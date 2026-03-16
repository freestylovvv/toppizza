import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, name, code } = await request.json()

    const verification = await prisma.verificationCode.findFirst({
      where: { email, code, expiresAt: { gte: new Date() } },
    })

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      user = await prisma.user.create({ data: { email, name } })
    }

    await prisma.verificationCode.deleteMany({ where: { email } })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 })
  }
}
