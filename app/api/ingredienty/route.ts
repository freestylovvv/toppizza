import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/public/ingredients — публичный эндпоинт для получения добавок
//
// Используется на главной странице и в модалках товаров.
// revalidate = 60 означает что Next.js кешируeт ответ на 60 секунд —
// не нужно ходить в БД при каждом запросе (добавки меняются редко).
// ============================================================

export const revalidate = 60 // кешируем ответ на 60 секунд (ISR)

// GET /api/ingredients?categoryId=... — возвращает ингредиенты (платные добавки)
// Если передан categoryId — фильтруем по категории товара
// Например: categoryId=1 вернёт только добавки для пицц
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') // необязательный фильтр по категории

    // Получаем все ингредиенты отсортированные по имени (А→Я)
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    })

    if (categoryId) {
      // Фильтруем на уровне приложения (не SQL) потому что
      // поле categories хранит строку "1,2,3" а не массив
      // SQL фильтрация по подстроке была бы ненадёжной
      const filtered = ingredients.filter(ing =>
        ing.categories.split(',').includes(categoryId)
      )
      return NextResponse.json({ success: true, ingredients: filtered })
    }

    // Без фильтра — возвращаем все ингредиенты
    return NextResponse.json({ success: true, ingredients })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}
