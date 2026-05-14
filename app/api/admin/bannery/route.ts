import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// /api/admin/banners — CRUD операции с баннерами карусели
// Баннеры отображаются на главной странице в карусели BannerCarousel
// Сортируются по полю order (меньше = раньше в карусели)
// ============================================================

// GET — получить все баннеры отсортированные по порядку отображения
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' } // order — числовое поле, меньше = первее в карусели
    })
    return NextResponse.json({ success: true, banners })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 })
  }
}

// POST — создать новый баннер
export async function POST(request: Request) {
  try {
    const { imageUrl, title, subtitle, order } = await request.json()
    // imageUrl — URL картинки (загружается через /api/upload-banner)
    // title — заголовок поверх баннера
    // subtitle — подзаголовок (необязательный)
    // order — позиция в карусели (0, 1, 2...)

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title,
        subtitle,           // может быть undefined — Prisma сохранит null
        order: order || 0   // если order не передан — ставим 0 (в начало)
      }
    })
    return NextResponse.json({ success: true, banner })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create banner' }, { status: 500 })
  }
}

// PUT — обновить баннер (например изменить порядок или заголовок)
export async function PUT(request: Request) {
  try {
    const { id, imageUrl, title, subtitle, order } = await request.json()
    const banner = await prisma.banner.update({
      where: { id }, // находим баннер по ID
      data: { imageUrl, title, subtitle, order }
    })
    return NextResponse.json({ success: true, banner })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update banner' }, { status: 500 })
  }
}

// DELETE — удалить баннер
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // parseInt(... || '') — если параметр не передан, parseInt('') вернёт NaN
    // Prisma выбросит ошибку при NaN — попадём в catch
    const id = parseInt(searchParams.get('id') || '')
    await prisma.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 })
  }
}
