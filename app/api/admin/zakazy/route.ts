import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/orders — управление заказами в админ-панели
//
// GET — получить последние 50 заказов
// PUT — изменить статус заказа (например с "pending" на "delivered")
//
// Статусы заказа:
// pending — новый заказ, ожидает обработки
// processing — готовится на кухне
// completed — готов, ожидает курьера
// delivered — доставлен
// cancelled — отменён
// pending_payment — ожидает оплаты картой (временный статус до подтверждения ЮКасса)
// ============================================================

export const dynamic = 'force-dynamic' // не кешировать, заказы меняются постоянно

// GET /api/admin/orders — возвращает последние 50 заказов для админ-панели
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, // новые заказы первыми
      take: 50,                        // ограничиваем 50 записями (достаточно для отображения)
      include: { items: true },        // включаем позиции каждого заказа
    })
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get orders' }, { status: 500 })
  }
}

// PUT /api/admin/orders — обновляет статус заказа
// Тело запроса: { orderId: number, status: string }
export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json()
    await prisma.order.update({ where: { id: orderId }, data: { status } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
