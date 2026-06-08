import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1600)
    const doneTimer = setTimeout(() => onDone(), 2100)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #00875A 0%, #14b8a6 100%)',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      <img
        src="/shoshi-logo.png"
        alt="Shoshiypharm"
        style={{
          width: 100,
          height: 100,
          borderRadius: 20,
          objectFit: 'contain',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          marginBottom: 24,
        }}
      />
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.5px',
      }}>
        Shoshiypharm
      </div>
      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 8,
        fontWeight: 500,
      }}>
        Аптека в вашем кармане
      </div>
    </div>
  )
}
