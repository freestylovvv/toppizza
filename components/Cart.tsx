'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AddressMap = dynamic(() => import('./AddressMap'), { ssr: false })

type CartItem = {
  productId: number
  variantId: number
  name: string
  size: string
  price: number
  quantity: number
  imageUrl: string
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(savedCart)
    }
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))

    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    window.addEventListener('openCart', () => setIsOpen(true))
    return () => {
      window.removeEventListener('cartUpdated', loadCart)
      window.removeEventListener('openCart', () => setIsOpen(true))
    }
  }, [])

  const updateQuantity = (variantId: number, delta: number) => {
    const newCart = cart.map(item => 
      item.variantId === variantId 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0)
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
        }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '16px 24px',
              backgroundColor: '#ff6900',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(255,105,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e85d00'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff6900'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span>Корзина</span>
            <span style={{ backgroundColor: '#fff', color: '#ff6900', padding: '4px 8px', borderRadius: '9999px', fontSize: '14px', fontWeight: '700' }}>{itemCount}</span>
            <span>{total} ₽</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}>
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '480px',
            maxWidth: '100%',
            backgroundColor: '#fff',
            padding: '32px',
            overflowY: 'auto',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#000' }}>Корзина</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
            </div>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: '16px', color: '#6b6b6b' }}>Корзина пуста</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '24px' }}>
                  {cart.map((item, index) => (
                    <div key={`${item.variantId}-${index}`} style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid #f0f0f0',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#000' }}>{item.name}</h4>
                        <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '12px' }}>{item.size}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => updateQuantity(item.variantId, -1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '50%',
                                backgroundColor: '#f9f9f9',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: '#ff6900',
                                fontWeight: '600',
                              }}
                            >
                              −
                            </button>
                            <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '50%',
                                backgroundColor: '#f9f9f9',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: '#ff6900',
                                fontWeight: '600',
                              }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>{item.price * item.quantity} ₽</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#6b6b6b' }}>Итого:</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>{total} ₽</span>
                </div>
                <button 
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      window.location.href = '/checkout'
                    }}
                    style={{
                      width: '100%',
                      padding: '18px',
                      backgroundColor: '#ff6900',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e85d00'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6900'}
                  >
                    Перейти к оформлению
                  </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
