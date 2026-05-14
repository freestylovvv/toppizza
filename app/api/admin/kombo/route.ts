import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/combos — CRUD операции с комбо-наборами
//
// Комбо — это набор из нескольких товаров со скидкой
// Пример: "Пицца Пепперони + Кола + Соус = скидка 150₽"
//
// Структура комбо в БД:
// Combo { id, name, imageUrl, discount }
//   └── ComboItem[] { productId, variantId }  — товары в комбо
// ============================================================

// GET — получить все комбо с позициями
export async function GET() {
  const combos = await prisma.combo.findMany({
    include: { items: true }, // подгружаем позиции каждого комбо (ComboItem[])
    orderBy: { createdAt: 'desc' }, // новые комбо первыми
  })
  return NextResponse.json({ success: true, combos })
  // Нет try/catch — если БД недоступна, Next.js вернёт 500 автоматически
}

// POST — создать новое комбо
export async function POST(req: NextRequest) {
  const { name, imageUrl, discount, items } = await req.json()
  // items — массив объектов { productId, variantId }
  // Каждый элемент — один товар в комбо

  const combo = await prisma.combo.create({
    data: {
      name,
      imageUrl,
      discount: discount || 0, // скидка в рублях, 0 если не передана
      items: {
        // Создаём все позиции комбо за один запрос (вложенный create)
        create: items.map((i: any) => ({
          productId: i.productId, // ID товара
          variantId: i.variantId, // ID варианта (размера) товара
        }))
      },
    },
    include: { items: true }, // возвращаем созданное комбо с позициями
  })
  return NextResponse.json({ success: true, combo })
}

// PUT — обновить комбо
export async function PUT(req: NextRequest) {
  const { id, name, imageUrl, discount, items } = await req.json()

  const combo = await prisma.combo.update({
    where: { id }, // находим комбо по ID
    data: {
      name,
      imageUrl,
      discount: discount || 0,
      items: {
        deleteMany: {},
        // deleteMany: {} — удаляем ВСЕ старые позиции комбо (пустой фильтр = все записи)
        // Это проще чем сравнивать что изменилось

        create: items.map((i: any) => ({
          productId: i.productId,
          variantId: i.variantId,
        })),
        // Создаём новые позиции
        // Prisma выполняет deleteMany и create в одной транзакции
      },
    },
    include: { items: true }, // возвращаем обновлённое комбо с позициями
  })
  return NextResponse.json({ success: true, combo })
}

// DELETE — удалить комбо
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '')
  // Позиции комбо (ComboItem) удалятся автоматически благодаря onDelete: Cascade в схеме
  // Не нужно вручную удалять ComboItem перед удалением Combo
  await prisma.combo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
