import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { sanitizeInput, validatePhone } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    console.log('Received request:', { phone })

    const sanitizedPhone = sanitizeInput(phone)
    
    // Нормализация номера телефона
    const digits = sanitizedPhone.replace(/\D/g, '')
    const normalized = '+' + (digits.startsWith('7') ? digits : '7' + digits)
    
    console.log('Normalized phone:', normalized)
    
    if (!validatePhone(normalized)) {
      console.log('Phone validation failed for:', normalized)
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    
    console.log('Generated code:', code)

    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })
    await prisma.verificationCode.create({
      data: { phone: normalized, code, expiresAt },
    })
    
    console.log('Code saved to database')

    await sendSms(normalized, `Top Pizza: ваш код подтверждения ${code}`)
    
    console.log('SMS sent successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to send code' }, { status: 500 })
  }
}
