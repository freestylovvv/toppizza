'use client'

import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    }
    
    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories)
      })
    
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <>
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(240, 240, 240, 0.8)',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
            borderBottom: '1px solid rgba(240, 240, 240, 0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <button
                    onClick={() => router.push('/profile')}
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
          
          <div className="header-categories">
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflowX: 'auto' }}>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.name}`}
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
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
    </>
  )
}
