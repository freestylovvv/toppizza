import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q || '')}`, {
    headers: { 'User-Agent': 'TopPizza/1.0' }
  })
  const data = await res.json()
  return NextResponse.json(data)
}
