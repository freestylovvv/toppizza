const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categories = [
    { name: 'Пиццы' },
    { name: 'Комбо' },
    { name: 'Римские пиццы' },
    { name: 'Закуски' },
    { name: 'Кофе' },
    { name: 'Напитки' },
    { name: 'Коктейли' },
    { name: 'Завтраки' },
    { name: 'Десерты' },
  ]

  for (const cat of categories) {
    await prisma.category.create({ data: cat })
  }

  const pizzaCategory = await prisma.category.findFirst({ where: { name: 'Пиццы' } })

  if (pizzaCategory) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Пепперони',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
        {
          name: 'Маргарита',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
        {
          name: 'Четыре сыра',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
        {
          name: 'Мясная',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
        {
          name: 'Гавайская',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
        {
          name: 'Барбекю',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍕%3C/text%3E%3C/svg%3E',
          categoryId: pizzaCategory.id,
        },
      ],
    })

    const products = await prisma.product.findMany({ where: { categoryId: pizzaCategory.id } })
    
    for (const product of products) {
      await prisma.variant.createMany({
        data: [
          { productId: product.id, size: 'Маленькая 25 см', price: 395 },
          { productId: product.id, size: 'Средняя 30 см', price: 595 },
          { productId: product.id, size: 'Большая 35 см', price: 795 },
        ],
      })
    }
  }

  const snacksCategory = await prisma.category.findFirst({ where: { name: 'Закуски' } })

  if (snacksCategory) {
    const snacks = await prisma.product.createMany({
      data: [
        {
          name: 'Куриные крылышки',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍗%3C/text%3E%3C/svg%3E',
          categoryId: snacksCategory.id,
        },
        {
          name: 'Картофель фри',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🍟%3C/text%3E%3C/svg%3E',
          categoryId: snacksCategory.id,
        },
      ],
    })

    const snackProducts = await prisma.product.findMany({ where: { categoryId: snacksCategory.id } })
    
    for (const product of snackProducts) {
      await prisma.variant.create({
        data: { productId: product.id, size: 'Стандарт', price: 195 },
      })
    }
  }

  const drinksCategory = await prisma.category.findFirst({ where: { name: 'Напитки' } })

  if (drinksCategory) {
    const drinks = await prisma.product.createMany({
      data: [
        {
          name: 'Coca-Cola',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🥤%3C/text%3E%3C/svg%3E',
          categoryId: drinksCategory.id,
        },
        {
          name: 'Сок апельсиновый',
          imageUrl: 'data:image/svg+xml,%3Csvg width="280" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="280" height="200" fill="%23f9f9f9"/%3E%3Ccircle cx="140" cy="100" r="60" fill="%23ff6900" opacity="0.2"/%3E%3Ctext x="140" y="110" font-family="Arial" font-size="16" fill="%236b6b6b" text-anchor="middle"%3E🧃%3C/text%3E%3C/svg%3E',
          categoryId: drinksCategory.id,
        },
      ],
    })

    const drinkProducts = await prisma.product.findMany({ where: { categoryId: drinksCategory.id } })
    
    for (const product of drinkProducts) {
      await prisma.variant.create({
        data: { productId: product.id, size: '0.5 л', price: 95 },
      })
    }
  }

  console.log('База данных заполнена!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
