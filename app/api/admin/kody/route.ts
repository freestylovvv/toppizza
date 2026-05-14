import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/codes — просмотр кодов подтверждения (для отладки)
//
// Используется администратором если SMS не доходит — можно посмотреть
// код напрямую в БД и ввести его вручную.
// В продакшене этот эндпоинт должен быть защищён авторизацией!
// ============================================================

export const dynamic = 'force-dynamic' // не кешировать, коды меняются постоянно

// GET /api/admin/codes — возвращает последние 50 кодов подтверждения (для отладки)
export async function GET() {
  try {
    const codes = await prisma.verificationCode.findMany({
      orderBy: { createdAt: 'desc' }, // новые коды первыми
      take: 50,                       // ограничиваем количество записей
    })
    return NextResponse.json({ success: true, codes })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get codes' }, { status: 500 })
  }
}
