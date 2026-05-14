import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/ingredients — CRUD операции с ингредиентами (платными добавками)
// Ингредиенты — это дополнительные топпинги которые пользователь
// может добавить к пицце за дополнительную плату
// ============================================================

// GET — получить все ингредиенты (отсортированные по алфавиту)
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }, // asc = ascending = по возрастанию (А→Я)
    })
    return NextResponse.json({ success: true, ingredients })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}

// POST — создать новый ингредиент
export async function POST(request: Request) {
  try {
    const { name, price, imageUrl, categories } = await request.json()
    // categories — строка с ID категорий через запятую ("1,3,5")
    // Определяет к каким категориям товаров применим этот ингредиент

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        price,     // цена в рублях (целое число)
        imageUrl,
        categories: categories || '', // если не передано — пустая строка (не привязан ни к чему)
      },
    })
    return NextResponse.json({ success: true, ingredient })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create ingredient' }, { status: 500 })
  }
}

// PUT — обновить ингредиент
export async function PUT(request: Request) {
  try {
    const { id, name, price, imageUrl, categories } = await request.json()
    const ingredient = await prisma.ingredient.update({
      where: { id }, // id здесь уже число (не строка) — TypeScript это гарантирует
      data: { name, price, imageUrl, categories: categories || '' },
    })
    return NextResponse.json({ success: true, ingredient })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update ingredient' }, { status: 500 })
  }
}

// DELETE — удалить ингредиент
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') // ID из query параметра ?id=5
    await prisma.ingredient.delete({ where: { id: parseInt(id!) } })
    // parseInt(id!) — конвертируем строку "5" в число 5
    // id! — говорим TypeScript что id не null (мы уверены что параметр передан)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete ingredient' }, { status: 500 })
  }
}
