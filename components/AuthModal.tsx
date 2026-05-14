'use client'
// 'use client' — директива Next.js, означает что этот компонент выполняется в браузере
// Нужна потому что используем useState (состояние) и fetch (запросы к API)

import { useState } from 'react'
import SqlTroll, { hasSql } from './SqlTroll'

// ============================================================
// ТИПЫ ПРОПСОВ
// TypeScript интерфейс описывает какие данные принимает компонент
// ============================================================
type AuthModalProps = {
  isOpen: boolean          // показывать ли модалку (true/false)
  onClose: () => void      // функция закрытия (вызывается при клике × или фон)
  onSuccess: (user: any) => void // функция при успешной авторизации (передаём данные пользователя)
}

// Тип для шага авторизации — строковый union тип
// Может быть только одним из трёх значений
type Step = 'phone' | 'code' | 'name'
// 'phone' — ввод номера телефона (начальный шаг)
// 'code' — ввод SMS кода
// 'name' — ввод имени (только для новых пользователей)

// ============================================================
// КОМПОНЕНТ AuthModal — модальное окно авторизации
// Реализует трёхшаговый процесс: телефон → код → имя (если новый)
// ============================================================
export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {

  // useState — хук React для хранения состояния компонента
  // При изменении состояния компонент перерендеривается

  const [step, setStep] = useState<Step>('phone')
  // Текущий шаг авторизации. <Step> — TypeScript дженерик, ограничивает тип значений

  const [phone, setPhone] = useState('')   // введённый номер телефона (форматированный)
  const [name, setName] = useState('')     // введённое имя (для регистрации)
  const [code, setCode] = useState('')     // введённый SMS код
  const [loading, setLoading] = useState(false) // идёт ли запрос к API (блокирует кнопку)
  const [error, setError] = useState('')   // текст ошибки для отображения пользователю
  const [trolled, setTrolled] = useState(false) // активирован ли SqlTroll

  // ============================================================
  // ФУНКЦИЯ formatPhone — форматирует номер телефона при вводе
  // Превращает "79161234567" в "+7 (916) 123-45-67"
  // ============================================================
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '') // убираем всё кроме цифр
    if (!digits) return '' // пустая строка — возвращаем пустую строку

    let result = '+7' // начинаем с +7

    // Добавляем части номера по мере ввода цифр
    if (digits.length > 1) result += ' (' + digits.slice(1, 4)
    // slice(1, 4) — берём цифры с индекса 1 по 3 (код города, 3 цифры)
    // Пример: "7916" → "+7 (916"

    if (digits.length >= 4) result += ') ' + digits.slice(4, 7)
    // Добавляем первые 3 цифры номера
    // Пример: "7916123" → "+7 (916) 123"

    if (digits.length >= 7) result += '-' + digits.slice(7, 9)
    // Добавляем следующие 2 цифры
    // Пример: "791612345" → "+7 (916) 123-45"

    if (digits.length >= 9) result += '-' + digits.slice(9, 11)
    // Добавляем последние 2 цифры
    // Пример: "79161234567" → "+7 (916) 123-45-67"

    return result
  }

  // ============================================================
  // ОБРАБОТЧИК ИЗМЕНЕНИЯ ПОЛЯ ТЕЛЕФОНА
  // Вызывается при каждом нажатии клавиши в поле телефона
  // ============================================================
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value // сырое значение из поля ввода

    // Проверяем на SQL-инъекцию — если найдена, активируем SqlTroll
    if (hasSql(raw)) { setTrolled(true); return }

    const digits = raw.replace(/\D/g, '') // убираем всё кроме цифр

    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    // Если начинается с 7 — берём первые 11 цифр
    // Если нет — добавляем 7 и берём первые 11
    const limited = digits.startsWith('7') ? digits.slice(0, 11) : ('7' + digits).slice(0, 11)

    setPhone(formatPhone(limited)) // форматируем и сохраняем в состояние
  }

  // ============================================================
  // ОБРАБОТЧИК ИЗМЕНЕНИЯ ПОЛЯ ИМЕНИ
  // ============================================================
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSql(e.target.value)) { setTrolled(true); return } // проверка на SQL
    setName(e.target.value) // сохраняем имя как есть
  }

  // ============================================================
  // ФУНКЦИЯ handleSendCode — отправляет запрос на получение SMS кода
  // Вызывается при сабмите формы на шаге 'phone'
  // ============================================================
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault() // отменяем стандартное поведение формы (перезагрузку страницы)
    if (hasSql(phone)) { setTrolled(true); return }

    setLoading(true)  // показываем состояние загрузки
    setError('')      // сбрасываем предыдущую ошибку

    try {
      const res = await fetch('/api/avtorizaciya/otpravit-kod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }), // отправляем телефон в теле запроса
      })

      if (res.ok) {
        // HTTP 200-299 — SMS отправлено, переходим к вводу кода
        setStep('code')
      } else {
        setError('Ошибка отправки кода')
      }
    } catch {
      // Сетевая ошибка (нет интернета, сервер недоступен)
      setError('Ошибка отправки кода')
    } finally {
      // finally выполняется всегда — и при успехе и при ошибке
      setLoading(false) // снимаем состояние загрузки
    }
  }

  // ============================================================
  // ФУНКЦИЯ handleVerifyCode — проверяет введённый SMS код
  // Вызывается при сабмите формы на шаге 'code'
  // ============================================================
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/avtorizaciya/proverit-kod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }), // отправляем телефон и код
      })
      const data = await res.json() // парсим ответ

      if (res.ok) {
        if (data.needName) {
          // Сервер сказал что нужно имя — новый пользователь
          setStep('name') // переходим к шагу ввода имени
        } else {
          // Авторизация успешна — сохраняем пользователя
          localStorage.setItem('user', JSON.stringify(data.user))
          // localStorage — хранилище браузера, данные сохраняются между сессиями
          // JSON.stringify — конвертируем объект в строку для хранения

          onSuccess(data.user) // вызываем колбэк родителя (обновляем состояние в Header)
          onClose()            // закрываем модалку
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

  // ============================================================
  // ФУНКЦИЯ handleCreateAccount — создаёт аккаунт для нового пользователя
  // Вызывается при сабмите формы на шаге 'name'
  // Повторно вызывает verify-code но теперь с именем
  // ============================================================
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasSql(name)) { setTrolled(true); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/avtorizaciya/proverit-kod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, name }),
        // Передаём name — сервер создаст нового пользователя с этим именем
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

  // ============================================================
  // ФУНКЦИЯ reset — сбрасывает форму к начальному состоянию
  // Вызывается при нажатии "← Назад" на шаге ввода кода
  // ============================================================
  const reset = () => {
    setStep('phone') // возвращаемся к вводу телефона
    setError('')     // сбрасываем ошибку
    setCode('')      // очищаем поле кода
    setName('')      // очищаем поле имени
    // phone не сбрасываем — пользователь может захотеть отправить код снова
  }

  return (
    <>
      {/* SqlTroll — показывается если пользователь ввёл SQL-инъекцию */}
      <SqlTroll visible={trolled} />

      {/* Модалка показывается только если isOpen === true */}
      {isOpen && (
        // Полупрозрачный фон — клик по нему закрывает модалку
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          {/* Белый блок модалки — stopPropagation чтобы клик внутри не закрывал */}
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '90%', position: 'relative' }}>

            {/* Кнопка закрытия × в правом верхнем углу */}
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>

            {/* Заголовок меняется в зависимости от текущего шага */}
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#000' }}>
              {step === 'phone' && 'Вход'}         {/* шаг 1 */}
              {step === 'code' && 'Введите код'}   {/* шаг 2 */}
              {step === 'name' && 'Регистрация'}   {/* шаг 3 */}
            </h2>

            {/* ШАГ 1: Форма ввода телефона */}
            {step === 'phone' && (
              <form onSubmit={handleSendCode}>
                <input
                  type="tel"                          // тип tel — мобильные показывают цифровую клавиатуру
                  placeholder="+7 (___) ___-__-__"
                  value={phone}                       // controlled input — значение из состояния
                  onChange={handlePhoneChange}        // обработчик изменения
                  required                            // HTML5 валидация — нельзя отправить пустым
                  style={{ width: '100%', padding: '16px', marginBottom: '24px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  // boxSizing: 'border-box' — padding включается в ширину (не выходит за 100%)
                />
                {/* Показываем ошибку только если она есть (условный рендеринг) */}
                {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading} // блокируем кнопку пока идёт запрос
                  style={{ width: '100%', padding: '18px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer', // меняем курсор при загрузке
                    fontSize: '16px', fontWeight: '600',
                    opacity: loading ? 0.6 : 1 // делаем полупрозрачным при загрузке
                  }}
                >
                  {loading ? 'Отправка...' : 'Получить код'} {/* текст меняется при загрузке */}
                </button>
              </form>
            )}

            {/* ШАГ 2: Форма ввода SMS кода */}
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
                  maxLength={6} // ограничиваем 6 символами (длина кода)
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '12px',
                    fontSize: '24px',       // крупный шрифт для читаемости
                    textAlign: 'center',    // цифры по центру
                    letterSpacing: '8px',   // расстояние между цифрами
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Проверка...' : 'Продолжить'}
                </button>
                {/* Кнопка "Назад" — возвращает к вводу телефона */}
                <button type="button" onClick={reset} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b6b6b', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  ← Назад
                </button>
              </form>
            )}

            {/* ШАГ 3: Форма ввода имени (только для новых пользователей) */}
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
