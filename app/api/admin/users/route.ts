import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, users })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get users' }, { status: 500 })
  }
}
