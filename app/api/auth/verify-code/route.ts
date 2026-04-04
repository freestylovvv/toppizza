import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, validatePhone, encrypt } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const { phone, name, code } = await request.json()
    
    // Валидация и санитизация входных данных
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedName = sanitizeInput(name)
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

    // Ищем пользователя по номеру (с плюсом и без)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalized },
          { phone: '+' + normalized }
        ]
      }
    })
    
    console.log('Looking for user with phone:', normalized)
    console.log('Found user:', user ? `id: ${user.id}, isAdmin: ${user.isAdmin}` : 'not found')
    if (!user) {
      // Шифруем чувствительные данные
      const encryptedEmail = sanitizedName.includes('@') ? encrypt(sanitizedName) : null
      
      user = await prisma.user.create({ 
        data: { 
          name: sanitizedName || normalized, 
          phone: normalized,
          encryptedEmail
        } 
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
