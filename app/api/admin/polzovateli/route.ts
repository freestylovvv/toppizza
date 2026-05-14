import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/users — управление пользователями в админ-панели
//
// Используется для отображения списка пользователей и управления правами админа.
// force-dynamic — данные всегда свежие, не кешируем.
// ============================================================

export const dynamic = 'force-dynamic'

// GET /api/admin/users — возвращает всех пользователей с их заказами
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { orders: true },       // подгружаем заказы каждого пользователя
      orderBy: { createdAt: 'desc' },  // новые пользователи первыми
    })
    return NextResponse.json({ success: true, users })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get users' }, { status: 500 })
  }
}
