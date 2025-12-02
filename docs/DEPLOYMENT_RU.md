# Руководство по развертыванию

## Предварительные требования

- Node.js 16+ или Python 3.8+
- Telegram Bot Token (от @BotFather)
- Домен с HTTPS (требуется для Mini App)
- База данных (рекомендуется PostgreSQL)
- Redis (для кэширования, опционально)

## Настройка

### 1. Клонирование репозитория
```bash
git clone https://github.com/ivan-meer/musicverse-pro.git
cd musicverse-pro
```

### 2. Установка зависимостей

**Для Node.js:**
```bash
npm install
```

**Для Python:**
```bash
pip install -r requirements.txt
```

### 3. Настройка переменных окружения

Скопируйте файл с примером переменных окружения:
```bash
cp .env.example .env
```

Отредактируйте `.env` вашей конфигурацией:
```env
# Конфигурация Telegram
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
TELEGRAM_BOT_USERNAME=username_вашего_бота

# URL Mini App (должен быть HTTPS)
MINI_APP_URL=https://ваш-домен.com

# Конфигурация API провайдера
MUSIC_API_KEY=ваш_api_ключ
MUSIC_API_SECRET=ваш_api_секрет
MUSIC_API_BASE_URL=https://api.music-provider.com

# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/musicverse
REDIS_URL=redis://localhost:6379

# Сервер
PORT=3000
NODE_ENV=production

# Безопасность
JWT_SECRET=ваш_случайный_секретный_ключ
ENCRYPTION_KEY=ваш_ключ_шифрования
```

### 4. Настройка Telegram бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте `/newbot` и следуйте инструкциям
3. Сохраните токен бота в `.env`
4. Настройте параметры бота:
   ```
   /setdescription - Установить описание бота
   /setabouttext - Установить текст "О боте"
   /setcommands - Установить список команд
   /setmenubutton - Настроить кнопку меню для открытия Mini App
   ```

5. Установите команды:
   ```
   start - Запустить бота
   help - Показать справку
   music - Получить рекомендации
   search - Поиск музыки
   playlists - Ваши плейлисты
   favorites - Избранные треки
   settings - Настройки
   ```

### 5. Настройка Mini App

1. Перейдите в @BotFather
2. Отправьте `/newapp`
3. Выберите вашего бота
4. Предоставьте:
   - Название приложения: MusicVerse Pro
   - Описание: Ваш персональный музыкальный компаньон
   - Фото: Загрузите иконку приложения (640x360)
   - GIF: Загрузите демо GIF (опционально)
   - Web App URL: `https://ваш-домен.com`

## Варианты развертывания

### Вариант 1: Традиционный сервер (VPS)

#### Использование Node.js

1. Установите PM2:
```bash
npm install -g pm2
```

2. Запустите приложение:
```bash
pm2 start bot/index.js --name musicverse-pro
pm2 save
pm2 startup
```

3. Мониторинг приложения:
```bash
pm2 status
pm2 logs musicverse-pro
```

#### Использование Python

1. Установите systemd сервис:
```bash
sudo nano /etc/systemd/system/musicverse.service
```

```ini
[Unit]
Description=MusicVerse Pro Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/musicverse-pro
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
ExecStart=/usr/bin/node bot/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Включите и запустите:
```bash
sudo systemctl enable musicverse
sudo systemctl start musicverse
sudo systemctl status musicverse
```

### Вариант 2: Docker

1. Соберите Docker образ:
```bash
docker build -t musicverse-pro .
```

2. Запустите контейнер:
```bash
docker run -d \
  --name musicverse-pro \
  -p 3000:3000 \
  --env-file .env \
  musicverse-pro
