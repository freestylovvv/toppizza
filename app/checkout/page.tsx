'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AlertModal from '@/components/AlertModal'

const AddressMap = dynamic(() => import('@/components/AddressMap'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b6b' }}>Загрузка карты...</div>
})

type CartItem = {
  productId: number
  variantId: number
  name: string
  size: string
  price: number
  quantity: number
  imageUrl: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setName(userData.name || '')
      setPhone(userData.phone || '')
    }
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        email: user?.email || '',
        phone,
        address,
        comment,
        items: cart,
        totalPrice: total,
      }),
    })
    
    localStorage.removeItem('cart')
    setShowSuccess(true)
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
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '100px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Оформление заказа</h1>
        
        <div className="checkout-grid">
          <div>
            <form onSubmit={handleSubmit}>
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Контактные данные</h2>
                
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setPhone(e.target.value)}
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

              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Адрес доставки</h2>
                
                <input
                  type="text"
                  placeholder="Улица, дом, квартира"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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

              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Комментарий к заказу</h2>
                
                <textarea
                  placeholder="Например: не звонить в дверь"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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

              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
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
                    Оплата картой
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <input
                      type="text"
                      placeholder="Номер карты"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                        setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim())
                      }}
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
                      type="text"
                      placeholder="IVAN IVANOV"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '15px',
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="ММ/ГГ"
                        value={cardExpiry}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          if (value.length >= 2) {
                            setCardExpiry(value.slice(0, 2) + '/' + value.slice(2))
                          } else {
                            setCardExpiry(value)
                          }
                        }}
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
                      
                      <input
                        type="password"
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
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
                  </>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '#ff6900',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Оформить заказ на {total} ₽
              </button>
            </form>
          </div>

          <div>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Ваш заказ</h2>
              
              {cart.map((item, index) => (
                <div key={`${item.variantId}-${index}`} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '4px' }}>{item.size}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity} × {item.price} ₽</p>
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
      {showSuccess && (
        <AlertModal
          message="Заказ оформлен! Мы свяжемся с вами в ближайшее время."
          onClose={() => {
            setShowSuccess(false)
            router.push('/')
          }}
        />
      )}
    </div>
  )
}
