export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { order, items } = req.body

  if (!order || !items) {
    return res.status(400).json({ error: 'Bad Request: Missing order or items' })
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  // Используем ваш переданный ID как запасной вариант (fallback),
  // но лучше потом добавить ADMIN_CHAT_ID в Vercel Environment Variables.
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '638384527'

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'Bot token not configured' })
  }

  try {
    let itemsText = ''
    items.forEach((item: any, index: number) => {
      const price = item.product?.discount_price ?? item.product?.price ?? item.price ?? 0
      itemsText += `${index + 1}. ${item.product?.name || 'Товар'} (x${item.quantity}) - ${price.toLocaleString('ru-RU')} сум\n`
    })

    const text = `🚨 *НОВЫЙ ЗАКАЗ!* 🚨

👤 *Покупатель:* ${order.customer_name || 'Не указано'}
📞 *Телефон:* \`${order.customer_phone || 'Не указан'}\`
📍 *Адрес:* ${order.customer_address || 'Не указан'}
🌐 *Локация на карте:* [Google Maps](https://maps.google.com/?q=${order.customer_lat},${order.customer_lon})

🛒 *Товары:*
${itemsText}
💰 *Итого к оплате:* *${(order.total_amount || 0).toLocaleString('ru-RU')} сум*`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Telegram API error:', errorData)
      return res.status(500).json({ error: 'Failed to send telegram message' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error sending notification:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
