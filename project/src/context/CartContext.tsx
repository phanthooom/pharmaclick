import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase, CartItem, Product } from '../lib/supabase'
import { getSessionId } from '../lib/session'

type CartContextValue = {
  items: (CartItem & { product: Product })[]
  itemCount: number
  totalAmount: number
  loading: boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const sessionId = getSessionId()

  const fetchCart = useCallback(async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('session_id', sessionId)
    setItems((data as (CartItem & { product: Product })[]) ?? [])
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (product: Product) => {
    const existing = items.find(i => i.product_id === product.id)
    if (existing) {
      await updateQuantity(product.id, existing.quantity + 1)
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        product_id: product.id,
        quantity: 1,
        created_at: new Date().toISOString(),
        product: product
      }
      setItems(prev => [...prev, newItem])
      
      supabase.from('cart_items').insert({
        session_id: sessionId,
        product_id: product.id,
        quantity: 1,
      }).then(() => fetchCart())
    }
  }

  const removeItem = async (productId: string) => {
    setItems(prev => prev.filter(i => i.product_id !== productId))
    supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .then(() => fetchCart())
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity } : i))
    supabase
      .from('cart_items')
      .update({ quantity })
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .then(() => fetchCart())
  }

  const clearCart = async () => {
    setItems([])
    await supabase.from('cart_items').delete().eq('session_id', sessionId)
  }

  const getQuantity = (productId: string) =>
    items.find(i => i.product_id === productId)?.quantity ?? 0

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const totalAmount = items.reduce((acc, i) => {
    const price = i.product.discount_price ?? i.product.price
    return acc + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, totalAmount, loading, addItem, removeItem, updateQuantity, clearCart, getQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
