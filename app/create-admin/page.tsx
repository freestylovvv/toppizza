'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(savedUser))
  }, [router])

  const handleCreateAdmin = async () => {
    if (!user) return
    
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isAdmin: true }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setMessage('Вы успешно стали администратором!')
        setTimeout(() => router.push('/admin'), 2000)
      } else {
        setMessage('Ошибка при назначении администратора')
      }
    } catch {
      setMessage('Ошибка при назначении администратора')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 24px' }}>
          <circle cx="20" cy="20" r="20" fill="#ff6900"/>
          <path d="M20 10C14.5 10 10 14.5 10 20C10 25.5 14.5 30 20 30C25.5 30 30 25.5 30 20C30 14.5 25.5 10 20 10ZM20 12C21.1 12 22 12.9 22 14C22 15.1 21.1 16 20 16C18.9 16 18 15.1 18 14C18 12.9 18.9 12 20 12ZM24 24H16C16 21.8 17.8 20 20 20C22.2 20 24 21.8 24 24Z" fill="white"/>
        </svg>
        
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>Создать администратора</h1>
        <p style={{ fontSize: '16px', color: '#6b6b6b', marginBottom: '32px' }}>
          Вы вошли как <strong>{user.name}</strong> ({user.email})
        </p>

        {message && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: message.includes('успешно') ? '#d4edda' : '#f8d7da', 
            color: message.includes('успешно') ? '#155724' : '#721c24',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '15px'
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleCreateAdmin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            backgroundColor: '#ff6900',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Обработка...' : 'Стать администратором'}
        </button>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#6b6b6b',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  )
}
