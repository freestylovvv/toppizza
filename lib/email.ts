// nodemailer — популярная Node.js библиотека для отправки email
// Устанавливается через: npm install nodemailer
import nodemailer from 'nodemailer'

// ============================================================
// НАСТРОЙКА SMTP ТРАНСПОРТА
//
// Transporter — объект который знает КАК отправлять письма
// (через какой сервер, с какими учётными данными).
// Создаётся один раз при загрузке модуля и переиспользуется.
//
// Используем Gmail как SMTP сервер.
// Для Gmail нужно:
// 1. Включить двухфакторную аутентификацию в аккаунте Google
// 2. Создать "Пароль приложения" (не обычный пароль аккаунта!)
// 3. Использовать этот пароль в EMAIL_PASS
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  // service: 'gmail' — nodemailer знает настройки Gmail (хост, порт и т.д.)
  // Альтернатива: указать host/port вручную:
  // host: 'smtp.gmail.com', port: 465

  secure: true,
  // secure: true — использовать SSL/TLS шифрование с самого начала соединения
  // Порт 465 (SSL) вместо порта 587 (STARTTLS)
  // Без этого данные передаются в открытом виде — уязвимость CWE-319

  auth: {
    user: process.env.EMAIL_USER, // email адрес отправителя (из .env)
    pass: process.env.EMAIL_PASS, // пароль приложения Gmail (из .env)
    // ВАЖНО: это не обычный пароль от Gmail аккаунта!
    // Это специальный "App Password" из настроек безопасности Google
  },
})

// ============================================================
// ФУНКЦИЯ sendVerificationCode
// Отправляет красиво оформленное письмо с кодом подтверждения
//
// Параметры:
//   email — адрес получателя
//   code — 6-значный код подтверждения
//
// Используется при подтверждении email адреса пользователя
// ============================================================
export async function sendVerificationCode(email: string, code: string) {
  // sendMail — асинхронная функция отправки письма
  // await — ждём пока письмо будет принято SMTP сервером
  // (не гарантирует доставку, только что сервер принял письмо)
  await transporter.sendMail({
    from: process.env.EMAIL_USER, // адрес отправителя (должен совпадать с auth.user)
    to: email,                    // адрес получателя
    subject: 'Код подтверждения - Top Pizza', // тема письма

    // html — HTML версия письма (отображается в современных почтовых клиентах)
    // Используем шаблонную строку (template literal) с ${code} для подстановки кода
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <!-- viewport для корректного отображения на мобильных -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <!-- Внешний body: серый фон, системные шрифты -->
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <!-- Внешняя таблица на всю ширину — стандартный подход для email вёрстки -->
        <!-- Email клиенты плохо поддерживают flexbox/grid, поэтому используем таблицы -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Внутренняя таблица шириной 600px — стандартная ширина email -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">

                <!-- ШАПКА: оранжевый градиент с логотипом -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ff6900 0%, #ff8533 100%); padding: 40px; text-align: center;">
                    <!-- SVG логотип пиццы — встроен прямо в письмо (не внешний файл) -->
                    <!-- Внешние картинки часто блокируются почтовыми клиентами -->
                    <svg width="60" height="60" viewBox="0 0 40 40" style="display: inline-block;">
                      <circle cx="20" cy="20" r="18" fill="#fff"/>        <!-- белый круг фон -->
                      <circle cx="20" cy="20" r="15" fill="#ffb366"/>     <!-- оранжевый круг пицца -->
                      <circle cx="14" cy="16" r="2" fill="#ff6900"/>      <!-- топпинг -->
                      <circle cx="26" cy="16" r="2" fill="#ff6900"/>      <!-- топпинг -->
                      <circle cx="20" cy="24" r="2" fill="#ff6900"/>      <!-- топпинг -->
                      <circle cx="16" cy="22" r="1.5" fill="#ff6900"/>    <!-- топпинг маленький -->
                      <circle cx="24" cy="22" r="1.5" fill="#ff6900"/>    <!-- топпинг маленький -->
                      <circle cx="18" cy="18" r="1.5" fill="#ff6900"/>    <!-- топпинг маленький -->
                      <circle cx="22" cy="18" r="1.5" fill="#ff6900"/>    <!-- топпинг маленький -->
                      <path d="M20 8 L22 10 L20 12 L18 10 Z" fill="#4CAF50"/> <!-- зелёный листик -->
                    </svg>
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 16px 0 0 0;">Top Pizza</h1>
                  </td>
                </tr>

                <!-- ТЕЛО ПИСЬМА: код подтверждения -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">Код подтверждения</h2>
                    <p style="color: #6b6b6b; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0; text-align: center;">Введите этот код для подтверждения вашего email:</p>

                    <!-- Блок с кодом: оранжевая рамка, крупный шрифт, моноширинный -->
                    <div style="background-color: #fff5e1; border: 2px solid #ff6900; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px 0;">
                      <!-- ${code} — подставляем реальный код из параметра функции -->
                      <!-- letter-spacing: 12px — расстояние между цифрами для читаемости -->
                      <!-- Courier New — моноширинный шрифт, все цифры одинаковой ширины -->
                      <div style="color: #ff6900; font-size: 48px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">${code}</div>
                    </div>

                    <p style="color: #6b6b6b; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">Код действителен в течение <strong>10 минут</strong>.</p>
                  </td>
                </tr>

                <!-- ПОДВАЛ ПИСЬМА: дисклеймер -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">Если вы не запрашивали этот код, просто игнорируйте это письмо.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}
