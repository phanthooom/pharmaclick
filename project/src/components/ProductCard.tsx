import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Star, Heart } from 'lucide-react'
import { Product } from '../lib/supabase'
import { formatPrice, discountPercent } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { haptic } from '../lib/haptic'

type Props = {
  product: Product
  compact?: boolean
}

export default function ProductCard({ product, compact = false }: Props) {
  const navigate = useNavigate()
  const { addItem, removeItem, updateQuantity, getQuantity } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const qty = getQuantity(product.id)
  const fav = isFavorite(product.id)
  const price = product.discount_price ?? product.price
  const hasDiscount = !!product.discount_price

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('medium')
    await addItem(product)
  }

  const handleDecrease = async (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('light')
    await updateQuantity(product.id, qty - 1)
  }

  const handleIncrease = async (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('light')
    await updateQuantity(product.id, qty + 1)
  }

  return (
    <div
      onClick={() => { haptic('light'); navigate(`/product/${product.slug}`) }}
      style={{
        background: 'var(--neutral-0)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
      }}
      onMouseDown={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(0.98)'
      }}
      onMouseUp={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
      }}
    >
      {/* Favorite button */}
      <button
        onClick={e => { e.stopPropagation(); haptic('light'); toggleFavorite(product.id) }}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Heart size={15} color={fav ? '#ef4444' : 'var(--neutral-400)'} fill={fav ? '#ef4444' : 'none'} />
      </button>

      {/* Badges */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {hasDiscount && (
          <span style={{
            background: 'var(--red-500)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 'var(--radius-full)',
          }}>
            -{discountPercent(product.price, product.discount_price!)}%
          </span>
        )}
        {product.is_new && (
          <span style={{
            background: 'var(--green-500)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 'var(--radius-full)',
          }}>
            NEW
          </span>
        )}
      </div>

      {/* Image */}
      <div style={{
        width: '100%',
        paddingTop: compact ? '75%' : '80%',
        position: 'relative',
        background: 'var(--neutral-50)',
      }}>
        <img
          src={product.image_url || 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div style={{ padding: compact ? '10px 10px 12px' : '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {product.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={11} fill="var(--amber-400)" color="var(--amber-400)" />
            <span style={{ fontSize: 12, color: 'var(--neutral-500)', fontWeight: 500 }}>
              {Number(product.rating).toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--neutral-400)' }}>
              ({product.reviews_count})
            </span>
          </div>
        )}

        <p style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 500,
          color: 'var(--neutral-800)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: compact ? 14 : 15, fontWeight: 700, color: hasDiscount ? 'var(--red-600)' : 'var(--neutral-900)' }}>
              {formatPrice(price)}
            </div>
            {hasDiscount && (
              <div style={{ fontSize: 11, color: 'var(--neutral-400)', textDecoration: 'line-through' }}>
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                width: '100%',
                height: 36,
                background: 'var(--green-500)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'background 0.15s ease',
              }}
            >
              <Plus size={14} />
              В корзину
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--green-50)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                height: 36,
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleDecrease}
                style={{
                  width: 28, height: 28,
                  background: 'var(--neutral-0)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green-600)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontWeight: 700, color: 'var(--green-700)', fontSize: 14 }}>{qty}</span>
              <button
                onClick={handleIncrease}
                style={{
                  width: 28, height: 28,
                  background: 'var(--green-500)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
