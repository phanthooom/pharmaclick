import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase, Product, Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
      setCategories((cats as Category[]) ?? [])

      if (slug) {
        const cat = (cats as Category[])?.find(c => c.slug === slug) ?? null
        setCurrentCategory(cat)
        if (cat) {
          const { data: prods } = await supabase
            .from('products')
            .select('*, category:categories(name), brand:brands(name)')
            .eq('category_id', cat.id)
          setProducts((prods as Product[]) ?? [])
        }
      } else {
        setCurrentCategory(null)
        const { data: prods } = await supabase
          .from('products')
          .select('*, category:categories(name), brand:brands(name)')
          .limit(24)
        setProducts((prods as Product[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <CatalogSkeleton />

  if (!slug) {
    return (
      <div style={{ padding: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/catalog/${cat.slug}`)}
              style={{
                background: 'var(--neutral-0)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'left',
                transition: 'transform 0.15s ease',
                width: '100%',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: 'var(--neutral-800)', 
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word'
                }}>
                  {cat.name}
                </div>
              </div>
              <div style={{ flexShrink: 0, display: 'flex' }}>
                <ChevronRight size={16} color="var(--neutral-400)" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Category header */}
      {currentCategory && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--neutral-0)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 16,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ fontSize: 32 }}>{currentCategory.icon}</span>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--neutral-900)' }}>
              {currentCategory.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--neutral-400)', marginTop: 2 }}>
              {products.length} товаров
            </p>
          </div>
        </div>
      )}

      {/* Category filter pills */}
      <div style={{
        display: 'flex', gap: 8,
        overflowX: 'auto',
        marginBottom: 16,
        paddingBottom: 2,
      }} className="hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/catalog/${cat.slug}`)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 500,
              background: cat.slug === slug ? 'var(--green-500)' : 'var(--neutral-0)',
              color: cat.slug === slug ? '#fff' : 'var(--neutral-600)',
              boxShadow: 'var(--shadow-sm)',
              border: cat.slug === slug ? 'none' : '1px solid var(--neutral-200)',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 20px', gap: 12, textAlign: 'center',
    }}>
      <span style={{ fontSize: 48 }}>📦</span>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-700)' }}>
        Товары не найдены
      </p>
      <p style={{ fontSize: 14, color: 'var(--neutral-400)' }}>
        В этой категории пока нет товаров
      </p>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          height: 240,
          background: 'var(--neutral-100)',
          borderRadius: 'var(--radius-lg)',
          animation: 'pulse 1.5s ease infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
