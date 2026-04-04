import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { items: true },
    })
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get orders' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json()
    await prisma.order.update({ where: { id: orderId }, data: { status } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}