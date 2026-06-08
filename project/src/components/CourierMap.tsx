import { useEffect, useRef } from 'react'

const PHARMACY = { lat: 41.2995, lon: 69.2401 }

declare global {
  interface Window { ymaps: any; __ymapsLoading?: Promise<void> }
}

function loadYmaps(apiKey: string): Promise<void> {
  if (window.__ymapsLoading) return window.__ymapsLoading
  if (window.ymaps?.geocode) return new Promise<void>(r => window.ymaps.ready(r))
  window.__ymapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = () => window.ymaps.ready(resolve)
    script.onerror = () => reject(new Error('Yandex Maps load error'))
    document.head.appendChild(script)
  })
  return window.__ymapsLoading
}

interface Props {
  apiKey: string
  courierLat?: number
  courierLon?: number
  customerLat?: number
  customerLon?: number
}

export default function CourierMap({ apiKey, courierLat, courierLon, customerLat, customerLon }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const courierPlacemarkRef = useRef<any>(null)
  const initedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initedRef.current) return
    initedRef.current = true

    const customerCoords = customerLat && customerLon
      ? { lat: customerLat, lon: customerLon }
      : PHARMACY

    const centerLat = (PHARMACY.lat + customerCoords.lat) / 2
    const centerLon = (PHARMACY.lon + customerCoords.lon) / 2

    loadYmaps(apiKey).then(() => {
      if (!containerRef.current || mapRef.current) return

      const map = new window.ymaps.Map(containerRef.current, {
        center: [centerLat, centerLon],
        zoom: 13,
        controls: [],
      }, { suppressMapOpenBlock: true })
      mapRef.current = map

      // Pharmacy marker
      map.geoObjects.add(new window.ymaps.Placemark(
        [PHARMACY.lat, PHARMACY.lon],
        { balloonContent: 'Аптека Shoshiypharm' },
        {
          preset: 'islands#greenMedicalIcon',
          iconColor: '#00875A',
        }
      ))

      // Customer marker
      if (customerLat && customerLon) {
        map.geoObjects.add(new window.ymaps.Placemark(
          [customerLat, customerLon],
          { balloonContent: 'Адрес доставки' },
          { preset: 'islands#redHomeIcon' }
        ))
      }

      // Courier marker
      const courierMark = new window.ymaps.Placemark(
        [courierLat ?? PHARMACY.lat, courierLon ?? PHARMACY.lon],
        { balloonContent: 'Ваш курьер' },
        {
          preset: 'islands#blueDeliveryIcon',
          iconColor: '#2563eb',
        }
      )
      map.geoObjects.add(courierMark)
      courierPlacemarkRef.current = courierMark
    })

    return () => {
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null }
      initedRef.current = false
    }
  }, [])

  // Update courier marker position when coords change
  useEffect(() => {
    if (!courierPlacemarkRef.current || courierLat == null || courierLon == null) return
    courierPlacemarkRef.current.geometry.setCoordinates([courierLat, courierLon])
    if (mapRef.current) {
      mapRef.current.setCenter([courierLat, courierLon], mapRef.current.getZoom(), { duration: 500 })
    }
  }, [courierLat, courierLon])

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: 220 }} />
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 20,
        padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        backdropFilter: 'blur(4px)',
      }}>
        🚴 Курьер едет к вам
      </div>
    </div>
  )
}
