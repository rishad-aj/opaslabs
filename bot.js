// Import necessary modules
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Ensure you load environment variables

// Get the bot token from the environment variable
const token = process.env.TELEGRAM_TOKEN;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id; // Get the chat ID

    // Send the chat ID back to the user in a copiable format
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown to format the chat ID as code
    });
});

// Optional: Handle /start=start command
bot.onText(/\/start=start/, (msg) => {
    const chatId = msg.chat.id; // Get the chat ID

    // Send the chat ID back to the user in a copiable format
    bot.sendMessage(chatId, `Your chat ID is: \`${chatId}\``, {
        parse_mode: 'Markdown' // Use Markdown to format the chat ID as code
    });
});
