'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================
// СТРАНИЦА УСПЕШНОЙ ОПЛАТЫ
//
// Открывается после редиректа от ЮКассы после успешной оплаты.
// URL указан в return_url при создании платежа (в api/oplata/sozdat).
//
// Что происходит на этой странице:
// 1. Очищаем корзину из localStorage
// 2. Показываем сообщение об успехе
// 3. Предлагаем вернуться на главную
//
// Сам заказ уже создан в БД со статусом pending_payment
// и будет подтверждён через вебхук (в api/oplata/vebhuk).
// ============================================================
export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Очищаем корзину после успешной оплаты
    localStorage.removeItem('cart')
    // Уведомляем Header и Cart об изменении корзины
    // dispatchEvent — генерируем кастомное событие, на которое подписаны компоненты
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
          style={{ padding: '16px 32px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  )
}
