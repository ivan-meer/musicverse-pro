# MVP Requirements - MusicVerse Pro

## Introduction

MVP (Minimum Viable Product) для MusicVerse Pro - базовая рабочая версия Telegram бота с Mini App для управления музыкальными плейлистами и избранным.

**Цель:** Запустить работающий продукт за 4 недели

**Принцип:** Простота > Сложность. Работающее > Идеальное.

## Glossary

- **System**: MusicVerse Pro - Telegram бот с Mini App для управления музыкой
- **MVP**: Minimum Viable Product - минимально жизнеспособный продукт
- **Bot**: Telegram бот для взаимодействия с пользователями
- **Mini App**: Веб-приложение, встроенное в Telegram
- **User**: Пользователь Telegram, взаимодействующий с System
- **Supabase**: Backend-as-a-Service для базы данных
- **Playlist**: Коллекция музыкальных треков, принадлежащая User
- **Track**: Музыкальный трек с метаданными (название, исполнитель, ID)
- **Favorite**: Избранный Track пользователя
- **RLS**: Row Level Security - защита данных на уровне строк в базе данных
- **initData**: Данные аутентификации от Telegram Web App SDK

## Requirements

### Requirement 1: User Management

**User Story:** Как пользователь, я хочу зарегистрироваться в системе через Telegram, чтобы начать использовать бота.

#### Acceptance Criteria

1. WHEN User отправляет команду /start THEN THE System SHALL создать новую запись User в базе данных с telegram_id, username и first_name
2. WHEN User с существующим telegram_id отправляет команду /start THEN THE System SHALL обновить существующую запись User в базе данных
3. WHEN System получает ошибку от базы данных при регистрации User THEN THE System SHALL отправить User сообщение "Произошла ошибка, попробуйте позже"
4. WHEN System успешно создает или обновляет запись User THEN THE System SHALL отправить User приветственное сообщение

### Requirement 2: Playlist Management

**User Story:** Как пользователь, я хочу создавать и управлять плейлистами, чтобы организовать свою музыку.

#### Acceptance Criteria

1. WHEN User создает Playlist с названием и описанием THEN THE System SHALL сохранить Playlist в базе данных с привязкой к User
2. WHEN User добавляет Track в существующий Playlist THEN THE System SHALL создать запись связи между Playlist и Track в таблице playlist_tracks
3. WHEN User удаляет Playlist THEN THE System SHALL удалить Playlist и все связанные записи Track из таблицы playlist_tracks
4. WHEN User запрашивает список Playlist THEN THE System SHALL вернуть только Playlist, принадлежащие этому User
5. WHEN User обновляет название или описание Playlist THEN THE System SHALL сохранить изменения в базе данных

### Requirement 3: Favorites Management

**User Story:** Как пользователь, я хочу добавлять треки в избранное, чтобы быстро находить любимую музыку.

#### Acceptance Criteria

1. WHEN User добавляет Track в Favorite THEN THE System SHALL создать запись в таблице favorites с привязкой к User и track_id
2. WHEN User удаляет Track из Favorite THEN THE System SHALL удалить соответствующую запись из таблицы favorites
3. WHEN User запрашивает список Favorite THEN THE System SHALL вернуть все Track из таблицы favorites, принадлежащие этому User
4. WHEN User пытается добавить Track с существующим track_id в Favorite THEN THE System SHALL отклонить операцию и сохранить только одну запись

### Requirement 4: Bot Commands

**User Story:** Как пользователь, я хочу взаимодействовать с ботом через команды, чтобы управлять своей музыкой.

#### Acceptance Criteria

1. WHEN User отправляет команду /start THEN THE System SHALL отправить User приветственное сообщение с описанием возможностей Bot
2. WHEN User отправляет команду /help THEN THE System SHALL отправить User список всех доступных команд с описанием
3. WHEN User отправляет команду /playlists THEN THE System SHALL отправить User список всех Playlist, принадлежащих этому User
4. WHEN User отправляет команду /favorites THEN THE System SHALL отправить User список всех Track из Favorite этого User

