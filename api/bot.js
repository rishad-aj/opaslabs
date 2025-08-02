import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { webHook: true });

const url = 'https://opaslabs.vercel.app'; // Your Vercel project URL
bot.setWebHook(`${url}/api/bot`);

bot.onText(/^\/start(?:=start)?$/, async (msg) => {
  const chatId = msg.chat.id;

  const message = `🆔 Your Chat ID: \`${chatId}\`\n\n_You can copy and use this chat ID._`;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body);
    res.status(200).send('ok');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
