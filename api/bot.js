// /api/bot.js

import TelegramBot from 'node-telegram-bot-api';

let bot;

if (!bot) {
  const token = process.env.TELEGRAM_TOKEN;
  const webhookUrl = `https://${process.env.VERCEL_URL}/api/bot`;

  bot = new TelegramBot(token, { webHook: true });
  bot.setWebHook(webhookUrl);
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
    parse_mode: 'Markdown',
  });
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body);
    res.status(200).end();
  } else {
    res.status(200).send("🤖 Telegram bot webhook is active!");
  }
}
