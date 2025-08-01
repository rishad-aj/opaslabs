// Import the required modules
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the bot with your token from environment variables
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id; // Get the chat ID

    // Reply with the chat ID
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown to format the chat ID as inline code
    });
});

// Listen for the /start=start command
bot.onText(/\/start=start/, (msg) => {
    const chatId = msg.chat.id; // Get the chat ID

    // Reply with the chat ID
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown to format the chat ID as inline code
    });
});

// Log a message when the bot starts
console.log('Bot is running...');
