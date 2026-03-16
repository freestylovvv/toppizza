import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    })
    
    if (categoryId) {
      const filtered = ingredients.filter(ing => 
        ing.categories.split(',').includes(categoryId)
      )
      return NextResponse.json({ success: true, ingredients: filtered })
    }
    
    return NextResponse.json({ success: true, ingredients })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}
