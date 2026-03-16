'use client'

import { useEffect, useRef } from 'react'

export default function AddressMap({ address, onAddressChange }: { address: string, onAddressChange: (address: string) => void }) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !initializedRef.current) {
      initializedRef.current = true
      
      import('leaflet').then((L) => {
        if (mapRef.current) return
        
        const map = L.map(containerRef.current!, { attributionControl: false }).setView([55.751244, 37.618423], 13)
        mapRef.current = map
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        
        const marker = L.marker([55.751244, 37.618423]).addTo(map)
        markerRef.current = marker
        
        map.on('click', async (e: any) => {
          marker.setLatLng(e.latlng)
          
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
          const data = await response.json()
          if (onAddressChange) onAddressChange(data.display_name || '')
        })
      })
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (address && mapRef.current && markerRef.current) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            mapRef.current.setView([lat, lon], 13)
            markerRef.current.setLatLng([lat, lon])
          }
        })
    }
  }, [address])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: '100%', height: '200px', marginTop: '12px', borderRadius: '8px', overflow: 'hidden' }} />
    </>
  )
}
