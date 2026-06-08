import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, User, CreditCard as Edit3, Save, X, ShieldCheck, Truck, Tag, Settings, Heart, ShoppingBag } from 'lucide-react'
import YandexMapPicker from '../components/YandexMapPicker'
import { getTelegramUser, getSessionId } from '../lib/session'
import { useFavorites } from '../context/FavoritesContext'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/format'

const PROFILE_KEY = 'shoshiypharm_profile'

type Profile = {
  name: string
  phone: string
  address: string
  lat?: number
  lon?: number
}

const aboutItems = [
  { Icon: ShieldCheck, title: 'Лицензированная аптека', desc: 'Все препараты сертифицированы' },
  { Icon: Truck, title: 'Быстрая доставка', desc: 'Доставка за 30-60 минут' },
  { Icon: Tag, title: 'Честные цены', desc: 'Цены как в обычной аптеке' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const tgUser = getTelegramUser()
  const isAdmin = ['tg_638384527', 'tg_6543511525'].includes(getSessionId())
  const { favorites } = useFavorites()
  const [orderStats, setOrderStats] = useState<{ count: number; total: number } | null>(null)

  useEffect(() => {
    const sessionId = getSessionId()
    supabase
      .from('orders')
      .select('total_amount')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        if (data) {
          setOrderStats({
            count: data.length,
            total: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          })
        }
      })
  }, [])
  const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Profile>({ name: '', phone: '', address: '' })
  const [saved, setSaved] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [coords, setCoords] = useState<{lat: number, lon: number} | undefined>()

  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Profile
      setProfile(parsed)
      setForm(parsed)
      if (parsed.lat && parsed.lon) {
        setCoords({ lat: parsed.lat, lon: parsed.lon })
      }
    }
  }, [])

  const handleSave = () => {
    const dataToSave = { ...form, lat: coords?.lat, lon: coords?.lon }
    setProfile(dataToSave)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(dataToSave))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setForm(profile)
    if (profile.lat && profile.lon) {
      setCoords({ lat: profile.lat, lon: profile.lon })
    }
    setEditing(false)
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, textAlign: 'center', color: '#fff',
      }}>
        <div style={{
          width: 72, height: 72, background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid rgba(255,255,255,0.3)',
        }}>
          <User size={36} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
            {profile.name || tgUser?.first_name || 'Гость'}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.85 }}>
            {profile.phone || 'Номер не указан'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={() => navigate('/favorites')}
          style={{
            background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)',
            padding: '14px', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={16} color="#ef4444" fill={favorites.length > 0 ? '#ef4444' : 'none'} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--neutral-900)' }}>{favorites.length}</p>
          <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>Избранных</p>
        </button>
        <div style={{
          background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)',
          padding: '14px', boxShadow: 'var(--shadow-sm)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={16} color="var(--green-600)" />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--neutral-900)' }}>{orderStats?.count ?? '—'}</p>
          <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>
            {orderStats ? formatPrice(orderStats.total) : 'Заказов'}
          </p>
        </div>
      </div>

      <div style={{
        background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid var(--neutral-100)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-800)' }}>Личные данные</span>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--green-600)', fontSize: 13, fontWeight: 600, background: 'none',
            }}>
              <Edit3 size={14} /> Изменить
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCancel} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'var(--neutral-500)', fontSize: 13, background: 'none',
              }}>
                <X size={14} /> Отмена
              </button>
              <button onClick={handleSave} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'var(--green-600)', fontSize: 13, fontWeight: 600, background: 'none',
              }}>
                <Save size={14} /> Сохранить
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div style={{ padding: '8px 16px', background: 'var(--green-50)', fontSize: 13, color: 'var(--green-700)', fontWeight: 600 }}>
            Сохранено!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ProfileRow icon={<User size={16} />} label="Имя" value={editing ? undefined : (profile.name || tgUser?.first_name || 'не указано')} editing={editing} editValue={form.name} onEdit={v => setForm(f => ({ ...f, name: v }))} />
          <ProfileRow 
            icon={<Phone size={16} />} 
            label="Телефон" 
            value={editing ? undefined : (profile.phone || 'не указан')} 
            editing={editing} 
            editValue={form.phone || '+998 '} 
            onEdit={v => {
              if (v.length < 5 || !v.startsWith('+998 ')) {
                setForm(f => ({ ...f, phone: '+998 ' }))
              } else {
                setForm(f => ({ ...f, phone: v }))
              }
            }} 
            type="tel" 
          />
          <ProfileRow 
            icon={<MapPin size={16} />} 
            label="Адрес" 
            value={editing ? undefined : (profile.address || 'не указан')} 
            editing={editing} 
            editValue={form.address} 
            onEdit={v => setForm(f => ({ ...f, address: v }))} 
            isAddress={true} 
            onAddressClick={() => setShowMap(true)} 
          />
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => navigate('/admin')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)',
            padding: '14px 16px', boxShadow: 'var(--shadow-sm)',
            color: 'var(--neutral-800)',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Settings size={18} color="var(--blue-600)" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Панель администратора</p>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 1 }}>Управление заказами</p>
          </div>
        </button>
      )}

      <div style={{ background: 'var(--neutral-0)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>О Shoshiypharm</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {aboutItems.map(({ Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#005738',
              }}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 1 }}>{title}</p>
                <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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

function ProfileRow({ icon, label, value, editing, editValue, onEdit, type = 'text', isAddress, onAddressClick }: {
  icon: React.ReactNode; label: string; value?: string
  editing: boolean; editValue: string; onEdit: (v: string) => void; type?: string;
  isAddress?: boolean; onAddressClick?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--neutral-100)' }}>
      <span style={{ color: 'var(--neutral-400)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: 'var(--neutral-400)', marginBottom: 1 }}>{label}</p>
        {editing ? (
          isAddress ? (
            <div 
              onClick={onAddressClick}
              style={{
                width: '100%', fontSize: 14, fontWeight: 600, color: editValue ? 'var(--neutral-800)' : 'var(--neutral-400)',
                background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '6px 8px',
                cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}
            >
              {editValue || 'Выбрать адрес на карте'}
            </div>
          ) : (
            <input type={type} value={editValue} onChange={e => onEdit(e.target.value)} style={{
              width: '100%', fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)',
              background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '6px 8px',
            }} />
          )
        ) : (
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)' }}>{value}</p>
        )}
      </div>
    </div>
  )
}