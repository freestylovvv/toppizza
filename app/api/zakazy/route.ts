import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { sanitizeInput, validatePhone, validateEmail, encrypt } from '@/lib/security'

// ============================================================
// POST /api/orders
// Создаёт новый заказ при оплате наличными (при получении)
//
// Отличие от /api/payment/webhook:
// - /api/orders — оплата наличными, заказ создаётся сразу
// - /api/payment/webhook — оплата картой, заказ создаётся после подтверждения оплаты
//
// Тело запроса:
// {
//   fullName: string,    — имя получателя
//   email: string,       — email (необязательный)
//   phone: string,       — телефон для связи
//   address: string,     — адрес доставки
//   comment: string,     — комментарий к заказу
//   items: CartItem[],   — список товаров из корзины
//   totalPrice: number   — итоговая сумма
// }
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Деструктурируем все нужные поля из тела запроса
    const { fullName, email, phone, address, comment, items, totalPrice } = body

    // ШАГ 1: Санитизация — очищаем все строки от опасных символов
    // Каждое поле обрабатывается отдельно
    const sanitizedFullName = sanitizeInput(fullName)
    const sanitizedEmail    = sanitizeInput(email)
    const sanitizedPhone    = sanitizeInput(phone)
    const sanitizedAddress  = sanitizeInput(address)
    const sanitizedComment  = sanitizeInput(comment || '') // comment может быть undefined

    // ШАГ 2: Валидация форматов данных

    // Проверяем формат телефона (+7XXXXXXXXXX)
    if (!validatePhone(sanitizedPhone)) {
      // 400 Bad Request — клиент прислал неверные данные
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }

    // Проверяем email только если он передан (необязательное поле)
    if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
    }

    // Проверяем сумму заказа:
    // - !totalPrice — сумма не передана или 0
    // - totalPrice < 0 — отрицательная сумма (попытка мошенничества)
    // - totalPrice > 100000 — слишком большая сумма (защита от ошибок)
    if (!totalPrice || totalPrice < 0 || totalPrice > 100000) {
      return NextResponse.json({ success: false, error: 'Invalid order amount' }, { status: 400 })
    }

    // Проверяем список товаров:
    // - !items — не передан
    // - !Array.isArray(items) — не массив (кто-то прислал строку или объект)
    // - items.length === 0 — пустой массив
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid items' }, { status: 400 })
    }

    // ШАГ 3: Ищем пользователя по телефону
    // Если пользователь авторизован — привязываем заказ к его аккаунту
    // findFirst — возвращает первую запись или null (не бросает ошибку)
    const user = await prisma.user.findFirst({ where: { phone: sanitizedPhone } })

    // ШАГ 4: Шифруем личные данные перед сохранением в БД
    // encrypt() использует RSA публичный ключ
    const encryptedFullName = encrypt(sanitizedFullName)
    const encryptedEmail    = sanitizedEmail ? encrypt(sanitizedEmail) : null
    // Тернарный оператор: если email есть — шифруем, если нет — null
    const encryptedPhone    = encrypt(sanitizedPhone)
    const encryptedAddress  = encrypt(sanitizedAddress)

    // ШАГ 5: Создаём заказ в БД
    // Prisma позволяет создать заказ и все его позиции за один запрос (вложенный create)
    const order = await prisma.order.create({
      data: {
        // Сохраняем и открытые данные (для отображения) и зашифрованные (для защиты)
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
        // user?.id — если user найден, берём его id; если null — оператор ?. вернёт undefined
        // ?? null — если undefined, используем null (Prisma принимает null, не undefined)

        items: {
          create: items.map((item: any) => ({
            // map() — трансформируем каждый элемент корзины в формат для БД
            // parseInt() — конвертируем в число (из корзины могут прийти строки)
            productId:   parseInt(item.productId),
            variantId:   parseInt(item.variantId),
            quantity:    parseInt(item.quantity),
            price:       parseInt(item.price),
            // Санитизируем строковые поля позиции
            productName: sanitizeInput(item.name || ''),
            variantSize: sanitizeInput(item.size || ''),
            imageUrl:    sanitizeInput(item.imageUrl || ''),
          })),
        },
      },
    })

    // ШАГ 6: Отправляем SMS уведомление клиенту
    // Обёрнуто в try/catch — если SMS не дошло, заказ всё равно создан
    // Не хотим отменять заказ из-за проблем с SMS
    try {
      await sendSms(
        sanitizedPhone,
        `Top Pizza: ваш заказ #${order.id} принят! Сумма: ${totalPrice} ₽. Ждите доставку по адресу: ${sanitizedAddress}`
      )
    } catch (smsError) {
      // Логируем ошибку SMS но не прерываем выполнение
      console.error('SMS notification failed:', smsError)
    }

    // Возвращаем ID созданного заказа — фронтенд может показать его пользователю
    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
