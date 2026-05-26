import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Product } from '../lib/supabase'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites } = useFavorites()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.length === 0) { setLoading(false); return }
    supabase
      .from('products')
      .select('*, category:categories(name), brand:brands(name)')
      .in('id', favorites)
      .then(({ data }) => {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      })
  }, [favorites])

  if (loading) return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 240, background: 'var(--neutral-100)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite' }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )

  if (favorites.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: 'var(--green-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
        🤍
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>Избранное пусто</p>
        <p style={{ fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.5 }}>Нажмите ♡ на товаре,<br />чтобы добавить в избранное</p>
      </div>
      <button
        onClick={() => navigate('/catalog')}
        style={{ padding: '12px 28px', background: 'var(--green-500)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: 15, fontWeight: 600 }}
      >
        Перейти в каталог
      </button>
    </div>
  )

  return (
    <div style={{ padding: 16, paddingBottom: 32 }}>
      <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginBottom: 12 }}>{products.length} товаров</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {products.map(p => <ProductCard key={p.id} product={p} compact />)}
      </div>
    </div>
  )
}
