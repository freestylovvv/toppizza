'use client'

import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import BannerCarousel from '@/components/BannerCarousel'

type Category = {
  id: number
  name: string
  products: any[]
}

type HomeClientProps = {
  categories: Category[]
  banners: any[]
}

export default function HomeClient({ categories, banners }: HomeClientProps) {
  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '104px' }}>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <BannerCarousel banners={banners} />

          <nav style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            padding: '8px 0',
          }}>
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
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>{category.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
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