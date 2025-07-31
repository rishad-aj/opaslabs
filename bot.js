const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { webHook: true });

const app = express();
const port = 3000;

// Set Telegram webhook
bot.setWebHook(`https://yourdomain.com/bot`);

app.use(express.json());
app.post('/bot', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, { parse_mode: 'Markdown' });
});

app.listen(port, () => {
  console.log(`Bot is listening on port ${port}`);
});
