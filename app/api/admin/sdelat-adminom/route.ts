import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/make-admin — управление правами администратора
//
// Вызывается из админ-панели при нажатии кнопки "Сделать админом" / "Админ".
// Тогглирует флаг isAdmin: если был true — станет false, и наоборот.
// Важно: этот эндпоинт должен быть защищён проверкой что запрашивающий сам является админом!
// ============================================================

// POST /api/admin/make-admin — выдаёт или снимает права администратора у пользователя
export async function POST(request: Request) {
  try {
    const { userId, isAdmin } = await request.json()
    // userId — ID пользователя
    // isAdmin — новое значение флага (true — выдать права, false — снять)

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isAdmin: Boolean(isAdmin) }, // Boolean() — гарантируем что значение точно boolean
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
