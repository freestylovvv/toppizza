import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

async function sendContactRequest(chatId: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: 'Для входа на сайт Top Pizza поделитесь своим номером телефона:',
      reply_markup: {
        keyboard: [[{ text: '📱 Поделиться номером', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body?.message
    if (!message) return NextResponse.json({ ok: true })

    const chatId = message.chat.id.toString()
    const username = message.from?.username?.toLowerCase()

    // Пользователь поделился контактом
    if (message.contact) {
      const rawPhone = message.contact.phone_number.replace(/\D/g, '')
      const phone = rawPhone.startsWith('7') ? rawPhone : '7' + rawPhone

      await prisma.telegramUser.upsert({
        where: { chatId },
        update: { phone, username: username ?? null },
        create: { chatId, phone, username: username ?? null },
      })

      // Проверяем есть ли ожидающий код для этого номера
      const pending = await prisma.verificationCode.findFirst({
        where: { phone, expiresAt: { gte: new Date() } },
      })

      if (pending) {
        await sendTelegramMessage(chatId, `Top Pizza: ваш код подтверждения ${pending.code}\n\nКод действителен 10 минут.`)
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Код отправлен! Вернитесь на сайт и введите его.',
            reply_markup: { remove_keyboard: true },
          }),
        })
      } else {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Номер сохранён! Теперь вернитесь на сайт и запросите код.',
            reply_markup: { remove_keyboard: true },
          }),
        })
      }

      return NextResponse.json({ ok: true })
    }

    // Обычное сообщение — сохраняем chatId и просим контакт
    await prisma.telegramUser.upsert({
      where: { chatId },
      update: { username: username ?? null },
      create: { chatId, username: username ?? null },
    })

    await sendContactRequest(chatId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
