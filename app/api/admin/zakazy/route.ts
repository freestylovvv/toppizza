import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/orders — возвращает последние 50 заказов для админ-панели
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, // новые заказы первыми
      take: 50,                        // ограничиваем 50 записями
      include: { items: true },        // включаем позиции каждого заказа
    })
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get orders' }, { status: 500 })
  }
}

// PUT /api/admin/orders — обновляет статус заказа (pending/confirmed/delivered/cancelled)
export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json()
    await prisma.order.update({ where: { id: orderId }, data: { status } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
