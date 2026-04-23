import { useState, useEffect } from 'react'
import { MapPin, Phone, User, CreditCard as Edit3, Save, X } from 'lucide-react'

const PROFILE_KEY = 'pharmaclick_profile'

type Profile = {
  name: string
  phone: string
  address: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Profile>({ name: '', phone: '', address: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Profile
      setProfile(parsed)
      setForm(parsed)
    }
  }, [])

  const handleSave = () => {
    setProfile(form)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(form))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Avatar card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{
          width: 72, height: 72,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          border: '3px solid rgba(255,255,255,0.3)',
        }}>
          👤
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
            {profile.name || 'Гость'}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.85 }}>
            {profile.phone || 'Номер не указан'}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div style={{
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--neutral-100)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-800)' }}>
            Личные данные
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'var(--green-600)', fontSize: 13, fontWeight: 600,
                background: 'none',
              }}
            >
              <Edit3 size={14} />
              Изменить
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--neutral-500)', fontSize: 13, fontWeight: 500,
                  background: 'none',
                }}
              >
                <X size={14} />
                Отмена
              </button>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--green-600)', fontSize: 13, fontWeight: 600,
                  background: 'none',
                }}
              >
                <Save size={14} />
                Сохранить
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div style={{
            padding: '8px 16px',
            background: 'var(--green-50)',
            fontSize: 13,
            color: 'var(--green-700)',
            fontWeight: 600,
          }}>
            Сохранено!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ProfileRow
            icon={<User size={16} />}
            label="Имя"
            value={editing ? undefined : (profile.name || '—')}
            editing={editing}
            editValue={form.name}
            onEdit={v => setForm(f => ({ ...f, name: v }))}
          />
          <ProfileRow
            icon={<Phone size={16} />}
            label="Телефон"
            value={editing ? undefined : (profile.phone || '—')}
            editing={editing}
            editValue={form.phone}
            onEdit={v => setForm(f => ({ ...f, phone: v }))}
            type="tel"
          />
          <ProfileRow
            icon={<MapPin size={16} />}
            label="Адрес"
            value={editing ? undefined : (profile.address || '—')}
            editing={editing}
            editValue={form.address}
            onEdit={v => setForm(f => ({ ...f, address: v }))}
          />
        </div>
      </div>

      {/* Info block */}
      <div style={{
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>
          О PharmaClick
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🏥', title: 'Лицензированная аптека', desc: 'Все препараты сертифицированы' },
            { icon: '🚚', title: 'Быстрая доставка', desc: 'Доставка за 30-60 минут' },
            { icon: '💰', title: 'Честные цены', desc: 'Цены как в обычной аптеке' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 1 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileRow({
  icon,
  label,
  value,
  editing,
  editValue,
  onEdit,
  type = 'text',
}: {
  icon: React.ReactNode
  label: string
  value?: string
  editing: boolean
  editValue: string
  onEdit: (v: string) => void
  type?: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--neutral-100)',
    }}>
      <span style={{ color: 'var(--neutral-400)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: 'var(--neutral-400)', marginBottom: 1 }}>{label}</p>
        {editing ? (
          <input
            type={type}
            value={editValue}
            onChange={e => onEdit(e.target.value)}
            style={{
              width: '100%',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--neutral-800)',
              background: 'var(--neutral-50)',
              border: '1px solid var(--neutral-200)',
              borderRadius: 6,
              padding: '6px 8px',
            }}
          />
        ) : (
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}
