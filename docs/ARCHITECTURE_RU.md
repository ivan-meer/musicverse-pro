# Архитектура MusicVerse Pro

## Обзор системы

MusicVerse Pro — это Telegram Mini App с интеграцией бота, который предоставляет поиск музыки, управление плейлистами и персонализированные рекомендации через внешние API провайдеры.

## Диаграмма архитектуры

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
│                    Сервер приложения                       │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │   Обработчик     │      │   Веб-сервер     │          │
│  │     бота         │      │   (Express)      │          │
│  │  (Node.js/Python)│      └────────┬─────────┘          │
│  └────────┬─────────┘      ┌────────▼─────────┐          │
│           │                │                   │          │
│           │    ┌───────────┴────────┤          │          │
│           │    │                    │          │          │
│  ┌────────▼────▼───┐      ┌────────▼─────────┐          │
│  │  Бизнес-логика   │      │   API маршруты   │          │
│  │    Сервисы       │      │   и контроллеры  │          │
│  └────────┬─────────┘      └────────┬─────────┘          │
│           │                         │                     │
│           └────────┬────────────────┘                     │
│                    │                                       │
└────────────────────┼───────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼─────────┐ ┌▼──────────────┐
│  PostgreSQL  │ │   Redis    │ │  Внешний      │
│  База данных │ │   Кэш      │ │  Music API    │
│              │ │            │ │  (Spotify,    │
│              │ │            │ │   Deezer)     │
└──────────────┘ └────────────┘ └───────────────┘
```

## Компоненты

### 1. Обработчик Telegram бота

**Обязанности:**
- Получение и обработка команд бота
- Обработка callback-запросов
- Управление inline-клавиатурами
- Обработка данных Web App
- Отправка уведомлений

**Технологии:**
- Node.js: `node-telegram-bot-api`
- Python: `python-telegram-bot`

**Ключевые файлы:**
- `bot/index.js` - Инициализация бота
- `bot/handlers.js` - Обработчики команд
- `bot/services/` - Сервисы бизнес-логики

### 2. Веб-сервер (Backend Mini App)

**Обязанности:**
- Обслуживание статических файлов Mini App
- Предоставление REST API endpoints
- Обработка аутентификации
- Обработка запросов пользователей
- Интеграция с внешними API

**Технологии:**
- Express.js (Node.js)
- FastAPI (альтернатива на Python)

**Ключевые файлы:**
- `bot/webapp.js` - Маршруты веб-приложения
- `miniapp/` - Статические файлы (HTML, CSS, JS)

### 3. Telegram Mini App (Frontend)

**Обязанности:**
- Пользовательский интерфейс для просмотра музыки
- Управление плейлистами
- Обработка избранного
- Коммуникация с backend API
- Интеграция с Telegram Web App SDK

**Технологии:**
- HTML5
- CSS3
- Vanilla JavaScript
- Telegram Web App SDK

**Ключевые файлы:**
- `miniapp/index.html` - Главный UI
- `miniapp/css/style.css` - Стилизация
- `miniapp/js/app.js` - Логика приложения

### 4. Слой музыкального сервиса

**Обязанности:**
- Интеграция с внешними музыкальными API
- Кэширование музыкальных данных
- Трансформация ответов API
- Обработка ограничений API

**Технологии:**
- Axios (HTTP клиент)
- Redis (кэширование)

**Ключевые файлы:**
- `bot/services/musicService.js` - Интеграция Music API

### 5. Слой базы данных

**Обязанности:**
- Хранение данных пользователей
- Управление плейлистами
- Хранение избранного
- Настройки пользователей
- Данные аналитики

**Схема базы данных:**
```sql
-- Таблица пользователей
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP
);

-- Таблица плейлистов
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица треков
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

-- Связующая таблица треков плейлиста
CREATE TABLE playlist_tracks (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id),
    track_id VARCHAR(255) REFERENCES tracks(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER
);

