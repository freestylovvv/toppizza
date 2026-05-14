import { NextResponse } from 'next/server'
import { join, basename } from 'path'
import sharp from 'sharp'

// ============================================================
// POST /api/upload-banner — загружает изображение для баннера карусели
//
// Отличие от /api/upload:
// - Другой размер: 1280×440 (широкоформатный баннер вместо квадратного товара)
// - Другой fit: 'cover' (обрезает по краям) вместо 'contain' (вписывает)
// - Выше качество: 98 вместо 95
//
// Принимает: multipart/form-data с полем "file"
// Возвращает: { success: true, url: "/uploads/filename.webp" }
// ============================================================
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Защита от path traversal — basename убирает директории из имени файла
    const safeName = basename(file.name).replace(/\s/g, '-').replace(/\.[^.]+$/, '.webp')
    const filename = `${Date.now()}-${safeName}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)

    // Проверяем что путь внутри папки uploads
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 })
    }

    await sharp(buffer)
      .resize(1280, 440, {
        fit: 'cover',
        // fit: 'cover' — заполняем весь прямоугольник 1280×440
        // Изображение обрезается по краям если пропорции не совпадают
        // Для баннеров это правильно — нам нужно заполнить всю ширину
        position: 'center'
        // position: 'center' — при обрезке сохраняем центральную часть
        // Альтернативы: 'top', 'bottom', 'left', 'right', 'entropy' (умная обрезка)
      })
      .webp({ quality: 98, effort: 6 })
      // quality: 98 — почти без потерь (баннеры крупные, качество важно)
      .toFile(filePath)

    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch {
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
