import { prisma } from '@/lib/prisma'
import HomeClient from '@/components/HomeClient'

// ============================================================
// ГЛАВНАЯ СТРАНИЦА — серверный компонент Next.js
//
// Серверный компонент выполняется на сервере, не отправляется
// в браузер как JavaScript. Преимущества:
// - Прямой доступ к БД (без API запросов)
// - Данные загружаются до отправки HTML клиенту (нет мигания)
// - Меньше JS в браузере = быстрее загрузка
// ============================================================

// revalidate = 60 — ISR (Incremental Static Regeneration)
// Next.js кеширует страницу и обновляет её каждые 60 секунд.
// Баланс между производительностью и актуальностью данных.
export const revalidate = 60

export default async function Home() {
  try {
    // Promise.all — запускает все запросы к БД ПАРАЛЛЕЛЬНО (~50мс суммарно)
    const [categoriesData, productsData, banners, allIngredients, combos] = await Promise.all([
      prisma.category.findMany({ orderBy: { id: 'asc' } }),
      prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { id: 'desc' } }),
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      prisma.combo.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
    ])

    // Формируем словарь categoryId → товары этой категории
    // Нужен для быстрого поиска relatedProducts без вложенных циклов
    const productsByCategory: Record<number, { id: number; name: string; imageUrl: string; price: number }[]> = {}
    productsData.forEach(p => {
      const price = p.variants[0]?.price || 0
      if (!productsByCategory[p.category.id]) productsByCategory[p.category.id] = []
      productsByCategory[p.category.id].push({ id: p.id, name: p.name, imageUrl: p.imageUrl, price })
    })

    // Добавляем relatedProducts к каждому товару на основе relatedCategoryId
    // relatedCategoryId задаётся в админке — например для пиццы выбирают категорию "Соусы"
    // relatedProducts — это все товары из выбранной категории (показываются в модалке)
    const productsWithRelated = productsData.map(p => ({
      ...p,
      relatedProducts: p.relatedCategoryId ? (productsByCategory[p.relatedCategoryId] || []) : [],
    }))

    // Формируем категории с товарами, убираем пустые
    const categories = categoriesData
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        products: productsWithRelated.filter((p) => p.category.id === cat.id),
      }))
      .filter((cat) => cat.products.length > 0)

    return <HomeClient
      categories={categories}
      banners={banners}
      allIngredients={allIngredients}
      sauces={[]} // sauces больше не используются — заменены на relatedProducts
      combos={combos}
      allProducts={productsWithRelated}
    />
  } catch (error) {
    // Если БД недоступна — показываем пустую страницу вместо ошибки 500
    console.error('Failed to load home page:', error)
    return <HomeClient categories={[]} banners={[]} allIngredients={[]} sauces={[]} combos={[]} allProducts={[]} />
  }
}
