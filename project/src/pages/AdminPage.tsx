import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase, Order } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { formatPrice } from '../lib/format'

const ADMIN_SESSION = 'tg_638384527'

const STATUSES = [
  { key: 'pending',   label: 'В обработке', color: 'var(--amber-600)',  bg: '#fffbeb' },
  { key: 'confirmed', label: 'Подтверждён', color: 'var(--blue-600)',   bg: '#eff6ff' },
  { key: 'shipping',  label: 'В пути',       color: '#7c3aed',           bg: '#f5f3ff' },
  { key: 'delivered', label: 'Доставлен',    color: 'var(--green-600)', bg: 'var(--green-50)' },
  { key: 'cancelled', label: 'Отменён',      color: 'var(--red-600)',   bg: '#fef2f2' },
]

export default function AdminPage() {
  if (getSessionId() !== ADMIN_SESSION) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center', gap: 12 }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)' }}>Нет доступа</p>
        <p style={{ fontSize: 14, color: 'var(--neutral-400)' }}>Только для администратора</p>
      </div>
    )
  }
  return <AdminDashboard />
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const changeStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) {
      alert(`Ошибка: ${error.message}`)
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    }
    setUpdatingId(null)
  }

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return }
    setExpandedId(orderId)
    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from('order_items')
        .select('*, product:products(name, image_url)')
        .eq('order_id', orderId)
      setOrderItems(prev => ({ ...prev, [orderId]: data || [] }))
    }
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div style={{ padding: '16px', paddingBottom: 32 }}>
      {/* Stats header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)' }}>Панель заказов</h2>
          <p style={{ fontSize: 13, color: 'var(--neutral-400)', marginTop: 2 }}>
            Всего: {orders.length} · Новых: <span style={{ color: 'var(--amber-600)', fontWeight: 700 }}>{pendingCount}</span>
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--neutral-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neutral-600)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }} className="hide-scrollbar">
        <button
          onClick={() => setFilterStatus('all')}
          style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-full)',
            fontSize: 12, fontWeight: 600,
            background: filterStatus === 'all' ? 'var(--neutral-800)' : 'var(--neutral-100)',
            color: filterStatus === 'all' ? '#fff' : 'var(--neutral-600)',
          }}
        >
          Все ({orders.length})
        </button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s.key).length
          if (count === 0) return null
          return (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-full)',
                fontSize: 12, fontWeight: 600,
                background: filterStatus === s.key ? s.bg : 'var(--neutral-100)',
                color: filterStatus === s.key ? s.color : 'var(--neutral-600)',
                border: filterStatus === s.key ? `1.5px solid ${s.color}40` : '1.5px solid transparent',
              }}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 140, background: 'var(--neutral-100)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--neutral-400)', fontSize: 14 }}>
          Нет заказов
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => {
            const isExpanded = expandedId === order.id
            const isUpdating = updatingId === order.id
            const statusCfg = STATUSES.find(s => s.key === order.status) ?? STATUSES[0]

            return (
              <div key={order.id} style={{ background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                {/* Order info */}
                <div style={{ padding: '14px 16px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--neutral-400)', marginTop: 1 }}>
                        {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        color: statusCfg.color, background: statusCfg.bg,
                      }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--neutral-900)' }}>
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={11} color="var(--neutral-400)" />
                      <span style={{ fontSize: 12, color: 'var(--neutral-700)', fontWeight: 500 }}>
                        {order.customer_name} · {order.customer_phone}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <MapPin size={11} color="var(--neutral-400)" style={{ marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--neutral-500)', lineHeight: 1.4 }}>
                        {order.customer_address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status buttons */}
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => changeStatus(order.id, s.key)}
                      disabled={isUpdating || order.status === s.key}
                      style={{
                        padding: '5px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: 11, fontWeight: 600,
                        background: order.status === s.key ? s.bg : 'var(--neutral-100)',
                        color: order.status === s.key ? s.color : 'var(--neutral-500)',
                        border: order.status === s.key ? `1px solid ${s.color}30` : '1px solid transparent',
                        opacity: isUpdating ? 0.5 : 1,
                        transition: 'all 0.15s',
                        cursor: order.status === s.key ? 'default' : 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    width: '100%', padding: '8px 16px',
                    borderTop: '1px solid var(--neutral-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, color: 'var(--neutral-500)', fontWeight: 500,
                    background: 'var(--neutral-50)',
                  }}
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'Скрыть товары' : 'Показать товары'}
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--neutral-100)' }}>
                    {orderItems[order.id] ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {orderItems[order.id].map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <img
                              src={item.product?.image_url || 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=200'}
                              alt={item.product?.name}
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'var(--neutral-100)', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.product?.name}
                              </p>
                              <p style={{ fontSize: 12, color: 'var(--neutral-500)' }}>
                                {item.quantity} шт. · {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--neutral-400)', fontSize: 13 }}>Загрузка...</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}
