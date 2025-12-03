# Project Structure

## Directory Organization

```
musicverse-pro/
├── bot/                    # Backend - Telegram Bot & API
│   ├── index.js           # Main entry point, bot initialization
│   ├── handlers.js        # Command handlers (/start, /help, /music)
│   ├── webapp.js          # Express routes for Mini App API
│   ├── middleware/        # Express middleware (rate limiting, auth)
│   ├── services/          # Business logic (musicService.js)
│   └── utils/             # Utility functions (auth.js for verification)
│
├── miniapp/               # Frontend - Telegram Mini App
│   ├── index.html        # Main UI with tab navigation
│   ├── css/              # Stylesheets
│   │   └── style.css     # Main styles
│   └── js/               # JavaScript
│       └── app.js        # Application logic, Telegram SDK integration
│
├── docs/                  # Documentation (Russian & English)
│   ├── API_SPECIFICATION.md
│   ├── BOT_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── GETTING_STARTED.md
│   ├── CONTRIBUTING.md
│   ├── FAQ.md
│   └── PROJECT_SUMMARY.md
│
├── examples/             # Code examples for integrations
│   └── music-provider-example.js
│
├── .kiro/                # Kiro AI assistant configuration
│   └── steering/         # AI steering rules
│
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Multi-container orchestration
├── package.json          # Node.js dependencies and scripts
├── .env.example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
└── README.md             # Project overview
```

## Key Architectural Patterns

### Separation of Concerns

- **bot/**: All backend logic (bot handlers, API routes, services)
- **miniapp/**: All frontend code (HTML, CSS, JS)
- **docs/**: Documentation separate from code

### Modular Design

- **handlers.js**: Command handlers are separate functions
- **services/**: Business logic isolated from handlers
- **middleware/**: Reusable middleware components
- **utils/**: Shared utility functions

### Configuration Management

- Environment variables in `.env` (never committed)
- `.env.example` as template
- Configuration loaded via `dotenv` package

## File Naming Conventions

- **JavaScript files**: camelCase (e.g., `musicService.js`, `rateLimiter.js`)
- **Documentation**: SCREAMING_SNAKE_CASE (e.g., `API_SPECIFICATION.md`)
- **Folders**: lowercase (e.g., `bot/`, `miniapp/`, `docs/`)

## Import/Export Pattern

Use CommonJS (require/module.exports) throughout the project:

```javascript
// Exporting
module.exports = { functionName };

// Importing
const { functionName } = require('./module');
```

## API Route Organization

Routes are organized in `bot/webapp.js`:
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User data endpoints
- `/api/recommendations/*` - Music recommendations
- `/api/playlists/*` - Playlist management
- `/api/favorites/*` - Favorites management
- `/health` - Health check endpoint

## Static Files

Mini App static files served from `miniapp/` directory via Express static middleware.
