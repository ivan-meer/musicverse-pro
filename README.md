# MusicVerse Pro 🎵

A Telegram Mini App with bot integration for music discovery, playlist management, and personalized recommendations.

## Features

- 🤖 **Telegram Bot Integration** - Interactive bot with commands and inline keyboards
- 🎵 **Music Discovery** - AI-powered recommendations and search
- 📚 **Playlist Management** - Create and manage custom playlists
- ❤️ **Favorites** - Save and organize favorite tracks
- 🔌 **API Provider Integration** - Support for multiple music API providers (Spotify, Deezer, etc.)
- 📱 **Telegram Mini App** - Beautiful, responsive web interface
- 🔐 **Secure Authentication** - Telegram Web App data verification
- ⚡ **Real-time Updates** - Fast and responsive user experience

## Quick Start

### Prerequisites

- Node.js 16+ or Python 3.8+
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Domain with HTTPS (for Mini App)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ivan-meer/musicverse-pro.git
cd musicverse-pro
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Configuration

### Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your bot token and add it to `.env`
3. Configure bot commands:
   ```
   start - Start the bot
   help - Show help information
   music - Get music recommendations
   search - Search for music
   playlists - View your playlists
   favorites - View favorite tracks
   ```

### Mini App Setup

1. Create Mini App in [@BotFather](https://t.me/BotFather)
2. Set your HTTPS URL
3. Upload app icon and description
4. Add Mini App URL to `.env`

### API Provider Configuration

Configure your music API provider in `.env`:
```env
MUSIC_API_KEY=your_api_key
MUSIC_API_SECRET=your_api_secret
MUSIC_API_BASE_URL=https://api.music-provider.com
```

## Project Structure

```
musicverse-pro/
├── bot/                    # Telegram Bot backend
│   ├── index.js           # Main bot entry point
│   ├── handlers.js        # Command handlers
│   ├── webapp.js          # Web app routes
│   └── services/          # Business logic
│       └── musicService.js
├── miniapp/               # Telegram Mini App frontend
│   ├── index.html        # Main UI
│   ├── css/              # Stylesheets
│   │   └── style.css
│   └── js/               # JavaScript
│       └── app.js
├── docs/                  # Documentation
│   ├── API_SPECIFICATION.md
│   ├── BOT_SPECIFICATION.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
├── package.json          # Node.js dependencies
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── .env.example         # Environment variables template
```

## Documentation

- [API Specification](docs/API_SPECIFICATION.md) - REST API documentation
- [Bot Specification](docs/BOT_SPECIFICATION.md) - Telegram Bot commands and features
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions for various platforms
- [Architecture](docs/ARCHITECTURE.md) - System architecture and design patterns

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Traditional Server

```bash
npm install -g pm2
pm2 start bot/index.js --name musicverse-pro
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## Technology Stack

### Backend
- Node.js / Express.js
- Telegram Bot API
- PostgreSQL
- Redis

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript
- Telegram Web App SDK

### External Integrations
- Music API Providers (Spotify, Deezer, etc.)
- Telegram Bot API
- Telegram Mini Apps

## API Endpoints

- `POST /api/auth/verify` - Verify Telegram Web App data
- `GET /api/user/:userId` - Get user data
- `GET /api/recommendations/:userId` - Get music recommendations
- `GET /api/playlists/:userId` - Get user playlists
- `GET /api/favorites/:userId` - Get user favorites
- `GET /health` - Health check

See [API Specification](docs/API_SPECIFICATION.md) for complete API documentation.

## Bot Commands

- `/start` - Initialize bot and show menu
- `/help` - Display help information
- `/music` - Get personalized recommendations
- `/search [query]` - Search for music
- `/playlists` - View playlists
- `/favorites` - View favorite tracks
- `/settings` - Configure bot settings

See [Bot Specification](docs/BOT_SPECIFICATION.md) for complete bot documentation.

## Security

- Telegram Web App data verification
- HTTPS required for Mini App
- Environment variables for secrets
- Input validation and sanitization
- Rate limiting
- CORS configuration

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting pull requests.

## License

ISC

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: [@support](https://t.me/support)

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Push notifications
- [ ] Social features (share playlists)
- [ ] AI-powered recommendations
- [ ] Audio streaming
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Analytics dashboard

## Acknowledgments

- Telegram Bot API
- Telegram Mini Apps
- Music API Providers
- Open source community