// api/bot.js

import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { webHook: false });

// Set this only once after deployment
bot.setWebHook(`https://${process.env.VERCEL_URL}/api/bot`);

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
    res.status(200).send("Hello, this is the Telegram Bot Webhook!");
  }
}
