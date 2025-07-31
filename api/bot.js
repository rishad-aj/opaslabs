import TelegramBot from 'node-telegram-bot-api';

// Load the Telegram token from environment variables
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// Set Webhook URL
const webhookUrl = `https://${process.env.VERCEL_URL}/api/bot`;

// Setting webhook
bot.setWebHook(webhookUrl);

// Listener for /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id; // Get chat ID
  // Sends the chat ID back to the user
  bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
    parse_mode: 'Markdown', // Using Markdown for formatting
  });
});

// Export the handler function for the webhook
export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body); // Process the update from Telegram
    res.status(200).end(); // Send a 200 OK response
  } else {
    res.status(200).send("Hello, this is the Telegram Bot Webhook!"); // GET request response
  }
}
