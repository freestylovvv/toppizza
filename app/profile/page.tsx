'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(savedUser)
    setUser(userData)
    setName(userData.name)
    setPhone(userData.phone || '')
    setEmail(userData.email || '')
    
    if (userData.birthday) {
      const date = new Date(userData.birthday)
      setDay(date.getDate().toString())
      setMonth((date.getMonth() + 1).toString())
      setYear(date.getFullYear().toString())
    }

    fetchUserData(userData.id)
  }, [router])

  const fetchUserData = async (userId: number) => {
    const res = await fetch(`/api/user?id=${userId}`)
    const data = await res.json()
    console.log('User data:', data)
    if (data.success) {
      console.log('Orders:', data.user.orders)
      setOrders(data.user.orders || [])
    }
  }

  const handleSaveName = async () => {
    setLoading(true)
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name, phone: user.phone, birthday: user.birthday }),
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleSavePhone = async () => {
    setLoading(true)
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name: user.name, phone, birthday: user.birthday }),
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleSaveBirthday = async () => {
    if (!day || !month || !year) return
    setLoading(true)
    const birthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name: user.name, phone: user.phone, birthday }),
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleSaveEmail = async () => {
    setLoading(true)
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name: user.name, phone: user.phone, email, birthday: user.birthday }),
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '32px', color: '#000' }}>Личные данные</h1>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSaveName}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6900',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Сохранить
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Номер телефона</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 922 478-77-86"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSavePhone}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6900',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Сохранить
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>День рождения</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="number"
              placeholder="День"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              min="1"
              max="31"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">Месяц</option>
              <option value="1">Январь</option>
              <option value="2">Февраль</option>
              <option value="3">Март</option>
              <option value="4">Апрель</option>
              <option value="5">Май</option>
              <option value="6">Июнь</option>
              <option value="7">Июль</option>
              <option value="8">Август</option>
              <option value="9">Сентябрь</option>
              <option value="10">Октябрь</option>
              <option value="11">Ноябрь</option>
              <option value="12">Декабрь</option>
            </select>
            <input
              type="number"
              placeholder="Год"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear()}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleSaveBirthday}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6900',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Сохранить
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Email для рассылок (необязательно)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.ru"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSaveEmail}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff6900',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Сохранить
          </button>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '700', marginTop: '48px', marginBottom: '24px', color: '#000' }}>История заказов</h2>
        
        {orders.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b6b6b' }}>Последние 90 дней заказов не было</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>Заказ #{order.id}</span>
                    <p style={{ fontSize: '14px', color: '#6b6b6b', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#ff6900' }}>{order.totalPrice} ₽</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>{item.productName || 'Товар'}</p>
                        <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '4px' }}>{item.variantSize || ''}</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#ff6900' }}>{item.price} ₽ × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
