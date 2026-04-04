import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { sanitizeInput, validatePhone, validateEmail, encrypt } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, comment, items, totalPrice } = body

    // Валидация и санитизация входных данных
    const sanitizedFullName = sanitizeInput(fullName)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedAddress = sanitizeInput(address)
    const sanitizedComment = sanitizeInput(comment || '')
    
    // Проверка форматов
    if (!validatePhone(sanitizedPhone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }
    
    if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
    }
    
    // Проверка суммы заказа
    if (!totalPrice || totalPrice < 0 || totalPrice > 100000) {
      return NextResponse.json({ success: false, error: 'Invalid order amount' }, { status: 400 })
    }
    
    // Проверка товаров
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid items' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { phone: sanitizedPhone } })

    // Шифруем чувствительные данные
    const encryptedFullName = encrypt(sanitizedFullName)
    const encryptedEmail = sanitizedEmail ? encrypt(sanitizedEmail) : null
    const encryptedPhone = encrypt(sanitizedPhone)
    const encryptedAddress = encrypt(sanitizedAddress)

    const order = await prisma.order.create({
      data: {
        fullName: sanitizedFullName,
        encryptedFullName,
        email: sanitizedEmail,
        encryptedEmail,
        phone: sanitizedPhone,
        encryptedPhone,
        address: sanitizedAddress,
        encryptedAddress,
        comment: sanitizedComment,
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

    try {
      await sendSms(sanitizedPhone, `Top Pizza: ваш заказ #${order.id} принят! Сумма: ${totalPrice} ₽. Ждите доставку по адресу: ${sanitizedAddress}`)
    } catch (smsError) {
      console.error('SMS notification failed:', smsError)
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
