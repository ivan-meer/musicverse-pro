const { getMusicRecommendations } = require('./services/musicService');

/**
 * Handle /start command
 */
async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `
👋 Welcome to MusicVerse Pro, ${firstName}!

🎵 Your personal music companion with AI-powered recommendations.

Use the buttons below to get started:
  `;
  
  const keyboard = {
    inline_keyboard: [
      [
        { 
          text: '🚀 Open Mini App', 
          web_app: { url: process.env.MINI_APP_URL } 
        }
      ],
      [
        { text: '🎵 Discover Music', callback_data: 'discover' },
        { text: '⚙️ Settings', callback_data: 'settings' }
      ],
      [
        { text: '❓ Help', callback_data: 'help' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
}

/**
 * Handle /help command
 */
async function handleHelp(bot, msg) {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📖 *MusicVerse Pro Help*

*Available Commands:*
/start - Start the bot and open main menu
/help - Show this help message
/music - Get music recommendations
/search [query] - Search for music
/playlists - View your playlists
/favorites - View your favorite tracks

*Mini App Features:*
• Browse and discover new music
• Create and manage playlists
• AI-powered recommendations
• Listen to previews
• Share music with friends

*Need more help?*
Contact support: @support
  `;
  
  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown'
  });
}

/**
 * Handle /music command - Get music recommendations
 */
async function handleMusic(bot, msg) {
  const chatId = msg.chat.id;
  
  try {
    await bot.sendMessage(chatId, '🎵 Getting personalized recommendations...');
    
    // Get recommendations from music service
    const recommendations = await getMusicRecommendations(msg.from.id);
    
    if (recommendations && recommendations.length > 0) {
      let message = '🎵 *Your Personalized Recommendations:*\n\n';
      
      recommendations.slice(0, 5).forEach((track, index) => {
        message += `${index + 1}. *${track.title}* by ${track.artist}\n`;
        message += `   Genre: ${track.genre} | Duration: ${track.duration}\n\n`;
      });
      
      const keyboard = {
        inline_keyboard: [
          [
            { 
              text: '🎧 Open in Mini App', 
              web_app: { url: `${process.env.MINI_APP_URL}/recommendations` } 
            }
          ]
        ]
      };
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else {
      await bot.sendMessage(chatId, 'No recommendations available at the moment. Try again later!');
    }
  } catch (error) {
    console.error('Error getting music recommendations:', error);
    await bot.sendMessage(chatId, '❌ Sorry, there was an error getting recommendations. Please try again later.');
  }
}

module.exports = {
  handleStart,
  handleHelp,
  handleMusic
};
