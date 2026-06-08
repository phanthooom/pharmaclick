import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  parent_id: string | null
  sort_order: number | null
  created_at: string
}

export type Brand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  category_id: string | null
  brand_id: string | null
  stock: number | null
  unit: string | null
  is_featured: boolean | null
  is_new: boolean | null
  rating: number | null
  reviews_count: number | null
  created_at: string
  category_name?: string
  brand_name?: string
}

export type CartItem = {
  id: string
  session_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export type Order = {
  id: string
  session_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_lat?: number
  customer_lon?: number
  courier_lat?: number
  courier_lon?: number
  total_amount: number
  status: string
  created_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: Product
}
