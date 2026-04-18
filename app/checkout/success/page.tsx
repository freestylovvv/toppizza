'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCash = searchParams.get('method') === 'cash'

  useEffect(() => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '440px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="#fff0e6"/>
            <circle cx="36" cy="36" r="28" fill="#ff6900"/>
            <path d="M22 36l10 10 18-18" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
          {isCash ? 'Заказ принят!' : 'Оплата прошла!'}
        </h1>
        <p style={{ fontSize: '16px', color: '#6b6b6b', marginBottom: '32px' }}>
          {isCash
            ? 'Ваш заказ оформлен. Курьер свяжется с вами в ближайшее время. Оплата при получении.'
            : 'Ваш заказ оплачен и уже готовится. Мы свяжемся с вами в ближайшее время.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '16px 32px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
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
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
