'use client'

import { useState, useEffect } from 'react'

type Banner = {
  id: number
  imageUrl: string
  title: string
  subtitle?: string
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!mounted || banners.length === 0) return null

  const next = () => setCurrent((prev) => (prev + 1) % banners.length)
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', height: isMobile ? 'auto' : '440px', backgroundColor: '#000', width: '100%' }}>
      <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${current * 100}%)`, height: '100%', width: '100%' }}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            style={{
              minWidth: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: isMobile ? 'contain' : 'cover', imageRendering: '-webkit-optimize-contrast' }} />
            {(banner.title || banner.subtitle) && (
              <>
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
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 2,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 2,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
          >
            ›
          </button>
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 2 }}>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
