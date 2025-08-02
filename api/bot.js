import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { webHook: true });

const url = process.env.VERCEL_URL || 'https://your-vercel-project.vercel.app'; // without trailing slash
bot.setWebHook(`${url}/api/bot`);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body);
    res.status(200).send('ok');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
