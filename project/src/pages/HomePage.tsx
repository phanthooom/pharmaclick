import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, Shield, Clock } from 'lucide-react'
import { supabase, Product, Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import CategoryIcon from '../components/CategoryIcon'

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: feat }, { data: newP }, { data: cats }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(name), brand:brands(name)')
          .eq('is_featured', true)
          .limit(6),
        supabase
          .from('products')
          .select('*, category:categories(name), brand:brands(name)')
          .eq('is_new', true)
          .limit(6),
        supabase.from('categories').select('*').order('sort_order'),
      ])
      setFeatured((feat as Product[]) ?? [])
      setNewProducts((newP as Product[]) ?? [])
      setCategories((cats as Category[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Hero Banner */}
      <div style={{
        margin: '16px 16px 0',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, #00875A 0%, #00b377 50%, #14b8a6 100%)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -10,
          width: 140, height: 140,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 30,
          width: 100, height: 100,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            marginBottom: 10,
          }}>
            <Zap size={12} color="#fff" fill="#fff" />
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Быстрая доставка</span>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}>
            Аптека<br />в вашем кармане
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 16, lineHeight: 1.5 }}>
            Более 1000 препаратов<br />с доставкой за 30 минут
          </p>
          <button
            onClick={() => navigate('/catalog')}
            style={{
              background: '#fff',
              color: 'var(--green-600)',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            Смотреть каталог
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '16px 16px 0',
        overflowX: 'auto',
      }}
        className="hide-scrollbar"
      >
        {[
          { icon: <Shield size={16} color="var(--green-500)" />, text: 'Оригиналы', sub: 'Только сертифицированные' },
          { icon: <Clock size={16} color="var(--green-500)" />, text: '30 минут', sub: 'Быстрая доставка' },
          { icon: <span style={{ fontSize: 16 }}>🏥</span>, text: 'Лицензия', sub: 'Фармацевтическая' },
        ].map((b, i) => (
          <div key={i} style={{
            flexShrink: 0,
            background: 'var(--neutral-0)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: 'var(--shadow-sm)',
            minWidth: 160,
          }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--green-50)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {b.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-800)' }}>{b.text}</div>
              <div style={{ fontSize: 11, color: 'var(--neutral-400)' }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <Section
        title="Категории"
        onMore={() => navigate('/catalog')}
      >
        <div style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          padding: '4px 16px',
        }}
          className="hide-scrollbar"
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/catalog/${cat.slug}`)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '12px 16px',
                background: 'var(--neutral-0)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                minWidth: 76,
              }}
            >
              <div style={{ color: 'var(--green-500)' }}>
                <CategoryIcon slug={cat.slug} name={cat.name} size={28} />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--neutral-800)',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.2px',
              }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Featured */}
      {featured.length > 0 && (
        <Section title="Рекомендуем" onMore={() => navigate('/catalog')}>
          <ProductGrid products={featured} />
        </Section>
      )}

      {/* New */}
      {newProducts.length > 0 && (
        <Section title="Новинки" onMore={() => navigate('/catalog')}>
          <ProductGrid products={newProducts} />
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  onMore,
  children,
}: {
  title: string
  onMore?: () => void
  children: React.ReactNode
}) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', marginBottom: 12,
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--neutral-900)', letterSpacing: '-0.2px' }}>
          {title}
        </h2>
        {onMore && (
          <button
            onClick={onMore}
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              color: 'var(--green-600)', fontSize: 13, fontWeight: 500,
              background: 'none',
            }}
          >
            Все <ChevronRight size={14} />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      padding: '0 16px',
    }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} compact />
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{
        height: 180,
        background: 'linear-gradient(135deg, var(--green-200), var(--green-100))',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 16,
        animation: 'pulse 1.5s ease infinite',
      }} />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: 220,
            background: 'var(--neutral-100)',
            borderRadius: 'var(--radius-lg)',
            animation: 'pulse 1.5s ease infinite',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
