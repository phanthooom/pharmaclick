import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Minus, Plus, Package, ShoppingCart } from 'lucide-react'
import { supabase, Product } from '../lib/supabase'
import { formatPrice, discountPercent } from '../lib/format'
import { useCart } from '../context/CartContext'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem, updateQuantity, getQuantity } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(name), brand:brands(name)')
        .eq('slug', slug!)
        .maybeSingle()
      setProduct(data as Product)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <ProductSkeleton />
  if (!product) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
      <p style={{ fontSize: 16, color: 'var(--neutral-500)' }}>Товар не найден</p>
    </div>
  )

  const qty = getQuantity(product.id)
  const price = product.discount_price ?? product.price
  const hasDiscount = !!product.discount_price
  const inStock = (product.stock ?? 0) > 0

  const handleAdd = async () => {
    setAdding(true)
    await addItem(product.id)
    setAdding(false)
  }

  return (
    <div>
      {/* Product Image */}
      <div style={{
        position: 'relative',
        background: 'var(--neutral-50)',
        paddingTop: '70%',
        overflow: 'hidden',
      }}>
        <img
          src={product.image_url || 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=600'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {hasDiscount && (
            <span style={{
              background: 'var(--red-500)', color: '#fff',
              fontSize: 12, fontWeight: 700,
              padding: '3px 8px', borderRadius: 'var(--radius-full)',
            }}>
              -{discountPercent(product.price, product.discount_price!)}%
            </span>
          )}
          {product.is_new && (
            <span style={{
              background: 'var(--green-500)', color: '#fff',
              fontSize: 12, fontWeight: 700,
              padding: '3px 8px', borderRadius: 'var(--radius-full)',
            }}>
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px', background: 'var(--neutral-0)', marginBottom: 8 }}>
        {product.brand_name && (
          <span style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 600,
            color: 'var(--green-600)',
            background: 'var(--green-50)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            marginBottom: 8,
          }}>
            {product.brand_name}
          </span>
        )}

        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--neutral-900)',
          lineHeight: 1.3,
          letterSpacing: '-0.3px',
          marginBottom: 12,
        }}>
          {product.name}
        </h1>

        {/* Rating */}
        {product.rating && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(star => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(Number(product.rating)) ? 'var(--amber-400)' : 'var(--neutral-200)'}
                  color={star <= Math.round(Number(product.rating)) ? 'var(--amber-400)' : 'var(--neutral-200)'}
                />
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)' }}>
              {Number(product.rating).toFixed(1)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--neutral-400)' }}>
              {product.reviews_count} отзывов
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 26,
            fontWeight: 800,
            color: hasDiscount ? 'var(--red-600)' : 'var(--neutral-900)',
            letterSpacing: '-0.5px',
          }}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span style={{
              fontSize: 16,
              color: 'var(--neutral-400)',
              textDecoration: 'line-through',
            }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px',
          background: inStock ? 'var(--green-50)' : '#fef2f2',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
        }}>
          <Package size={14} color={inStock ? 'var(--green-600)' : 'var(--red-500)'} />
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: inStock ? 'var(--green-700)' : 'var(--red-600)',
          }}>
            {inStock ? `В наличии: ${product.stock} ${product.unit}` : 'Нет в наличии'}
          </span>
        </div>

        {/* Cart controls */}
        {inStock && (
          qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={adding}
              style={{
                width: '100%',
                height: 52,
                background: 'linear-gradient(135deg, var(--green-500), var(--teal-500))',
                color: '#fff',
                borderRadius: 'var(--radius-lg)',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
                opacity: adding ? 0.7 : 1,
              }}
            >
              <ShoppingCart size={20} />
              Добавить в корзину
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--green-50)',
                borderRadius: 'var(--radius-lg)',
                padding: 6,
                height: 52,
              }}>
                <button
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  style={{
                    width: 40, height: 40,
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--green-600)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 18,
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--green-700)' }}>{qty}</span>
                <button
                  onClick={() => updateQuantity(product.id, qty + 1)}
                  style={{
                    width: 40, height: 40,
                    background: 'var(--green-500)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  height: 52,
                  padding: '0 20px',
                  background: 'var(--green-500)',
                  color: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <ShoppingCart size={16} />
                Корзина
              </button>
            </div>
          )
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div style={{
          padding: '20px 16px',
          background: 'var(--neutral-0)',
          marginBottom: 8,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 10 }}>
            Описание
          </h3>
          <p style={{
            fontSize: 14,
            color: 'var(--neutral-600)',
            lineHeight: 1.6,
          }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Meta */}
      <div style={{
        padding: '16px',
        background: 'var(--neutral-0)',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>
          Характеристики
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['Категория', product.category_name],
            ['Бренд', product.brand_name],
            ['Единица', product.unit],
          ].filter(([_, v]) => v).map(([label, value]) => (
            <div key={label as string} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--neutral-100)',
            }}>
              <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div>
      <div style={{ height: '55vw', background: 'var(--neutral-100)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ padding: 16, background: 'var(--neutral-0)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[80, 200, 60, 100, 48].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--neutral-100)', borderRadius: 8, animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
