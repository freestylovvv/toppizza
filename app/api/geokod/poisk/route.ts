import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// GET /api/geocode/search?q=... — поиск адреса по тексту
//
// Используется в компоненте AddressMap когда пользователь вводит адрес.
// Например: "Москва, Тверская 6" → координаты на карте.
//
// Почему проксируем через сервер (не запрашиваем из браузера напрямую):
// 1. Nominatim требует заголовок User-Agent — браузер не может его установить
// 2. CORS — браузер блокирует прямые запросы к сторонним API
// ============================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') // поисковый запрос (текст адреса)

  // encodeURIComponent — кодируем спецсимволы для URL
  // Например: "Москва, ул. Тверская" → "%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0..."
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q || '')}`,
    {
      headers: { 'User-Agent': 'TopPizza/1.0' } // Nominatim требует User-Agent по правилам использования
    }
  )
  const data = await res.json()
  // Возвращаем массив найденных мест, каждое содержит:
  // { display_name: "полный адрес", lat: "широта", lon: "долгота", ... }
  return NextResponse.json(data)
}
