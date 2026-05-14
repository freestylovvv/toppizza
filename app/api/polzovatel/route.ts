import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================
// PUT /api/user — обновляет данные профиля пользователя
//
// Вызывается со страницы /profile когда пользователь
// нажимает "Сохранить" в любом из полей профиля.
//
// Тело запроса: { id, name, phone, email?, birthday? }
// Ответ: { success: true, user: {...} }
// ============================================================
export async function PUT(request: Request) {
  try {
    const { id, name, phone, email, birthday } = await request.json()

    const user = await prisma.user.update({
      where: { id }, // находим пользователя по ID
      data: {
        name,
        phone,
        email: email || null,
        // email || null — если email пустая строка ("") или undefined — сохраняем null
        // Это важно: пустая строка и null — разные значения в БД
        // null означает "не указан", "" означает "указан но пустой"

        birthday: birthday ? new Date(birthday) : null,
        // birthday приходит как строка "2000-01-15" (из HTML input type="date")
        // new Date("2000-01-15") конвертирует строку в объект Date
        // Prisma ожидает Date, не строку
        // Если birthday не передан — сохраняем null
      },
    })

    // Возвращаем обновлённого пользователя — фронтенд обновит localStorage
    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

// ============================================================
// GET /api/user?id=... — возвращает профиль пользователя с историей заказов
//
// Вызывается при загрузке страницы /profile
// Возвращает данные пользователя + заказы за последние 90 дней
//
// Query параметр: id — числовой ID пользователя
// Ответ: { success: true, user: { ...данные, orders: [...] } }
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // new URL(request.url) — парсим полный URL в объект
    // searchParams — объект для работы с ?key=value параметрами
    const id = searchParams.get('id') // получаем значение параметра id

    if (!id) {
      // ID не передан — возвращаем 400 Bad Request
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }, // parseInt конвертирует строку "5" в число 5
      include: {
        orders: {
          // Сортируем заказы от новых к старым
          orderBy: { createdAt: 'desc' },

          where: {
            createdAt: {
              // Фильтр: только заказы за последние 90 дней
              // gte = greater than or equal (больше или равно)
              // Date.now() — текущее время в миллисекундах
              // 90 * 24 * 60 * 60 * 1000 = 90 дней в миллисекундах
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },

          include: {
            items: true, // подгружаем позиции каждого заказа (OrderItem[])
            // Нужно для отображения списка товаров в истории заказов
          },
        },
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get user' }, { status: 500 })
  }
}
