'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AlertModal from '@/components/AlertModal'
import AuthModal from '@/components/AuthModal'
import SqlTroll, { hasSql } from '@/components/SqlTroll'

const AddressMap = dynamic(() => import('@/components/AddressMap'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b6b' }}>Загрузка карты...</div>
})

type CartItem = {
  productId?: number
  variantId?: number
  name?: string
  size?: string
  price?: number
  quantity: number
  imageUrl?: string
  isCombo?: boolean
  finalPrice?: number
  comboName?: string
  comboImageUrl?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [trolled, setTrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const checkTroll = (val: string) => { if (hasSql(val)) { setTrolled(true); return true }; return false }

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart.map((item: any) => ({
      ...item,
      price: isNaN(Number(item.price)) ? 0 : Number(item.price),
      finalPrice: isNaN(Number(item.finalPrice)) ? undefined : Number(item.finalPrice),
      quantity: isNaN(Number(item.quantity)) ? 1 : Number(item.quantity),
    })))
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setName(userData.name || '')
      const rawPhone = userData.phone || ''
      setPhone(rawPhone && !rawPhone.startsWith('+') ? '+' + rawPhone : rawPhone)
    }
  }, [])

  const getItemPrice = (item: CartItem) => item.isCombo ? (item.finalPrice ?? 0) * item.quantity : (item.price ?? 0) * item.quantity
  const total = cart.reduce((sum, item) => sum + getItemPrice(item), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setLoading(true)
    setPaymentError('')

    const orderData = { fullName: name, email: user?.email || '', phone, address, comment, items: cart, totalPrice: total }

    if (paymentMethod === 'card') {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, orderData }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        const data = await res.json()
        if (data.success) {
          window.location.href = data.confirmationUrl
        } else {
          setPaymentError(data.error || 'Не удалось создать платёж. Попробуйте ещё раз.')
          setLoading(false)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setPaymentError('Превышено время ожидания. Проверьте интернет и попробуйте снова.')
        } else if (!navigator.onLine) {
          setPaymentError('Нет подключения к интернету. Проверьте соединение и попробуйте снова.')
        } else {
          setPaymentError('Произошла ошибка при создании платежа. Попробуйте ещё раз.')
        }
        setLoading(false)
      }
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        const data = await res.json()
        setPaymentError(data.error || 'Не удалось оформить заказ. Попробуйте ещё раз.')
        setLoading(false)
        return
      }
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))
      router.push('/checkout/success')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setPaymentError('Превышено время ожидания. Проверьте интернет и попробуйте снова.')
      } else if (!navigator.onLine) {
        setPaymentError('Нет подключения к интернету. Проверьте соединение и попробуйте снова.')
      } else {
        setPaymentError('Произошла ошибка при оформлении заказа. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Корзина пуста</h2>
          <button onClick={() => router.push('/')} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
            Вернуться к покупкам
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <SqlTroll visible={trolled} />
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onSuccess={(userData) => {
        setUser(userData)
        setName(userData.name || '')
        const rawPhone = userData.phone || ''
        setPhone(rawPhone && !rawPhone.startsWith('+') ? '+' + rawPhone : rawPhone)
        setShowAuthModal(false)
      }}
    />
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '100px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Оформление заказа</h1>
        
        <div className="checkout-grid">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="liquid-glass-white" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Контактные данные</h2>
                
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => { if (!checkTroll(e.target.value)) setName(e.target.value) }}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={phone}
                  onChange={(e) => { if (!checkTroll(e.target.value)) setPhone(e.target.value) }}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="liquid-glass-white" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Адрес доставки</h2>
                
                <input
                  type="text"
                  placeholder="Улица, дом, квартира"
                  value={address}
                  onChange={(e) => { if (!checkTroll(e.target.value)) setAddress(e.target.value) }}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                
                <AddressMap address={address} onAddressChange={setAddress} />
              </div>

              <div className="liquid-glass-white" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Комментарий к заказу</h2>
                
                <textarea
                  placeholder="Например: не звонить в дверь"
                  value={comment}
                  onChange={(e) => { if (!checkTroll(e.target.value)) setComment(e.target.value) }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    minHeight: '100px',
                    maxHeight: '200px',
                    resize: 'none',
                  }}
                />
              </div>

              <div className="liquid-glass-white" style={{ borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Способ оплаты</h2>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      border: paymentMethod === 'cash' ? '2px solid #ff6900' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      backgroundColor: paymentMethod === 'cash' ? '#fff5e1' : '#fff',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: paymentMethod === 'cash' ? '600' : '400',
                    }}
                  >
                    Оплата при получении
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      flex: 1,
                      padding: '16px',
                      border: paymentMethod === 'card' ? '2px solid #ff6900' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      backgroundColor: paymentMethod === 'card' ? '#fff5e1' : '#fff',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: paymentMethod === 'card' ? '600' : '400',
                    }}
                  >
                    Оплата картой онлайн
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <p style={{ fontSize: '14px', color: '#6b6b6b', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    После нажатия «Оформить заказ» вы будете перенаправлены на страницу оплаты ЮКасса.
                  </p>
                )}
              </div>

              {paymentError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', color: '#cc0000' }}>
                  ⚠️ {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: loading ? '#ccc' : '#ff6900',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Обработка...' : `Оформить заказ на ${total} ₽`}
              </button>
            </form>
          </div>

          <div>
            <div className="liquid-glass-white" style={{ borderRadius: '16px', padding: '24px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Ваш заказ</h2>
              
              {cart.map((item, index) => (
                <div key={`${item.variantId}-${index}`} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.isCombo ? item.comboImageUrl : item.imageUrl} alt={item.isCombo ? item.comboName : item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f0f0f0' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.isCombo ? item.comboName : item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '4px' }}>{item.isCombo ? 'Комбо' : item.size}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity} × {item.isCombo ? item.finalPrice : item.price} ₽</p>
                  </div>
                </div>
              ))}
              
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>Товары</span>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{total} ₽</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px' }}>Доставка</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#00b341' }}>Бесплатно</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid #f0f0f0' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>Итого</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>{total} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  )
}
