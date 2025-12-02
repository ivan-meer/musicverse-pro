# Примеры использования MusicVerse Pro

Этот каталог содержит примеры кода для интеграции с различными музыкальными API провайдерами.

## Доступные примеры

### 1. Интеграция с музыкальными провайдерами

#### Spotify API
```javascript
// examples/music-provider-example.js
const SpotifyProvider = require('./providers/spotify');

const spotify = new SpotifyProvider({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Поиск треков
const results = await spotify.search('electronic music', 'track');

// Получение рекомендаций
const recommendations = await spotify.getRecommendations(userId);
```

#### Deezer API
```javascript
const DeezerProvider = require('./providers/deezer');

const deezer = new DeezerProvider({
    apiKey: process.env.DEEZER_API_KEY
});

// Поиск треков
const results = await deezer.search('rock music');

// Получение деталей трека
const track = await deezer.getTrack(trackId);
```

## Структура провайдера

Все музыкальные провайдеры должны реализовывать следующий интерфейс:

```javascript
class MusicProvider {
    constructor(config) {
        this.config = config;
    }

    // Поиск треков, исполнителей или альбомов
    async search(query, type = 'track', limit = 20) {
        // Реализация
    }

    // Получение персонализированных рекомендаций
    async getRecommendations(userId, limit = 10) {
        // Реализация
    }

    // Получение деталей трека
    async getTrack(trackId) {
        // Реализация
    }

    // Получение информации о плейлисте
    async getPlaylist(playlistId) {
        // Реализация
    }
}
```

## Примеры использования

### Базовый поиск

```javascript
const musicService = require('../bot/services/musicService');

// Поиск треков
const searchResults = await musicService.search('jazz', {
    type: 'track',
    limit: 10
});

console.log(`Найдено ${searchResults.length} треков`);
searchResults.forEach(track => {
    console.log(`${track.artist} - ${track.title}`);
});
```

### Получение рекомендаций

```javascript
// Получение рекомендаций для пользователя
const recommendations = await musicService.getRecommendations(userId, {
    genre: 'electronic',
    limit: 5
});

// Отправка рекомендаций пользователю
bot.sendMessage(chatId, 'Вот ваши рекомендации:');
recommendations.forEach((track, index) => {
    bot.sendMessage(chatId, 
        `${index + 1}. ${track.artist} - ${track.title}\n` +
        `Жанр: ${track.genre} | Длительность: ${track.duration}`
    );
});
```

### Работа с плейлистами

```javascript
// Создание нового плейлиста
const playlist = await createPlaylist(userId, {
    name: 'Моя коллекция',
    description: 'Любимые треки'
});

// Добавление треков в плейлист
await addTrackToPlaylist(playlist.id, trackId);

// Получение треков плейлиста
const tracks = await getPlaylistTracks(playlist.id);
```

### Управление избранным

```javascript
// Добавление трека в избранное
await addToFavorites(userId, trackId);

// Получение избранных треков
const favorites = await getFavorites(userId);

// Удаление из избранного
await removeFromFavorites(userId, trackId);
```

## Обработка ошибок

```javascript
try {
    const results = await musicService.search(query);
    // Обработка результатов
} catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
        console.log('Превышен лимит запросов, повторите позже');
    } else if (error.code === 'INVALID_API_KEY') {
        console.log('Неверный API ключ');
    } else {
        console.error('Ошибка:', error.message);
    }
}
```

## Кэширование

```javascript
const redis = require('redis');
const client = redis.createClient();

// Кэширование результатов поиска
async function searchWithCache(query) {
    const cacheKey = `search:${query}`;
    
    // Проверка кэша
    const cached = await client.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Запрос к API
    const results = await musicService.search(query);
    
    // Сохранение в кэш (TTL: 30 минут)
    await client.setex(cacheKey, 1800, JSON.stringify(results));
    
    return results;
}
```

## Пагинация

```javascript
// Получение результатов с пагинацией
async function searchWithPagination(query, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const results = await musicService.search(query, {
        limit: limit,
        offset: offset
    });
    
    return {
        results: results,
        page: page,
        hasMore: results.length === limit
    };
}
```

## Интеграция с ботом

```javascript
// Обработчик команды поиска
bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    try {
        const results = await musicService.search(query);
        
        if (results.length === 0) {
            bot.sendMessage(chatId, 'Ничего не найдено');
            return;
        }
        
        // Создание inline-клавиатуры с результатами
        const keyboard = results.slice(0, 5).map(track => [{
            text: `${track.artist} - ${track.title}`,
            callback_data: `play:${track.id}`
        }]);
        
        bot.sendMessage(chatId, 'Результаты поиска:', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при поиске');
    }
});
```

## Тестирование

```javascript
// Пример unit теста
describe('MusicService', () => {
    it('должен возвращать результаты поиска', async () => {
        const results = await musicService.search('test');
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeGreaterThan(0);
    });
    
    it('должен обрабатывать ошибки API', async () => {
        await expect(
            musicService.search('')
        ).rejects.toThrow('Пустой запрос');
    });
});
```

## Дополнительные ресурсы

- [Документация Spotify API](https://developer.spotify.com/documentation/web-api/)
- [Документация Deezer API](https://developers.deezer.com/api)
- [Документация Apple Music API](https://developer.apple.com/documentation/applemusicapi)
- [Документация Last.fm API](https://www.last.fm/api)

## Поддержка

Если у вас возникли вопросы или проблемы с примерами:
- Откройте issue на GitHub
- Проверьте документацию в папке `docs/`
- Свяжитесь с мейнтейнерами проекта
