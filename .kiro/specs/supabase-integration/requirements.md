# Requirements Document

## Introduction

Данная спецификация описывает интеграцию MusicVerse Pro с Supabase в качестве backend-решения для хранения данных пользователей, плейлистов, избранного и рекомендаций. Также включает полную настройку и запуск Telegram Mini App и бота с использованием Supabase в качестве основной базы данных.

## Glossary

- **Supabase**: Open-source альтернатива Firebase, предоставляющая PostgreSQL базу данных, аутентификацию, storage и real-time подписки
- **Telegram Bot**: Серверное приложение, обрабатывающее команды пользователей через Telegram Bot API
- **Mini App**: Веб-приложение, встроенное в Telegram и использующее Telegram Web App SDK
- **System**: MusicVerse Pro - комплексная система, включающая бота, Mini App и Supabase backend
- **User**: Пользователь Telegram, взаимодействующий с ботом или Mini App
- **Playlist**: Коллекция музыкальных треков, созданная пользователем
- **Favorite**: Музыкальный трек, отмеченный пользователем как избранный
- **Recommendation**: Музыкальная рекомендация, сгенерированная системой для пользователя
- **Migration**: SQL-скрипт для создания или изменения структуры базы данных
- **RLS**: Row Level Security - механизм безопасности Supabase для контроля доступа к данным на уровне строк
- **Environment Variable**: Конфигурационная переменная, хранящаяся в файле .env

## Requirements

### Requirement 1

**User Story:** Как разработчик, я хочу настроить Supabase проект с необходимой схемой базы данных, чтобы система могла хранить данные пользователей, плейлисты и избранное.

#### Acceptance Criteria

1. WHEN разработчик создает Supabase проект THEN THE System SHALL предоставить SQL миграции для создания всех необходимых таблиц
2. WHEN миграции применяются THEN THE System SHALL создать таблицы users, playlists, playlist_tracks, favorites и recommendations с корректными связями
3. WHEN таблицы созданы THEN THE System SHALL настроить индексы для оптимизации запросов по telegram_id и user_id
4. WHEN схема базы данных создана THEN THE System SHALL применить Row Level Security политики для защиты данных пользователей
5. WHEN RLS политики применены THEN THE System SHALL разрешить пользователям доступ только к их собственным данным

### Requirement 2

**User Story:** Как разработчик, я хочу подключить Telegram бота к Supabase, чтобы бот мог сохранять и получать данные пользователей.

#### Acceptance Criteria

1. WHEN бот инициализируется THEN THE System SHALL установить соединение с Supabase используя переменные окружения SUPABASE_URL и SUPABASE_KEY
2. WHEN пользователь отправляет команду /start THEN THE System SHALL создать или обновить запись пользователя в таблице users с telegram_id, username и first_name
3. WHEN соединение с Supabase недоступно THEN THE System SHALL логировать ошибку и возвращать понятное сообщение пользователю
4. WHEN бот выполняет операции с базой данных THEN THE System SHALL использовать Supabase JavaScript клиент для всех запросов
5. WHEN происходит ошибка базы данных THEN THE System SHALL обрабатывать ошибку gracefully без падения бота

### Requirement 3

**User Story:** Как пользователь, я хочу создавать и управлять плейлистами через бота, чтобы организовать свою музыкальную коллекцию.

#### Acceptance Criteria

1. WHEN пользователь создает плейлист THEN THE System SHALL сохранить новую запись в таблице playlists с user_id, названием и описанием
2. WHEN пользователь добавляет трек в плейлист THEN THE System SHALL создать запись в таблице playlist_tracks со связью playlist_id и track_id
3. WHEN пользователь удаляет плейлист THEN THE System SHALL удалить плейлист и все связанные записи из playlist_tracks
4. WHEN пользователь запрашивает список плейлистов THEN THE System SHALL вернуть только плейлисты, принадлежащие этому пользователю
5. WHEN пользователь обновляет название плейлиста THEN THE System SHALL обновить соответствующую запись в таблице playlists

### Requirement 4

**User Story:** Как пользователь, я хочу добавлять треки в избранное через Mini App, чтобы быстро находить любимую музыку.

#### Acceptance Criteria

1. WHEN пользователь добавляет трек в избранное THEN THE System SHALL создать запись в таблице favorites с user_id и track_id
2. WHEN пользователь удаляет трек из избранного THEN THE System SHALL удалить соответствующую запись из таблицы favorites
3. WHEN пользователь запрашивает список избранного THEN THE System SHALL вернуть все треки из таблицы favorites для данного пользователя
4. WHEN пользователь пытается добавить дубликат в избранное THEN THE System SHALL предотвратить создание дубликата используя уникальный индекс
5. WHEN Mini App загружается THEN THE System SHALL аутентифицировать пользователя через Telegram Web App initData

