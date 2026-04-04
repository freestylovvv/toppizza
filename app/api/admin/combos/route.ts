import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const combos = await prisma.combo.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, combos })
}

export async function POST(req: NextRequest) {
  const { name, imageUrl, discount, items } = await req.json()
  const combo = await prisma.combo.create({
    data: {
      name,
      imageUrl,
      discount: discount || 0,
      items: { create: items.map((i: any) => ({ productId: i.productId, variantId: i.variantId })) },
    },
    include: { items: true },
  })
  return NextResponse.json({ success: true, combo })
}

export async function PUT(req: NextRequest) {
  const { id, name, imageUrl, discount, items } = await req.json()
  const combo = await prisma.combo.update({
    where: { id },
    data: {
      name,
      imageUrl,
      discount: discount || 0,
      items: {
        deleteMany: {},
        create: items.map((i: any) => ({ productId: i.productId, variantId: i.variantId })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json({ success: true, combo })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '')
  await prisma.combo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
