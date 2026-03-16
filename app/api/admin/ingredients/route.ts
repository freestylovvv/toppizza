import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, ingredients })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, imageUrl, categories } = await request.json()
    const ingredient = await prisma.ingredient.create({
      data: { name, price, imageUrl, categories: categories || '' },
    })
    return NextResponse.json({ success: true, ingredient })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create ingredient' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, price, imageUrl, categories } = await request.json()
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { name, price, imageUrl, categories: categories || '' },
    })
    return NextResponse.json({ success: true, ingredient })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update ingredient' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await prisma.ingredient.delete({ where: { id: parseInt(id!) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete ingredient' }, { status: 500 })
  }
}
