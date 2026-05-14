import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, validatePhone, encrypt } from '@/lib/security'

// ============================================================
// POST /api/auth/verify-code
// Шаг 2 авторизации: проверяет введённый код и авторизует пользователя
//
// Тело запроса: { phone: string, code: string, name?: string }
//   name — передаётся только при регистрации нового пользователя
//
// Возможные ответы:
//   { success: true, user: {...} } — успешная авторизация
//   { success: true, needName: true } — новый пользователь, нужно имя
//   { success: false, error: string } — ошибка
// ============================================================
export async function POST(request: Request) {
  try {
    // Деструктурируем тело запроса: phone и code обязательны, name необязателен
    const { phone, name, code } = await request.json()

    // Очищаем входные данные от опасных символов
    const sanitizedPhone = sanitizeInput(phone)
    const sanitizedCode = sanitizeInput(code)

    // Нормализуем телефон к формату 7XXXXXXXXXX
    const digits = sanitizedPhone.replace(/\D/g, '')
    const normalized = digits.startsWith('7') ? digits : '7' + digits

    if (!validatePhone('+' + normalized)) {
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }

    // Ищем код в таблице VerificationCode
    // Условие: phone совпадает И code совпадает И код ещё не истёк
    // expiresAt: { gte: new Date() } — expiresAt >= текущее время (код ещё действителен)
    // gte = greater than or equal (больше или равно)
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: normalized,
        code: sanitizedCode,
        expiresAt: { gte: new Date() } // код не истёк
      },
    })

    // Если код не найден (неверный) или истёк — отказываем
    // Не говорим конкретно что именно неверно — защита от перебора
    if (!verification) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    // Ищем пользователя по телефону
    // OR — ищем с + и без + (разные форматы могли сохраниться в БД)
    // findFirst — возвращает первую найденную запись или null
    let user = await prisma.user.findFirst({
      where: { OR: [{ phone: normalized }, { phone: '+' + normalized }] }
    })

    if (!user) {
      // Пользователь с таким телефоном не найден — это новая регистрация

      if (!name) {
        // Имя не передано — просим фронтенд показать поле для ввода имени
        // needName: true — специальный флаг для фронтенда
        return NextResponse.json({ success: true, needName: true })
      }

      // Имя передано — создаём нового пользователя
      // sanitizeInput(name) — очищаем имя от опасных символов
      user = await prisma.user.create({
        data: { name: sanitizeInput(name), phone: normalized }
      })
    }

    // Удаляем использованный код из БД
    // Код одноразовый — после успешной проверки он больше не нужен
    // deleteMany — удаляем все коды для этого номера (на случай если их несколько)
    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })

    // Деструктурируем объект пользователя, исключая зашифрованные поля
    // Зашифрованные данные не нужны клиенту — они только для хранения в БД
    // ...safeUser — все остальные поля (id, name, phone, isAdmin и т.д.)
    const { encryptedEmail, encryptedBirthday, ...safeUser } = user

    // Возвращаем данные пользователя — фронтенд сохранит их в localStorage
    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 })
  }
}
