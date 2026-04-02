import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { phone, name } = await request.json()
    const digits = phone.replace(/\D/g, '')
    const normalized = digits.startsWith('7') ? digits : '7' + digits

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })
    await prisma.verificationCode.create({
      data: { phone: normalized, code, expiresAt },
    })

    // Ищем пользователя Telegram по номеру
    const tgUser = await prisma.telegramUser.findUnique({ where: { phone: normalized } })

    if (!tgUser) {
      // Пользователь ещё не писал боту — код сохранён, отправим когда напишет
      return NextResponse.json({ success: true, needBot: true })
    }

    await sendTelegramMessage(tgUser.chatId, `Top Pizza: ваш код подтверждения ${code}\n\nКод действителен 10 минут.`)

    return NextResponse.json({ success: true, needBot: false })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 })
  }
}
