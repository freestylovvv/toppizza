export async function sendSms(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  const url = `https://sms.ru/sms/send?api_id=${process.env.SMSRU_API_KEY}&to=${cleanPhone}&msg=${encodeURIComponent(message)}&json=1`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK') {
    throw new Error(`SMS error: ${JSON.stringify(data)}`)
  }
}
