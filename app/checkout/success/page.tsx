'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '440px', width: '90%' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Оплата прошла!</h1>
        <p style={{ fontSize: '16px', color: '#6b6b6b', marginBottom: '32px' }}>
          Ваш заказ принят и уже готовится. Мы свяжемся с вами в ближайшее время.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '16px 32px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}
        >
          На главную
        </button>
        <button
          onClick={() => router.push('/profile')}
          style={{ padding: '16px 32px', backgroundColor: '#fff', color: '#ff6900', border: '2px solid #ff6900', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Мои заказы
        </button>
      </div>
    </div>
  )
}
