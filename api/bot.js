// Import required modules
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Telegram bot token from environment variables
const token = process.env.TELEGRAM_TOKEN;

// Create a new instance of the TelegramBot
const bot = new TelegramBot(token);

// Set the webhook URL (replace with your actual Vercel URL)
const webhookUrl = `https://${process.env.VERCEL_URL}/api/bot`;

// Set the webhook for Telegram
bot.setWebHook(webhookUrl);

// Handle incoming requests
export default function handler(req, res) {
    if (req.method === 'POST') {
        bot.processUpdate(req.body); // Process the update sent from Telegram
        res.status(200).end(); // Send a 200 OK response
    } else {
        res.status(200).send("This is your Telegram bot webhook!"); // Response for GET requests
    }
}

// Listen for /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id; // Get chat ID
    // Reply with the chat ID
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown for formatting
    });
});

// Listen for /start=start command
bot.onText(/\/start=start/, (msg) => {
    const chatId = msg.chat.id; // Get chat ID
    // Reply with the chat ID
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown for formatting
    });
});

// Log a message when the bot starts
console.log('Bot is running...');
