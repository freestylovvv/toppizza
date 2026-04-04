// SMS Aero API для отправки SMS
export async function sendSms(phone: string, message: string) {
  const email = process.env.SMSAERO_EMAIL
  const apiKey = process.env.SMSAERO_API_KEY
  
  console.log('SMS Aero config:', { email, apiKey: apiKey ? 'SET' : 'NOT SET' })
  
  if (!email || !apiKey) {
    throw new Error('SMS Aero credentials not configured')
  }
  
  // Нормализация номера телефона
  const normalizedPhone = phone.replace(/\D/g, '')
  const formattedPhone = normalizedPhone.startsWith('7') ? normalizedPhone : '7' + normalizedPhone
  
  console.log('Sending SMS to:', formattedPhone)
  console.log('Message:', message)
  
  const url = 'https://gate.smsaero.ru/v2/sms/send'
  
  const params = new URLSearchParams({
    number: formattedPhone,
    text: message,
    sign: 'TopPizza', // Короткая подпись
    channel: 'DIRECT' // Прямой канал (быстрее)
  })
  
  const requestUrl = `${url}?${params}`
  console.log('Request URL:', requestUrl)
  
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    // Увеличиваем timeout
    signal: AbortSignal.timeout(10000) // 10 секунд
  })
  
  const result = await response.json()
  
  console.log('SMS Aero response:', { status: response.status, result })
  
  if (!response.ok || !result.success) {
    console.error('SMS Aero error:', result)
    throw new Error(`SMS sending failed: ${result.message || 'Unknown error'}`)
  }
  
  return result
}
