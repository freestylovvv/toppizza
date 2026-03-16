import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, isAdmin } = await request.json()
    
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isAdmin: Boolean(isAdmin) },
    })
    
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
