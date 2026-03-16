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
      .resize(640, 480, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 95, effort: 6 })
      .toFile(path)

    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
