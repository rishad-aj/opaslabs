// api/bot.js

import { Telegraf } from 'telegraf';

// Initialize bot with token from environment variable
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// /start and /start <payload> handler
bot.command('start', async (ctx) => {
  const chatId = ctx.chat.id;
  const args = ctx.message.text.split(' ').slice(1); // check for deep link payload

  // Optional: handle payload-specific behavior here
  const message = `your chat id : \`${chatId}\`\ntap to copy`;

  await ctx.reply(message, { parse_mode: 'Markdown' });
});

// Vercel API handler — receives Telegram webhook requests
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('ok');
    } catch (error) {
      console.error('Telegram bot error:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
