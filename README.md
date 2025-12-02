<div align="center">

# 🎵 MusicVerse Pro

### Ваш персональный музыкальный компаньон в Telegram

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue.svg)](https://core.telegram.org/bots)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING_RU.md)
[![Status](https://img.shields.io/badge/status-production%20ready-success)](docs/PROJECT_SUMMARY_RU.md)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](docker-compose.yml)
[![Documentation](https://img.shields.io/badge/docs-Russian%20%7C%20English-informational)](docs/)

[Возможности](#-возможности) • [Быстрый старт](#-быстрый-старт) • [Документация](#-документация) • [Развертывание](#-развертывание) • [Участие](#-участие-в-разработке)

---

**[🇷🇺 Русский](README.md)** | **[🇬🇧 English](docs/README_EN.md)**

</div>

---

## 📖 О проекте

MusicVerse Pro — это полнофункциональное Telegram Mini App с интеграцией бота для поиска музыки, управления плейлистами и персонализированных рекомендаций. Проект предоставляет надежную основу для создания музыкальной платформы, интегрированной с экосистемой Telegram.

### 🎯 Основные преимущества

- ⚡ **Быстрый старт** - Готовая структура проекта, запуск за 5 минут
- 🔒 **Безопасность** - Встроенная верификация Telegram Web App
- 📦 **Модульность** - Легко расширяемая архитектура
- 🐳 **Docker Ready** - Готовые конфигурации для контейнеризации
- 📚 **Документация** - Полная документация на русском и английском
- 🎨 **Адаптивный дизайн** - Работает на всех устройствах

## ✨ Возможности

<table>
<tr>
<td width="50%">

### 🤖 Telegram Bot
- Интерактивные команды
- Inline-клавиатуры
- Обработка callback-запросов
- Интеграция с Mini App
- Обработка ошибок и логирование

</td>
<td width="50%">

### 📱 Mini App
- Адаптивный дизайн
- Навигация по вкладкам
- Поиск и рекомендации
- Управление плейлистами
- Система избранного

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Безопасность
- Верификация данных Telegram
- HTTPS обязателен
- Ограничение запросов
- Валидация входных данных
- CORS конфигурация

</td>
<td width="50%">

### 🔌 Интеграции
- Spotify API
- Deezer API
- Apple Music API
- Last.fm API
- Расширяемая архитектура

</td>
</tr>
</table>

## 🚀 Быстрый старт

### Предварительные требования

```bash
Node.js 16+ или Python 3.8+
Telegram Bot Token (от @BotFather)
Домен с HTTPS (для Mini App)
```

### Установка

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/ivan-meer/musicverse-pro.git
cd musicverse-pro

# 2. Установите зависимости
npm install

# 3. Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env своими данными

# 4. Запустите приложение
npm start

# Для разработки с автоперезагрузкой:
npm run dev
```

### Настройка Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Сохраните токен в `.env`
4. Настройте команды бота:

```
start - Запустить бота
help - Показать справку
music - Получить рекомендации
search - Поиск музыки
playlists - Ваши плейлисты
favorites - Избранные треки
settings - Настройки
```

### ⚙️ Переменные окружения

```env
# Обязательные
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
MINI_APP_URL=https://your-domain.com

# Опциональные
MUSIC_API_KEY=your_api_key
MUSIC_API_SECRET=your_api_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=production
```

## 📁 Структура проекта

```
musicverse-pro/
├── 🤖 bot/                    # Backend Telegram бота
│   ├── index.js              # Точка входа
│   ├── handlers.js           # Обработчики команд
│   ├── webapp.js             # Маршруты веб-приложения
│   ├── middleware/           # Middleware (rate limiting)
│   ├── services/             # Бизнес-логика
│   └── utils/                # Утилиты (аутентификация)
│
├── 📱 miniapp/                # Frontend Mini App
│   ├── index.html            # Главный UI
│   ├── css/                  # Стили
│   └── js/                   # JavaScript
│
├── 📚 docs/                   # Документация
│   ├── API_SPECIFICATION.md
│   ├── BOT_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── GETTING_STARTED.md
│   ├── CONTRIBUTING.md
│   └── FAQ.md
│
├── 🐳 Docker                  # Контейнеризация
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── ⚙️ Конфигурация
    ├── package.json
    ├── .env.example
    ├── .eslintrc.json
    └── .prettierrc
```

## 📚 Документация

### 🇷🇺 Русская документация

| Документ | Описание |
|----------|----------|
| [🚀 Начало работы](docs/GETTING_STARTED_RU.md) | Пошаговое руководство по настройке |
| [📡 API спецификация](docs/API_SPECIFICATION_RU.md) | Полная документация REST API |
| [🤖 Спецификация бота](docs/BOT_SPECIFICATION_RU.md) | Команды и функции бота |
| [🏗️ Архитектура](docs/ARCHITECTURE_RU.md) | Дизайн системы и паттерны |
| [🚢 Развертывание](docs/DEPLOYMENT_RU.md) | Инструкции по развертыванию |
| [📋 Обзор проекта](docs/PROJECT_SUMMARY_RU.md) | Полный обзор проекта |
| [❓ FAQ](docs/FAQ_RU.md) | Часто задаваемые вопросы |
| [🤝 Участие](docs/CONTRIBUTING_RU.md) | Руководство для контрибьюторов |
| [🔒 Безопасность](SECURITY_RU.md) | Политика безопасности |
| [📝 История изменений](CHANGELOG_RU.md) | Журнал изменений |

### 🇬🇧 English Documentation

| Document | Description |
|----------|-------------|
| [🚀 Getting Started](docs/GETTING_STARTED.md) | Step-by-step setup guide |
| [📡 API Specification](docs/API_SPECIFICATION.md) | Complete REST API documentation |
| [🤖 Bot Specification](docs/BOT_SPECIFICATION.md) | Bot commands and features |
| [🏗️ Architecture](docs/ARCHITECTURE.md) | System design and patterns |
| [🚢 Deployment](docs/DEPLOYMENT.md) | Deployment instructions |
| [📋 Project Summary](docs/PROJECT_SUMMARY.md) | Complete project overview |
| [❓ FAQ](docs/FAQ.md) | Frequently asked questions |
| [🤝 Contributing](docs/CONTRIBUTING.md) | Contribution guidelines |
| [🔒 Security](SECURITY.md) | Security policy |
| [📝 Changelog](CHANGELOG.md) | Version history |

## 🛠️ Технологический стек

<table>
<tr>
<td>

### Backend
- Node.js / Express.js
- Telegram Bot API
- PostgreSQL
- Redis

</td>
<td>

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript
- Telegram Web App SDK

</td>
<td>

### DevOps
- Docker
- Docker Compose
- PM2
- NGINX

</td>
</tr>
</table>

## 🔌 API Endpoints

```javascript
POST   /api/auth/verify              // Верификация данных Telegram
GET    /api/user/:userId             // Получить данные пользователя
GET    /api/recommendations/:userId  // Получить рекомендации
GET    /api/playlists/:userId        // Получить плейлисты
POST   /api/playlists                // Создать плейлист
GET    /api/favorites/:userId        // Получить избранное
POST   /api/favorites/:userId        // Добавить в избранное
GET    /health                       // Проверка здоровья
```

Полная документация: [API Specification](docs/API_SPECIFICATION.md)

## 🤖 Команды бота

| Команда | Описание | Пример |
|---------|----------|--------|
| `/start` | Запустить бота и показать меню | `/start` |
| `/help` | Показать справочную информацию | `/help` |
| `/music` | Получить персональные рекомендации | `/music` |
| `/search [запрос]` | Поиск музыки | `/search электронная музыка` |
| `/playlists` | Просмотр плейлистов | `/playlists` |
| `/favorites` | Просмотр избранного | `/favorites` |
| `/settings` | Настройки бота | `/settings` |

### Примеры использования

```bash
# Поиск музыки
/search Daft Punk

# Получение рекомендаций
/music

# Просмотр избранного
/favorites
```

## 🚢 Развертывание

### Docker (рекомендуется)

```bash
# Запуск с Docker Compose
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Традиционный сервер

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start bot/index.js --name musicverse-pro

# Сохранение конфигурации
pm2 save
pm2 startup
```

### Облачные платформы

- **Heroku**: `git push heroku main`
- **Railway**: Подключите GitHub репозиторий
- **Vercel**: `vercel --prod`
- **AWS/DigitalOcean**: См. [руководство по развертыванию](docs/DEPLOYMENT.md)

## 🔒 Безопасность

- ✅ Верификация данных Telegram Web App (HMAC-SHA256)
- ✅ Проверка срока действия init data (TTL 1 час)
- ✅ Ограничение запросов (rate limiting)
- ✅ CORS конфигурация для доменов Telegram
- ✅ Валидация и санитизация входных данных
- ✅ HTTPS обязателен для Mini App
- ✅ Переменные окружения для секретов

Подробнее: [SECURITY.md](SECURITY.md)

## 🧪 Разработка

```bash
# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm test

# Проверка кода (linting)
npm run lint

# Форматирование кода
npm run format
```

## 🗺️ Дорожная карта

- [ ] WebSocket для обновлений в реальном времени
- [ ] Push-уведомления
- [ ] Социальные функции (шаринг плейлистов)
- [ ] AI-рекомендации на основе ML
- [ ] Аудио-стриминг
- [ ] Офлайн-режим
- [ ] Мультиязычность (i18n)
- [ ] Панель аналитики

## 🤝 Участие в разработке

Мы приветствуем вклад в проект! Пожалуйста, ознакомьтесь с [руководством для контрибьюторов](docs/CONTRIBUTING.md).

```bash
# 1. Форкните репозиторий
# 2. Создайте ветку для фичи
git checkout -b feature/amazing-feature

# 3. Закоммитьте изменения
git commit -m "Add: amazing feature"

# 4. Запушьте в ветку
git push origin feature/amazing-feature

# 5. Откройте Pull Request
```

## 📄 Лицензия

Этот проект распространяется под лицензией ISC. См. файл [LICENSE](LICENSE) для подробностей.

## 💬 Поддержка

- 📖 [Документация](docs/)
- 🐛 [Сообщить о проблеме](https://github.com/ivan-meer/musicverse-pro/issues)
- 💡 [Предложить функцию](https://github.com/ivan-meer/musicverse-pro/issues/new)
- 📧 Контакт: [@support](https://t.me/support)

## 🔗 Полезные ссылки

### Официальная документация
- [Telegram Bot API](https://core.telegram.org/bots/api) - Документация Bot API
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - Руководство по Mini Apps
- [BotFather](https://t.me/BotFather) - Создание и настройка ботов

### Музыкальные API
- [Spotify for Developers](https://developer.spotify.com/) - Spotify API
- [Deezer Developers](https://developers.deezer.com/) - Deezer API
- [Apple Music API](https://developer.apple.com/documentation/applemusicapi) - Apple Music
- [Last.fm API](https://www.last.fm/api) - Last.fm API

### Инструменты разработки
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express.js](https://expressjs.com/) - Web framework
- [Docker](https://www.docker.com/) - Контейнеризация
- [PostgreSQL](https://www.postgresql.org/) - База данных
- [Redis](https://redis.io/) - Кэширование

### Хостинг платформы
- [Heroku](https://www.heroku.com/) - Cloud platform
- [Railway](https://railway.app/) - Deploy platform
- [Vercel](https://vercel.com/) - Frontend hosting
- [DigitalOcean](https://www.digitalocean.com/) - VPS hosting

## 🙏 Благодарности

- [Telegram Bot API](https://core.telegram.org/bots/api) - За мощный API для ботов
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - За платформу Mini Apps
- Провайдеры музыкальных API - За доступ к музыкальным данным
- Open Source сообщество - За вдохновение и поддержку

## 📊 Статистика проекта

```
📁 Файлов кода: 15+
📝 Строк кода: 2000+
📚 Страниц документации: 10+
🌍 Языков: 2 (Русский, English)
⭐ Версия: 1.0.0
```

## 🗺️ Roadmap 2025

- [x] ✅ Базовая функциональность бота
- [x] ✅ Telegram Mini App
- [x] ✅ Система безопасности
- [x] ✅ Docker поддержка
- [x] ✅ Полная документация
- [ ] 🔄 WebSocket для real-time
- [ ] 🔄 Push-уведомления
- [ ] 🔄 AI-рекомендации
- [ ] 🔄 Аудио-стриминг
- [ ] 🔄 Социальные функции
- [ ] 🔄 Мобильное приложение

---

<div align="center">

**Сделано с ❤️ для музыкальных энтузиастов**

⭐ Поставьте звезду, если проект вам понравился!

[⬆ Наверх](#-musicverse-pro)

</div>