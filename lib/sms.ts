// ============================================================
// SMS AERO API — отправка SMS сообщений
//
// SMS Aero — российский сервис для отправки SMS.
// Используется для отправки кодов подтверждения при авторизации.
//
// Документация API: https://smsaero.ru/integration/api/
// Авторизация: Basic Auth (email:apiKey в Base64)
// ============================================================

// Основная функция отправки SMS
// phone — номер телефона получателя
// message — текст SMS сообщения
export async function sendSms(phone: string, message: string) {

  // Получаем учётные данные из переменных окружения
  // process.env — объект со всеми переменными окружения из .env файла
  const email = process.env.SMSAERO_EMAIL   // email аккаунта в SMS Aero
  const apiKey = process.env.SMSAERO_API_KEY // API ключ из личного кабинета SMS Aero

  // Если переменные не настроены — бросаем ошибку немедленно
  // Это лучше чем получить непонятную ошибку от API
  if (!email || !apiKey) {
    throw new Error('SMS Aero credentials not configured')
  }

  // Нормализация номера телефона
  // replace(/\D/g, '') — удаляем все нецифровые символы
  // \D — любой символ кроме цифры, g — глобально (все вхождения)
  // Пример: "+7 (916) 123-45-67" → "79161234567"
  const normalizedPhone = phone.replace(/\D/g, '')

  // SMS Aero ожидает номер без + в формате 7XXXXXXXXXX
  // Если номер начинается с 7 — оставляем как есть
  // Если нет (например передали "9161234567") — добавляем 7 в начало
  const formattedPhone = normalizedPhone.startsWith('7') ? normalizedPhone : '7' + normalizedPhone

  // URL эндпоинта SMS Aero для отправки SMS
  const url = 'https://gate.smsaero.ru/v2/sms/send'

  // URLSearchParams — встроенный класс для формирования query параметров
  // Автоматически кодирует специальные символы (encodeURIComponent)
  const params = new URLSearchParams({
    number: formattedPhone, // номер получателя
    text: message,          // текст SMS (максимум 160 символов для одного SMS)
    sign: 'SMS Aero',       // подпись отправителя (отображается вместо номера)
    channel: 'DIRECT'       // канал: DIRECT — прямая отправка через операторов
  })

  // Отправляем GET запрос к API SMS Aero
  // SMS Aero использует GET (не POST) для отправки — параметры в URL
  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      // Basic авторизация: "Basic " + base64(email:apiKey)
      // Buffer.from(`${email}:${apiKey}`) — создаём Buffer из строки "email:apiKey"
      // .toString('base64') — конвертируем в Base64
      'Authorization': `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    // AbortSignal.timeout(10000) — автоматически отменяем запрос через 10 секунд
    // Без таймаута запрос может висеть бесконечно если сервер не отвечает
    signal: AbortSignal.timeout(10000)
  })

  // Парсим JSON ответ от API
  const result = await response.json()

  // Проверяем успешность:
  // response.ok — HTTP статус 200-299
  // result.success — поле в ответе SMS Aero (true если SMS отправлено)
  if (!response.ok || !result.success) {
    throw new Error('SMS sending failed')
  }

  return result // возвращаем ответ API (содержит ID отправленного SMS)
}
