const SESSION_KEY = 'shoshiypharm_session'

export function getSessionId(): string {
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser && tgUser.id) {
    return `tg_${tgUser.id}`
  }

  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function getTelegramUser() {
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null
}
