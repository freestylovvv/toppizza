import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import BannerCarousel from '@/components/BannerCarousel'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // кэш на 60 секунд

export default async function Home() {
  const [categoriesRaw, productsRaw, banners] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.product.findMany({ include: { category: true, variants: true } }),
    prisma.banner.findMany({ orderBy: { order: 'asc' } }).then(b => b.map(x => ({ ...x, subtitle: x.subtitle ?? undefined }))),
  ])

  const categories = categoriesRaw
    .map(cat => ({
      ...cat,
      products: productsRaw.filter(p => p.categoryId === cat.id),
    }))
    .filter(cat => cat.products.length > 0)

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '104px' }}>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <div style={{ flex: 1 }}>
          <BannerCarousel banners={banners} />

          <nav className="category-nav">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.name}`}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#fff',
                  borderRadius: '9999px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#000',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {category.name}
              </a>
            ))}
          </nav>

          {categories.map((category) => (
            <section key={category.id} id={category.name} style={{ marginBottom: '40px' }}>
              <h2 className="category-title">{category.name}</h2>
              <div className="products-grid">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <Cart />
      </main>
      <Footer />
    </div>
  )
}
