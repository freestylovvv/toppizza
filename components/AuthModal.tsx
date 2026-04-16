'use client'

import { useState } from 'react'
import SqlTroll, { hasSql } from './SqlTroll'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

type Step = 'phone' | 'code' | 'name'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trolled, setTrolled] = useState(false)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''
    let result = '+7'
    if (digits.length > 1) result += ' (' + digits.slice(1, 4)
    if (digits.length >= 4) result += ') ' + digits.slice(4, 7)
    if (digits.length >= 7) result += '-' + digits.slice(7, 9)
    if (digits.length >= 9) result += '-' + digits.slice(9, 11)
    return result
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (hasSql(raw)) { setTrolled(true); return }
    const digits = raw.replace(/\D/g, '')
    const limited = digits.startsWith('7') ? digits.slice(0, 11) : ('7' + digits).slice(0, 11)
    setPhone(formatPhone(limited))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSql(e.target.value)) { setTrolled(true); return }
    setName(e.target.value)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasSql(phone)) { setTrolled(true); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) {
        setStep('code')
      } else {
        setError('Ошибка отправки кода')
      }
    } catch {
      setError('Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.needName) {
          setStep('name')
        } else {
          localStorage.setItem('user', JSON.stringify(data.user))
          onSuccess(data.user)
          onClose()
        }
      } else {
        setError('Неверный код')
      }
    } catch {
      setError('Ошибка проверки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasSql(name)) { setTrolled(true); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, name }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        onSuccess(data.user)
        onClose()
      } else {
        setError('Ошибка создания аккаунта')
      }
    } catch {
      setError('Ошибка создания аккаунта')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('phone')
    setError('')
    setCode('')
    setName('')
  }

  return (
    <>
      <SqlTroll visible={trolled} />
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '90%', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>

            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#000' }}>
              {step === 'phone' && 'Вход'}
              {step === 'code' && 'Введите код'}
              {step === 'name' && 'Регистрация'}
            </h2>

            {step === 'phone' && (
              <form onSubmit={handleSendCode}>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  style={{ width: '100%', padding: '16px', marginBottom: '24px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Отправка...' : 'Получить код'}
                </button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode}>
                <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '16px' }}>
                  Код отправлен на {phone}.<br/>Сообщение придёт в течение 5 минут.
                </p>
                <input
                  type="text"
                  placeholder="Введите код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '24px', textAlign: 'center', letterSpacing: '8px', outline: 'none', boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Проверка...' : 'Продолжить'}
                </button>
                <button type="button" onClick={reset} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b6b6b', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  ← Назад
                </button>
              </form>
            )}

            {step === 'name' && (
              <form onSubmit={handleCreateAccount}>
                <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '16px' }}>
                  Номер не найден. Введите имя для регистрации.
                </p>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={handleNameChange}
                  required
                  style={{ width: '100%', padding: '16px', marginBottom: '24px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
                {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Создание...' : 'Создать аккаунт'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
