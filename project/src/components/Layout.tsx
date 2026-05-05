import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function Layout() {
  const location = useLocation()
  const isSuccess = location.pathname === '/order-success'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {!isSuccess && <Header />}
      <main style={{
        flex: 1,
        paddingTop: isSuccess ? 0 : 'calc(var(--header-height) + var(--tg-header-pad))',
        paddingBottom: isSuccess ? 0 : 'calc(var(--nav-height) + max(var(--tg-safe-bottom), env(safe-area-inset-bottom)))',
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>
      {!isSuccess && <BottomNav />}
    </div>
  )
}
