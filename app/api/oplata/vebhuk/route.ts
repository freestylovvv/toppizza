import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.event !== 'payment.succeeded') {
      return NextResponse.json({ success: true })
    }

    const payment = body.object
    const orderId = payment.metadata?.orderId

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'No orderId in metadata' }, { status: 400 })
    }

    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'pending' },
    })

    console.log('Order confirmed via YooKassa webhook:', orderId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
