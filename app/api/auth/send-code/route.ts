import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'

export async function POST(request: Request) {
  try {
    const { phone, name } = await request.json()

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificationCode.deleteMany({ where: { phone } })
    await prisma.verificationCode.create({
      data: { phone, code, expiresAt },
    })

    await sendSms(phone, `Top Pizza: ваш код подтверждения ${code}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 })
  }
}
