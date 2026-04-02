import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { phone, name, code } = await request.json()
    const digits = phone.replace(/\D/g, '')
    const normalized = digits.startsWith('7') ? digits : '7' + digits

    const verification = await prisma.verificationCode.findFirst({
      where: { phone: normalized, code, expiresAt: { gte: new Date() } },
    })

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { phone: normalized } })
    if (!user) {
      user = await prisma.user.create({ data: { name, phone: normalized } })
    }

    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 })
  }
}
