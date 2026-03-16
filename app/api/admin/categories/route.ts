import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json()
    
    const category = await prisma.category.create({
      data: { name, type: type || 'pizza' },
    })
    
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type } = await request.json()
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, type: type || 'pizza' },
    })
    
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    await prisma.category.delete({
      where: { id: parseInt(id!) },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
