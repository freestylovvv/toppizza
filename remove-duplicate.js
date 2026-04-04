const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeDuplicate() {
  console.log('🗑️ Удаление дублированного пользователя...')
  
  try {
    // Удаляем дубликат (id: 3) - обычный пользователь без админских прав
    const deleted = await prisma.user.delete({
      where: { id: 3 }
    })
    
    console.log('✅ Удален дубликат:', deleted)
    
    // Проверяем что остался только админ
    const remaining = await prisma.user.findMany({
      where: {
        phone: {
          contains: '79224787786'
        }
      }
    })
    
    console.log('👑 Оставшиеся пользователи с этим номером:', remaining)
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

removeDuplicate()