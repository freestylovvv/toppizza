import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, comment, items, totalPrice } = body

    const user = await prisma.user.findFirst({ where: { phone } })

    const order = await prisma.order.create({
      data: {
        fullName,
        email,
        phone,
        address,
        comment: comment ?? '',
        totalPrice,
        userId: user?.id ?? null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.name || '',
            variantSize: item.size || '',
            imageUrl: item.imageUrl || '',
          })),
        },
      },
    })

    try {
      await sendSms(phone, `Top Pizza: ваш заказ #${order.id} принят! Сумма: ${totalPrice} ₽. Ждите доставку по адресу: ${address}`)
    } catch (smsError) {
      console.error('SMS notification failed:', smsError)
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
