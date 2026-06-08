export default async function handler(req: any, res: any) {
  // Проверка метода
  if (req.method !== 'POST') {
    return res.status(200).send('Shoshiypharm Bot is running.')
  }

  const message = req.body?.message

  // Если нет текста (например, системное уведомление), просто отвечаем OK
  if (!message || !message.text) {
    return res.status(200).send('OK')
  }

  const chatId = message.chat.id
  const text = message.text
  const firstName = message.from.first_name || 'друг'

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const WEB_APP_URL = process.env.VITE_PUBLIC_URL || 'https://shoshiypharm.vercel.app' // Или подставьте сюда вашу ссылку Vercel

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set in environment variables')
    return res.status(500).send('Bot token not set')
  }

  if (text.startsWith('/start')) {
    const welcomeText = `Здравствуйте, ${firstName}! Добро пожаловать в **Shoshiypharm** 💊\n\nЗдесь вы можете заказать медикаменты с быстрой доставкой на дом. \n\nНажмите кнопку ниже, чтобы открыть наш удобный каталог.`
    
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '💊 Открыть аптеку',
                  web_app: { url: WEB_APP_URL }
                }
              ]
            ]
          }
        })
      })
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  return res.status(200).send('OK')
}
