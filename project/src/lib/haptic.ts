// Haptic feedback helper — uses Telegram WebApp API
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style)
  } catch (_) {}
}

export function hapticNotification(type: 'success' | 'warning' | 'error') {
  try {
    (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(type)
  } catch (_) {}
}
