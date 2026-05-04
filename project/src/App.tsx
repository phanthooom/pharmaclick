import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import OrderSuccessPage from './pages/OrderSuccessPage'

function setCss(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

function applyTgInsets(tg: any) {
  const safe = tg.safeAreaInset ?? {}
  const content = tg.contentSafeAreaInset ?? {}
  const cTop = Math.max(Number(content.top ?? 0), Number(safe.top ?? 0))
  const cBottom = Math.max(Number(content.bottom ?? 0), Number(safe.bottom ?? 0))
  // Mirror croissant: always at least 72px inside Telegram for the floating close bar.
  setCss('--tg-header-pad', `${Math.max(cTop, 72)}px`)
  setCss('--tg-safe-bottom', `${cBottom}px`)
}

export default function App() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return
    applyTgInsets(tg)
    const handler = () => applyTgInsets(tg)
    tg.onEvent?.('safeAreaChanged', handler)
    tg.onEvent?.('fullscreenChanged', handler)
    tg.onEvent?.('contentSafeAreaChanged', handler)
    return () => {
      tg.offEvent?.('safeAreaChanged', handler)
      tg.offEvent?.('fullscreenChanged', handler)
      tg.offEvent?.('contentSafeAreaChanged', handler)
    }
  }, [])

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:slug" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
