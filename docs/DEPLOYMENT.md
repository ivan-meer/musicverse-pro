# Deployment Guide

## Prerequisites

- Node.js 16+ or Python 3.8+
- Telegram Bot Token (from @BotFather)
- Domain with HTTPS (required for Mini App)
- Database (PostgreSQL recommended)
- Redis (for caching, optional)

## Setup

### 1. Clone Repository
```bash
git clone https://github.com/ivan-meer/musicverse-pro.git
cd musicverse-pro
```

### 2. Install Dependencies

**For Node.js:**
```bash
npm install
```

**For Python:**
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username

# Mini App URL (must be HTTPS)
MINI_APP_URL=https://your-domain.com

# API Provider Configuration
MUSIC_API_KEY=your_api_key
MUSIC_API_SECRET=your_api_secret
MUSIC_API_BASE_URL=https://api.music-provider.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicverse
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your_random_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### 4. Setup Telegram Bot

1. Open Telegram and find @BotFather
2. Send `/newbot` and follow instructions
3. Save the bot token to `.env`
4. Configure bot settings:
   ```
   /setdescription - Set bot description
   /setabouttext - Set about text
   /setcommands - Set command list
   /setmenubutton - Configure menu button to open Mini App
   ```

5. Set up commands:
   ```
   start - Start the bot
   help - Show help information
   music - Get music recommendations
   search - Search for music
   playlists - View your playlists
   favorites - View favorite tracks
   settings - Configure bot settings
   ```

### 5. Setup Mini App

1. Go to @BotFather
2. Send `/newapp`
3. Select your bot
4. Provide:
   - App name: MusicVerse Pro
   - Description: Your personal music companion
   - Photo: Upload app icon (640x360)
   - GIF: Upload demo GIF (optional)
   - Web App URL: `https://your-domain.com`

## Deployment Options

### Option 1: Traditional Server (VPS)

#### Using Node.js

1. Install PM2:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start bot/index.js --name musicverse-pro
pm2 save
pm2 startup
```

3. Monitor application:
```bash
pm2 status
pm2 logs musicverse-pro
```

#### Using Python

1. Install systemd service:
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

2. Enable and start:
```bash
sudo systemctl enable musicverse
sudo systemctl start musicverse
sudo systemctl status musicverse
```

### Option 2: Docker

1. Build Docker image:
```bash
docker build -t musicverse-pro .
```

2. Run container:
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

Run with:
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku

1. Install Heroku CLI
2. Login and create app:
```bash
heroku login
heroku create musicverse-pro
```

3. Set environment variables:
```bash
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set MINI_APP_URL=https://musicverse-pro.herokuapp.com
```

4. Deploy:
```bash
git push heroku main
```

#### Vercel (for Mini App)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

#### Railway

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Option 4: Serverless

#### AWS Lambda + API Gateway

1. Package application
2. Create Lambda function
3. Set up API Gateway
4. Configure environment variables
5. Deploy

## NGINX Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

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

## SSL Certificate

### Using Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Setup

### PostgreSQL

```sql
CREATE DATABASE musicverse;
CREATE USER musicverse WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE musicverse TO musicverse;
```

### Migrations

Run initial migrations:
```bash
npm run migrate
# or
python manage.py migrate
```

## Monitoring

### Logging

Configure logging:
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

### Health Checks

Monitor endpoints:
- `/health` - Application health
- `/api/health` - API health

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

## Backup

### Database Backups

```bash
# Backup
pg_dump musicverse > backup_$(date +%Y%m%d).sql

# Restore
psql musicverse < backup_20240101.sql
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /usr/bin/pg_dump musicverse > /backups/backup_$(date +\%Y\%m\%d).sql
```

## Scaling

### Horizontal Scaling

1. Use load balancer (NGINX, HAProxy)
2. Multiple application instances
3. Shared Redis for session storage
4. Database replication

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Implement caching
4. Use CDN for static assets

## Troubleshooting

### Bot Not Responding

1. Check bot token
2. Verify network connectivity
3. Check logs: `pm2 logs`
4. Restart bot: `pm2 restart musicverse-pro`

### Mini App Not Loading

1. Verify HTTPS is configured
2. Check CORS settings
3. Verify Mini App URL in BotFather
4. Check browser console for errors

### Database Connection Issues

1. Verify DATABASE_URL
2. Check PostgreSQL is running
3. Test connection: `psql $DATABASE_URL`
4. Check firewall rules

## Security Checklist

- [ ] Use HTTPS for Mini App
- [ ] Validate Telegram Web App data
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Input validation and sanitization
- [ ] CORS configuration
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

## Performance Optimization

1. **Caching**: Use Redis for frequently accessed data
2. **Database Indexing**: Add indexes on frequently queried columns
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression
5. **Lazy Loading**: Implement lazy loading in Mini App
6. **Connection Pooling**: Use database connection pooling

## Maintenance

### Regular Tasks

- Monitor error logs daily
- Check system resources weekly
- Update dependencies monthly
- Review and rotate logs monthly
- Database optimization quarterly
- Security audit quarterly

### Updates

```bash
# Update dependencies
npm update
npm audit fix

# Restart application
pm2 restart musicverse-pro
```
