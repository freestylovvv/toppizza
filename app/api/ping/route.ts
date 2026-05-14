import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// force-dynamic — не кэшировать, каждый запрос идёт напрямую
export const dynamic = 'force-dynamic'

// GET /api/ping — healthcheck эндпоинт
// Проверяет что сервер жив и БД отвечает (SELECT 1)
// Используется для мониторинга и keep-alive (чтобы БД не засыпала)
export async function GET() {
  await prisma.$queryRaw`SELECT 1`
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}