```

3. Docker Compose:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: musicverse
      POSTGRES_USER: musicverse
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Запустите с помощью:
```bash
docker-compose up -d
```

### Вариант 3: Облачные платформы

#### Heroku

1. Установите Heroku CLI
2. Войдите и создайте приложение:
```bash
heroku login
heroku create musicverse-pro
```

3. Установите переменные окружения:
```bash
heroku config:set TELEGRAM_BOT_TOKEN=ваш_токен
heroku config:set MINI_APP_URL=https://musicverse-pro.herokuapp.com
```

4. Разверните:
```bash
git push heroku main
```

#### Vercel (для Mini App)

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Разверните:
```bash
vercel --prod
```

3. Настройте переменные окружения в панели Vercel

#### Railway

1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Автоматическое развертывание

### Вариант 4: Serverless

#### AWS Lambda + API Gateway

1. Упакуйте приложение
2. Создайте Lambda функцию
3. Настройте API Gateway
4. Настройте переменные окружения
5. Разверните

## Конфигурация NGINX

```nginx
server {
    listen 80;
    server_name ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL сертификат

### Использование Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.com
```

## Настройка базы данных

### PostgreSQL

```sql
CREATE DATABASE musicverse;
CREATE USER musicverse WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE musicverse TO musicverse;
```

### Миграции

Запустите начальные миграции:
```bash
npm run migrate
# или
python manage.py migrate
```

## Мониторинг

### Логирование

Настройте логирование:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Проверки здоровья

Мониторинг endpoints:
- `/health` - Здоровье приложения
- `/api/health` - Здоровье API

### Мониторинг uptime

Используйте сервисы:
- UptimeRobot
- Pingdom
- StatusCake

## Резервное копирование

### Резервные копии базы данных

```bash
# Резервное копирование
pg_dump musicverse > backup_$(date +%Y%m%d).sql

# Восстановление
psql musicverse < backup_20240101.sql
```

### Автоматические резервные копии

```bash
# Добавьте в crontab
0 2 * * * /usr/bin/pg_dump musicverse > /backups/backup_$(date +\%Y\%m\%d).sql
```

## Масштабирование

### Горизонтальное масштабирование

1. Используйте балансировщик нагрузки (NGINX, HAProxy)
2. Несколько экземпляров приложения
3. Общий Redis для хранения сессий
4. Репликация базы данных

### Вертикальное масштабирование

1. Увеличьте ресурсы сервера
2. Оптимизируйте запросы к базе данных
3. Реализуйте кэширование
4. Используйте CDN для статических ресурсов

## Устранение неполадок

### Бот не отвечает

1. Проверьте токен бота
2. Проверьте сетевое подключение
3. Проверьте логи: `pm2 logs`
4. Перезапустите бота: `pm2 restart musicverse-pro`

### Mini App не загружается

1. Проверьте настройку HTTPS
2. Проверьте настройки CORS
3. Проверьте URL Mini App в BotFather
4. Проверьте консоль браузера на ошибки

### Проблемы с подключением к базе данных

1. Проверьте DATABASE_URL
2. Проверьте, что PostgreSQL запущен
3. Протестируйте подключение: `psql $DATABASE_URL`
4. Проверьте правила файрвола

## Чек-лист безопасности

- [ ] Используйте HTTPS для Mini App
- [ ] Валидируйте данные Telegram Web App
- [ ] Реализуйте ограничение запросов
- [ ] Используйте переменные окружения для секретов
- [ ] Регулярные обновления безопасности
- [ ] Шифрование подключения к базе данных
- [ ] Валидация и санитизация входных данных
- [ ] Конфигурация CORS
- [ ] Регулярные резервные копии
- [ ] Мониторинг логов на подозрительную активность

## Оптимизация производительности

1. **Кэширование**: Используйте Redis для часто запрашиваемых данных
2. **Индексация БД**: Добавьте индексы на часто запрашиваемые колонки
3. **CDN**: Используйте CDN для статических ресурсов
4. **Сжатие**: Включите gzip сжатие
5. **Ленивая загрузка**: Реализуйте ленивую загрузку в Mini App
6. **Connection Pooling**: Используйте пулы подключений к БД

## Обслуживание

### Регулярные задачи

- Мониторинг логов ошибок ежедневно
- Проверка системных ресурсов еженедельно
- Обновление зависимостей ежемесячно
- Просмотр и ротация логов ежемесячно
- Оптимизация базы данных ежеквартально
- Аудит безопасности ежеквартально

### Обновления

```bash
# Обновление зависимостей
npm update
npm audit fix

# Перезапуск приложения
pm2 restart musicverse-pro
```
