require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const { supabase } = require('./services/supabaseClient');
const { createOrUpdateUser } = require('./services/userService');

// Initialize bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Initialize Express server for Mini App
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('miniapp'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count');
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Database connection working',
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Bot command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    // Create or update user in database
    const result = await createOrUpdateUser({
      telegram_id: user.id,
      username: user.username || null,
      first_name: user.first_name || null
    });
    
    if (!result.success) {
      bot.sendMessage(chatId, result.error);
      return;
    }
    
    const welcomeMessage = result.isNew
      ? `👋 Добро пожаловать в MusicVerse Pro, ${user.first_name}!\n\n` +
        `Я помогу вам управлять музыкальными плейлистами и избранным.\n\n` +
        `Используйте /help для списка команд.`
      : `С возвращением, ${user.first_name}! 🎵\n\n` +
        `Используйте /help для списка команд.`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '📋 Мои плейлисты', callback_data: 'my_playlists' }],
        [{ text: '⭐ Избранное', callback_data: 'my_favorites' }]
      ]
    };
    
    bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard });
  } catch (error) {
    console.error('Error in /start:', error);
    bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже');
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = 
    `📖 *Доступные команды:*\n\n` +
    `/start - Начать работу с ботом\n` +
    `/help - Показать это сообщение\n` +
    `/playlists - Показать мои плейлисты\n` +
    `/favorites - Показать избранное\n\n` +
    `🎵 Mini App будет доступен после деплоя на HTTPS`;
  
  bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown'
  });
});

bot.onText(/\/playlists/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    const { getUserByTelegramId } = require('./services/userService');
    const { getUserPlaylists } = require('./services/playlistService');
    
    const userResult = await getUserByTelegramId(user.id);
    if (!userResult.success) {
      bot.sendMessage(chatId, 'Сначала отправьте /start');
      return;
    }
    
    const result = await getUserPlaylists(userResult.user.id);
    
    if (!result.success) {
      bot.sendMessage(chatId, result.error);
      return;
    }
    
    if (result.playlists.length === 0) {
      bot.sendMessage(chatId, '📋 У вас пока нет плейлистов.\n\nИспользуйте /createplaylist чтобы создать первый!');
      return;
    }
    
    let message = `📋 *Ваши плейлисты (${result.playlists.length}):*\n\n`;
    result.playlists.forEach((playlist, index) => {
      message += `${index + 1}. ${playlist.name}\n`;
      if (playlist.description) {
        message += `   _${playlist.description}_\n`;
      }
    });
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /playlists:', error);
    bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже');
  }
});

bot.onText(/\/favorites/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    const { getUserByTelegramId } = require('./services/userService');
    const { getUserFavorites } = require('./services/favoritesService');
    
    const userResult = await getUserByTelegramId(user.id);
    if (!userResult.success) {
      bot.sendMessage(chatId, 'Сначала отправьте /start');
      return;
    }
    
    const result = await getUserFavorites(userResult.user.id);
    
    if (!result.success) {
      bot.sendMessage(chatId, result.error);
      return;
    }
    
    if (result.favorites.length === 0) {
      bot.sendMessage(chatId, '⭐ У вас пока нет избранных треков.');
      return;
    }
    
    let message = `⭐ *Избранное (${result.favorites.length}):*\n\n`;
    result.favorites.forEach((fav, index) => {
      const track = fav.track_data;
      message += `${index + 1}. ${track.title} - ${track.artist}\n`;
    });
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /favorites:', error);
    bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже');
  }
});

// Command to create playlist
bot.onText(/\/createplaylist (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  const playlistName = match[1];
  
  try {
    const { getUserByTelegramId } = require('./services/userService');
    const { createPlaylist } = require('./services/playlistService');
    
    const userResult = await getUserByTelegramId(user.id);
    if (!userResult.success) {
      bot.sendMessage(chatId, 'Сначала отправьте /start');
      return;
    }
    
    const result = await createPlaylist(userResult.user.id, playlistName);
    
    if (!result.success) {
      bot.sendMessage(chatId, result.error);
      return;
    }
    
    bot.sendMessage(chatId, `✅ Плейлист "${result.playlist.name}" создан!`);
  } catch (error) {
    console.error('Error in /createplaylist:', error);
    bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже');
  }
});

// Handle callback queries from inline keyboards
bot.on('callback_query', async (query) => {
  const { data, message } = query;
  const chatId = message.chat.id;
  
  await bot.answerCallbackQuery(query.id);
  
  switch(data) {
    case 'my_playlists':
      bot.sendMessage(chatId, '📋 Функция плейлистов будет добавлена в Task 2.2...');
      break;
    case 'my_favorites':
      bot.sendMessage(chatId, '⭐ Функция избранного будет добавлена в Task 2.3...');
      break;
    default:
      break;
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
