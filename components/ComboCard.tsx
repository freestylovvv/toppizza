'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Variant = { id: number; size: string; price: number }
type Product = {
  id: number; name: string; imageUrl: string
  requiredIngredients: string; removableIngredients: string
  categoryId: number; category: { name: string; type: string }
  variants: Variant[]
}
type Ingredient = { id: number; name: string; price: number; imageUrl: string; categories: string }
type ComboItemConfig = {
  productId: number; variantId: number
  removedIngredients: string[]; addedIngredients: string[]
  price: number
}
type Combo = {
  id: number; name: string; imageUrl: string; discount: number
  items: { id: number; productId: number; variantId: number }[]
}

export default function ComboCard({
  combo, products, allIngredients,
}: {
  combo: Combo; products: Product[]; allIngredients: Ingredient[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [configs, setConfigs] = useState<ComboItemConfig[]>([])

  useEffect(() => { setMounted(true) }, [])

  const comboProducts = combo.items.map(item => products.find(p => p.id === item.productId)).filter(Boolean) as Product[]

  const baseTotal = configs.reduce((sum, c) => sum + c.price, 0)
  const finalPrice = Math.max(0, baseTotal - combo.discount)

  const openModal = () => {
    const initial: ComboItemConfig[] = combo.items.map(item => {
      const product = products.find(p => p.id === item.productId)
      const defaultVariant = product?.variants.length ? (product.variants[1] ?? product.variants[0]) : null
      return {
        productId: item.productId,
        variantId: defaultVariant?.id ?? item.variantId,
        removedIngredients: [],
        addedIngredients: [],
        price: defaultVariant?.price ?? 0,
      }
    })
    setConfigs(initial)
    setStep(0)
    setShowModal(true)
  }

  const updateConfig = (idx: number, patch: Partial<ComboItemConfig>) => {
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c))
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
      isCombo: true,
      comboId: combo.id,
      comboName: combo.name,
      comboImageUrl: combo.imageUrl,
      discount: combo.discount,
      totalPrice: baseTotal,
      finalPrice,
      quantity: 1,
      items: configs.map((cfg, idx) => {
        const product = comboProducts[idx]
        const variant = product?.variants.find(v => v.id === cfg.variantId)
        return {
          productId: product?.id,
          variantId: variant?.id,
          name: product?.name,
          size: variant?.size,
          price: cfg.price,
          imageUrl: product?.imageUrl,
        }
      }),
    })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setShowModal(false)
  }

  const currentProduct = comboProducts[step]
  const currentConfig = configs[step]

  const renderStep = () => {
    if (!currentProduct || !currentConfig) return null
    const type = currentProduct.category?.type
    const variant = currentProduct.variants.find(v => v.id === currentConfig.variantId) ?? currentProduct.variants[0]
    const getImageSize = () => {
      const s = variant?.size?.toLowerCase() || ''
      if (s.includes('маленьк') || s.includes('25')) return '160px'
      if (s.includes('больш') || s.includes('35')) return '260px'
      return '210px'
    }
    const required = currentProduct.requiredIngredients ? currentProduct.requiredIngredients.split(',').map(s => s.trim()).filter(Boolean) : []
    const removable = currentProduct.removableIngredients ? currentProduct.removableIngredients.split(',').map(s => s.trim()).filter(Boolean) : []
    const extras = allIngredients.filter(i => i.categories.split(',').includes(String(currentProduct.categoryId)))

    const getExtraPrice = (added: string[]) =>
      added.reduce((sum, name) => sum + (extras.find(i => i.name === name)?.price ?? 0), 0)

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', minHeight: '280px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentProduct.imageUrl} alt={currentProduct.name} style={{ width: getImageSize(), height: getImageSize(), objectFit: 'contain', transition: 'all 0.3s ease' }} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{currentProduct.name}</h3>

        {currentProduct.variants.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f9f9f9', padding: '4px', borderRadius: '10px' }}>
              {currentProduct.variants.map(v => (
                <button key={v.id} onClick={() => {
                  const extra = getExtraPrice(currentConfig.addedIngredients)
                  updateConfig(step, { variantId: v.id, price: v.price + extra })
                }} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                  backgroundColor: currentConfig.variantId === v.id ? '#fff' : 'transparent',
                  fontWeight: currentConfig.variantId === v.id ? '600' : '400',
                }}>{v.size}</button>
              ))}
            </div>
          </div>
        )}

        {type === 'pizza' && (required.length > 0 || removable.length > 0) && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Состав</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {required.map(ing => (
                <div key={ing} style={{ padding: '6px 10px', backgroundColor: '#f9f9f9', borderRadius: '6px', fontSize: '13px' }}>{ing}</div>
              ))}
              {removable.map(ing => (
                <div key={ing} onClick={() => {
                  const newRemoved = currentConfig.removedIngredients.includes(ing)
                    ? currentConfig.removedIngredients.filter(i => i !== ing)
                    : [...currentConfig.removedIngredients, ing]
                  updateConfig(step, { removedIngredients: newRemoved })
                }} style={{
                  padding: '6px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                  backgroundColor: currentConfig.removedIngredients.includes(ing) ? '#f8d7da' : '#f9f9f9',
                  textDecoration: currentConfig.removedIngredients.includes(ing) ? 'line-through' : 'none',
                  opacity: currentConfig.removedIngredients.includes(ing) ? 0.6 : 1,
                }}>
                  {currentConfig.removedIngredients.includes(ing) && <span style={{ color: '#dc3545', fontWeight: '700', marginRight: '4px' }}>×</span>}
                  {ing}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'pizza' && extras.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Добавить по вкусу</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {extras.map(ing => {
                const added = currentConfig.addedIngredients.includes(ing.name)
                return (
                  <div key={ing.id} onClick={() => {
                    const newAdded = added
                      ? currentConfig.addedIngredients.filter(n => n !== ing.name)
                      : [...currentConfig.addedIngredients, ing.name]
                    const baseVariantPrice = currentProduct.variants.find(v => v.id === currentConfig.variantId)?.price ?? 0
                    updateConfig(step, { addedIngredients: newAdded, price: baseVariantPrice + getExtraPrice(newAdded) })
                  }} style={{
                    padding: '6px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    backgroundColor: added ? '#d1e7dd' : '#f9f9f9',
                    border: added ? '2px solid #00b341' : '2px solid transparent',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ing.imageUrl} alt={ing.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>{ing.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#ff6900' }}>{ing.price} ₽</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ fontSize: '15px', color: '#6b6b6b', marginBottom: '16px' }}>
          Цена за этот товар: <strong style={{ color: '#000' }}>{currentConfig.price} ₽</strong>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.backgroundColor = '#fff'; setIsHovered(true) }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#f9f9f9'; setIsHovered(false) }}
        onClick={openModal}
      >
        <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={combo.imageUrl} alt={combo.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s', transform: isHovered ? 'scale(1.1)' : 'scale(1)' }} />
        </div>
        <div style={{ padding: '0 4px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 6px', color: '#000' }}>{combo.name}</h3>
          <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '12px' }}>
            {comboProducts.map(p => p.name).join(' + ')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {combo.discount > 0 && (
                <>
                  <div style={{ fontSize: '13px', color: '#6b6b6b', textDecoration: 'line-through' }}>
                    {comboProducts.reduce((sum, p) => sum + (p.variants[1]?.price ?? p.variants[0]?.price ?? 0), 0)} ₽
                  </div>
                  <div style={{ fontSize: '13px', color: '#00b341', fontWeight: '600' }}>Скидка {combo.discount} ₽</div>
                </>
              )}
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                от {Math.max(0, comboProducts.reduce((sum, p) => sum + (p.variants[1]?.price ?? p.variants[0]?.price ?? 0), 0) - combo.discount)} ₽
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); openModal() }}
              style={{ padding: '10px 24px', backgroundColor: 'rgba(255,105,0,0.1)', color: '#e85d00', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,105,0,0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,105,0,0.1)'}
            >Выбрать</button>
          </div>
        </div>
      </div>

      {mounted && showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>

            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{combo.name}</h2>

            {/* Шаги */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {comboProducts.map((p, idx) => (
                <button key={idx} onClick={() => setStep(idx)} style={{
                  flex: 1, padding: '8px 4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  backgroundColor: step === idx ? '#ff6900' : '#f0f0f0',
                  color: step === idx ? '#fff' : '#6b6b6b',
                }}>{p.name}</button>
              ))}
            </div>

            {renderStep()}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '14px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>← Назад</button>
              )}
              {step < comboProducts.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '14px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Далее →</button>
              ) : (
                <button onClick={addToCart} style={{ flex: 1, padding: '14px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  {combo.discount > 0
                    ? <>В корзину за <span style={{ textDecoration: 'line-through', opacity: 0.7, marginRight: '4px' }}>{baseTotal} ₽</span>{finalPrice} ₽</>
                    : `В корзину за ${finalPrice} ₽`
                  }
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
