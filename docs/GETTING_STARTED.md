# Getting Started with MusicVerse Pro

This guide will help you set up and run MusicVerse Pro on your local machine or server.

## Prerequisites

Before you begin, ensure you have:
- Node.js 16 or higher installed
- npm or yarn package manager
- A Telegram account
- (Optional) PostgreSQL and Redis for production use

## Step 1: Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "MusicVerse Pro")
4. Choose a username for your bot (must end in 'bot', e.g., "musicverse_pro_bot")
5. Save the bot token that BotFather gives you

### Configure Bot Commands

Send this to BotFather:
```
/setcommands
```

Then select your bot and paste:
```
start - Start the bot
help - Show help information
music - Get music recommendations
search - Search for music
playlists - View your playlists
favorites - View favorite tracks
settings - Configure bot settings
```

## Step 2: Clone the Repository

```bash
git clone https://github.com/ivan-meer/musicverse-pro.git
cd musicverse-pro
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your configuration:
```env
# Required: Your bot token from BotFather
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# Required: Your Mini App URL (for development, use localhost)
MINI_APP_URL=http://localhost:3000

# Optional: Music API configuration
MUSIC_API_KEY=your_music_api_key
MUSIC_API_SECRET=your_music_api_secret
MUSIC_API_BASE_URL=https://api.music-provider.com

# Optional: Database (not required for basic testing)
DATABASE_URL=postgresql://user:password@localhost:5432/musicverse
REDIS_URL=redis://localhost:6379

# Server configuration
PORT=3000
NODE_ENV=development
```

### Important Notes:
- For local development, you can use `http://localhost:3000` as MINI_APP_URL
- Music API keys are optional for initial testing (the app will use dummy data)
- Database is optional for basic functionality

## Step 5: Start the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

You should see:
```
Server running on port 3000
Bot @your_bot_username is running...
```

## Step 6: Test Your Bot

1. Open Telegram
2. Search for your bot by username
3. Send `/start` command
4. You should see the welcome message with buttons

### Available Commands:
- `/start` - Show welcome menu
- `/help` - Display help information
- `/music` - Get music recommendations

## Step 7: Set Up the Mini App (Optional for Testing)

For local testing without HTTPS, the Mini App button won't work. To test the Mini App locally:

### Option 1: Use ngrok for HTTPS tunnel
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm start

# In another terminal, create HTTPS tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update MINI_APP_URL in .env
# Restart your app
```

### Option 2: Test without Mini App
You can test all bot functionality without the Mini App:
- Use bot commands: `/music`, `/search`, etc.
- The bot works fully without the web interface

### Option 3: Deploy to get HTTPS
See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options that provide HTTPS.

## Step 8: Configure Mini App in BotFather (When HTTPS is Available)

Once you have an HTTPS URL (from deployment or ngrok):

1. Send `/newapp` to @BotFather
2. Select your bot
3. Provide:
   - App title: MusicVerse Pro
   - Description: Your personal music companion
   - Photo: 640x360px image of your app
   - Web App URL: Your HTTPS URL
   - Short name: musicverse

4. Update `.env` with your HTTPS URL:
```env
MINI_APP_URL=https://your-domain.com
```

5. Restart your app

## Step 9: Test the Complete System

1. **Test Bot Commands:**
   - Send `/start` - Should show welcome message
   - Send `/help` - Should show help information
   - Send `/music` - Should show recommendations

2. **Test Mini App (if HTTPS configured):**
   - Click "Open Mini App" button
   - Should open the web interface
   - Test navigation between tabs
   - Test adding favorites

## Quick Start with Docker (Alternative)

If you prefer Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Troubleshooting

### Bot not responding
- Check if bot token is correct in `.env`
- Verify the app is running: check console output
- Try `/start` command again

### "Polling error" in console
- Bot token might be incorrect
- Another instance might be running with same token
- Check network connectivity

### Mini App button doesn't work
- Ensure MINI_APP_URL is HTTPS (not HTTP)
- Verify Mini App is configured in BotFather
- Check if the URL is accessible

### Port already in use
- Change PORT in `.env` to another port (e.g., 3001)
- Or stop the process using port 3000:
  ```bash
  # Find process
  lsof -i :3000
  # Kill process
  kill -9 <PID>
  ```

## Next Steps

Now that your bot is running:

1. **Customize the Bot:**
   - Edit `bot/handlers.js` to modify command responses
   - Add new commands in `bot/index.js`

2. **Customize the Mini App:**
   - Edit `miniapp/index.html` for UI changes
   - Modify `miniapp/css/style.css` for styling
   - Update `miniapp/js/app.js` for functionality

3. **Add Music API Integration:**
   - Get API keys from music providers (Spotify, Deezer, etc.)
   - Update `bot/services/musicService.js` with real API calls
   - Configure API credentials in `.env`

4. **Deploy Your App:**
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
   - Consider Heroku, Railway, or VPS hosting

5. **Explore Documentation:**
   - [API Specification](API_SPECIFICATION.md) - API endpoints
   - [Bot Specification](BOT_SPECIFICATION.md) - Bot features
   - [Architecture](ARCHITECTURE.md) - System design
   - [FAQ](FAQ.md) - Common questions

## Getting Help

- Check [FAQ.md](FAQ.md) for common issues
- Review documentation in `docs/` folder
- Open an issue on GitHub
- Check console logs for error messages

## Development Tips

1. **Use nodemon for development:**
   ```bash
   npm run dev
   ```

2. **Check logs regularly:**
   - Console output shows bot activity
   - Error messages help debug issues

3. **Test incrementally:**
   - Test bot commands first
   - Then test Mini App
   - Add features one at a time

4. **Use environment variables:**
   - Never commit `.env` file
   - Keep secrets secure
   - Use different configs for dev/prod

## What's Next?

Congratulations! You now have a working Telegram Mini App with bot integration. Here are some ideas to extend it:

- Add user authentication and profiles
- Integrate with real music APIs
- Add database for persistent storage
- Implement playlist sharing
- Add audio playback
- Create admin panel
- Add analytics
- Implement caching with Redis

Happy coding! 🎵
