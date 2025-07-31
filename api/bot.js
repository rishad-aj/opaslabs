import TelegramBot from 'node-telegram-bot-api';

// Ensure global.bot is not re-created on every request (important for Vercel)
if (!global.bot) {
  const token = process.env.TELEGRAM_TOKEN;
  const webhookUrl = `https://${process.env.VERCEL_URL}/api/bot`;

  const bot = new TelegramBot(token, { webHook: true });

  // Set Telegram webhook to point to the Vercel endpoint
  bot.setWebHook(webhookUrl);

  // Handle the /start command
  bot.onText(/\/start(?:=start)?/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Your Chat ID is: \`${chatId}\``, {
      parse_mode: 'Markdown',
    });
  });

  global.bot = bot;
}

// Vercel API handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Pass update from Telegram to the bot
    global.bot.processUpdate(req.body);
    res.status(200).end();
  } else {
    // Optional: show that the webhook is live
    res.status(200).send('🤖 Telegram bot webhook is active!');
  }
}
