# MVP Design - MusicVerse Pro

## Overview

Простая архитектура для MVP без излишней сложности.

**Принцип:** Keep It Simple, Stupid (KISS)

## Architecture

### Simple 3-Tier Architecture

```
┌─────────────────────┐
│   Telegram Users    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌────▼─────┐
│  Bot  │   │ Mini App │
└───┬───┘   └────┬─────┘
    │            │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  Express   │
    │  Server    │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  Supabase  │
    │ PostgreSQL │
    └────────────┘
```

**Нет:**
- ❌ Redis
- ❌ Bull Queue
- ❌ Workers
- ❌ Microservices

**Есть:**
- ✅ Один Express сервер
- ✅ Прямые запросы к Supabase
- ✅ Простая структура

## Components

### 1. Telegram Bot

**File:** `bot/index.js`

**Responsibilities:**
- Обработка команд (/start, /help, /playlists, /favorites)
- Отправка сообщений пользователям
- Обработка callback queries

**Libraries:**
- node-telegram-bot-api

### 2. Express Server

**File:** `bot/index.js` (same file)

**Responsibilities:**
- API endpoints для Mini App
- Статические файлы Mini App
- Аутентификация

**Routes:**
- GET /health
- GET /api/playlists/:userId
- POST /api/playlists
- DELETE /api/playlists/:id
- GET /api/favorites/:userId
- POST /api/favorites
- DELETE /api/favorites/:id

### 3. Services

**Files:** `bot/services/*.js`

**UserService:**
```javascript
async function createOrUpdateUser(telegramId, userData)
async function getUserByTelegramId(telegramId)
```

**PlaylistService:**
```javascript
async function createPlaylist(userId, name, description)
async function getUserPlaylists(userId)
async function addTrackToPlaylist(playlistId, trackData)
async function deletePlaylist(playlistId)
```

**FavoritesService:**
```javascript
async function addToFavorites(userId, trackData)
async function removeFromFavorites(userId, trackId)
async function getUserFavorites(userId)
```

### 4. Supabase Client

**File:** `bot/services/supabaseClient.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = { supabase };
```

### 5. Mini App

**Files:** `miniapp/*`

**Structure:**
```
miniapp/
├── index.html (main UI)
├── css/
│   └── style.css
└── js/
    └── app.js (Telegram SDK + API calls)
```

## Data Models

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Playlists Table

```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Playlist Tracks Table

```sql
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Favorites Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);
```

## Security

### Row Level Security

```sql
-- Users can only see their own playlists
CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  USING (user_id = auth.uid());

-- Users can only see their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());
```

### Telegram Authentication

```javascript
// Verify Telegram Web App initData
function verifyTelegramWebAppData(initData, botToken) {
  // HMAC-SHA256 verification
  // Implementation in bot/utils/auth.js
}
```

## Error Handling

### Simple Strategy

```javascript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: 'Произошла ошибка' };
}
```

### User-Friendly Messages

- Database error → "Произошла ошибка, попробуйте позже"
- Not found → "Плейлист не найден"
- Validation error → "Название не может быть пустым"

## Deployment

### Simple Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "bot/index.js"]
```

### Environment Variables

```bash
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=your_bot
MINI_APP_URL=https://yourdomain.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_key
PORT=3000
NODE_ENV=production
```

## Performance

### Expected Metrics

- Response time: < 1s (acceptable for MVP)
- Concurrent users: ~100 (sufficient for MVP)
- Database queries: Direct, no caching
- Uptime: > 95%

### No Optimization

MVP не требует:
- Кэширования
- Connection pooling
- Query optimization
- Load balancing

Это будет добавлено в Enhanced фазе.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User registration idempotence

*For any* user with telegram_id, calling /start multiple times should result in exactly one user record in the database
**Validates: Requirements 1.2**

### Property 2: User data persistence

*For any* user registration, all fields (telegram_id, username, first_name) should be stored in the database
**Validates: Requirements 1.1**

### Property 3: Playlist creation persistence

