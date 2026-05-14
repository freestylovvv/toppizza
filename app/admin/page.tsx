import { prisma } from '@/lib/prisma'
import AdminClient from '@/components/AdminClient'

// ============================================================
// СТРАНИЦА АДМИН-ПАНЕЛИ — серверный компонент Next.js
//
// Загружает все данные параллельно и передаёт их в AdminClient.
// AdminClient — клиентский компонент с интерактивным интерфейсом.
//
// Разделение на серверный + клиентский компонент:
// - Серверный (этот файл) — загружает данные из БД
// - Клиентский (AdminClient) — рендерит интерфейс, обрабатывает события
//
// Проверка прав администратора происходит в AdminClient
// через localStorage (isAdmin флаг пользователя).
// ============================================================

// force-dynamic — отключаем кэширование, данные всегда свежие
// Важно для админки — нужны актуальные данные при каждом открытии
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    // Promise.all — загружаем все данные параллельно для скорости
    const [users, products, categories, orders, ingredients, banners] = await Promise.all([
      prisma.user.findMany({ include: { orders: true }, orderBy: { createdAt: 'desc' } }),
      // include: { orders: true } — подгружаем заказы каждого пользователя (для счётчика)
      prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { id: 'desc' } }),
      prisma.category.findMany({ include: { products: true }, orderBy: { id: 'asc' } }),
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
      // take: 50 — ограничиваем 50 заказами (достаточно для отображения)
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),
    ])

    return (
      <AdminClient
        initialUsers={users}
        initialProducts={products}
        initialCategories={categories}
        initialOrders={orders}
        initialIngredients={ingredients}
        initialBanners={banners}
      />
    )
  } catch (error) {
    // При ошибке БД рендерим AdminClient с пустыми данными (не крашим страницу)
    // AdminClient сам покажет пустые списки
    console.error('Failed to load admin page:', error)
    return (
      <AdminClient
        initialUsers={[]}
        initialProducts={[]}
        initialCategories={[]}
        initialOrders={[]}
        initialIngredients={[]}
        initialBanners={[]}
      />
    )
  }
}
