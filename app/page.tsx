'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import BannerCarousel from '@/components/BannerCarousel'
import { prisma } from '@/lib/prisma'

export default function Home() {
  const [categories, setCategories] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(res => res.json()),
      fetch('/api/admin/products').then(res => res.json())
    ]).then(([categoriesData, productsData]) => {
      if (categoriesData.success && productsData.success) {
        const orderedCategories = categoriesData.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          products: productsData.products.filter((p: any) => p.category.id === cat.id)
        })).filter((cat: any) => cat.products.length > 0)
        setCategories(orderedCategories)
      }
    })
    
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBanners(data.banners)
      })
  }, [])

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
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {category.name}
              </a>
            ))}
          </nav>

          {categories.map((category) => (
            <section key={category.id} id={category.name} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>{category.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {category.products.map((product: any) => (
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