*For any* valid playlist data (name, description), creating a playlist should result in a stored playlist with the same data
**Validates: Requirements 2.1**

### Property 4: Playlist-track association

*For any* playlist and track, adding a track to a playlist should create a verifiable association in playlist_tracks table
**Validates: Requirements 2.2**

### Property 5: Cascade deletion

*For any* playlist with tracks, deleting the playlist should also delete all associated tracks from playlist_tracks table
**Validates: Requirements 2.3**

### Property 6: Data isolation for playlists

*For any* two different users, each user should only see their own playlists and not the other user's playlists
**Validates: Requirements 2.4, 6.1**

### Property 7: Favorites creation persistence

*For any* valid track data, adding to favorites should create a record in favorites table
**Validates: Requirements 3.1**

### Property 8: Favorites deletion

*For any* favorite track, removing from favorites should delete the record from favorites table
**Validates: Requirements 3.2**

### Property 9: Data isolation for favorites

*For any* two different users, each user should only see their own favorites and not the other user's favorites
**Validates: Requirements 3.3, 6.1**

### Property 10: Favorites uniqueness

*For any* track, attempting to add it to favorites twice should result in only one record in the database
**Validates: Requirements 3.4**

### Property 11: RLS policy enforcement

*For any* user attempting to access another user's data directly via database query, the RLS policy should block the access
**Validates: Requirements 6.2**

### Property 12: Telegram authentication verification

*For any* initData, the system should correctly verify valid Telegram signatures and reject invalid ones
**Validates: Requirements 6.3**

### Property 13: Input validation error messages

*For any* invalid input data, the system should return a specific error message indicating what is wrong
**Validates: Requirements 8.2**

### Property 14: Error logging

*For any* error that occurs, the system should log the error details to console for debugging
**Validates: Requirements 8.4**

## Testing Strategy

### Property-Based Testing

For MVP, we will use **fast-check** library for property-based testing in JavaScript:

```bash
npm install --save-dev fast-check jest
```

**Configuration:**
- Each property test should run minimum 100 iterations
- Each test must be tagged with format: `**Feature: mvp, Property {number}: {property_text}**`
- Tests should be placed in `__tests__/` directory

**Example:**
```javascript
// __tests__/userService.test.js
const fc = require('fast-check');

test('**Feature: mvp, Property 1: User registration idempotence**', async () => {
  await fc.assert(
    fc.asyncProperty(fc.bigInt(), fc.string(), fc.string(), async (telegramId, username, firstName) => {
      // Call /start twice
      await createOrUpdateUser({ telegram_id: telegramId, username, first_name: firstName });
      await createOrUpdateUser({ telegram_id: telegramId, username, first_name: firstName });
      
      // Check only one record exists
      const users = await getUsersByTelegramId(telegramId);
      return users.length === 1;
    }),
    { numRuns: 100 }
  );
});
```

### Manual Testing

- Test all bot commands
- Test all Mini App features
- Test on different devices
- Test error scenarios

### Testing Approach for MVP

**Priority:**
1. Manual testing (primary for MVP)
2. Property-based tests for critical paths (optional)
3. Unit tests (will be added in Enhanced phase)

Для MVP достаточно manual testing. Property-based тесты опциональны и будут добавлены по мере необходимости.

## Monitoring

### Basic Logging

```javascript
console.log('User registered:', userId);
console.error('Error creating playlist:', error);
```

### No Advanced Monitoring

- No Prometheus
- No Grafana
- No Sentry
- Just console logs

Это будет добавлено в Advanced фазе.

## What's NOT in MVP

- ❌ Caching (Redis)
- ❌ Background jobs (Bull)
- ❌ Analytics
- ❌ Search
- ❌ Notifications
- ❌ Recommendations
- ❌ Advanced security
- ❌ Performance optimization
- ❌ Automated tests
- ❌ Advanced monitoring

## Next Steps

1. Review this design
2. Start implementation (tasks.md)
3. Build MVP in 4 weeks
4. Launch and gather feedback
5. Decide on Enhanced phase
