import { useLocation, useNavigate } from 'react-router-dom'
import { Chrome as Home, Grid3x3 as Grid3X3, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useCart } from '../context/CartContext'

const TABS = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/catalog', icon: Grid3X3, label: 'Каталог' },
  { path: '/cart', icon: ShoppingCart, label: 'Корзина' },
  { path: '/orders', icon: ClipboardList, label: 'Заказы' },
  { path: '/profile', icon: User, label: 'Профиль' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'var(--neutral-0)',
      borderTop: '1px solid var(--neutral-100)',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ path, icon: Icon, label }) => {
        const active = isActive(path)
        const isCart = path === '/cart'
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              color: active ? 'var(--green-500)' : 'var(--neutral-400)',
              transition: 'color 0.15s ease',
              position: 'relative',
            }}
          >
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: 32,
                height: 2,
                background: 'var(--green-500)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ position: 'relative' }}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
              {isCart && itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6, right: -6,
                  width: 16, height: 16,
                  background: 'var(--red-500)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--neutral-0)',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              lineHeight: 1,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
