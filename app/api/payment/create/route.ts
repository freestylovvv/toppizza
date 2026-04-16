import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, orderData } = body

    const shopId = '1332793'
    const secretKey = process.env.YOOKASSA_SECRET_KEY!

    const payment = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': uuidv4(),
        'Authorization': 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: { value: amount.toFixed(2), currency: 'RUB' },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        },
        capture: true,
        description: `Заказ Top Pizza на ${amount} ₽`,
        metadata: { orderData: JSON.stringify(orderData) },
      }),
    })

    const data = await payment.json()

    if (!payment.ok) {
      console.error('YooKassa error:', data)
      return NextResponse.json({ success: false, error: data.description }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      confirmationUrl: data.confirmation.confirmation_url,
      paymentId: data.id,
    })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create payment' }, { status: 500 })
  }
}
