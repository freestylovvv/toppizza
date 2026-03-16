import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificationCode.deleteMany({ where: { email } })
    await prisma.verificationCode.create({
      data: { email, code, expiresAt },
    })

    await sendVerificationCode(email, code)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 })
  }
}
