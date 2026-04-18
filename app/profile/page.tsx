'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const StatusIcon = ({ status }: { status: string }) => {
  const s = { marginRight: 4, verticalAlign: 'middle' as const }
  if (status === 'pending') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  if (status === 'confirmed') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M7 12l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (status === 'cooking') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><path d="M12 3C9 3 6 5.5 6 8.5c0 2 1 3.5 2.5 4.5V18h7v-5c1.5-1 2.5-2.5 2.5-4.5C18 5.5 15 3 12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 18v2h6v-2" stroke="currentColor" strokeWidth="2"/></svg>
  if (status === 'delivering') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/></svg>
  if (status === 'delivered') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (status === 'cancelled') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={s}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  return null
}

const statusLabel: Record<string, string> = {
  pending: '\u041e\u0436\u0438\u0434\u0430\u0435\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f',
  confirmed: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d',
  cooking: '\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f',
  delivering: '\u0412 \u043f\u0443\u0442\u0438',
  delivered: '\u0414\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d',
  cancelled: '\u041e\u0442\u043c\u0435\u043d\u0451\u043d',
}

const statusBg: Record<string, string> = {
  pending: '#fff3e0', confirmed: '#e3f2fd', cooking: '#fff8e1',
  delivering: '#e8f5e9', delivered: '#e8f5e9', cancelled: '#fce4ec',
}

const statusColor: Record<string, string> = {
  pending: '#e65100', confirmed: '#1565c0', cooking: '#f57f17',
  delivering: '#2e7d32', delivered: '#1b5e20', cancelled: '#c62828',
}

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
    if (data.success) setOrders(data.user.orders || [])
  }

  const handleSaveName = async () => {
    setLoading(true)
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name, phone: user.phone, birthday: user.birthday }),
    })
    const data = await res.json()
    if (data.success) { localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user) }
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
    if (data.success) { localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user) }
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
    if (data.success) { localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user) }
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
    if (data.success) { localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user) }
    setLoading(false)
  }

  if (!user) return null

  const btnStyle = { padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' as const }
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' }

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '32px', color: '#000' }}>\u041b\u0438\u0447\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435</h1>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>\u0418\u043c\u044f</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <button onClick={handleSaveName} disabled={loading} style={btnStyle}>\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>\u041d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 922 478-77-86" style={inputStyle} />
          <button onClick={handleSavePhone} disabled={loading} style={btnStyle}>\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input type="number" placeholder="\u0414\u0435\u043d\u044c" value={day} onChange={(e) => setDay(e.target.value)} min="1" max="31" style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', outline: 'none' }} />
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
              <option value="">\u041c\u0435\u0441\u044f\u0446</option>
              <option value="1">\u042f\u043d\u0432\u0430\u0440\u044c</option>
              <option value="2">\u0424\u0435\u0432\u0440\u0430\u043b\u044c</option>
              <option value="3">\u041c\u0430\u0440\u0442</option>
              <option value="4">\u0410\u043f\u0440\u0435\u043b\u044c</option>
              <option value="5">\u041c\u0430\u0439</option>
              <option value="6">\u0418\u044e\u043d\u044c</option>
              <option value="7">\u0418\u044e\u043b\u044c</option>
              <option value="8">\u0410\u0432\u0433\u0443\u0441\u0442</option>
              <option value="9">\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c</option>
              <option value="10">\u041e\u043a\u0442\u044f\u0431\u0440\u044c</option>
              <option value="11">\u041d\u043e\u044f\u0431\u0440\u044c</option>
              <option value="12">\u0414\u0435\u043a\u0430\u0431\u0440\u044c</option>
            </select>
            <input type="number" placeholder="\u0413\u043e\u0434" value={year} onChange={(e) => setYear(e.target.value)} min="1900" max={new Date().getFullYear()} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', outline: 'none' }} />
          </div>
          <button onClick={handleSaveBirthday} disabled={loading} style={btnStyle}>\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Email \u0434\u043b\u044f \u0440\u0430\u0441\u0441\u044b\u043b\u043e\u043a (\u043d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.ru" style={inputStyle} />
          <button onClick={handleSaveEmail} disabled={loading} style={btnStyle}>\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '700', marginTop: '48px', marginBottom: '24px', color: '#000' }}>\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u043a\u0430\u0437\u043e\u0432</h2>
        
        {orders.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b6b6b' }}>\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 90 \u0434\u043d\u0435\u0439 \u0437\u0430\u043a\u0430\u0437\u043e\u0432 \u043d\u0435 \u0431\u044b\u043b\u043e</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>\u0417\u0430\u043a\u0430\u0437 #{order.id}</span>
                    <p style={{ fontSize: '14px', color: '#6b6b6b', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginTop: '8px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: statusBg[order.status] || '#f5f5f5',
                      color: statusColor[order.status] || '#616161',
                    }}>
                      <StatusIcon status={order.status} />
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#ff6900' }}>{order.totalPrice} \u20bd</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>{item.productName || '\u0422\u043e\u0432\u0430\u0440'}</p>
                        <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '4px' }}>{item.variantSize || ''}</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#ff6900' }}>{item.price} \u20bd \u00d7 {item.quantity}</p>
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
