import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// GET /api/geocode/reverse?lat=...&lon=... — обратное геокодирование
//
// Получает адрес по координатам (обратное геокодирование).
// Вызывается когда пользователь кликает на карту в форме оформления заказа.
// Пример: lat=55.7558, lon=37.6173 → "Москва, Тверская улица, 6"
// ============================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') // широта (например 55.7558)
  const lon = searchParams.get('lon') // долгота (например 37.6173)

  // Nominatim reverse geocoding API — преобразует координаты в адрес
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { 'User-Agent': 'TopPizza/1.0' } }
  )
  const data = await res.json()
  // Ответ содержит поле display_name с полным адресом
  // и объект address с отдельными полями (road, house_number, city и т.д.)
  return NextResponse.json(data)
}
