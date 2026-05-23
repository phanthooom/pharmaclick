import { Pill, Leaf, Thermometer, Baby, Stethoscope, Package, Heart, Sparkles, Activity } from 'lucide-react'

interface CategoryIconProps {
  slug: string
  name?: string
  size?: number
  color?: string
  className?: string
}

export default function CategoryIcon({ slug, name = '', size = 24, color = 'currentColor', className }: CategoryIconProps) {
  const n = name.toLowerCase()
  const s = slug.toLowerCase()

  if (s.includes('pain') || n.includes('обезбол')) return <Pill size={size} color={color} className={className} />
  if (s.includes('vitamin') || n.includes('витамин')) return <Leaf size={size} color={color} className={className} />
  if (s.includes('cold') || n.includes('простуд')) return <Thermometer size={size} color={color} className={className} />
  if (s.includes('kid') || s.includes('baby') || n.includes('детям') || n.includes('детск')) return <Baby size={size} color={color} className={className} />
  if (s.includes('device') || s.includes('med') || n.includes('техника') || n.includes('аппарат')) return <Stethoscope size={size} color={color} className={className} />
  if (s.includes('beauty') || n.includes('красот') || n.includes('космет')) return <Sparkles size={size} color={color} className={className} />
  if (s.includes('drug') || s.includes('medicin') || n.includes('лекарств') || n.includes('препарат')) return <Pill size={size} color={color} className={className} />
  if (s.includes('diag') || n.includes('диагност')) return <Activity size={size} color={color} className={className} />
  if (n.includes('здоров')) return <Heart size={size} color={color} className={className} />

  // Fallback icon for unknown categories
  return <Package size={size} color={color} className={className} />
}
