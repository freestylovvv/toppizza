import { NextRequest, NextResponse } from 'next/server'

// GET /api/geocode/reverse?lat=...&lon=... — получает адрес по координатам (обратное геокодирование)
// Вызывается когда пользователь кликает на карту в форме оформления заказа
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') // широта
  const lon = searchParams.get('lon') // долгота
  // Проксируем запрос к Nominatim reverse geocoding API
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
    headers: { 'User-Agent': 'TopPizza/1.0' }
  })
  const data = await res.json()
  return NextResponse.json(data) // возвращает объект с полем display_name (полный адрес)
}
