import { prisma } from '@/lib/prisma'
import HomeClient from '@/components/HomeClient'

// ============================================================
// ГЛАВНАЯ СТРАНИЦА — серверный компонент Next.js
//
// Серверный компонент (Server Component) — выполняется на сервере,
// не отправляется в браузер как JavaScript.
// Преимущества:
// - Прямой доступ к БД (без API запросов)
// - Данные загружаются до отправки HTML клиенту (нет мигания)
// - Меньше JS в браузере = быстрее загрузка
//
// Отличие от клиентского компонента:
// - Нет useState, useEffect, обработчиков событий
// - Можно использовать async/await напрямую
// ============================================================

// revalidate = 60 — ISR (Incremental Static Regeneration)
// Next.js кеширует эту страницу и обновляет её каждые 60 секунд.
// Это значит: первый запрос загружает данные из БД,
// следующие 60 секунд все пользователи получают кешированную версию,
// затем Next.js тихо обновляет кеш в фоне.
// Баланс между производительностью и актуальностью данных.
export const revalidate = 60

// Асинхронная функция — главная страница
// async позволяет использовать await для запросов к БД
export default async function Home() {
  try {
    // Promise.all — запускает все запросы ПАРАЛЛЕЛЬНО
    // Без Promise.all запросы шли бы последовательно: 5 запросов × ~50мс = ~250мс
    // С Promise.all все 5 запросов идут одновременно: ~50мс суммарно
    const [categoriesData, productsData, banners, allIngredients, combos] = await Promise.all([

      // Запрос 1: все категории, отсортированные по ID (порядок создания)
      prisma.category.findMany({ orderBy: { id: 'asc' } }),

      // Запрос 2: все товары с вложенными данными
      // include: { category: true } — подгружаем объект категории для каждого товара
      // include: { variants: true } — подгружаем все варианты (размеры/цены)
      // orderBy: { id: 'desc' } — новые товары первыми
      prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { id: 'desc' } }),

      // Запрос 3: баннеры для карусели, отсортированные по полю order (порядок отображения)
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),

      // Запрос 4: все ингредиенты (платные добавки), по алфавиту
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),

      // Запрос 5: комбо-наборы с позициями, новые первыми
      // include: { items: true } — подгружаем список товаров в каждом комбо
      prisma.combo.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
    ])

    // Соусы больше не нужны отдельно — каждый товар сам знает что предлагать
    // Формируем словарь: categoryId → список товаров этой категории
    const productsByCategory: Record<number, { id: number; name: string; imageUrl: string; price: number }[]> = {}
    productsData.forEach(p => {
      const price = p.variants[0]?.price || 0
      if (!productsByCategory[p.category.id]) productsByCategory[p.category.id] = []
      productsByCategory[p.category.id].push({ id: p.id, name: p.name, imageUrl: p.imageUrl, price })
    })

    // Добавляем relatedProducts к каждому товару
    const productsWithRelated = productsData.map(p => ({
      ...p,
      relatedProducts: p.relatedCategoryId ? (productsByCategory[p.relatedCategoryId] || []) : [],
    }))

    const categories = categoriesData
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        products: productsWithRelated.filter((p) => p.category.id === cat.id),
      }))
      .filter((cat) => cat.products.length > 0)

    // Выбираем соусы отдельно для показа в модалке товара
    // Соусы — это товары из категории с "соус" в названии
    const sauces = productsData
      .filter((p) => p.category?.name?.toLowerCase().includes('соус'))
      // ?. — опциональная цепочка, защита от null если category не загружена
      // toLowerCase() — приводим к нижнему регистру для сравнения без учёта регистра
      .map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.variants[0]?.price || 0 // берём цену первого варианта (у соусов обычно один)
      }))

    return <HomeClient
      categories={categories}
      banners={banners}
      allIngredients={allIngredients}
      sauces={[]}
      combos={combos}
      allProducts={productsWithRelated}
    />
  } catch (error) {
    // Если БД недоступна — не крашим сайт, показываем пустую страницу
    // Пользователь увидит сайт без товаров, а не страницу ошибки 500
    console.error('Failed to load home page:', error)
    return <HomeClient categories={[]} banners={[]} allIngredients={[]} sauces={[]} combos={[]} allProducts={[]} />
  }
}
