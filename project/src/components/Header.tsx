import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

const PAGE_TITLES: Record<string, string> = {
  '/': 'PharmaClick',
  '/catalog': 'Каталог',
  '/cart': 'Корзина',
  '/orders': 'Заказы',
  '/profile': 'Профиль',
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()

  const isHome = location.pathname === '/'
  const isProduct = location.pathname.startsWith('/product/')
  const isCatalogChild = location.pathname.startsWith('/catalog/')

  const title = isProduct
    ? 'Товар'
    : isCatalogChild
    ? 'Категория'
    : PAGE_TITLES[location.pathname] ?? 'PharmaClick'

  const showBack = isProduct || isCatalogChild || location.pathname === '/cart' || location.pathname === '/orders' || location.pathname === '/profile'

  const showSearch = location.pathname === '/' || location.pathname === '/catalog' || location.pathname.startsWith('/catalog/')

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'calc(var(--header-height) + var(--tg-header-pad))',
      background: 'var(--neutral-0)',
      borderBottom: '1px solid var(--neutral-100)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      paddingTop: 'var(--tg-header-pad)',
      zIndex: 100,
      gap: 8,
    }}>
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'var(--neutral-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neutral-700)',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/logo.jpg"
            alt="PharmaClick"
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
        </div>
      )}

      {showSearch ? (
        <button
          onClick={() => navigate('/catalog')}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 8,
            height: 38,
            background: 'var(--neutral-100)',
            borderRadius: 'var(--radius-full)',
            padding: '0 14px',
            color: 'var(--neutral-400)',
            fontSize: 14,
            textAlign: 'left',
            border: 'none',
          }}
        >
          <Search size={16} />
          <span>Поиск...</span>
        </button>
      ) : (
        <span style={{
          flex: 1,
          fontSize: isHome ? 18 : 17,
          fontWeight: 600,
          color: 'var(--neutral-900)',
          letterSpacing: isHome ? '-0.3px' : '-0.2px',
        }}>
          {title}
          {isHome && (
            <span style={{
              color: 'var(--green-500)',
              fontWeight: 700,
            }}>.</span>
          )}
        </span>
      )}

      {location.pathname !== '/cart' && (
        <button
          onClick={() => navigate('/cart')}
          style={{
            position: 'relative',
            width: 38, height: 38,
            borderRadius: 'var(--radius-full)',
            background: itemCount > 0 ? 'var(--green-50)' : 'var(--neutral-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: itemCount > 0 ? 'var(--green-600)' : 'var(--neutral-500)',
            transition: 'all 0.2s ease',
          }}
        >
          <ShoppingCart size={18} />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -2, right: -2,
              width: 18, height: 18,
              background: 'var(--green-500)',
              color: '#fff',
              borderRadius: '50%',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--neutral-0)',
            }}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>
      )}
    </header>
  )
}
