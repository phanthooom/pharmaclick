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
        paddingTop: isSuccess ? 0 : 'var(--header-height)',
        paddingBottom: isSuccess ? 0 : 'var(--nav-height)',
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>
      {!isSuccess && <BottomNav />}
    </div>
  )
}
