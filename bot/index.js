require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { handleStart, handleHelp, handleMusic } = require('./handlers');
const { setupWebApp } = require('./webapp');

// Initialize bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Initialize Express server for Mini App
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('miniapp'));

// Setup Web App routes
setupWebApp(app);

// Bot command handlers
bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/music/, (msg) => handleMusic(bot, msg));

// Handle callback queries from inline keyboards
bot.on('callback_query', (query) => {
  const { data, message } = query;
  
  switch(data) {
    case 'open_app':
      bot.answerCallbackQuery(query.id, {
        text: 'Opening Mini App...',
        show_alert: false
      });
      break;
    case 'settings':
      bot.sendMessage(message.chat.id, '⚙️ Settings menu coming soon!');
      break;
    default:
      bot.answerCallbackQuery(query.id);
  }
});

// Handle Web App data
bot.on('web_app_data', (msg) => {
  const { web_app_data, chat } = msg;
  const data = JSON.parse(web_app_data.data);
  
  bot.sendMessage(chat.id, `Received data from Mini App: ${JSON.stringify(data)}`);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Bot @${process.env.TELEGRAM_BOT_USERNAME} is running...`);
});

module.exports = { bot, app };
