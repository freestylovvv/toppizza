import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { id, name, phone, birthday } = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        birthday: birthday ? new Date(birthday) : null,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            items: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get user' }, { status: 500 })
  }
}
