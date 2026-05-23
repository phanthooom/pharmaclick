import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, MapPin, Phone, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import YandexMapPicker from '../components/YandexMapPicker'

const PROFILE_KEY = 'pharmaclick_profile'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, totalAmount, updateQuantity, removeItem, clearCart, itemCount } = useCart()

  const [checkingOut, setCheckingOut] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '+998 ', address: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMap, setShowMap] = useState(false)
  const [coords, setCoords] = useState<{lat: number, lon: number} | undefined>()

  // Load saved profile data on mount
  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        phone: parsed.phone && parsed.phone.length > 5 ? parsed.phone : f.phone,
        address: parsed.address || f.address,
      }))
      if (parsed.lat && parsed.lon) {
        setCoords({ lat: parsed.lat, lon: parsed.lon })
      }
    }
  }, [])

  if (itemCount === 0) return <EmptyCart />

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.phone.trim()) e.phone = 'Введите номер телефона'
    if (!form.address.trim()) e.address = 'Введите адрес'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleOrder = async () => {
    if (!validate()) return
    setSubmitting(true)
    const sessionId = getSessionId()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        session_id: sessionId,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        customer_lat: coords?.lat,
        customer_lon: coords?.lon,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Order creation error:', error)
      alert(`Ошибка при оформлении заказа: ${error.message}`)
    }

    if (order) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.discount_price ?? item.product.price,
      }))
      await supabase.from('order_items').insert(orderItems)
      await clearCart()
      navigate('/order-success')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Items */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const price = item.product.discount_price ?? item.product.price
          return (
            <div key={item.id} style={{
              background: 'var(--neutral-0)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              display: 'flex', gap: 12,
              boxShadow: 'var(--shadow-sm)',
              alignItems: 'center',
            }}>
              <img
                src={item.product.image_url || 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=200'}
                alt={item.product.name}
                style={{
                  width: 68, height: 68,
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  flexShrink: 0,
                  background: 'var(--neutral-100)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--neutral-800)',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}>
                  {item.product.name}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-600)', marginBottom: 8 }}>
                  {formatPrice(price)}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'var(--neutral-100)',
                    borderRadius: 'var(--radius-md)',
                    padding: '3px',
                    gap: 2,
                  }}>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      style={{
                        width: 26, height: 26,
                        background: '#fff',
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--neutral-600)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      style={{
                        width: 26, height: 26,
                        background: 'var(--green-500)',
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    style={{
                      width: 30, height: 30,
                      background: '#fef2f2',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--red-500)',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{
        margin: '4px 16px 16px',
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>Товаров: {itemCount}</span>
          <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>{formatPrice(totalAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>Доставка</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-600)' }}>Бесплатно</span>
        </div>
        <div style={{
          borderTop: '1px dashed var(--neutral-200)',
          paddingTop: 10,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-900)' }}>Итого</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.3px' }}>
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* Checkout form */}
      {!checkingOut ? (
        <div style={{ padding: '0 16px' }}>
          <button
            onClick={() => setCheckingOut(true)}
            style={{
              width: '100%',
              height: 52,
              background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ShoppingBag size={18} />
            Оформить заказ
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)' }}>
            Данные для доставки
          </h3>

          <FormField
            icon={<User size={16} />}
            placeholder="Ваше имя"
            value={form.name}
            onChange={v => setForm(f => ({ ...f, name: v }))}
            error={errors.name}
          />
          <FormField
            icon={<Phone size={16} />}
            placeholder="+998 90 123 45 67"
            value={form.phone}
            onChange={v => setForm(f => ({ ...f, phone: v }))}
            type="tel"
            error={errors.phone}
          />
          {/* Address Map Trigger */}
          <div>
            <div
              onClick={() => setShowMap(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--neutral-0)',
                border: `1.5px solid ${errors.address ? 'var(--red-400)' : 'var(--neutral-200)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 14px',
                height: 48,
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: 'var(--neutral-400)', flexShrink: 0 }}><MapPin size={16} /></span>
              <div style={{
                flex: 1,
                fontSize: 14,
                color: form.address ? 'var(--neutral-800)' : 'var(--neutral-400)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {form.address || 'Выбрать адрес на карте'}
              </div>
            </div>
            {errors.address && (
              <p style={{ fontSize: 12, color: 'var(--red-500)', marginTop: 4, paddingLeft: 4 }}>{errors.address}</p>
            )}
          </div>

          <button
            onClick={handleOrder}
            disabled={submitting}
            style={{
              width: '100%',
              height: 52,
              background: submitting
                ? 'var(--neutral-300)'
                : 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              fontSize: 16, fontWeight: 700,
              transition: 'background 0.2s',
            }}
          >
            {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
          </button>
        </div>
      )}

      {showMap && (
        <YandexMapPicker
          apiKey={import.meta.env.VITE_YANDEX_MAPS_API_KEY}
          initialCoords={coords}
          onSave={(addr, c) => {
            setForm(f => ({ ...f, address: addr }))
            setCoords(c)
            setShowMap(false)
          }}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  )
}

function FormField({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  error?: string
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--neutral-0)',
        border: `1.5px solid ${error ? 'var(--red-400)' : 'var(--neutral-200)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0 14px',
        height: 48,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <span style={{ color: 'var(--neutral-400)', flexShrink: 0 }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1,
            fontSize: 14,
            color: 'var(--neutral-800)',
            background: 'none',
            border: 'none',
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--red-500)', marginTop: 4, paddingLeft: 4 }}>{error}</p>
      )}
    </div>
  )
}

function EmptyCart() {
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
        🛒
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>
          Корзина пуста
        </p>
        <p style={{ fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.5 }}>
          Добавьте товары из каталога,<br />чтобы сделать заказ
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
