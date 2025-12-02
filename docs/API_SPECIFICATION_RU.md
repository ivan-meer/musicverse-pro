# Спецификация API MusicVerse Pro

## Обзор
Этот документ описывает API endpoints для Telegram Mini App MusicVerse Pro и интеграции с ботом.

## Базовый URL
```
Продакшн: https://ваш-домен.com
Разработка: http://localhost:3000
```

## Аутентификация
Все API запросы должны включать данные инициализации Telegram Web App для верификации.

### Заголовки
```
Content-Type: application/json
X-Telegram-Init-Data: <telegram_init_data>
```

## Endpoints

### 1. Аутентификация

#### Верификация данных Telegram Web App
```http
POST /api/auth/verify
```

**Тело запроса:**
```json
{
  "initData": "string"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Аутентификация успешна",
  "token": "jwt_token"
}
```

### 2. Управление пользователями

#### Получить данные пользователя
```http
GET /api/user/:userId
```

**Ответ:**
```json
{
  "userId": "123456",
  "playlists": [],
  "favorites": [],
  "settings": {
    "language": "ru",
    "theme": "dark"
  }
}
```

#### Обновить настройки пользователя
```http
PUT /api/user/:userId/settings
```

**Тело запроса:**
```json
{
  "language": "ru",
  "theme": "dark"
}
```

### 3. Музыкальные рекомендации

#### Получить рекомендации
```http
GET /api/recommendations/:userId
```

**Параметры запроса:**
- `limit` (опционально): Количество рекомендаций (по умолчанию: 10)
- `genre` (опционально): Фильтр по жанру

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Название трека",
      "artist": "Имя исполнителя",
      "genre": "Electronic",
      "duration": "3:45",
      "preview_url": "https://example.com/preview.mp3",
      "cover_url": "https://example.com/cover.jpg"
    }
  ]
}
```

### 4. Поиск

#### Поиск музыки
```http
GET /api/search
```

**Параметры запроса:**
- `q`: Поисковый запрос (обязательно)
- `type`: Тип поиска (track, artist, album) (по умолчанию: track)
- `limit`: Количество результатов (по умолчанию: 20)

**Ответ:**
```json
{
  "success": true,
  "results": [
    {
      "id": "1",
      "title": "Название трека",
      "artist": "Имя исполнителя",
      "type": "track"
    }
  ]
}
```

### 5. Плейлисты

#### Получить плейлисты пользователя
```http
GET /api/playlists/:userId
```

**Ответ:**
```json
{
  "success": true,
  "playlists": [
    {
      "id": "1",
      "name": "Мой плейлист",
      "description": "Описание",
      "track_count": 15,
      "cover_url": "https://example.com/cover.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Создать плейлист
```http
POST /api/playlists
```

**Тело запроса:**
```json
{
  "userId": "123456",
  "name": "Мой плейлист",
  "description": "Описание"
}
```

#### Добавить трек в плейлист
```http
POST /api/playlists/:playlistId/tracks
```

**Тело запроса:**
```json
{
  "trackId": "123"
}
```

### 6. Избранное

#### Получить избранное пользователя
```http
GET /api/favorites/:userId
```

**Ответ:**
```json
{
  "success": true,
  "favorites": [
    {
      "id": "1",
      "title": "Название трека",
      "artist": "Имя исполнителя",
      "added_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Добавить в избранное
```http
POST /api/favorites/:userId
```

**Тело запроса:**
```json
{
  "trackId": "123"
}
```

#### Удалить из избранного
```http
DELETE /api/favorites/:userId/:trackId
```

### 7. Проверка здоровья

#### Проверить здоровье API
```http
GET /health
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Ответы с ошибками

Все ответы с ошибками следуют этому формату:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Читаемое человеком сообщение об ошибке"
  }
}
```

### Общие коды ошибок
- `UNAUTHORIZED` (401): Неверная или отсутствующая аутентификация
- `FORBIDDEN` (403): У пользователя нет прав доступа
- `NOT_FOUND` (404): Ресурс не найден
- `VALIDATION_ERROR` (400): Неверные данные запроса
- `INTERNAL_ERROR` (500): Ошибка сервера

## Ограничение запросов
- Лимит: 100 запросов в минуту на пользователя
- Заголовки лимита включены в ответы:
  - `X-RateLimit-Limit`: Лимит запросов
  - `X-RateLimit-Remaining`: Оставшиеся запросы
  - `X-RateLimit-Reset`: Время сброса

## Webhooks

### Webhook бота
```http
POST /webhook/bot
```

Получает обновления от Telegram Bot API.

## Интеграция с внешними провайдерами музыки

### Настройка провайдера Music API

Бот интегрируется с внешними провайдерами музыкальных API (Spotify, Deezer и т.д.).

**Требуемая конфигурация:**
```env
MUSIC_API_BASE_URL=https://api.music-provider.com
MUSIC_API_KEY=ваш_api_ключ
MUSIC_API_SECRET=ваш_api_секрет
```

**Используемые endpoints провайдера:**
- `/search` - Поиск треков, исполнителей, альбомов
- `/recommendations` - Получение персонализированных рекомендаций
- `/tracks/:id` - Получение деталей трека
- `/playlists/:id` - Получение информации о плейлисте

## Поддержка WebSocket (будущее)

Функции реального времени будут использовать WebSocket соединения:

```javascript
ws://localhost:3000/ws?userId=123456
```

**События:**
- `track.play` - Начато воспроизведение трека
- `playlist.update` - Плейлист изменен
- `recommendation.new` - Доступны новые рекомендации
