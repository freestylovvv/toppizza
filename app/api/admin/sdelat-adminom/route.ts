import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/make-admin — выдаёт или снимает права администратора у пользователя
export async function POST(request: Request) {
  try {
    const { userId, isAdmin } = await request.json()
    
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isAdmin: Boolean(isAdmin) }, // true — выдать права, false — снять
    })
    
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
