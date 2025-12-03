# Design Document: Supabase Integration

## Overview

Данный документ описывает архитектурное решение для интеграции MusicVerse Pro с Supabase в качестве основного backend-решения. Интеграция включает:

- Настройку PostgreSQL базы данных через Supabase
- Подключение Telegram бота к Supabase
- Реализацию API endpoints для Mini App
- Систему аутентификации через Telegram Web App
- Управление данными пользователей, плейлистами и избранным
- Систему рекомендаций музыки

Supabase выбран как решение благодаря:
- Встроенной PostgreSQL базе данных с real-time возможностями
- Готовой системе аутентификации
- Row Level Security для защиты данных
- JavaScript/TypeScript клиенту для простой интеграции
- Бесплатному tier для разработки и малых проектов

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────────┐
│ Bot  │  │ Mini App  │
└───┬──┘  └──┬────────┘
    │        │
    │   ┌────▼─────┐
    │   │ Express  │
    │   │  Server  │
    │   └────┬─────┘
    │        │
    └────┬───┘
         │
    ┌────▼─────────┐
    │   Supabase   │
    │  PostgreSQL  │
    └──────────────┘
```

### Component Interaction Flow

1. **User Authentication Flow:**
   - User opens Mini App → Telegram generates initData
   - Mini App sends initData to Express server
   - Server verifies initData signature using bot token
   - Server authenticates user with Supabase
   - Server returns user data and session

2. **Bot Command Flow:**
   - User sends command to bot
   - Bot processes command
   - Bot queries/updates Supabase
   - Bot sends response to user

3. **Mini App Data Flow:**
   - Mini App makes API request with auth token
   - Express middleware verifies Telegram auth
   - Express handler queries Supabase
   - Response sent back to Mini App

### Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** Supabase (PostgreSQL)
- **Bot Framework:** node-telegram-bot-api
- **Supabase Client:** @supabase/supabase-js
- **Authentication:** Telegram Web App initData verification
- **Deployment:** Docker + Docker Compose

## Components and Interfaces

### 1. Supabase Client Module

**Location:** `bot/services/supabaseClient.js`

**Purpose:** Централизованное управление подключением к Supabase

**Interface:**
```javascript
// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Export client instance
module.exports = { supabase };
```

**Responsibilities:**
- Инициализация Supabase клиента с credentials
- Валидация переменных окружения
- Экспорт singleton instance для использования в приложении

### 2. User Service

**Location:** `bot/services/userService.js`

**Purpose:** Управление данными пользователей

**Interface:**
```javascript
async function createOrUpdateUser(telegramId, userData)
async function getUserByTelegramId(telegramId)
async function updateUserPreferences(userId, preferences)
```

**Responsibilities:**
- Создание новых пользователей при первом взаимодействии
- Обновление информации пользователя
- Получение данных пользователя по telegram_id
- Управление настройками пользователя

### 3. Playlist Service

**Location:** `bot/services/playlistService.js`

**Purpose:** Управление плейлистами пользователей

**Interface:**
```javascript
async function createPlaylist(userId, name, description)
async function getUserPlaylists(userId)
async function addTrackToPlaylist(playlistId, trackData)
async function removeTrackFromPlaylist(playlistId, trackId)
async function deletePlaylist(playlistId)
async function updatePlaylist(playlistId, updates)
```

**Responsibilities:**
- CRUD операции для плейлистов
- Управление треками в плейлистах
- Валидация прав доступа пользователя

### 4. Favorites Service

**Location:** `bot/services/favoritesService.js`

**Purpose:** Управление избранными треками

**Interface:**
```javascript
async function addToFavorites(userId, trackData)
async function removeFromFavorites(userId, trackId)
async function getUserFavorites(userId)
async function isFavorite(userId, trackId)
```

**Responsibilities:**
- Добавление/удаление треков из избранного
- Получение списка избранного
- Проверка наличия трека в избранном

### 5. Recommendations Service

**Location:** `bot/services/recommendationsService.js`

**Purpose:** Генерация и управление рекомендациями

**Interface:**
```javascript
async function generateRecommendations(userId)
async function getUserRecommendations(userId)
async function updateRecommendationInteraction(recommendationId)
async function refreshRecommendations(userId)
```

**Responsibilities:**
- Генерация персонализированных рекомендаций
- Сохранение рекомендаций в базу
- Отслеживание взаимодействий с рекомендациями
- Обновление устаревших рекомендаций

### 6. Authentication Middleware

**Location:** `bot/middleware/telegramAuth.js`

**Purpose:** Аутентификация запросов от Mini App

**Interface:**
```javascript
async function authenticateRequest(req, res, next)
async function extractUserFromRequest(req)
```

**Responsibilities:**
- Верификация Telegram initData
- Извлечение данных пользователя
- Проверка срока действия initData
- Добавление user object в request

### 7. Database Migration Scripts

**Location:** `supabase/migrations/`

**Purpose:** Создание и обновление схемы базы данных

**Files:**
- `001_initial_schema.sql` - Создание таблиц
- `002_rls_policies.sql` - Row Level Security политики
- `003_indexes.sql` - Индексы для оптимизации

## Data Models

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
```

