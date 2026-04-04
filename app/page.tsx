import { prisma } from '@/lib/prisma'
import HomeClient from '@/components/HomeClient'

export const revalidate = 60

export default async function Home() {
  try {
    const [categoriesData, productsData, banners, allIngredients, combos] = await Promise.all([
      prisma.category.findMany({ orderBy: { id: 'asc' } }),
      prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { id: 'desc' } }),
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      prisma.combo.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
    ])

    const categories = categoriesData
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        products: productsData.filter((p) => p.category.id === cat.id),
      }))
      .filter((cat) => cat.products.length > 0)

    const sauces = productsData
      .filter((p) => p.category?.name?.toLowerCase().includes('соус'))
      .map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl, price: p.variants[0]?.price || 0 }))

    return <HomeClient categories={categories} banners={banners} allIngredients={allIngredients} sauces={sauces} combos={combos} allProducts={productsData} />
  } catch (error) {
    console.error('Failed to load home page:', error)
    return <HomeClient categories={[]} banners={[]} allIngredients={[]} sauces={[]} combos={[]} allProducts={[]} />
  }
}
