import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, comment, items, totalPrice } = body

    const user = await prisma.user.findUnique({ where: { email } })
    console.log('Found user:', user)

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

    console.log('Created order:', order)
    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
