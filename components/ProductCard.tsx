'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Variant = {
  id: number
  size: string
  price: number
}

type Product = {
  id: number
  name: string
  imageUrl: string
  ingredients: string
  requiredIngredients: string
  removableIngredients: string
  categoryId: number
  category: { name: string; type: string }
  variants: Variant[]
}

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

const BASE_INGREDIENTS = ['Моцарелла', 'Томатный соус', 'Итальянские травы']

export default function ProductCard({ product, allIngredients = [], sauces = [] }: { product: Product; allIngredients?: Ingredient[]; sauces?: SauceProduct[] }) {
  const middleVariant = product.variants.length > 1 ? product.variants[1] : product.variants[0]
  const [selectedVariant, setSelectedVariant] = useState(middleVariant)
  const [isHovered, setIsHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [addedIngredients, setAddedIngredients] = useState<string[]>([])
  const productIngredients = product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : []
  const requiredIngredients = product.requiredIngredients ? product.requiredIngredients.split(',').map(i => i.trim()) : []
  const removableIngredients = product.removableIngredients ? product.removableIngredients.split(',').map(i => i.trim()) : []

  const extraIngredients = allIngredients.filter(ing =>
    ing.categories.split(',').includes(String(product.categoryId))
  )
  const [selectedSauces, setSelectedSauces] = useState<number[]>([])

  useEffect(() => {
    if (!selectedVariant && product.variants.length > 0) {
      setSelectedVariant(product.variants.length > 1 ? product.variants[1] : product.variants[0])
    }
    setMounted(true)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [product.variants, selectedVariant])
  
  const getImageSize = () => {
    if (!selectedVariant) return '280px'
    const s = selectedVariant.size.toLowerCase()
    if (s.includes('маленьк')) return '240px'
    if (s.includes('средн')) return '340px'
    if (s.includes('больш')) return '440px'
    if (s.includes('25')) return '240px'
    if (s.includes('30')) return '340px'
    if (s.includes('35')) return '440px'
    return '340px'
  }

  const toggleRemoveIngredient = (ing: string) => {
    setRemovedIngredients(prev => {
      const newRemoved = prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
      return newRemoved
    })
  }

  const toggleAddIngredient = (ing: string) => {
    setAddedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    )
  }

  const toggleSauce = (sauceId: number) => {
    setSelectedSauces(prev => 
      prev.includes(sauceId) ? prev.filter(s => s !== sauceId) : [...prev, sauceId]
    )
  }

  const getTotalPrice = () => {
    if (!selectedVariant) return 0
    const extraPrice = addedIngredients.reduce((sum, ingName) => {
      const ingredient = extraIngredients.find(i => i.name === ingName)
      return sum + (ingredient?.price || 0)
    }, 0)
    const saucePrice = selectedSauces.reduce((sum, sauceId) => {
      const sauce = sauces.find(s => s.id === sauceId)
      return sum + (sauce?.price || 0)
    }, 0)
    return selectedVariant.price + extraPrice + saucePrice
  }

  const addToCart = () => {
    if (!selectedVariant) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      price: getTotalPrice(),
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setShowModal(false)
    setRemovedIngredients([])
    setAddedIngredients([])
    setSelectedSauces([])
  }

  return (
    <>
      <div style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.backgroundColor = '#fff'; setIsHovered(true); }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#f9f9f9'; setIsHovered(false); }}
      >
        <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px' }} onClick={() => setShowModal(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s', transform: isHovered ? 'scale(1.1)' : 'scale(1)' }} />
        </div>
        <div style={{ padding: '0 4px' }}>
          <h3 className="product-card-title">{product.name}</h3>
          {(product.requiredIngredients || product.removableIngredients) && (
            <p className="product-card-desc">
              {[product.requiredIngredients, product.removableIngredients].filter(Boolean).join(', ')}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
            <span className="product-card-price">от {selectedVariant?.price || 0} ₽</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
              className="product-card-btn"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 105, 0, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 105, 0, 0.1)'}
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>

      {mounted && showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', borderRadius: '24px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative', boxShadow: '0 8px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.45)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6b6b6b', zIndex: 1 }}>×</button>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} style={{ width: getImageSize(), height: getImageSize(), objectFit: 'contain', transition: 'all 0.3s' }} />
              </div>
              
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px' }}>{product.name}</h2>
                {product.ingredients && <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '20px' }}>{product.ingredients}</p>}
                
                {product.category?.type !== 'dessert' && product.variants.length > 1 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f9f9f9', padding: '4px', borderRadius: '10px' }}>
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: selectedVariant.id === variant.id ? '#fff' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: selectedVariant.id === variant.id ? '600' : '400',
                            color: '#000',
                          }}
                        >
                          {variant.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.category?.type === 'pizza' && (requiredIngredients.length > 0 || removableIngredients.length > 0) && (
                <>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Состав</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {requiredIngredients.map(ing => (
                      <div
                        key={ing}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '6px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {ing}
                      </div>
                    ))}
                    {removableIngredients.map(ing => (
                      <div
                        key={ing}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRemoveIngredient(ing)
                        }}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: removedIngredients.includes(ing) ? '#f8d7da' : '#f9f9f9',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: removedIngredients.includes(ing) ? 'line-through' : 'none',
                          opacity: removedIngredients.includes(ing) ? 0.6 : 1,
                        }}
                      >
                        {removedIngredients.includes(ing) && <span style={{ color: '#dc3545', fontWeight: '700' }}>×</span>}
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>

                {extraIngredients.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Добавить по вкусу</h3>
                  <div className="ingredients-grid">
                    {extraIngredients.map(ing => (
                      <div
                        key={ing.id}
                        onClick={() => toggleAddIngredient(ing.name)}
                        style={{
                          padding: '6px',
                          backgroundColor: addedIngredients.includes(ing.name) ? '#d1e7dd' : '#f9f9f9',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          border: addedIngredients.includes(ing.name) ? '2px solid #00b341' : '2px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <img src={ing.imageUrl} alt={ing.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ fontSize: '11px', textAlign: 'center', fontWeight: '500' }}>{ing.name}</div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#ff6900' }}>{ing.price} ₽</div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
                </>
                )}

                {(['pizza', 'snack', 'combo'].includes(product.category?.type)) && sauces.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Соусы</h3>
                    <div className="ingredients-grid">
                      {sauces.map(sauce => (
                        <div
                          key={sauce.id}
                          onClick={() => toggleSauce(sauce.id)}
                          style={{
                            padding: '6px',
                            backgroundColor: selectedSauces.includes(sauce.id) ? '#d1e7dd' : '#f9f9f9',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            border: selectedSauces.includes(sauce.id) ? '2px solid #00b341' : '2px solid transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <img src={sauce.imageUrl} alt={sauce.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div style={{ fontSize: '11px', textAlign: 'center', fontWeight: '500' }}>{sauce.name}</div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#ff6900' }}>{sauce.price} ₽</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={addToCart}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#ff6900',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Добавить в корзину за {getTotalPrice()} ₽
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}
