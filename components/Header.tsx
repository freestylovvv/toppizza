'use client'

import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import { useRouter } from 'next/navigation'

// Пропсы Header — опциональный список категорий для навигации
type HeaderProps = {
  categories?: { id: number; name: string; anchor?: string }[]
}

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)       // авторизованный пользователь из localStorage
  const [showAuth, setShowAuth] = useState(false)   // показывать ли модалку авторизации
  const [cartCount, setCartCount] = useState(0)     // количество товаров в корзине (для бейджа)

  useEffect(() => {
    // Загружаем пользователя из localStorage при монтировании
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    
    // Считаем количество товаров в корзине (сумма quantity всех позиций)
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    }
    
    updateCartCount()
    // Слушаем кастомное событие cartUpdated — диспатчится при изменении корзины
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  // Выход: удаляем пользователя из localStorage и редиректим на главную
  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <>
      {/* Шапка с эффектом frosted glass (backdrop-filter) */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: '0 4px 32px rgba(255, 105, 0, 0.08), 0 1.5px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(255,105,0,0.07) inset',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          {/* Верхняя строка: логотип + кнопки авторизации */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
            borderBottom: '1px solid rgba(240, 240, 240, 0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              {/* Логотип — SVG пицца + название, клик ведёт на главную */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#ff6900"/>
                  <circle cx="20" cy="20" r="15" fill="#ffb366"/>
                  <circle cx="14" cy="16" r="2" fill="#ff6900"/>
                  <circle cx="26" cy="16" r="2" fill="#ff6900"/>
                  <circle cx="20" cy="24" r="2" fill="#ff6900"/>
                  <circle cx="16" cy="22" r="1.5" fill="#ff6900"/>
                  <circle cx="24" cy="22" r="1.5" fill="#ff6900"/>
                  <circle cx="18" cy="18" r="1.5" fill="#ff6900"/>
                  <circle cx="22" cy="18" r="1.5" fill="#ff6900"/>
                  <path d="M20 8 L22 10 L20 12 L18 10 Z" fill="#4CAF50"/>
                </svg>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Top Pizza</span>
              </div>
            </div>

            {/* Кнопки: если авторизован — имя + выход (+ кнопка админки для админов), иначе — войти */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Кнопка "Админ панель" — только для isAdmin === true */}
                  {user.isAdmin && (
                    <button
                      onClick={() => router.push('/admin')}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#ff6900',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e85d00'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6900'}
                    >
                      Админ панель
                    </button>
                  )}
                  {/* Кнопка с именем — ведёт в профиль */}
                  <button
                    onClick={() => router.push('/profil')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    {user.name}
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  Войти
                </button>
              )}
            </div>
          </div>
          
          {/* Нижняя строка шапки: навигация по категориям + кнопка "Акции" */}
          <div className="header-categories">
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflowX: 'auto' }}>
              {/* Ссылки-якоря на секции каталога (href="#Пиццы" и т.д.) */}
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.anchor ?? cat.name}`}
                  style={{
                    padding: '8px 12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#000',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    borderRadius: '8px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff6900'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#000'}
                >
                  {cat.name}
                </a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#ff6900',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5e1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Акции
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Модалка авторизации — монтируется всегда, показывается по isOpen */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
    </>
  )
}
