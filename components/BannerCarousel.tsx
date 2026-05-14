'use client'

import { useState, useEffect } from 'react'

// Тип баннера
type Banner = {
  id: number
  imageUrl: string
  title: string
  subtitle?: string // необязательный подзаголовок
}

// Компонент карусели баннеров на главной странице
export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)       // индекс текущего баннера
  const [isMobile, setIsMobile] = useState(false) // флаг мобильного устройства
  const [mounted, setMounted] = useState(false)   // флаг монтирования (для SSR)

  useEffect(() => {
    setMounted(true) // компонент смонтирован в браузере
    // Определяем мобильное устройство по ширине экрана
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize) // очистка
  }, [])

  // Автоматическое переключение баннеров каждые 5 секунд
  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      // % banners.length — зацикливаем (после последнего идёт первый)
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer) // очищаем таймер при размонтировании
  }, [banners.length])

  // Не рендерим до монтирования (избегаем гидратационных ошибок) и если нет баннеров
  if (!mounted || banners.length === 0) return null

  // Переключение на следующий баннер
  const next = () => setCurrent((prev) => (prev + 1) % banners.length)
  // Переключение на предыдущий баннер (+ banners.length чтобы не было отрицательных)
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    // Контейнер карусели с overflow: hidden чтобы скрыть соседние баннеры
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', height: isMobile ? 'auto' : '440px', backgroundColor: '#000', width: '100%' }}>
      {/* Горизонтальная лента всех баннеров — сдвигаем через translateX */}
      <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${current * 100}%)`, height: '100%', width: '100%' }}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            style={{
              minWidth: '100%', // каждый баннер занимает 100% ширины
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: isMobile ? 'contain' : 'cover', imageRendering: '-webkit-optimize-contrast' }} />
            {/* Текст поверх баннера (если есть заголовок или подзаголовок) */}
            {(banner.title || banner.subtitle) && (
              <>
                {/* Тёмный оверлей для читаемости текста */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
                <div style={{ position: 'absolute', left: isMobile ? '16px' : '40px', right: isMobile ? '16px' : '40px', zIndex: 1, maxWidth: '600px' }}>
                  {banner.title && (
                    <h1 style={{ fontSize: isMobile ? '22px' : '40px', fontWeight: '700', marginBottom: '12px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle && (
                    <p style={{ fontSize: isMobile ? '13px' : '18px', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{banner.subtitle}</p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Кнопки навигации и точки — показываем только если баннеров больше одного */}
      {banners.length > 1 && (
        <>
          {/* Кнопка "назад" */}
          <button onClick={prev} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', zIndex: 2, transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
          >‹</button>
          {/* Кнопка "вперёд" */}
          <button onClick={next} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', zIndex: 2, transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
          >›</button>
          {/* Точки-индикаторы внизу карусели */}
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 2 }}>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)} // клик на точку — переходим к баннеру
                style={{
                  width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                  // Активная точка белая, остальные полупрозрачные
                  backgroundColor: index === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
