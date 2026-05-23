import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck as CheckCircle, Home, Package, PhoneCall, Box, Truck } from 'lucide-react'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      background: 'linear-gradient(160deg, var(--green-50) 0%, var(--neutral-0) 50%, var(--neutral-50) 100%)',
      textAlign: 'center',
      gap: 0,
    }}>
      {/* Animated circle */}
      <div style={{
        position: 'relative',
        marginBottom: 32,
        transform: visible ? 'scale(1)' : 'scale(0.5)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{
          width: 120, height: 120,
          background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(0,135,90,0.35)',
        }}>
          <CheckCircle size={56} color="#fff" strokeWidth={2.5} />
        </div>
        {/* Ripple rings */}
        <div style={{
          position: 'absolute',
          top: -8, left: -8, right: -8, bottom: -8,
          borderRadius: '50%',
          border: '2px solid var(--green-300)',
          opacity: visible ? 0 : 1,
          transform: visible ? 'scale(1.5)' : 'scale(1)',
          transition: 'all 1s ease 0.3s',
        }} />
        <div style={{
          position: 'absolute',
          top: -16, left: -16, right: -16, bottom: -16,
          borderRadius: '50%',
          border: '2px solid var(--green-200)',
          opacity: visible ? 0 : 1,
          transform: visible ? 'scale(1.8)' : 'scale(1)',
          transition: 'all 1.2s ease 0.5s',
        }} />
      </div>

      <div style={{
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s ease 0.2s',
        marginBottom: 12,
      }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: 'var(--neutral-900)',
          letterSpacing: '-0.5px',
          marginBottom: 8,
        }}>
          Заказ оформлен!
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--neutral-500)',
          lineHeight: 1.6,
        }}>
          Ваш заказ принят и передан<br />в обработку. Ожидайте звонка!
        </p>
      </div>

      {/* Steps */}
      <div style={{
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        width: '100%',
        maxWidth: 360,
        marginTop: 16,
        marginBottom: 32,
        boxShadow: 'var(--shadow-md)',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s ease 0.35s',
      }}>
        {[
          { icon: <PhoneCall size={20} color="var(--green-600)" />, title: 'Звонок оператора', desc: 'В течение 15 минут' },
          { icon: <Box size={20} color="var(--green-600)" />, title: 'Сборка заказа', desc: 'Оригинальные препараты' },
          { icon: <Truck size={20} color="var(--green-600)" />, title: 'Доставка', desc: 'До вашей двери' },
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            paddingBottom: i < 2 ? 14 : 0,
            marginBottom: i < 2 ? 14 : 0,
            borderBottom: i < 2 ? '1px solid var(--neutral-100)' : 'none',
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--green-50)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {step.icon}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 2 }}>
                {step.title}
              </p>
              <p style={{ fontSize: 13, color: 'var(--neutral-400)' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s ease 0.5s',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            height: 52,
            background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Home size={18} />
          На главную
        </button>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            height: 48,
            background: 'var(--neutral-0)',
            border: '1.5px solid var(--neutral-200)',
            color: 'var(--neutral-700)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Package size={16} />
          Продолжить покупки
        </button>
      </div>
    </div>
  )
}