-- Таблица избранного
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    track_id VARCHAR(255) REFERENCES tracks(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- Таблица настроек пользователя
CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    language VARCHAR(10) DEFAULT 'ru',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Слой кэша (Redis)

**Кэшируемые данные:**
- Музыкальные рекомендации (TTL: 1 час)
- Результаты поиска (TTL: 30 минут)
- Сессии пользователей (TTL: 24 часа)
- Ответы API (TTL: настраиваемый)
- Данные ограничения запросов

**Паттерны ключей:**
```
recommendations:user:{user_id}
search:{query}:{page}
session:{session_id}
ratelimit:api:{endpoint}:{user_id}
```

## Поток данных

### 1. Пользователь запускает бота

```
Пользователь → Telegram → Обработчик бота
                    ↓
              handleStart()
                    ↓
           Отправка приветственного сообщения
                    ↓
          Показ Inline-клавиатуры
                    ↓
              Пользователь ← Telegram
```

### 2. Пользователь открывает Mini App

```
Пользователь → Нажимает "Открыть Mini App" → Telegram
                                    ↓
                            Открывает URL Mini App
                                    ↓
                           Загружает HTML/CSS/JS
                                    ↓
                        Инициализирует Telegram SDK
                                    ↓
                           GET /api/user/:userId
                                    ↓
                         Загружает данные пользователя и UI
                                    ↓
                      GET /api/recommendations/:userId
                                    ↓
                    Проверка кэша Redis → Если промах:
                                    ↓
                          Запрос к Music API
                                    ↓
                          Сохранение в кэш
                                    ↓
                      Показ рекомендаций
```

### 3. Пользователь добавляет в избранное

```
Пользователь → Нажимает "Избранное" → Mini App
                            ↓
                   POST /api/favorites/:userId
                            ↓
                    Валидация и аутентификация
                            ↓
                   Сохранение в базу данных
                            ↓
                   Обновление кэша
                            ↓
                   Возврат успеха
                            ↓
                   Обновление UI
                            ↓
                   Пользователь видит обратную связь
```

### 4. Пользователь отправляет данные боту

```
Пользователь → Нажимает "Отправить боту" → Mini App
                                  ↓
                        Сбор данных избранного
                                  ↓
                    tg.sendData(JSON.stringify(data))
                                  ↓
                           Telegram SDK
                                  ↓
                          Обработчик бота
                                  ↓
                      bot.on('web_app_data')
                                  ↓
                        Обработка данных
                                  ↓
                   Отправка подтверждающего сообщения
                                  ↓
                          Пользователь ← Telegram
```

## Архитектура безопасности

### 1. Аутентификация

**Верификация данных Telegram Web App:**
```javascript
function verifyTelegramWebAppData(initData, botToken) {
    // Извлечение данных и хэша
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Сортировка и создание data-check-string
    const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    // Вычисление секретного ключа
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    
    // Верификация хэша
    const computedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    
    return hash === computedHash;
}
```

### 2. Ограничение запросов

**Реализация:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 100, // 100 запросов на окно
    message: 'Слишком много запросов'
});

app.use('/api/', limiter);
```

### 3. Валидация входных данных

- Санитизация всех пользовательских вводов
- Валидация параметров запросов
- Использование параметризованных запросов
- Экранирование HTML вывода

### 4. Конфигурация CORS

```javascript
app.use(cors({
    origin: [
        'https://web.telegram.org',
        'https://telegram.org'
    ],
    credentials: true
}));
```

## Соображения масштабируемости

### 1. Горизонтальное масштабирование

- Балансировщик нагрузки (NGINX/HAProxy)
- Несколько экземпляров приложения
- Архитектура без состояния
- Общий кэш (Redis)
- Репликация базы данных

### 2. Стратегия кэширования

- Кэширование часто запрашиваемых данных
- Использование Redis для хранения сессий
- Кэширование ответов API
- Реализация инвалидации кэша

### 3. Оптимизация базы данных

- Индексация часто запрашиваемых колонок
- Использование connection pooling
- Реализация read replicas
- Регулярная оптимизация запросов

### 4. Ограничение API

- Реализация лимитов на пользователя
- Кэширование ответов API
- Использование очередей для массовых операций
- Пакетирование API запросов

## Мониторинг и логирование

### 1. Логи приложения

- Логи запросов/ответов
- Логи ошибок
- Метрики производительности
- Логи активности пользователей

### 2. Отслеживаемые метрики

- Время ответа
- Частота ошибок
- Частота вызовов API
- Вовлеченность пользователей
- Процент попаданий в кэш

### 3. Оповещения

- Порог частоты ошибок
- Деградация времени ответа
- Сбои API
- Проблемы с подключением к базе данных

## Рабочий процесс разработки

```
Разработка → Тестирование → Staging → Продакшн
     ↓           ↓         ↓          ↓
  Локальный ПК  Unit Tests  QA     Реальные пользователи
     ↓           ↓         ↓          ↓
  Hot Reload  Integration UAT    Мониторинг
               Tests
```

## Точки интеграции API

### Внешние провайдеры Music API

**Поддерживаемые провайдеры:**
1. Spotify API
2. Deezer API
3. Apple Music API
4. Last.fm API

**Паттерн интеграции:**
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

// Паттерн фабрики для выбора провайдера
function createMusicProvider(type) {
    switch(type) {
        case 'spotify':
            return new SpotifyProvider(config);
        case 'deezer':
            return new DeezerProvider(config);
        default:
            throw new Error('Неизвестный провайдер');
    }
}
```

## Обработка ошибок

### Глобальный обработчик ошибок

```javascript
app.use((err, req, res, next) => {
    logger.error(err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Внутренняя ошибка сервера'
        }
    });
});
```

## Будущие улучшения

1. **Поддержка WebSocket** - Обновления в реальном времени
2. **Push-уведомления** - Уведомления Telegram
3. **Социальные функции** - Шаринг плейлистов с друзьями
4. **AI рекомендации** - Предложения на основе машинного обучения
5. **Аудио-стриминг** - Воспроизведение музыки в приложении
6. **Офлайн-режим** - Кэш для офлайн доступа
7. **Мультиязычность** - Интернационализация
8. **Панель аналитики** - Админ-панель
