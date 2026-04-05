import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, validatePhone, encrypt } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const { phone, name, code } = await request.json()
    
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedCode = sanitizeInput(code)
    
    const digits = sanitizedPhone.replace(/\D/g, '')
    const normalized = digits.startsWith('7') ? digits : '7' + digits
    
    if (!validatePhone('+' + normalized)) {
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }

    const verification = await prisma.verificationCode.findFirst({
      where: { phone: normalized, code: sanitizedCode, expiresAt: { gte: new Date() } },
    })

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    // Ищем пользователя
    let user = await prisma.user.findFirst({
      where: { OR: [{ phone: normalized }, { phone: '+' + normalized }] }
    })

    if (!user) {
      // Если имя не передано — просим его
      if (!name) {
        return NextResponse.json({ success: true, needName: true })
      }
      user = await prisma.user.create({
        data: { name: sanitizeInput(name), phone: normalized }
      })
    }

    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })

    // Не возвращаем зашифрованные данные
    const { encryptedEmail, encryptedBirthday, ...safeUser } = user
    
    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 })
  }
}
