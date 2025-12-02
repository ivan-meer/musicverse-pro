# MusicVerse Pro Architecture

## System Overview

MusicVerse Pro is a Telegram Mini App with bot integration that provides music discovery, playlist management, and personalized recommendations through external API providers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Telegram                            │
│  ┌──────────────┐              ┌──────────────┐           │
│  │  Telegram    │              │   Telegram   │           │
│  │    Bot       │◄────────────►│   Mini App   │           │
│  └──────┬───────┘              └──────┬───────┘           │
└─────────┼──────────────────────────────┼──────────────────┘
          │                              │
          │ Webhook/Polling              │ HTTPS
          │                              │
┌─────────▼──────────────────────────────▼──────────────────┐
│                    Application Server                      │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │   Bot Handler    │      │   Web Server     │          │
│  │  (Node.js/Python)│      │   (Express)      │          │
│  └────────┬─────────┘      └────────┬─────────┘          │
│           │                         │                     │
│           │    ┌────────────────────┤                     │
│           │    │                    │                     │
│  ┌────────▼────▼───┐      ┌────────▼─────────┐          │
│  │  Business Logic  │      │   API Routes     │          │
│  │    Services      │      │   & Controllers  │          │
│  └────────┬─────────┘      └────────┬─────────┘          │
│           │                         │                     │
│           └────────┬────────────────┘                     │
│                    │                                       │
└────────────────────┼───────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼─────────┐ ┌▼──────────────┐
│  PostgreSQL  │ │   Redis    │ │  External     │
│  Database    │ │   Cache    │ │  Music API    │
│              │ │            │ │  (Spotify,    │
│              │ │            │ │   Deezer)     │
└──────────────┘ └────────────┘ └───────────────┘
```

## Components

### 1. Telegram Bot Handler

**Responsibilities:**
- Receive and process bot commands
- Handle callback queries
- Manage inline keyboards
- Process Web App data
- Send notifications

**Technologies:**
- Node.js: `node-telegram-bot-api`
- Python: `python-telegram-bot`

**Key Files:**
- `bot/index.js` - Main bot initialization
- `bot/handlers.js` - Command handlers
- `bot/services/` - Business logic services

### 2. Web Server (Mini App Backend)

**Responsibilities:**
- Serve Mini App static files
- Provide REST API endpoints
- Handle authentication
- Process user requests
- Integrate with external APIs

**Technologies:**
- Express.js (Node.js)
- FastAPI (Python alternative)

**Key Files:**
- `bot/webapp.js` - Web app routes
- `miniapp/` - Static files (HTML, CSS, JS)

### 3. Telegram Mini App (Frontend)

**Responsibilities:**
- User interface for music browsing
- Playlist management
- Favorites handling
- Communication with backend API
- Integration with Telegram Web App SDK

**Technologies:**
- HTML5
- CSS3
- Vanilla JavaScript
- Telegram Web App SDK

**Key Files:**
- `miniapp/index.html` - Main UI
- `miniapp/css/style.css` - Styling
- `miniapp/js/app.js` - Application logic

### 4. Music Service Layer

**Responsibilities:**
- Integrate with external music APIs
- Cache music data
- Transform API responses
- Handle API rate limiting

**Technologies:**
- Axios (HTTP client)
- Redis (caching)

**Key Files:**
- `bot/services/musicService.js` - Music API integration

### 5. Database Layer

**Responsibilities:**
- Store user data
- Manage playlists
- Store favorites
- User preferences
- Analytics data

**Database Schema:**
```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE tracks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    duration VARCHAR(10),
    preview_url TEXT,
    cover_url TEXT,
    external_id VARCHAR(255),
    provider VARCHAR(50)
);

-- Playlist tracks junction table
CREATE TABLE playlist_tracks (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id),
    track_id VARCHAR(255) REFERENCES tracks(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER
);

-- Favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    track_id VARCHAR(255) REFERENCES tracks(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- User settings table
CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Cache Layer (Redis)

**Cached Data:**
- Music recommendations (TTL: 1 hour)
- Search results (TTL: 30 minutes)
- User sessions (TTL: 24 hours)
- API responses (TTL: configurable)
- Rate limiting data

**Key Patterns:**
```
recommendations:user:{user_id}
search:{query}:{page}
session:{session_id}
ratelimit:api:{endpoint}:{user_id}
```

## Data Flow

### 1. User Starts Bot

```
User → Telegram → Bot Handler
                    ↓
              handleStart()
                    ↓
           Send Welcome Message
                    ↓
          Display Inline Keyboard
                    ↓
              User ← Telegram
```

### 2. User Opens Mini App

```
User → Clicks "Open Mini App" → Telegram
                                    ↓
                            Opens Mini App URL
                                    ↓
                           Loads HTML/CSS/JS
                                    ↓
                        Initializes Telegram SDK
                                    ↓
                           GET /api/user/:userId
                                    ↓
                         Loads User Data & UI
                                    ↓
                      GET /api/recommendations/:userId
                                    ↓
                    Check Redis Cache → If Miss:
                                    ↓
                          Query Music API
                                    ↓
                          Store in Cache
                                    ↓
                      Display Recommendations
```

### 3. User Adds to Favorites

```
User → Clicks Favorite → Mini App
                            ↓
                   POST /api/favorites/:userId
                            ↓
                    Validate & Authenticate
                            ↓
                   Save to Database
                            ↓
                   Update Cache
                            ↓
                   Return Success
                            ↓
                   Update UI
                            ↓
                   User sees feedback
```

### 4. User Sends Data to Bot

```
User → Clicks "Send to Bot" → Mini App
                                  ↓
                        Collect Favorites Data
                                  ↓
                    tg.sendData(JSON.stringify(data))
                                  ↓
                           Telegram SDK
                                  ↓
                          Bot Handler
                                  ↓
                      bot.on('web_app_data')
                                  ↓
                        Process Data
                                  ↓
                   Send Confirmation Message
                                  ↓
                          User ← Telegram
```

## Security Architecture

### 1. Authentication

**Telegram Web App Data Verification:**
```javascript
function verifyTelegramWebAppData(initData, botToken) {
    // Extract data and hash
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Sort and create data-check-string
    const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    // Compute secret key
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    
    // Verify hash
    const computedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    
    return hash === computedHash;
}
```

### 2. Rate Limiting

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per window
    message: 'Too many requests'
});

app.use('/api/', limiter);
```

### 3. Input Validation

- Sanitize all user inputs
- Validate request parameters
- Use parameterized queries
- Escape HTML output

### 4. CORS Configuration

```javascript
app.use(cors({
    origin: [
        'https://web.telegram.org',
        'https://telegram.org'
    ],
    credentials: true
}));
```

## Scalability Considerations

### 1. Horizontal Scaling

- Load balancer (NGINX/HAProxy)
- Multiple application instances
- Stateless architecture
- Shared cache (Redis)
- Database replication

### 2. Caching Strategy

- Cache frequently accessed data
- Use Redis for session storage
- Cache API responses
- Implement cache invalidation

### 3. Database Optimization

- Index frequently queried columns
- Use connection pooling
- Implement read replicas
- Regular query optimization

### 4. API Rate Limiting

- Implement per-user rate limits
- Cache API responses
- Use queues for bulk operations
- Batch API requests

## Monitoring & Logging

### 1. Application Logs

- Request/response logs
- Error logs
- Performance metrics
- User activity logs

### 2. Metrics to Track

- Response time
- Error rate
- API call frequency
- User engagement
- Cache hit rate

### 3. Alerting

- Error rate threshold
- Response time degradation
- API failures
- Database connection issues

## Development Workflow

```
Development → Testing → Staging → Production
     ↓           ↓         ↓          ↓
  Local PC    Unit Tests  QA     Live Users
     ↓           ↓         ↓          ↓
  Hot Reload  Integration UAT    Monitoring
               Tests
```

## API Integration Points

### External Music API Providers

**Supported Providers:**
1. Spotify API
2. Deezer API
3. Apple Music API
4. Last.fm API

**Integration Pattern:**
```javascript
class MusicAPIProvider {
    constructor(config) {
        this.baseURL = config.baseURL;
        this.apiKey = config.apiKey;
    }
    
    async search(query) { /* ... */ }
    async getRecommendations(userId) { /* ... */ }
    async getTrack(trackId) { /* ... */ }
}

// Factory pattern for provider selection
function createMusicProvider(type) {
    switch(type) {
        case 'spotify':
            return new SpotifyProvider(config);
        case 'deezer':
            return new DeezerProvider(config);
        default:
            throw new Error('Unknown provider');
    }
}
```

## Error Handling

### Global Error Handler

```javascript
app.use((err, req, res, next) => {
    logger.error(err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Internal server error'
        }
    });
});
```

## Future Enhancements

1. **WebSocket Support** - Real-time updates
2. **Push Notifications** - Telegram notifications
3. **Social Features** - Share playlists with friends
4. **AI Recommendations** - Machine learning-based suggestions
5. **Audio Streaming** - In-app music playback
6. **Offline Mode** - Cache for offline access
7. **Multi-language** - Internationalization
8. **Analytics Dashboard** - Admin panel
