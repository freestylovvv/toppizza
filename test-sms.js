// Тест SMS Aero API
const email = 'svyatoslovvv@gmail.com'
const apiKey = 'hZifutS1P2etCsRrXdk5kRUUaw0lg0AH'

async function testSMSAero() {
  console.log('Testing SMS Aero credentials...')
  
  // Тест баланса
  const balanceUrl = 'https://gate.smsaero.ru/v2/balance'
  
  try {
    const response = await fetch(balanceUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    })
    
    const result = await response.json()
    
    console.log('Balance check response:', {
      status: response.status,
      result
    })
    
    if (response.ok && result.success) {
      console.log('✅ Credentials are valid!')
      console.log('💰 Balance:', result.data.balance)
    } else {
      console.log('❌ Credentials are invalid!')
      console.log('Error:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testSMSAero()