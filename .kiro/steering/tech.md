# Technology Stack

## Runtime & Framework

- **Node.js**: 18+ (LTS version)
- **Express.js**: Web server framework
- **node-telegram-bot-api**: Telegram Bot API integration

## Frontend

- **HTML5/CSS3**: Semantic markup with modern styling
- **Vanilla JavaScript**: No framework dependencies
- **Telegram Web App SDK**: Official Telegram integration

## Database & Cache

- **PostgreSQL**: Primary database (optional, structure documented)
- **Redis**: Caching layer (optional, for performance)

## Development Tools

- **ESLint**: Code linting with recommended rules
- **Prettier**: Code formatting
- **Nodemon**: Hot reload during development
- **Jest**: Testing framework (configured but tests not implemented)

## Deployment

- **Docker**: Containerization with multi-stage builds
- **Docker Compose**: Orchestration with PostgreSQL and Redis
- **PM2**: Process management for traditional deployments

## Common Commands

### Development
```bash
npm run dev          # Start with hot reload (nodemon)
npm start            # Start production server
npm test             # Run tests (Jest)
npm run lint         # Check code style
npm run format       # Format code with Prettier
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop services
docker-compose build              # Rebuild containers
```

### Production (PM2)
```bash
pm2 start bot/index.js --name musicverse-pro
pm2 logs musicverse-pro
pm2 restart musicverse-pro
pm2 stop musicverse-pro
```

## Environment Variables

Required variables are defined in `.env.example`. Always copy to `.env` and configure before running:
- `TELEGRAM_BOT_TOKEN`: Bot token from @BotFather
- `TELEGRAM_BOT_USERNAME`: Bot username
- `MINI_APP_URL`: HTTPS URL where Mini App is hosted
- `PORT`: Server port (default: 3000)

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line endings**: Unix (LF)
- **Max line length**: 80 characters
