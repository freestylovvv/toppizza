import { NextRequest, NextResponse } from 'next/server'

// GET /api/geocode/search?q=... — поиск адреса по тексту через Nominatim (OpenStreetMap)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') // поисковый запрос
  // Проксируем запрос к Nominatim API (чтобы не раскрывать его клиенту напрямую)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q || '')}`, {
    headers: { 'User-Agent': 'TopPizza/1.0' } // Nominatim требует User-Agent
  })
  const data = await res.json()
  return NextResponse.json(data) // возвращаем массив найденных мест
}
