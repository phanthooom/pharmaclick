import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { supabase, Product } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(name), brand:brands(name)')
        .ilike('name', `%${query}%`)
        .limit(20)
      setResults((data as Product[]) ?? [])
      setSearched(true)
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div>
      {/* Search Input */}
      <div style={{ padding: '12px 16px', background: 'var(--neutral-0)', borderBottom: '1px solid var(--neutral-100)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--neutral-50)',
          border: '1.5px solid var(--neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 14px',
          height: 48,
        }}>
          <Search size={18} color="var(--neutral-400)" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Поиск лекарств, витаминов..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              fontSize: 15,
              color: 'var(--neutral-800)',
              background: 'none',
              border: 'none',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--neutral-400)', background: 'none' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '16px 16px 0' }}>
        {loading && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
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
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 20px', gap: 12, textAlign: 'center',
          }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-700)' }}>
              Ничего не найдено
            </p>
            <p style={{ fontSize: 14, color: 'var(--neutral-400)' }}>
              Попробуйте другой запрос
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginBottom: 12 }}>
              Найдено: {results.length} товаров
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}>
              {results.map(p => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </>
        )}

        {!query && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 20px', gap: 16, textAlign: 'center',
          }}>
            <div style={{
              width: 72, height: 72,
              background: 'var(--green-50)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
            }}>
              💊
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 6 }}>
                Начните поиск
              </p>
              <p style={{ fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.5 }}>
                Введите название препарата,<br />витамина или бренда
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