### Requirement 5

**User Story:** Как разработчик, я хочу настроить переменные окружения для Telegram бота и Mini App, чтобы система могла корректно работать в разных окружениях.

#### Acceptance Criteria

1. WHEN разработчик настраивает проект THEN THE System SHALL предоставить .env.example файл со всеми необходимыми переменными
2. WHEN бот запускается THEN THE System SHALL валидировать наличие обязательных переменных TELEGRAM_BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY
3. WHEN отсутствует обязательная переменная окружения THEN THE System SHALL выбросить ошибку с понятным сообщением о недостающей переменной
4. WHEN Mini App загружается THEN THE System SHALL использовать MINI_APP_URL для корректной работы Telegram Web App SDK
5. WHEN система работает в production THEN THE System SHALL использовать SUPABASE_KEY с соответствующими правами доступа

### Requirement 6

**User Story:** Как разработчик, я хочу запустить систему локально для разработки, чтобы тестировать изменения перед деплоем.

#### Acceptance Criteria

1. WHEN разработчик выполняет npm install THEN THE System SHALL установить все необходимые зависимости включая @supabase/supabase-js
2. WHEN разработчик выполняет npm run dev THEN THE System SHALL запустить бота и Express сервер с hot reload
3. WHEN сервер запускается THEN THE System SHALL слушать на порту, указанном в переменной PORT
4. WHEN бот запускается THEN THE System SHALL установить webhook или использовать long polling в зависимости от конфигурации
5. WHEN Mini App открывается локально THEN THE System SHALL корректно загружать статические файлы из директории miniapp

### Requirement 7

**User Story:** Как разработчик, я хочу развернуть систему в production используя Docker, чтобы обеспечить консистентное окружение.

#### Acceptance Criteria

1. WHEN разработчик выполняет docker-compose up THEN THE System SHALL запустить все необходимые контейнеры
2. WHEN контейнеры запускаются THEN THE System SHALL использовать переменные окружения из .env файла
3. WHEN система работает в Docker THEN THE System SHALL корректно подключаться к Supabase через внешний URL
4. WHEN происходит перезапуск контейнера THEN THE System SHALL автоматически переподключиться к Supabase
5. WHEN система деплоится THEN THE System SHALL использовать HTTPS для Mini App URL согласно требованиям Telegram

### Requirement 8

**User Story:** Как пользователь, я хочу получать персонализированные рекомендации музыки, чтобы открывать новые треки.

#### Acceptance Criteria

1. WHEN система генерирует рекомендации THEN THE System SHALL сохранить их в таблице recommendations с user_id и track_id
2. WHEN пользователь запрашивает рекомендации THEN THE System SHALL вернуть треки из таблицы recommendations для данного пользователя
3. WHEN рекомендации устаревают THEN THE System SHALL обновить записи в таблице recommendations новыми треками
4. WHEN пользователь взаимодействует с рекомендацией THEN THE System SHALL обновить поле interaction_count в таблице recommendations
5. WHEN генерируются новые рекомендации THEN THE System SHALL учитывать избранное и историю прослушиваний пользователя

### Requirement 9

**User Story:** Как администратор системы, я хочу мониторить здоровье системы, чтобы быстро реагировать на проблемы.

#### Acceptance Criteria

1. WHEN выполняется запрос к /health endpoint THEN THE System SHALL проверить соединение с Supabase
2. WHEN Supabase доступен THEN THE System SHALL вернуть статус 200 с информацией о состоянии системы
3. WHEN Supabase недоступен THEN THE System SHALL вернуть статус 503 с деталями ошибки
4. WHEN бот запускается THEN THE System SHALL логировать успешное подключение к Supabase
5. WHEN происходят ошибки THEN THE System SHALL логировать детальную информацию для отладки

### Requirement 10

**User Story:** Как разработчик, я хочу иметь документацию по настройке и запуску системы, чтобы быстро начать работу с проектом.

#### Acceptance Criteria

1. WHEN разработчик открывает документацию THEN THE System SHALL предоставить пошаговую инструкцию по созданию Supabase проекта
2. WHEN разработчик следует инструкции THEN THE System SHALL предоставить все необходимые SQL скрипты для миграций
3. WHEN разработчик настраивает бота THEN THE System SHALL предоставить инструкции по получению TELEGRAM_BOT_TOKEN от @BotFather
4. WHEN разработчик настраивает Mini App THEN THE System SHALL предоставить инструкции по регистрации Mini App в @BotFather
5. WHEN возникают проблемы THEN THE System SHALL предоставить раздел troubleshooting с распространенными ошибками и решениями
