'use client'

import { useState } from 'react'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

type Method = 'sms' | 'telegram'
type Step = 'choose' | 'input' | 'code'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [method, setMethod] = useState<Method>('sms')
  const [step, setStep] = useState<Step>('choose')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [needBot, setNeedBot] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    const digits = e.target.value.replace(/\D/g, '')
    const limited = digits.startsWith('7') ? digits.slice(0, 11) : ('7' + digits).slice(0, 11)
    setPhone(formatPhone(limited))
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (method === 'sms') {
        const res = await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name }),
        })
        if (res.ok) {
          setStep('code')
        } else {
          setError('Ошибка отправки кода')
        }
      } else {
        const res = await fetch('/api/auth/send-tg-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name }),
        })
        const data = await res.json()
        if (res.ok) {
          setNeedBot(data.needBot)
          setStep('code')
        } else {
          setError('Ошибка отправки кода')
        }
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
      const body = { phone, name, code }

      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        onSuccess(data.user)
        onClose()
      } else {
        setError('Неверный код')
      }
    } catch {
      setError('Ошибка проверки кода')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('choose')
    setError('')
    setCode('')
    setNeedBot(false)
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '90%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>

        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#000' }}>
          {step === 'choose' ? 'Вход или регистрация' : step === 'code' ? 'Введите код' : method === 'sms' ? 'Вход по SMS' : 'Вход через Telegram'}
        </h2>

        {step === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => { setMethod('sms'); setStep('input') }}
              style={{ padding: '18px', border: '2px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6900'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="2" width="14" height="20" rx="3" stroke="#ff6900" strokeWidth="2"/>
                <circle cx="12" cy="18" r="1" fill="#ff6900"/>
                <line x1="9" y1="6" x2="15" y2="6" stroke="#ff6900" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div>По номеру телефона</div>
                <div style={{ fontSize: '13px', color: '#6b6b6b', fontWeight: '400' }}>Код придёт в SMS</div>
              </div>
            </button>
            <button
              onClick={() => { setMethod('telegram'); setStep('input') }}
              style={{ padding: '18px', border: '2px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#229ED9'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="#229ED9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#229ED9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div>Через Telegram</div>
                <div style={{ fontSize: '13px', color: '#6b6b6b', fontWeight: '400' }}>Код придёт в Telegram</div>
              </div>
            </button>
          </div>
        )}

        {step === 'input' && (
          <form onSubmit={handleSendCode}>
            {method === 'sms' && (
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '16px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            )}
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={handlePhoneChange}
              required
              style={{ width: '100%', padding: '16px', marginBottom: method === 'telegram' ? '10px' : '24px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
            {method === 'telegram' && (
              <p style={{ fontSize: '13px', color: '#6b6b6b', lineHeight: '1.5', marginBottom: '24px' }}>
                Код придёт в Telegram. Если вы ещё не писали боту —{' '}
                <a href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`} target="_blank" rel="noreferrer" style={{ color: '#229ED9', fontWeight: '600' }}>
                  напишите ему /start
                </a>{' '}
                и поделитесь номером, затем нажмите «Получить код».
              </p>
            )}
            {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '18px', backgroundColor: method === 'sms' ? '#ff6900' : '#229ED9', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', opacity: loading ? 0.6 : 1, marginBottom: '12px' }}
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
            <button type="button" onClick={reset} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b6b6b', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              ← Назад
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '16px' }}>
              {method === 'sms'
                ? `Код отправлен на ${phone}`
                : needBot
                  ? <>Напишите боту <a href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`} target="_blank" rel="noreferrer" style={{ color: '#229ED9', fontWeight: '600' }}>@{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}</a> и поделитесь номером — код придёт автоматически.</>
                  : `Код отправлен в Telegram на номер ${phone}`
              }
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
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '18px', backgroundColor: method === 'sms' ? '#ff6900' : '#229ED9', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </button>
            <button type="button" onClick={() => setStep('input')} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b6b6b', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              ← Назад
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
