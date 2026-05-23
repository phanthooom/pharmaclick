import { useEffect, useRef, useState, useCallback } from 'react'

const TASHKENT = { lat: 41.2995, lon: 69.2401 }

declare global {
  interface Window {
    ymaps: any
    __ymapsLoading?: Promise<void>
  }
}

function loadYmaps(apiKey: string, lang: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.__ymapsLoading) return window.__ymapsLoading
  if (window.ymaps?.geocode) return new Promise<void>((r) => window.ymaps.ready(r))
  window.__ymapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=${lang}`
    script.async = true
    script.onload = () => window.ymaps.ready(resolve)
    script.onerror = () => reject(new Error('Yandex Maps load error'))
    document.head.appendChild(script)
  })
  return window.__ymapsLoading
}

interface Props {
  initialCoords?: { lat: number; lon: number }
  apiKey: string
  lang?: string
  topOffset?: number
  saveLabel?: string
  detectingLabel?: string
  detectLocationLabel?: string
  onSave: (address: string, coords: { lat: number; lon: number }) => void
  onClose: () => void
}

export default function YandexMapPicker({
  initialCoords,
  apiKey,
  lang = 'ru_RU',
  topOffset = 16,
  saveLabel = 'Подтвердить адрес',
  detectingLabel = 'Определение адреса...',
  detectLocationLabel = 'Моё местоположение',
  onSave,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [address, setAddress] = useState(detectingLabel)
  const [coords, setCoords] = useState(initialCoords ?? TASHKENT)
  const [geocoding, setGeocoding] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  const geocode = useCallback(async (lat: number, lon: number) => {
    setGeocoding(true)
    try {
      const res = await (window.ymaps as any).geocode([lat, lon], { results: 1, kind: 'house' })
      const first = (res as any).geoObjects.get(0)
      const text: string = first?.getAddressLine?.() ?? ''
      setAddress(text || `${lat.toFixed(5)}, ${lon.toFixed(5)}`)
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`)
    } finally {
      setGeocoding(false)
    }
  }, [])

  function panTo(lat: number, lon: number) {
    if (!mapRef.current) return
    mapRef.current.setCenter([lat, lon], 16, { duration: 400 })
  }

  function detectLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setCoords({ lat, lon })
        panTo(lat, lon)
        setLocating(false)
      },
      () => {
        setError('Не удалось определить геолокацию. Разрешите доступ в настройках.')
        setLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    loadYmaps(apiKey, lang)
      .then(() => {
        if (destroyed || !containerRef.current || mapRef.current) return

        const center: [number, number] = [coords.lat, coords.lon]
        const map = new (window.ymaps as any).Map(
          containerRef.current,
          { center, zoom: 16, controls: [] },
          { suppressMapOpenBlock: true },
        )
        mapRef.current = map

        void geocode(coords.lat, coords.lon)

        map.events.add('actiontick', () => {
          if (timerRef.current) clearTimeout(timerRef.current)
          setAddress(detectingLabel)
        })

        map.events.add('actionend', () => {
          if (timerRef.current) clearTimeout(timerRef.current)
          const [lat, lon]: [number, number] = map.getCenter()
          setCoords({ lat, lon })
          timerRef.current = setTimeout(() => void geocode(lat, lon), 350)
        })
      })
      .catch(() => {
        if (!destroyed) setError('Не удалось загрузить карту')
      })

    return () => {
      destroyed = true
      if (timerRef.current) clearTimeout(timerRef.current)
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [])

  const topPx = topOffset + 12

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 200, background: '#fff'
    }}>
      {/* Map Container */}
      <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {/* Top Bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: topPx,
        zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px'
      }}>
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', background: '#fff', color: 'var(--neutral-900)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Address Bubble */}
        <div style={{
          flex: 1, borderRadius: 16, background: '#fff', padding: '10px 16px',
          fontSize: 14, fontWeight: 600, lineHeight: 1.3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          color: geocoding ? 'var(--neutral-400)' : 'var(--neutral-900)'
        }}>
          {geocoding ? detectingLabel : address}
        </div>
      </div>

      {/* GPS Button */}
      <button
        type="button"
        disabled={locating}
        onClick={detectLocation}
        style={{
          position: 'absolute', zIndex: 10, right: 16, top: topPx + 56,
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', background: '#fff', border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          opacity: locating ? 0.6 : 1
        }}
        title={detectLocationLabel}
      >
        {locating ? (
          <div style={{
            width: 20, height: 20, borderRadius: '50%', border: '3px solid var(--green-100)',
            borderTopColor: 'var(--green-500)', animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3.5" stroke="var(--green-500)" strokeWidth="2" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="var(--green-500)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Center Pin */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 10
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-28px)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16, background: 'var(--green-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ width: 3, height: 12, background: 'var(--green-500)', borderRadius: '0 0 2px 2px' }} />
          <div style={{
            width: 12, height: 12, borderRadius: '50%', background: 'var(--green-500)',
            boxShadow: '0 0 0 4px rgba(46, 204, 113, 0.2)'
          }} />
        </div>
      </div>

      {error && (
        <div style={{
          position: 'absolute', left: 16, right: 16, zIndex: 20, top: topPx + 68,
          borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca',
          padding: '12px 16px', fontSize: 14, color: '#ef4444', textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Save Button */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
      }}>
        <button
          type="button"
          disabled={geocoding}
          onClick={() => onSave(address === detectingLabel ? '' : address, coords)}
          style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: 'var(--green-500)', color: '#fff', border: 'none',
            fontSize: 16, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            opacity: geocoding ? 0.5 : 1
          }}
        >
          {saveLabel}
        </button>
      </div>
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