### Requirement 5: Mini App Interface

**User Story:** Как пользователь, я хочу использовать Mini App для удобного управления музыкой.

#### Acceptance Criteria

1. WHEN User открывает Mini App THEN THE System SHALL верифицировать initData от Telegram и аутентифицировать User
2. WHEN Mini App успешно загружается THEN THE System SHALL отобразить список Playlist и Favorite, принадлежащих User
3. WHEN User создает новый Playlist через Mini App THEN THE System SHALL сохранить Playlist в базе данных с привязкой к User
4. WHEN User добавляет Track в Favorite через Mini App THEN THE System SHALL создать запись в таблице favorites

### Requirement 6: Data Security

**User Story:** Как пользователь, я хочу, чтобы мои данные были защищены от доступа других пользователей.

#### Acceptance Criteria

1. WHEN User запрашивает Playlist или Favorite THEN THE System SHALL вернуть только данные, принадлежащие этому User
2. WHEN RLS политики применяются к запросу базы данных THEN THE System SHALL блокировать доступ к данным других User
3. WHEN Mini App отправляет initData для аутентификации THEN THE System SHALL верифицировать подпись HMAC-SHA256 с использованием Bot token

### Requirement 7: API Endpoints

**User Story:** Как Mini App, мне нужны API endpoints для взаимодействия с backend.

#### Acceptance Criteria

1. WHEN Mini App отправляет GET запрос на /api/playlists/:userId THEN THE System SHALL вернуть JSON массив всех Playlist для указанного User
2. WHEN Mini App отправляет POST запрос на /api/playlists с данными Playlist THEN THE System SHALL создать новый Playlist и вернуть его ID
3. WHEN Mini App отправляет GET запрос на /api/favorites/:userId THEN THE System SHALL вернуть JSON массив всех Favorite для указанного User
4. WHEN Mini App отправляет POST запрос на /api/favorites с данными Track THEN THE System SHALL создать новую запись Favorite и вернуть подтверждение

### Requirement 8: Error Handling

**User Story:** Как пользователь, я хочу получать понятные сообщения об ошибках.

#### Acceptance Criteria

1. WHEN System получает ошибку от базы данных при выполнении операции THEN THE System SHALL отправить User сообщение "Произошла ошибка, попробуйте позже"
2. WHEN User отправляет некорректные данные в запросе THEN THE System SHALL отправить User сообщение с описанием конкретной ошибки валидации
3. WHEN Mini App не может подключиться к серверу THEN THE System SHALL отобразить User сообщение "Сервер недоступен, проверьте подключение"
4. WHEN System обрабатывает любую ошибку THEN THE System SHALL записать детали ошибки в console.log для отладки

## Out of Scope (НЕ в MVP)

Следующие функции НЕ включены в MVP:

- ❌ Redis кэширование
- ❌ Background jobs
- ❌ Аналитика
- ❌ Полнотекстовый поиск
- ❌ Система уведомлений
- ❌ Рекомендации
- ❌ Социальные функции
- ❌ Расширенная безопасность
- ❌ Мониторинг (кроме базовых логов)

Эти функции будут добавлены в Enhanced и Advanced фазах.

## Success Criteria

MVP считается успешным если:

- ✅ 50+ зарегистрированных пользователей
- ✅ 100+ созданных плейлистов
- ✅ 500+ треков в избранном
- ✅ < 5 критических багов
- ✅ Uptime > 95%
- ✅ Response time < 1s
- ✅ Все core функции работают

## Technical Constraints

- Node.js 18+
- Supabase (free tier)
- Telegram Bot API
- Telegram Web App SDK
- Express.js
- Vanilla JavaScript (no frameworks)

## Timeline

**4 недели:**
- Week 1: Foundation (Supabase, Express, Bot)
- Week 2: Core Features (Playlists, Favorites)
- Week 3: Mini App (UI, Integration)
- Week 4: Polish & Deploy

## Next Steps

После утверждения requirements:
1. Создать design.md с архитектурой
2. Детализировать tasks.md
3. Начать реализацию
