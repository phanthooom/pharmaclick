import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Package, Clock, CircleCheck as CheckCircle2 } from 'lucide-react'
import { supabase, Order } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { formatPrice } from '../lib/format'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sessionId = getSessionId()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
      setOrders((data as Order[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <OrdersSkeleton />

  if (orders.length === 0) return <EmptyOrders />

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map(order => (
        <div
          key={order.id}
          onClick={() => navigate(`/orders?detail=${order.id}`)}
          style={{
            background: 'var(--neutral-0)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 2 }}>
                Заказ #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--neutral-900)' }}>
              {formatPrice(order.total_amount)}
            </span>
            <ChevronRight size={16} color="var(--neutral-300)" />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
      label: 'В обработке',
      color: 'var(--amber-600)',
      bg: '#fffbeb',
      icon: <Clock size={12} />,
    },
    confirmed: {
      label: 'Подтверждён',
      color: 'var(--blue-600)',
      bg: '#eff6ff',
      icon: <CheckCircle2 size={12} />,
    },
    delivered: {
      label: 'Доставлен',
      color: 'var(--green-600)',
      bg: 'var(--green-50)',
      icon: <CheckCircle2 size={12} />,
    },
    cancelled: {
      label: 'Отменён',
      color: 'var(--red-600)',
      bg: '#fef2f2',
      icon: <Package size={12} />,
    },
  }

  const c = config[status] ?? config.pending

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700,
      color: c.color,
      background: c.bg,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
    }}>
      {c.icon}
      {c.label}
    </span>
  )
}

function EmptyOrders() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 24px', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80,
        background: 'var(--green-50)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        📋
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>
          У вас пока нет заказов
        </p>
        <p style={{ fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.5 }}>
          Сделайте первый заказ,<br />и он появится здесь
        </p>
      </div>
      <button
        onClick={() => navigate('/catalog')}
        style={{
          padding: '12px 28px',
          background: 'var(--green-500)',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          fontSize: 15, fontWeight: 600,
          marginTop: 8,
        }}
      >
        Перейти в каталог
      </button>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          height: 90,
          background: 'var(--neutral-100)',
          borderRadius: 'var(--radius-lg)',
          animation: 'pulse 1.5s ease infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
