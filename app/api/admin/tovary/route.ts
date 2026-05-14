import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// force-dynamic — отключаем кеширование, данные всегда свежие
export const dynamic = 'force-dynamic'

// GET /api/admin/tovary — все товары с категориями и вариантами
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { id: 'desc' }, // новые товары первыми
    })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get products' }, { status: 500 })
  }
}

// POST /api/admin/tovary — создать новый товар
export async function POST(request: Request) {
  try {
    const { name, imageUrl, categoryId, relatedCategoryId, variants, ingredients, requiredIngredients, removableIngredients } = await request.json()
    // relatedCategoryId — ID категории товаров которые предлагаются к этому товару
    // Например: к пицце предлагаем категорию "Соусы"
    // null — ничего не предлагать

    const product = await prisma.product.create({
      data: {
        name,
        imageUrl,
        ingredients: ingredients || '',
        requiredIngredients: requiredIngredients || '',
        removableIngredients: removableIngredients || '',
        categoryId: parseInt(categoryId),
        relatedCategoryId: relatedCategoryId ? parseInt(relatedCategoryId) : null,
        variants: {
          // Создаём все варианты за один запрос (вложенный create)
          create: variants.map((v: any) => ({ size: v.size, price: parseFloat(v.price) })),
        },
      },
      include: { variants: true }, // возвращаем товар вместе с вариантами
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PUT /api/admin/tovary — обновить существующий товар
export async function PUT(request: Request) {
  try {
    const { id, name, imageUrl, categoryId, relatedCategoryId, ingredients, requiredIngredients, removableIngredients, variants } = await request.json()

    if (variants && variants.length > 0) {
      // Стратегия обновления вариантов: удаляем все старые и создаём новые
      // Проще чем сравнивать что изменилось/добавилось/удалилось
      await prisma.variant.deleteMany({ where: { productId: parseInt(id) } })
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        imageUrl,
        ingredients: ingredients || '',
        requiredIngredients: requiredIngredients || '',
        removableIngredients: removableIngredients || '',
        categoryId: parseInt(categoryId),
        relatedCategoryId: relatedCategoryId ? parseInt(relatedCategoryId) : null,
        // Условно добавляем варианты только если они переданы
        ...(variants && variants.length > 0 && {
          variants: {
            create: variants.map((v: any) => ({ size: v.size, price: parseFloat(v.price) })),
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

// DELETE /api/admin/tovary?id=5 — удалить товар
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Сначала удаляем варианты (foreign key constraint),
    // затем сам товар
    await prisma.variant.deleteMany({ where: { productId: parseInt(id!) } })
    await prisma.product.delete({ where: { id: parseInt(id!) } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
