import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, encrypt } from '@/lib/security'

// ============================================================
// POST /api/payment/webhook
// Вебхук от ЮКасса — вызывается автоматически после успешной оплаты
//
// Важно: этот эндпоинт вызывает НЕ пользователь, а сервер ЮКасса.
// Пользователь в это время уже на странице /checkout/success.
//
// Почему заказ создаётся здесь, а не сразу при оплате:
// Пользователь мог закрыть браузер после оплаты, не дождавшись редиректа.
// Webhook гарантирует что заказ будет создан даже в этом случае.
//
// Структура входящего запроса от ЮКасса:
// {
//   event: "payment.succeeded",  — тип события
//   object: {
//     id: "платёж_id",
//     metadata: {
//       orderData: "{...JSON строка с данными заказа...}"
//     }
//   }
// }
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ЮКасса присылает разные типы событий:
    // payment.succeeded — оплата прошла успешно
    // payment.canceled — оплата отменена
    // refund.succeeded — возврат средств
    // Нас интересует только payment.succeeded
    if (body.event !== 'payment.succeeded') {
      // Для других событий просто отвечаем 200 OK (ЮКасса ожидает 200)
      return NextResponse.json({ success: true })
    }

    // body.object — объект платежа с деталями
    const payment = body.object

    // Извлекаем данные заказа из метаданных
    // Мы сохранили их при создании платежа в /api/payment/create
    // payment.metadata?.orderData — опциональная цепочка (metadata может отсутствовать)
    // || '{}' — если metadata нет, парсим пустой объект (не бросаем ошибку)
    const orderData = JSON.parse(payment.metadata?.orderData || '{}')

    // Проверяем что данные заказа есть (минимум телефон)
    if (!orderData.phone) {
      return NextResponse.json({ success: false, error: 'No order data' }, { status: 400 })
    }

    // Деструктурируем данные заказа из метаданных
    const { fullName, email, phone, address, comment, items, totalPrice } = orderData

    // Ищем пользователя по телефону для привязки заказа к аккаунту
    const user = await prisma.user.findFirst({ where: { phone } })

    // Создаём заказ в БД — аналогично /api/orders но без валидации
    // (данные уже были валидированы при создании платежа)
    const order = await prisma.order.create({
      data: {
        // Санитизируем данные ещё раз (данные пришли из метаданных ЮКасса)
        fullName: sanitizeInput(fullName),
        encryptedFullName: encrypt(sanitizeInput(fullName)), // шифруем RSA
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
          // Создаём все позиции заказа за один запрос (вложенный create)
          create: items.map((item: any) => ({
            productId:   parseInt(item.productId),
            variantId:   parseInt(item.variantId),
            quantity:    parseInt(item.quantity),
            price:       parseInt(item.price),
            productName: sanitizeInput(item.name || ''),
            variantSize: sanitizeInput(item.size || ''),
            imageUrl:    sanitizeInput(item.imageUrl || ''),
          })),
        },
      },
    })

    // Логируем ID созданного заказа для отладки
    console.log('Order created via YooKassa webhook:', order.id)
    return NextResponse.json({ success: true })
  } catch {
    // При ошибке логируем но возвращаем 500
    // ЮКасса повторит запрос если получит не 200
    console.error('Webhook error')
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
