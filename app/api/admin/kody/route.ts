import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/codes — возвращает последние 50 кодов подтверждения (для отладки)
// Позволяет администратору видеть коды если SMS не доходят
export async function GET() {
  try {
    const codes = await prisma.verificationCode.findMany({
      orderBy: { createdAt: 'desc' }, // новые коды первыми
      take: 50,
    })
    return NextResponse.json({ success: true, codes })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get codes' }, { status: 500 })
  }
}