**Fields:**
- `id`: UUID primary key
- `telegram_id`: Уникальный Telegram ID пользователя
- `username`: Telegram username (может быть null)
- `first_name`: Имя пользователя
- `last_name`: Фамилия пользователя (опционально)
- `language_code`: Код языка пользователя
- `preferences`: JSON объект с настройками пользователя
- `created_at`: Дата создания записи
- `updated_at`: Дата последнего обновления

### Playlists Table

```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
```

**Fields:**
- `id`: UUID primary key
- `user_id`: Foreign key к таблице users
- `name`: Название плейлиста
- `description`: Описание плейлиста (опционально)
- `cover_image_url`: URL обложки плейлиста
- `is_public`: Флаг публичности плейлиста
- `created_at`: Дата создания
- `updated_at`: Дата последнего обновления

### Playlist Tracks Table

```sql
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE UNIQUE INDEX idx_playlist_tracks_unique ON playlist_tracks(playlist_id, track_id);
```

**Fields:**
- `id`: UUID primary key
- `playlist_id`: Foreign key к таблице playlists
- `track_id`: ID трека из внешнего API
- `track_data`: JSON объект с полными данными трека
- `position`: Позиция трека в плейлисте
- `added_at`: Дата добавления трека

### Favorites Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE UNIQUE INDEX idx_favorites_unique ON favorites(user_id, track_id);
```

**Fields:**
- `id`: UUID primary key
- `user_id`: Foreign key к таблице users
- `track_id`: ID трека из внешнего API
- `track_data`: JSON объект с полными данными трека
- `added_at`: Дата добавления в избранное

### Recommendations Table

```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  score FLOAT DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_expires_at ON recommendations(expires_at);
```

**Fields:**
- `id`: UUID primary key
- `user_id`: Foreign key к таблице users
- `track_id`: ID рекомендованного трека
- `track_data`: JSON объект с данными трека
- `score`: Оценка релевантности рекомендации
- `interaction_count`: Количество взаимодействий пользователя
- `created_at`: Дата создания рекомендации
- `expires_at`: Дата истечения рекомендации

## Error Handling

### Error Categories

1. **Database Errors:**
   - Connection failures
   - Query errors
   - Constraint violations
   - Timeout errors

2. **Authentication Errors:**
   - Invalid initData signature
   - Expired initData
   - Missing credentials
   - Unauthorized access

3. **Validation Errors:**
   - Invalid input data
   - Missing required fields
   - Data type mismatches

4. **Business Logic Errors:**
   - Duplicate entries
   - Resource not found
   - Permission denied

### Error Handling Strategy

**1. Centralized Error Handler:**

```javascript
// bot/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.code === 'PGRST116') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }
  
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
```

**2. Service-Level Error Handling:**

```javascript
async function getUserPlaylists(userId) {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

**3. Bot Error Handling:**

```javascript
bot.on('polling_error', (error) => {
  console.error('Bot polling error:', error);
  // Implement retry logic or alerting
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});
```

**4. Graceful Degradation:**

- При недоступности Supabase возвращать cached данные
- Показывать понятные сообщения пользователю
- Логировать ошибки для мониторинга
- Не раскрывать внутренние детали ошибок

## Testing Strategy

### Unit Testing

**Framework:** Jest

**Coverage Areas:**
- Service functions (userService, playlistService, etc.)
- Utility functions (auth verification, data validation)
- Middleware functions
- Error handlers

**Example Unit Tests:**
```javascript
describe('UserService', () => {
  test('should create new user with valid telegram_id', async () => {
    const userData = {
      telegram_id: 123456789,
      username: 'testuser',
      first_name: 'Test'
    };
    const result = await createOrUpdateUser(userData.telegram_id, userData);
    expect(result.success).toBe(true);
    expect(result.data.telegram_id).toBe(userData.telegram_id);
  });
  
  test('should handle duplicate telegram_id gracefully', async () => {
    // Test duplicate handling
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with corresponding correctness property
- Format: `**Feature: supabase-integration, Property {number}: {property_text}**`

**Property Test Areas:**
- Data integrity across operations
- Round-trip serialization/deserialization
- Invariants preservation
- Error handling consistency

### Integration Testing

**Areas:**
- Supabase connection and queries
- API endpoints with real database
- Bot command handlers with database operations
- Authentication flow end-to-end

### Testing Environment

**Setup:**
- Separate Supabase project for testing
- Test database with migrations applied
- Mock Telegram API responses
- Isolated test data

**Teardown:**
- Clean up test data after each test
- Reset database state
- Clear caches


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

После анализа acceptance criteria, были выявлены следующие избыточности:

- **Properties 3.1 и 4.1** (создание плейлиста и добавление в избранное) можно обобщить в одно свойство о сохранении данных пользователя
- **Properties 3.4 и 4.3** (получение плейлистов и избранного) оба проверяют изоляцию данных пользователя - можно объединить
- **Properties 8.1 и 8.2** (сохранение и получение рекомендаций) - это round-trip операция, можно объединить

После устранения избыточности, остаются следующие уникальные свойства:

### Core Properties

**Property 1: Row Level Security Isolation**

*For any* two different users A and B, when user A queries their data (playlists, favorites, or recommendations), the system should return only data belonging to user A and never data belonging to user B.

**Validates: Requirements 1.5, 3.4, 4.3**

**Reasoning:** Это фундаментальное свойство безопасности, которое должно работать для всех типов данных и всех пользователей. RLS политики Supabase должны гарантировать изоляцию данных на уровне базы данных.

---

**Property 2: User Creation Idempotence**

*For any* telegram_id and user data, calling createOrUpdateUser multiple times with the same telegram_id should result in exactly one user record with the most recent data.

**Validates: Requirements 2.2**

**Reasoning:** Команда /start может быть вызвана многократно. Система должна корректно обрабатывать повторные вызовы, обновляя существующего пользователя вместо создания дубликатов.

---

**Property 3: Playlist-Track Cascade Deletion**

*For any* playlist with associated tracks, when the playlist is deleted, all corresponding records in playlist_tracks table should also be deleted.

**Validates: Requirements 3.3**

**Reasoning:** Это свойство целостности данных. Каскадное удаление должно работать для любого плейлиста независимо от количества треков, предотвращая orphaned records.

---

**Property 4: Playlist Update Preservation**

*For any* playlist and any new name, when the playlist name is updated, all other playlist properties (id, user_id, tracks, created_at) should remain unchanged.

**Validates: Requirements 3.5**

**Reasoning:** Обновление должно быть хирургически точным - изменять только указанное поле, сохраняя все остальные данные неизменными.

---

**Property 5: Favorite Uniqueness**

*For any* user and track_id, attempting to add the same track to favorites multiple times should result in exactly one favorite record.

**Validates: Requirements 4.4**

**Reasoning:** Уникальный индекс на (user_id, track_id) должен предотвращать дубликаты. Это свойство должно работать независимо от количества попыток добавления.

---

**Property 6: Favorite Round-Trip**

*For any* user and track data, if a track is added to favorites and then immediately queried, the returned track data should match the original track data.

**Validates: Requirements 4.1, 4.3**

**Reasoning:** Это round-trip свойство проверяет, что данные корректно сериализуются в JSONB и десериализуются обратно без потерь.

---

**Property 7: Telegram Authentication Verification**

*For any* valid Telegram initData with correct HMAC signature, the authentication should succeed and return user data matching the initData.

**Validates: Requirements 4.5**

**Reasoning:** Аутентификация должна работать для любого валидного initData. Это критическое свойство безопасности для Mini App.

---

**Property 8: Environment Variable Validation**

*For any* missing required environment variable (TELEGRAM_BOT_TOKEN, SUPABASE_URL, or SUPABASE_KEY), the system should throw a descriptive error mentioning the specific missing variable.

**Validates: Requirements 5.3**

**Reasoning:** Валидация должна работать для каждой обязательной переменной, предоставляя четкую обратную связь разработчику.

---

**Property 9: Port Configuration Flexibility**

*For any* valid port number specified in PORT environment variable, the Express server should successfully listen on that port.

**Validates: Requirements 6.3**

**Reasoning:** Система должна быть гибкой в конфигурации портов для разных окружений (development, staging, production).

---

**Property 10: Static File Serving**

*For any* file in the miniapp directory, a GET request to the corresponding URL path should return the file content with correct MIME type.

**Validates: Requirements 6.5**

**Reasoning:** Express static middleware должен корректно обслуживать все файлы Mini App независимо от типа (HTML, CSS, JS, images).

---

**Property 11: Docker Environment Variable Propagation**

*For any* environment variable defined in .env file, when containers start via docker-compose, the variable should be accessible within the container.

**Validates: Requirements 7.2**

**Reasoning:** Docker Compose должен корректно передавать все переменные окружения в контейнеры.

---

**Property 12: Database Reconnection Resilience**

*For any* container restart, the system should automatically re-establish connection to Supabase without manual intervention.

**Validates: Requirements 7.4**

**Reasoning:** Система должна быть resilient к перезапускам, автоматически восстанавливая соединения с внешними сервисами.

---

**Property 13: Recommendations Round-Trip**

*For any* user and set of generated recommendations, if recommendations are saved and then immediately queried for that user, the returned recommendations should match the saved ones.

**Validates: Requirements 8.1, 8.2**

**Reasoning:** Это round-trip свойство для рекомендаций, проверяющее корректность сохранения и извлечения данных.

---

**Property 14: Recommendation Interaction Counter**

*For any* recommendation, each interaction should increment the interaction_count by exactly 1, and N interactions should result in interaction_count equal to N.

**Validates: Requirements 8.4**

**Reasoning:** Счетчик взаимодействий должен точно отражать количество взаимодействий пользователя с рекомендацией.

---

**Property 15: Recommendation Expiration Update**

*For any* expired recommendations (where expires_at < NOW()), calling refreshRecommendations should replace them with new recommendations having future expires_at timestamps.

**Validates: Requirements 8.3**

**Reasoning:** Система должна корректно обновлять устаревшие рекомендации, заменяя их свежими с новыми датами истечения.

---

**Property 16: Error Logging Completeness**

*For any* error thrown in the system, the error should be logged with at least: timestamp, error message, stack trace, and context information.

**Validates: Requirements 9.5**

**Reasoning:** Полное логирование ошибок критично для отладки. Каждая ошибка должна содержать достаточно информации для диагностики.

---

### Edge Case Properties

**Edge Case 1: Database Connection Failure Handling**

When Supabase connection is unavailable, the system should log the error and return user-friendly error messages without crashing.

**Validates: Requirements 2.3, 2.5**

---

**Edge Case 2: Health Check Failure Response**

When Supabase is unavailable during /health endpoint check, the system should return HTTP 503 status with error details.

**Validates: Requirements 9.3**

---

### Example-Based Tests

The following requirements are best validated through specific example tests rather than property-based tests:

- **Requirements 1.1-1.4, 10.1-10.5:** Documentation and migration file existence
- **Requirements 5.1, 5.2:** Configuration file validation
- **Requirements 6.1, 6.2, 6.4:** Development setup commands
- **Requirements 7.1, 7.3, 7.5:** Docker deployment configuration
- **Requirements 9.1, 9.2, 9.4:** Health check endpoint behavior

These will be covered by unit tests with specific test cases.



## Security Considerations

### 1. Telegram Web App Authentication

**Mechanism:** HMAC-SHA256 signature verification

**Implementation:**
```javascript
function verifyTelegramWebAppData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

**Security Properties:**
- Prevents tampering with user data
- Validates requests originate from Telegram
- Time-based expiration (auth_date check)

### 2. Row Level Security (RLS)

**Users Table Policy:**
```sql
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Playlists Table Policy:**
```sql
CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own playlists"
  ON playlists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (user_id = auth.uid());
```

**Similar policies for:** favorites, recommendations, playlist_tracks

### 3. Environment Variables Security

**Best Practices:**
- Never commit .env file to version control
- Use different keys for development/production
- Rotate Supabase keys periodically
- Use service role key only on backend
- Use anon key for client-side (if needed)

### 4. Rate Limiting

**Implementation:** Express rate-limit middleware

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter limit for auth endpoints
  message: 'Too many authentication attempts'
});
```

### 5. Input Validation

**Validation Strategy:**
- Validate all user inputs before database operations
- Sanitize strings to prevent SQL injection (Supabase client handles this)
- Validate data types and formats
- Check string lengths and numeric ranges
- Validate foreign key references exist

## Deployment Configuration

### Environment Variables

**Required Variables:**
```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=musicverse_pro_bot
MINI_APP_URL=https://yourdomain.com

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=3000
NODE_ENV=production
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  bot:
    build: .
    ports:
      - "${PORT}:${PORT}"
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_BOT_USERNAME=${TELEGRAM_BOT_USERNAME}
      - MINI_APP_URL=${MINI_APP_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - PORT=${PORT}
      - NODE_ENV=${NODE_ENV}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "bot/index.js"]
```

### Supabase Setup Steps

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and region
   - Set database password
   - Wait for project provisioning

2. **Get API Credentials:**
   - Navigate to Project Settings > API
   - Copy Project URL (SUPABASE_URL)
   - Copy anon/public key (SUPABASE_KEY)
   - Copy service_role key (SUPABASE_SERVICE_ROLE_KEY)

3. **Run Migrations:**
   - Navigate to SQL Editor in Supabase dashboard
   - Run migration scripts in order:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`
     - `003_indexes.sql`

4. **Verify Setup:**
   - Check Tables section to confirm all tables created
   - Check Policies section to verify RLS policies
   - Test connection from application

### Telegram Bot Setup Steps

1. **Create Bot:**
   - Message @BotFather on Telegram
   - Send `/newbot` command
   - Follow prompts to set name and username
   - Save the bot token (TELEGRAM_BOT_TOKEN)

2. **Configure Mini App:**
   - Send `/newapp` to @BotFather
   - Select your bot
   - Provide app title, description, and photo
   - Set Web App URL (must be HTTPS)
   - Set short name for deep linking

3. **Set Bot Commands:**
   - Send `/setcommands` to @BotFather
   - Provide command list:
     ```
     start - Start the bot
     help - Show help message
     music - Get music recommendations
     playlists - View your playlists
     favorites - View favorites
     ```

## Monitoring and Observability

### Logging Strategy

**Log Levels:**
- `error`: Critical errors requiring immediate attention
- `warn`: Warning conditions that should be reviewed
- `info`: General informational messages
- `debug`: Detailed debugging information (development only)

**Log Format:**
```javascript
{
  timestamp: '2024-01-01T12:00:00.000Z',
  level: 'error',
  message: 'Database query failed',
  context: {
    userId: 'uuid',
    operation: 'getUserPlaylists',
    error: 'Connection timeout'
  }
}
```

### Health Monitoring

**Health Check Endpoint:**
```javascript
app.get('/health', async (req, res) => {
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        bot: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

### Metrics to Monitor

- **Application Metrics:**
  - Request rate (requests/second)
  - Response time (p50, p95, p99)
  - Error rate
  - Active users

- **Database Metrics:**
  - Query execution time
  - Connection pool usage
  - Failed queries
  - Table sizes

- **Bot Metrics:**
  - Commands processed
  - Active conversations
  - Message delivery rate
  - Webhook failures (if using webhooks)

## Migration Path

### From Current State to Supabase

**Phase 1: Setup (Week 1)**
1. Create Supabase project
2. Run database migrations
3. Install @supabase/supabase-js dependency
4. Create supabaseClient.js module
5. Update .env.example with Supabase variables

**Phase 2: Service Layer (Week 2)**
1. Implement userService.js
2. Implement playlistService.js
3. Implement favoritesService.js
4. Implement recommendationsService.js
5. Write unit tests for each service

**Phase 3: Integration (Week 3)**
1. Update bot handlers to use services
2. Update API endpoints to use services
3. Implement authentication middleware
4. Add error handling
5. Write integration tests

**Phase 4: Testing & Documentation (Week 4)**
1. Write property-based tests
2. Perform end-to-end testing
3. Write setup documentation
4. Write API documentation
5. Create troubleshooting guide

**Phase 5: Deployment (Week 5)**
1. Deploy to staging environment
2. Perform load testing
3. Fix any issues found
4. Deploy to production
5. Monitor and iterate

## Performance Considerations

### Database Optimization

**Indexes:**
- `telegram_id` on users table (unique)
- `user_id` on playlists, favorites, recommendations
- `playlist_id` on playlist_tracks
- `expires_at` on recommendations (for cleanup queries)

**Query Optimization:**
- Use `.select()` to fetch only needed columns
- Use `.limit()` for pagination
- Use `.order()` for sorted results
- Avoid N+1 queries with proper joins

**Caching Strategy:**
- Cache user preferences in memory
- Cache frequently accessed playlists
- Use Supabase real-time for live updates
- Implement TTL for cached data

### API Performance

**Best Practices:**
- Implement pagination for list endpoints
- Use compression middleware (gzip)
- Enable HTTP/2 if possible
- Implement request coalescing for duplicate requests
- Use connection pooling for database

### Bot Performance

**Optimization:**
- Use webhook instead of polling in production
- Implement message queue for high load
- Cache bot responses for common queries
- Use inline keyboards to reduce messages
- Implement command throttling per user

## Future Enhancements

### Potential Features

1. **Real-time Collaboration:**
   - Use Supabase real-time subscriptions
   - Live playlist updates
   - Collaborative playlists

2. **Advanced Analytics:**
   - Listening history tracking
   - Genre preferences analysis
   - Recommendation algorithm improvements

3. **Social Features:**
   - Share playlists with friends
   - Follow other users
   - Activity feed

4. **Storage Integration:**
   - Upload custom cover images
   - Store audio files (if licensed)
   - User profile pictures

5. **Advanced Search:**
   - Full-text search with PostgreSQL
   - Fuzzy matching
   - Search filters and facets

