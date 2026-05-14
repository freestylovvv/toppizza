import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/public/products — публичный эндпоинт для получения товаров
//
// force-dynamic — отключаем кеширование Next.js, данные всегда свежие.
// Используется в AdminClient для получения актуального списка товаров.
// Главная страница использует серверный компонент (app/page.tsx)
// и читает БД напрямую, без этого API.
// ============================================================

export const dynamic = 'force-dynamic'

// GET /api/products — возвращает все товары с категориями и вариантами
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,  // подгружаем категорию каждого товара
        variants: true,  // подгружаем варианты (размеры/цены)
      },
    })
    return NextResponse.json(products, {
      // Cache-Control — заголовок кеширования для CDN/прокси
      // s-maxage=60 — CDN кеширует на 60 секунд
      // stale-while-revalidate=300 — пока CDN обновляет кеш, отдаёт устаревший ещё 300 секунд
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 })
  }
}
