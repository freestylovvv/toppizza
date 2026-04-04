import { prisma } from '@/lib/prisma'
import AdminClient from '@/components/AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    const [users, codes, products, categories, orders, ingredients, banners] = await Promise.all([
      prisma.user.findMany({ include: { orders: true }, orderBy: { createdAt: 'desc' } }),
      prisma.verificationCode.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { id: 'desc' } }),
      prisma.category.findMany({ include: { products: true }, orderBy: { id: 'asc' } }),
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),
    ])

    return (
      <AdminClient
        initialUsers={users}
        initialCodes={codes}
        initialProducts={products}
        initialCategories={categories}
        initialOrders={orders}
        initialIngredients={ingredients}
        initialBanners={banners}
      />
    )
  } catch (error) {
    console.error('Failed to load admin page:', error)
    return (
      <AdminClient
        initialUsers={[]}
        initialCodes={[]}
        initialProducts={[]}
        initialCategories={[]}
        initialOrders={[]}
        initialIngredients={[]}
        initialBanners={[]}
      />
    )
  }
}
