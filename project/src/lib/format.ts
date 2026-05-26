export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' сум'
}

export function discountPercent(original: number, discounted: number): number {
  return Math.round((1 - discounted / original) * 100)
}
