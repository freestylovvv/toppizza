import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, encrypt } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.event !== 'payment.succeeded') {
      return NextResponse.json({ success: true })
    }

    const payment = body.object
    const orderData = JSON.parse(payment.metadata?.orderData || '{}')

    if (!orderData.phone) {
      return NextResponse.json({ success: false, error: 'No order data' }, { status: 400 })
    }

    const { fullName, email, phone, address, comment, items, totalPrice } = orderData

    const user = await prisma.user.findFirst({ where: { phone } })

    const order = await prisma.order.create({
      data: {
        fullName: sanitizeInput(fullName),
        encryptedFullName: encrypt(sanitizeInput(fullName)),
        email: sanitizeInput(email || ''),
        encryptedEmail: email ? encrypt(sanitizeInput(email)) : null,
        phone: sanitizeInput(phone),
        encryptedPhone: encrypt(sanitizeInput(phone)),
        address: sanitizeInput(address),
        encryptedAddress: encrypt(sanitizeInput(address)),
        comment: sanitizeInput(comment || ''),
        totalPrice,
        userId: user?.id ?? null,
        items: {
          create: items.map((item: any) => ({
            productId: parseInt(item.productId),
            variantId: parseInt(item.variantId),
            quantity: parseInt(item.quantity),
            price: parseInt(item.price),
            productName: sanitizeInput(item.name || ''),
            variantSize: sanitizeInput(item.size || ''),
            imageUrl: sanitizeInput(item.imageUrl || ''),
          })),
        },
      },
    })

    console.log('Order created via YooKassa webhook:', order.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
