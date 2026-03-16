import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Код подтверждения - Top Pizza',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background: linear-gradient(135deg, #ff6900 0%, #ff8533 100%); padding: 40px; text-align: center;">
                    <svg width="60" height="60" viewBox="0 0 40 40" style="display: inline-block;">
                      <circle cx="20" cy="20" r="18" fill="#fff"/>
                      <circle cx="20" cy="20" r="15" fill="#ffb366"/>
                      <circle cx="14" cy="16" r="2" fill="#ff6900"/>
                      <circle cx="26" cy="16" r="2" fill="#ff6900"/>
                      <circle cx="20" cy="24" r="2" fill="#ff6900"/>
                      <circle cx="16" cy="22" r="1.5" fill="#ff6900"/>
                      <circle cx="24" cy="22" r="1.5" fill="#ff6900"/>
                      <circle cx="18" cy="18" r="1.5" fill="#ff6900"/>
                      <circle cx="22" cy="18" r="1.5" fill="#ff6900"/>
                      <path d="M20 8 L22 10 L20 12 L18 10 Z" fill="#4CAF50"/>
                    </svg>
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 16px 0 0 0;">Top Pizza</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #000; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">Код подтверждения</h2>
                    <p style="color: #6b6b6b; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0; text-align: center;">Введите этот код для подтверждения вашего email:</p>
                    <div style="background-color: #fff5e1; border: 2px solid #ff6900; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px 0;">
                      <div style="color: #ff6900; font-size: 48px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">${code}</div>
                    </div>
                    <p style="color: #6b6b6b; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">Код действителен в течение <strong>10 минут</strong>.</p>
                  </td>
                </tr>
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
