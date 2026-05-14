import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, encrypt, encryptLong } from '@/lib/security'
// uuid — библиотека для генерации уникальных идентификаторов
// v4 — версия 4 (случайный UUID), пример: "550e8400-e29b-41d4-a716-446655440000"

// ============================================================
// POST /api/payment/create
// Создаёт платёж в ЮКасса и возвращает ссылку для оплаты
//
// Схема работы онлайн-оплаты:
// 1. Пользователь нажимает "Оплатить картой"
// 2. Фронтенд вызывает этот эндпоинт с суммой и данными заказа
// 3. Мы создаём платёж в ЮКасса через их API
// 4. ЮКасса возвращает ссылку на страницу оплаты
// 5. Мы редиректим пользователя на эту страницу
// 6. Пользователь вводит данные карты на сайте ЮКасса
// 7. После оплаты ЮКасса вызывает наш webhook (/api/payment/webhook)
// 8. В webhook мы создаём заказ в БД
//
// Тело запроса: { amount: number, orderData: object }
// Ответ: { success: true, confirmationUrl: string, paymentId: string }
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, orderData } = body
    // amount — сумма в рублях (число)
    // orderData — данные заказа (имя, телефон, адрес, товары)
    // Сохраняем orderData в метаданных платежа — получим их обратно в webhook

    const shopId = '1332793' // ID магазина в личном кабинете ЮКасса
    const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim()
    // .trim() — убираем пробелы по краям (частая ошибка при копировании ключа в .env)
    // ?. — опциональная цепочка, защита если переменная не задана

    if (!secretKey) {
      // Ключ не настроен — оплата недоступна
      return NextResponse.json({ success: false, error: 'Payment not configured' }, { status: 500 })
    }

    // Отправляем запрос к ЮКасса API для создания платежа
    const { fullName, email, phone, address, comment, items, totalPrice } = orderData
    const user = await prisma.user.findFirst({ where: { phone } })

    const flatItems: any[] = []
    for (const item of items) {
      if (item.isCombo && Array.isArray(item.items)) {
        for (const ci of item.items) {
          flatItems.push({ ...ci, quantity: item.quantity, price: ci.price, comboId: item.comboId, comboName: item.comboName || '', comboImageUrl: item.comboImageUrl || '', comboDiscount: item.discount || 0 })
        }
      } else {
        flatItems.push(item)
      }
    }

    const order = await prisma.order.create({
      data: {
        fullName: sanitizeInput(fullName),
        encryptedFullName: encryptLong(sanitizeInput(fullName)),
        email: sanitizeInput(email || ''),
        encryptedEmail: email ? encrypt(sanitizeInput(email)) : null,
        phone: sanitizeInput(phone),
        encryptedPhone: encrypt(sanitizeInput(phone)),
        address: sanitizeInput(address),
        encryptedAddress: encryptLong(sanitizeInput(address)),
        comment: sanitizeInput(comment || ''),
        totalPrice,
        status: 'pending_payment',
        userId: user?.id ?? null,
        items: {
          create: flatItems.map((item: any) => ({
            productId:   parseInt(item.productId),
            variantId:   parseInt(item.variantId),
            quantity:    parseInt(item.quantity),
            price:       parseInt(item.price),
            productName: sanitizeInput(item.name || ''),
            variantSize: sanitizeInput(item.size || ''),
            imageUrl:    sanitizeInput(item.imageUrl || ''),
            comboId:      item.comboId ? parseInt(item.comboId) : null,
            comboName:    sanitizeInput(item.comboName || ''),
            comboImageUrl: sanitizeInput(item.comboImageUrl || ''),
            comboDiscount: item.comboDiscount ? parseInt(item.comboDiscount) : 0,
          })),
        },
      },
    })

    const payment = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        // Idempotence-Key — уникальный ключ для защиты от дублирования платежей
        // Если запрос повторится (например из-за сетевой ошибки),
        // ЮКасса вернёт тот же платёж вместо создания нового
        // uuidv4() генерирует случайный UUID для каждого запроса
        'Idempotence-Key': uuidv4(),

        // Basic авторизация: base64(shopId:secretKey)
        // Buffer.from(`${shopId}:${secretKey}`) — создаём Buffer из строки
        // .toString('base64') — конвертируем в Base64
        'Authorization': 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2), // сумма с двумя знаками после запятой ("599.00")
          currency: 'RUB'           // валюта — российский рубль
        },
        confirmation: {
          type: 'redirect',         // тип подтверждения — редирект на страницу оплаты
          // URL куда вернётся пользователь после успешной оплаты
          // NEXT_PUBLIC_ — переменная доступна и на сервере и в браузере
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/oformlenie/uspeh`,
        },
        capture: true,
        // capture: true — автоматически подтверждать платёж после авторизации
        // capture: false — двухстадийная оплата (сначала заморозить, потом подтвердить)
        // Нам нужна одностадийная — сразу списываем деньги

        description: `Заказ Top Pizza на ${amount} ₽`,
        // Описание платежа — отображается в выписке банка пользователя

        metadata: { orderId: String(order.id) },
        // metadata — произвольные данные которые ЮКасса сохранит и вернёт в webhook
        // Сохраняем данные заказа как JSON строку
        // В webhook распарсим их обратно: JSON.parse(payment.metadata.orderData)
      }),
    })

    const data = await payment.json() // парсим ответ ЮКасса

    if (!payment.ok) {
      console.error('YooKassa error', JSON.stringify(data))
      return NextResponse.json({ success: false, error: 'Payment creation failed' }, { status: 400 })
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
