export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { chatId, status, orderId } = req.body
  if (!chatId || !status || !orderId) return res.status(400).json({ error: 'Missing fields' })

  const MESSAGES: Record<string, string> = {
    confirmed: '✅ Ваш заказ <b>#{id}</b> подтверждён! Уже готовим к отправке.',
    shipping:  '🚴 Курьер едет к вам! Заказ <b>#{id}</b> в пути.',
    delivered: '🎉 Заказ <b>#{id}</b> доставлен! Спасибо за покупку в Shoshiypharm.',
    cancelled: '❌ Заказ <b>#{id}</b> отменён. Свяжитесь с нами если есть вопросы.',
  }

  const template = MESSAGES[status]
  if (!template) return res.status(200).json({ skipped: true })

  const text = template.replace('{id}', orderId.slice(0, 8).toUpperCase())
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return res.status(500).json({ error: 'Bot token not configured' })

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await r.json() as { ok: boolean; description?: string }
    return res.status(200).json(data.ok ? { ok: true } : { error: data.description })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
