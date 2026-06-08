import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const FAVORITES_KEY = 'shoshiypharm_favorites'

type FavoritesContextValue = {
  favorites: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
