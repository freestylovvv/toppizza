'use client'

import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import ComboCard from '@/components/ComboCard'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import BannerCarousel from '@/components/BannerCarousel'

type Ingredient = {
  id: number
  name: string
  price: number
  imageUrl: string
  categories: string
}

type SauceProduct = {
  id: number
  name: string
  imageUrl: string
  price: number
}

type Category = {
  id: number
  name: string
  products: any[]
}

type HomeClientProps = {
  categories: Category[]
  banners: any[]
  allIngredients: Ingredient[]
  sauces: SauceProduct[]
  combos: any[]
  allProducts: any[]
}

export default function HomeClient({ categories, banners, allIngredients, sauces, combos, allProducts }: HomeClientProps) {
  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '104px', position: 'relative' }}>
      <Header categories={[
        ...(combos.length > 0 ? [{ id: -1, name: 'Комбо', anchor: 'combos' }] : []),
        ...categories,
      ]} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          <BannerCarousel banners={banners} />

          <nav style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            padding: '8px 0',
          }}>
            {combos.length > 0 && (
              <a href="#combos" className="summer-nav-link">Комбо</a>
            )}
            {categories.map((category) => (
              <a key={category.id} href={`#${category.name}`} className="summer-nav-link">
                {category.name}
              </a>
            ))}
          </nav>

          {combos.length > 0 && (
            <section id="combos" style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>Комбо</h2>
              <div className="products-grid">
                {combos.map((combo) => (
                  <ComboCard key={combo.id} combo={combo} products={allProducts} allIngredients={allIngredients} />
                ))}
              </div>
            </section>
          )}

          {categories.map((category) => (
            <section key={category.id} id={category.name} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>{category.name}</h2>
              <div className="products-grid">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} allIngredients={allIngredients} sauces={['pizza','snack','combo'].includes(product.category?.type) ? sauces : []} />
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