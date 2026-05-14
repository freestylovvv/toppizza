import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 })
  }
}
