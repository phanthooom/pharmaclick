import { Pill, Leaf, Thermometer, Baby, Stethoscope, Package } from 'lucide-react'

interface CategoryIconProps {
  slug: string
  size?: number
  color?: string
  className?: string
}

export default function CategoryIcon({ slug, size = 24, color = 'currentColor', className }: CategoryIconProps) {
  switch (slug) {
    case 'pain':
      return <Pill size={size} color={color} className={className} />
    case 'vitamins':
      return <Leaf size={size} color={color} className={className} />
    case 'cold':
      return <Thermometer size={size} color={color} className={className} />
    case 'kids':
      return <Baby size={size} color={color} className={className} />
    case 'medical-devices':
      return <Stethoscope size={size} color={color} className={className} />
    default:
      return <Package size={size} color={color} className={className} />
  }
}
