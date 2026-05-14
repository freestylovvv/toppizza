'use client'

import { useEffect, useRef } from 'react'

// Компонент интерактивной карты для выбора адреса доставки
// address — текущий адрес (для синхронизации маркера), onAddressChange — колбэк при клике на карту
export default function AddressMap({ address, onAddressChange }: { address: string, onAddressChange: (address: string) => void }) {
  const mapRef = useRef<any>(null)       // ссылка на экземпляр карты Leaflet
  const markerRef = useRef<any>(null)    // ссылка на маркер на карте
  const containerRef = useRef<HTMLDivElement>(null) // ссылка на DOM-элемент контейнера
  const initializedRef = useRef(false)   // флаг чтобы не инициализировать карту дважды

  // Инициализация карты при монтировании компонента
  useEffect(() => {
    // Leaflet работает только в браузере (не на сервере), проверяем window
    if (typeof window !== 'undefined' && containerRef.current && !initializedRef.current) {
      initializedRef.current = true
      
      // Динамический импорт Leaflet (чтобы не ломать SSR)
      import('leaflet').then((L) => {
        if (mapRef.current) return // защита от двойной инициализации

        // Настраиваем иконку маркера (стандартные иконки Leaflet не работают с webpack)
        L.Icon.Default.mergeOptions({
          iconUrl: '/images/marker-icon.png',
          iconRetinaUrl: '/images/marker-icon-2x.png',
          shadowUrl: '/images/marker-shadow.png',
        })
        
        // Создаём карту с центром в Москве, масштаб 13
        const map = L.map(containerRef.current!, { attributionControl: false }).setView([55.751244, 37.618423], 13)
        mapRef.current = map
        
        // Добавляем тайлы OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        
        // Добавляем маркер в центр карты
        const marker = L.marker([55.751244, 37.618423]).addTo(map)
        markerRef.current = marker
        
        // При клике на карту — перемещаем маркер и получаем адрес по координатам
        map.on('click', async (e: any) => {
          marker.setLatLng(e.latlng) // перемещаем маркер в точку клика
          
          // Обратное геокодирование: координаты → адрес
          const response = await fetch(`/api/geokod/obratno?lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
          if (!response.ok) return
          const data = await response.json()
          if (onAddressChange) onAddressChange(data.display_name || '') // передаём адрес наверх
        })
      })
    }
    
    // Очистка при размонтировании — удаляем карту из DOM
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, []) // пустой массив — запускаем только один раз

  // Когда меняется адрес в поле ввода — ищем его на карте и перемещаем маркер
  useEffect(() => {
    if (address && mapRef.current && markerRef.current) {
      // Прямое геокодирование: адрес → координаты
      fetch(`/api/geokod/poisk?q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            mapRef.current.setView([lat, lon], 13)      // центрируем карту
            markerRef.current.setLatLng([lat, lon])     // перемещаем маркер
          }
        })
    }
  }, [address]) // запускаем при каждом изменении адреса

  return (
    <>
      {/* Подключаем стили Leaflet из public папки */}
      <link rel="stylesheet" href="/leaflet.css" />
      {/* Скрываем копирайт Leaflet */}
      <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
      {/* Контейнер карты — высота 200px */}
      <div ref={containerRef} style={{ width: '100%', height: '200px', marginTop: '12px', borderRadius: '8px', overflow: 'hidden' }} />
    </>
  )
}
