import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ success: true, banners })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, title, subtitle, order } = await request.json()
    const banner = await prisma.banner.create({
      data: { imageUrl, title, subtitle, order: order || 0 }
    })
    return NextResponse.json({ success: true, banner })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create banner' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, imageUrl, title, subtitle, order } = await request.json()
    const banner = await prisma.banner.update({
      where: { id },
      data: { imageUrl, title, subtitle, order }
    })
    return NextResponse.json({ success: true, banner })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')
    await prisma.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 })
  }
}
