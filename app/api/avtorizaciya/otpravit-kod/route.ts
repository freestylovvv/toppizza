import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { sanitizeInput, validatePhone } from '@/lib/security'

// ============================================================
// POST /api/auth/send-code
// Шаг 1 авторизации: принимает номер телефона, генерирует код и отправляет SMS
//
// Тело запроса: { phone: string }
// Ответ успех: { success: true }
// Ответ ошибка: { success: false, error: string }
// ============================================================
export async function POST(request: Request) {
  try {
    // request.json() — парсит тело запроса как JSON
    // await — ждём пока тело запроса полностью прочитается
    const { phone } = await request.json()
    console.log('Received request:', { phone })

    // sanitizeInput удаляет опасные символы: ' " \ ;
    // Защита от SQL-инъекций на уровне приложения
    const sanitizedPhone = sanitizeInput(phone)

    // Убираем всё кроме цифр из номера телефона
    // /\D/g — регулярное выражение: \D = не цифра, g = все вхождения
    // Пример: "+7 (916) 123-45-67" → "79161234567"
    const digits = sanitizedPhone.replace(/\D/g, '')

    // Приводим к единому формату 7XXXXXXXXXX (без +, без пробелов)
    // startsWith('7') — проверяем начинается ли с 7
    // Если нет (например "9161234567") — добавляем 7 в начало
    const normalized = digits.startsWith('7') ? digits : '7' + digits

    // validatePhone ожидает формат +7XXXXXXXXXX поэтому добавляем +
    // Если формат неверный — возвращаем 400 Bad Request
    if (!validatePhone('+' + normalized)) {
      return NextResponse.json({ success: false, error: 'Invalid phone format' }, { status: 400 })
    }

    // Генерируем случайный 6-значный код
    // Math.random() → число от 0 до 1 (например 0.847291)
    // * 900000 → от 0 до 900000
    // + 100000 → от 100000 до 1000000
    // Math.floor() → убираем дробную часть → от 100000 до 999999
    // .toString() → конвертируем в строку "847291"
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Время истечения кода: текущее время + 10 минут
    // Date.now() — текущее время в миллисекундах (Unix timestamp)
    // 10 * 60 * 1000 = 600000 миллисекунд = 10 минут
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Удаляем все старые коды для этого номера
    // Это гарантирует что у одного номера всегда только один активный код
    // deleteMany — удаляет все записи подходящие под условие
    await prisma.verificationCode.deleteMany({ where: { phone: normalized } })

    // Сохраняем новый код в БД
    // create — создаёт одну новую запись
    await prisma.verificationCode.create({
      data: { phone: normalized, code, expiresAt },
    })

    // Отправляем SMS с кодом через SMS Aero API
    // Если SMS не отправится — выбросится исключение и попадём в catch
    await sendSms(normalized, `Top Pizza: ваш код подтверждения ${code}`)

    // Возвращаем успешный ответ (код не возвращаем клиенту — только по SMS!)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    // 500 Internal Server Error — что-то пошло не так на сервере
    return NextResponse.json({ success: false, error: error.message || 'Failed to send code' }, { status: 500 })
  }
}
