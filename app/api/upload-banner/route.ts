import { NextResponse } from 'next/server'
import { join } from 'path'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-').replace(/\.[^.]+$/, '.webp')}`
    const path = join(process.cwd(), 'public', 'uploads', filename)
    
    await sharp(buffer)
      .resize(1280, 440, { fit: 'cover', position: 'center' })
      .webp({ quality: 98, effort: 6 })
      .toFile(path)

    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
