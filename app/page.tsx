import { prisma } from '@/lib/prisma'
import HomeClient from '@/components/HomeClient'

export const revalidate = 60

export default async function Home() {
  const [categoriesRaw, productsRaw, banners] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.product.findMany({ include: { category: true, variants: true } }),
    prisma.banner.findMany({ orderBy: { order: 'asc' } }),
  ])

  const categories = categoriesRaw
    .map(cat => ({
      ...cat,
      products: productsRaw.filter(p => p.categoryId === cat.id),
    }))
    .filter(cat => cat.products.length > 0)

  return <HomeClient categories={categories} banners={banners} />
}