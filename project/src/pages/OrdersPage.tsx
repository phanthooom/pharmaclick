import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Package, Clock, CircleCheck as CheckCircle2, X, MapPin, Truck } from 'lucide-react'
import { supabase, Order } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { formatPrice } from '../lib/format'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const sessionId = getSessionId()

    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
      setOrders((data as Order[]) ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
          setSelectedOrder(prev => prev?.id === payload.new.id ? { ...prev, ...payload.new } : prev)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <OrdersSkeleton />

  if (orders.length === 0) return <EmptyOrders />

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
      {orders.map(order => (
        <div
          key={order.id}
          onClick={() => setSelectedOrder(order)}
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

      {/* Bottom Sheet */}
      <OrderBottomSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

import { useRef } from 'react'

function OrderBottomSheet({ order, onClose }: { order: Order | null, onClose: () => void }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)

  useEffect(() => {
    if (!order) return
    // Reset transform when opened
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
      sheetRef.current.style.transform = 'translateY(0)'
    }
    setLoading(true)
    supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', order.id)
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [order])

  const handleClose = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.3, 1, 0.3, 1)'
      sheetRef.current.style.transform = `translateY(100%)`
    }
    setTimeout(onClose, 250)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    const delta = Math.max(0, e.touches[0].clientY - startY.current)
    sheetRef.current.style.transform = `translateY(${delta}px)`
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false
    const currentY = e.changedTouches[0].clientY
    const delta = currentY - startY.current
    
    sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.3, 1, 0.3, 1)'
    if (delta > 100) {
      handleClose()
    } else {
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }

  if (!order) return null

  return (
    <>
      <div 
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease',
        }} 
      />
      <div 
        ref={sheetRef}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: 'var(--neutral-50)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
        }}
      >
        {/* Header with Drag Handle */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'flex', flexDirection: 'column',
            padding: '12px 20px 16px', background: '#fff', borderRadius: '24px 24px 0 0',
            borderBottom: '1px solid var(--neutral-100)',
            position: 'sticky', top: 0, zIndex: 10,
          }}
        >
          {/* Drag Pill */}
          <div style={{
            width: 40, height: 4, background: 'var(--neutral-200)', borderRadius: 2,
            margin: '0 auto 16px'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 4 }}>
                Заказ #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--neutral-400)' }}>
                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <button 
              onClick={handleClose}
              style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--neutral-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-600)',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }} className="hide-scrollbar">
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-800)' }}>Статус</span>
              <StatusBadge status={order.status} />
            </div>
            <StatusStepper status={order.status} />
          </div>

          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px',
            marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <MapPin size={16} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 2 }}>Адрес доставки</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)', lineHeight: 1.4 }}>
                {order.customer_address}
              </p>
            </div>
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 12, paddingLeft: 4 }}>
            Товары ({items.length})
          </h4>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--green-100)', borderTopColor: 'var(--green-500)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: '#fff', borderRadius: 'var(--radius-lg)', padding: '12px',
                  display: 'flex', gap: 12, alignItems: 'center'
                }}>
                  <img 
                    src={item.product?.image_url || 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=200'} 
                    alt={item.product?.name}
                    style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', background: 'var(--neutral-100)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                      {item.product?.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{item.quantity} шт.</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-600)' }}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px',
            marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)' }}>Итого</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)' }}>
              {formatPrice(order.total_amount)}
            </span>
          </div>

        </div>
      </div>
    </>
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
    shipping: {
      label: 'В пути',
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: <Truck size={12} />,
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

function StatusStepper({ status }: { status: string }) {
  const steps = [
    { key: 'pending', label: 'Принят', icon: <Clock size={14} /> },
    { key: 'confirmed', label: 'Подтверждён', icon: <CheckCircle2 size={14} /> },
    { key: 'shipping', label: 'В пути', icon: <Truck size={14} /> },
    { key: 'delivered', label: 'Доставлен', icon: <Package size={14} /> },
  ]

  const order = ['pending', 'confirmed', 'shipping', 'delivered']
  const isCancelled = status === 'cancelled'
  const currentIdx = isCancelled ? -1 : order.indexOf(status)

  if (isCancelled) {
    return (
      <div style={{
        background: '#fef2f2', borderRadius: 'var(--radius-md)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <X size={16} color="var(--red-500)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-600)' }}>Заказ отменён</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {steps.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line left */}
            {i > 0 && (
              <div style={{
                position: 'absolute', top: 14, right: '50%', left: '-50%', height: 2,
                background: done || active ? 'var(--green-500)' : 'var(--neutral-200)',
                transition: 'background 0.3s',
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', zIndex: 1,
              background: done ? 'var(--green-500)' : active ? 'var(--green-500)' : 'var(--neutral-100)',
              border: active ? '3px solid var(--green-200)' : 'none',
              color: done || active ? '#fff' : 'var(--neutral-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {step.icon}
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 6, textAlign: 'center',
              color: done || active ? 'var(--neutral-800)' : 'var(--neutral-400)',
              lineHeight: 1.2,
            }}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
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
