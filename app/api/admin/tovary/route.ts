import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/products — CRUD операции с товарами
// CRUD = Create (POST), Read (GET), Update (PUT), Delete (DELETE)
// Используется только в AdminClient компоненте
// ============================================================

// GET — получить все товары
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true, // JOIN с таблицей Category — нужно для отображения названия категории
        variants: true, // JOIN с таблицей Variant — нужно для отображения цен
      },
      orderBy: { id: 'desc' }, // новые товары первыми (больший ID = позже создан)
    })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get products' }, { status: 500 })
  }
}

// POST — создать новый товар
export async function POST(request: Request) {
  try {
    const { name, imageUrl, categoryId, variants, ingredients, requiredIngredients, removableIngredients } = await request.json()

    // Создаём товар и его варианты за один запрос к БД
    // Prisma поддерживает вложенные create — не нужно делать два отдельных запроса
    const product = await prisma.product.create({
      data: {
        name,
        imageUrl,
        ingredients: ingredients || '',           // если не передано — пустая строка
        requiredIngredients: requiredIngredients || '',
        removableIngredients: removableIngredients || '',
        categoryId: parseInt(categoryId),         // parseInt — строка "3" → число 3
        variants: {
          create: variants.map((v: any) => ({     // map — создаём объект для каждого варианта
            size:  v.size,
            price: parseFloat(v.price),           // parseFloat — строка "599.00" → число 599
          })),
        },
      },
      include: { variants: true }, // возвращаем созданный товар вместе с вариантами
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PUT — обновить существующий товар
export async function PUT(request: Request) {
  try {
    const { id, name, imageUrl, categoryId, ingredients, requiredIngredients, removableIngredients, variants } = await request.json()

    if (variants && variants.length > 0) {
      // Стратегия обновления вариантов: удалить все старые и создать новые
      // Это проще чем сравнивать какие изменились, какие добавились, какие удалились
      // deleteMany — удаляет все варианты этого товара
      await prisma.variant.deleteMany({ where: { productId: parseInt(id) } })
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) }, // находим товар по ID
      data: {
        name,
        imageUrl,
        ingredients: ingredients || '',
        requiredIngredients: requiredIngredients || '',
        removableIngredients: removableIngredients || '',
        categoryId: parseInt(categoryId),
        // Условное добавление поля variants через spread оператор
        // ...(условие && { поле: значение }) — добавляет поле только если условие true
        // Если variants не переданы — не трогаем варианты в БД
        ...(variants && variants.length > 0 && {
          variants: {
            create: variants.map((v: any) => ({
              size:  v.size,
              price: parseFloat(v.price),
            })),
          },
        }),
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// DELETE — удалить товар
export async function DELETE(request: Request) {
  try {
    // ID передаётся как query параметр: DELETE /api/admin/products?id=5
    const { searchParams } = new URL(request.url)
    // new URL(request.url) — парсим URL в объект
    // searchParams — объект для работы с query параметрами (?key=value)
    const id = searchParams.get('id') // получаем значение параметра id

    // Порядок удаления важен из-за foreign key constraints:
    // Нельзя удалить товар пока есть варианты ссылающиеся на него
    // Сначала удаляем варианты...
    await prisma.variant.deleteMany({ where: { productId: parseInt(id!) } })
    // id! — оператор non-null assertion, говорим TypeScript что id точно не null

    // ...затем удаляем сам товар
    await prisma.product.delete({
      where: { id: parseInt(id!) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
