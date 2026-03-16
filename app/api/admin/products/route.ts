import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { id: 'desc' },
    })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, imageUrl, categoryId, variants, ingredients, requiredIngredients, removableIngredients } = await request.json()
    
    const product = await prisma.product.create({
      data: {
        name,
        imageUrl,
        ingredients: ingredients || '',
        requiredIngredients: requiredIngredients || '',
        removableIngredients: removableIngredients || '',
        categoryId: parseInt(categoryId),
        variants: {
          create: variants.map((v: any) => ({
            size: v.size,
            price: parseFloat(v.price),
          })),
        },
      },
      include: { variants: true },
    })
    
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, imageUrl, categoryId, ingredients, requiredIngredients, removableIngredients, variants } = await request.json()
    
    if (variants && variants.length > 0) {
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
        ...(variants && variants.length > 0 && {
          variants: {
            create: variants.map((v: any) => ({
              size: v.size,
              price: parseFloat(v.price),
            })),
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    await prisma.variant.deleteMany({ where: { productId: parseInt(id!) } })
    
    await prisma.product.delete({
      where: { id: parseInt(id!) },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
