const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🔍 Проверка подключения к базе данных...')
  
  try {
    // Тест подключения
    await prisma.$connect()
    console.log('✅ Подключение к БД успешно!')
    
    // Проверка таблиц
    const categories = await prisma.category.count()
    const products = await prisma.product.count()
    const users = await prisma.user.count()
    const orders = await prisma.order.count()
    
    console.log('📊 Статистика БД:')
    console.log(`   Категории: ${categories}`)
    console.log(`   Товары: ${products}`)
    console.log(`   Пользователи: ${users}`)
    console.log(`   Заказы: ${orders}`)
    
    // Тест создания записи
    console.log('\n🧪 Тест создания тестовой записи...')
    
    const testCode = await prisma.verificationCode.create({
      data: {
        phone: '79999999999',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    })
    
    console.log('✅ Тестовая запись создана:', testCode.id)
    
    // Удаляем тестовую запись
    await prisma.verificationCode.delete({
      where: { id: testCode.id }
    })
    
    console.log('✅ Тестовая запись удалена')
    console.log('\n🎉 База данных работает корректно!')
    
  } catch (error) {
    console.error('❌ Ошибка БД:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Проблема с подключением к серверу БД')
    } else if (error.code === 'P2002') {
      console.log('💡 Нарушение уникальности данных')
    } else if (error.code === 'P2025') {
      console.log('💡 Запись не найдена')
    }
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Отключение от БД')
  }
}

testDatabase()