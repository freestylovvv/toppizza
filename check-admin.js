const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdmin() {
  console.log('🔍 Проверка данных админа...')
  
  try {
    // Ищем всех пользователей с телефоном
    const usersByPhone = await prisma.user.findMany({
      where: {
        phone: {
          contains: '79224787786'
        }
      }
    })
    
    console.log('📱 Пользователи по телефону 79224787786:', usersByPhone)
    
    // Ищем всех пользователей с email
    const usersByEmail = await prisma.user.findMany({
      where: {
        email: {
          contains: 'svyatoslovvv@gmail.com'
        }
      }
    })
    
    console.log('📧 Пользователи по email svyatoslovvv@gmail.com:', usersByEmail)
    
    // Ищем всех админов
    const admins = await prisma.user.findMany({
      where: {
        isAdmin: true
      }
    })
    
    console.log('👑 Все админы:', admins)
    
    // Показываем всех пользователей
    const allUsers = await prisma.user.findMany()
    console.log('👥 Все пользователи:', allUsers)
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()