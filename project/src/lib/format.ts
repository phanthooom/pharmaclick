export function formatPrice(tiyin: number): string {
  const som = tiyin / 100
  return new Intl.NumberFormat('ru-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(som) + ' сум'
}

export function discountPercent(original: number, discounted: number): number {
  return Math.round((1 - discounted / original) * 100)
}
