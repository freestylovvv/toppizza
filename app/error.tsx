'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Что-то пошло не так</h2>
        <p style={{ fontSize: '16px', color: '#6b6b6b', marginBottom: '24px' }}>Не удалось загрузить страницу. Попробуйте ещё раз.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            Попробовать снова
          </button>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '12px 24px', backgroundColor: '#f0f0f0', color: '#000', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}
