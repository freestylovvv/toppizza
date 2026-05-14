import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/categories — CRUD операции с категориями товаров
//
// Категории определяют как отображается товар на сайте:
// - pizza — показывает выбор размера, состав, добавки
// - drink — простая карточка без выбора размера
// - snack, dessert — аналогично drink
// ============================================================

// GET /api/admin/categories — все категории с товарами
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }, // подгружаем товары каждой категории
      orderBy: { id: 'asc' },      // сортируем по ID (порядок создания)
    })
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get categories' }, { status: 500 })
  }
}

// POST /api/admin/categories — создаёт новую категорию
export async function POST(request: Request) {
  try {
    const { name, type } = await request.json()
    // name — название (например "Пиццы", "Напитки")
    // type — тип отображения: pizza | drink | snack | dessert | combo
    const category = await prisma.category.create({
      data: { name, type: type || 'pizza' }, // тип по умолчанию pizza
    })
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT /api/admin/categories — обновляет категорию
export async function PUT(request: Request) {
  try {
    const { id, name, type } = await request.json()
    const category = await prisma.category.update({
      where: { id: parseInt(id) }, // parseInt — преобразуем строку в число
      data: { name, type: type || 'pizza' },
    })
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/admin/categories?id=... — удаляет категорию
// Важно: нельзя удалить категорию если в ней есть товары (ошибка foreign key)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') // ID из query параметра ?id=5
    await prisma.category.delete({ where: { id: parseInt(id!) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
