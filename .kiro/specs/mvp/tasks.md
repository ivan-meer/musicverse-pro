# MVP Implementation Tasks

## Overview

**Goal:** Launch basic working version in 4 weeks
**Focus:** Core functionality without optimization
**Principle:** Simple, working, deployable

---

## Week 1: Foundation

### Task 1.1: Setup Supabase Project (2 days)

- [ ] 1.1.1 Create Supabase account and project
  - Go to https://supabase.com
  - Create new project
  - Choose region
  - Save credentials

- [ ] 1.1.2 Create basic database schema
  - Create users table
  - Create playlists table
  - Create playlist_tracks table
  - Create favorites table

- [ ] 1.1.3 Setup Row Level Security
  - Enable RLS on all tables
  - Create basic policies
  - Test policies

- [ ] 1.1.4 Test database connection
  - Connect from local machine
  - Run test queries
  - Verify RLS works

**SQL Schema:**
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Tracks
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);
```

### Task 1.2: Setup Express Server (1 day)

- [ ] 1.2.1 Initialize Node.js project
  ```bash
  npm init -y
  npm install express dotenv @supabase/supabase-js cors
  npm install --save-dev nodemon
  ```

- [ ] 1.2.2 Create basic server structure
  - Create bot/index.js
  - Setup Express app
  - Add basic routes
  - Add error handling

- [ ] 1.2.3 Setup Supabase client
  - Create bot/services/supabaseClient.js
  - Initialize client with credentials
  - Export for use in services

- [ ] 1.2.4 Test server
  - Start server
  - Test /health endpoint
  - Verify Supabase connection

**Code:**
```javascript
// bot/index.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('miniapp'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Task 1.3: Create Telegram Bot (2 days)

- [ ] 1.3.1 Create bot with @BotFather
  - Open @BotFather in Telegram
  - Send /newbot
  - Save bot token

- [ ] 1.3.2 Install bot dependencies
  ```bash
  npm install node-telegram-bot-api
  ```

- [ ] 1.3.3 Implement basic bot
  - Create bot instance
  - Add /start command
  - Add /help command
  - Test bot responds

- [ ] 1.3.4 Connect bot to database
  - Save user on /start
  - Test user creation

**Code:**
```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  // Save user to database
  await createOrUpdateUser(user);
  
  bot.sendMessage(chatId, 'Welcome to MusicVerse Pro!');
});
```

---

## Week 2: Core Features

### Task 2.1: Implement User Management (2 days)

- [ ] 2.1.1 Create UserService
  - Create bot/services/userService.js
  - Implement createOrUpdateUser
  - Implement getUserByTelegramId
  - _Requirements: 1.1, 1.2_

- [ ] 2.1.2 Update /start command
  - Create/update user on /start
  - Send personalized welcome
  - Handle errors gracefully
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2.1.3 Write property test for user registration idempotence
  - **Property 1: User registration idempotence**
  - **Validates: Requirements 1.2**
  - Setup fast-check and jest
  - Test that calling /start multiple times results in one user record

- [ ] 2.1.4 Write property test for user data persistence
  - **Property 2: User data persistence**
  - **Validates: Requirements 1.1**
  - Test that all fields (telegram_id, username, first_name) are stored

### Task 2.2: Implement Playlists (2 days)

- [ ] 2.2.1 Create PlaylistService
  - Create bot/services/playlistService.js
  - Implement createPlaylist
  - Implement getUserPlaylists
  - Implement addTrackToPlaylist
  - Implement deletePlaylist
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.2.2 Add playlist commands
  - /playlists - list playlists
  - /createplaylist - create new
  - Handle inline keyboards
  - _Requirements: 4.3_

- [ ] 2.2.3 Add API endpoints
  - GET /api/playlists/:userId
  - POST /api/playlists
  - POST /api/playlists/:id/tracks
  - DELETE /api/playlists/:id
  - _Requirements: 7.1, 7.2_

- [ ] 2.2.4 Write property test for playlist creation persistence
  - **Property 3: Playlist creation persistence**
  - **Validates: Requirements 2.1**
  - Test that creating a playlist stores it with correct data

- [ ] 2.2.5 Write property test for playlist-track association
  - **Property 4: Playlist-track association**
  - **Validates: Requirements 2.2**
  - Test that adding a track creates verifiable association

- [ ] 2.2.6 Write property test for cascade deletion
  - **Property 5: Cascade deletion**
  - **Validates: Requirements 2.3**
  - Test that deleting playlist also deletes all associated tracks

- [ ] 2.2.7 Write property test for playlist data isolation
  - **Property 6: Data isolation for playlists**
  - **Validates: Requirements 2.4, 6.1**
  - Test that users only see their own playlists

### Task 2.3: Implement Favorites (1 day)

- [ ] 2.3.1 Create FavoritesService
  - Create bot/services/favoritesService.js
  - Implement addToFavorites
  - Implement removeFromFavorites
  - Implement getUserFavorites
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2.3.2 Add favorites command
  - /favorites - list favorites
  - Handle add/remove actions
  - _Requirements: 4.4_

- [ ] 2.3.3 Add API endpoints
  - GET /api/favorites/:userId
  - POST /api/favorites
  - DELETE /api/favorites/:id
  - _Requirements: 7.3, 7.4_

- [ ] 2.3.4 Write property test for favorites creation persistence
  - **Property 7: Favorites creation persistence**
  - **Validates: Requirements 3.1**
  - Test that adding to favorites creates a record

- [ ] 2.3.5 Write property test for favorites deletion
  - **Property 8: Favorites deletion**
  - **Validates: Requirements 3.2**
  - Test that removing from favorites deletes the record

- [ ] 2.3.6 Write property test for favorites data isolation
  - **Property 9: Data isolation for favorites**
  - **Validates: Requirements 3.3, 6.1**
  - Test that users only see their own favorites

- [ ] 2.3.7 Write property test for favorites uniqueness
  - **Property 10: Favorites uniqueness**
  - **Validates: Requirements 3.4**
  - Test that adding duplicate track results in only one record

### Task 2.4: Checkpoint - Ensure all tests pass

- [ ] 2.4.1 Ensure all tests pass, ask the user if questions arise

---

## Week 3: Mini App

### Task 3.1: Create Mini App UI (2 days)

- [ ] 3.1.1 Create HTML structure
  - Create miniapp/index.html
  - Add basic layout
  - Add navigation tabs

- [ ] 3.1.2 Add CSS styling
  - Create miniapp/css/style.css
  - Style for Telegram theme
  - Make responsive

- [ ] 3.1.3 Add JavaScript
  - Create miniapp/js/app.js
  - Initialize Telegram Web App SDK
  - Add tab switching

- [ ] 3.1.4 Test Mini App
  - Test in Telegram
  - Test on mobile
  - Test navigation

### Task 3.2: Connect Mini App to API (2 days)

- [ ] 3.2.1 Implement authentication
  - Get initData from Telegram
  - Send to server for verification
  - Store user data
  - _Requirements: 5.1, 6.3_

- [ ] 3.2.2 Fetch and display playlists
  - Call /api/playlists
  - Render playlists
  - Handle loading states
  - _Requirements: 5.2_

- [ ] 3.2.3 Fetch and display favorites
  - Call /api/favorites
  - Render favorites
  - Handle empty states
  - _Requirements: 5.2_

- [ ] 3.2.4 Write property test for RLS policy enforcement
  - **Property 11: RLS policy enforcement**
  - **Validates: Requirements 6.2**
  - Test that RLS blocks access to other users' data

- [ ] 3.2.5 Write property test for Telegram authentication verification
  - **Property 12: Telegram authentication verification**
  - **Validates: Requirements 6.3**
  - Test that system verifies valid signatures and rejects invalid ones

### Task 3.3: Add Mini App Actions (1 day)

- [ ] 3.3.1 Add create playlist
  - Add create button
  - Show input form
  - Call API
  - Update UI
  - _Requirements: 5.3_

- [ ] 3.3.2 Add to favorites
  - Add favorite buttons
  - Call API
  - Update UI
  - Show feedback
  - _Requirements: 5.4_

- [ ] 3.3.3 Add remove actions
  - Add delete buttons
  - Confirm before delete
  - Call API
  - Update UI
  - _Requirements: 2.3, 3.2_

- [ ] 3.3.4 Write property test for input validation error messages
  - **Property 13: Input validation error messages**
  - **Validates: Requirements 8.2**
  - Test that invalid input returns specific error messages

- [ ] 3.3.5 Write property test for error logging
  - **Property 14: Error logging**
  - **Validates: Requirements 8.4**
  - Test that errors are logged to console for debugging

### Task 3.4: Checkpoint - Ensure all tests pass

- [ ] 3.4.1 Ensure all tests pass, ask the user if questions arise

---

## Week 4: Polish & Deploy

### Task 4.1: Testing (2 days)

- [ ] 4.1.1 Manual testing
  - Test all bot commands
  - Test all Mini App features
  - Test on different devices
  - Create test checklist

- [ ] 4.1.2 Fix critical bugs
  - Fix any crashes
  - Fix data loss issues
  - Fix UI issues
  - Prioritize by severity

- [ ] 4.1.3 Performance testing
  - Test with multiple users
  - Check response times
  - Check database queries
  - Optimize if needed

- [ ] 4.1.4 Security check
  - Verify RLS works
  - Check authentication
  - Test input validation
  - Fix security issues

### Task 4.2: Documentation (1 day)

- [ ] 4.2.1 Write README
  - Project description
  - Setup instructions
  - Environment variables
  - Running locally

- [ ] 4.2.2 Document API
  - List all endpoints
  - Request/response examples
  - Error codes

- [ ] 4.2.3 Create .env.example
  - List all variables
  - Add descriptions
  - Add example values

- [ ] 4.2.4 Write deployment guide
  - Server requirements
  - Deployment steps
  - Troubleshooting

### Task 4.3: Deploy MVP (2 days)

- [ ] 4.3.1 Setup Docker
  - Create Dockerfile
  - Create docker-compose.yml
  - Test locally

- [ ] 4.3.2 Deploy to VPS
  - Setup server
  - Install Docker
  - Clone repository
  - Configure environment

- [ ] 4.3.3 Configure domain & SSL
  - Point domain to server
  - Setup Nginx
  - Get SSL certificate
  - Configure HTTPS

- [ ] 4.3.4 Test in production
  - Test bot
  - Test Mini App
  - Test all features
  - Monitor for issues

### Task 4.4: Final Checkpoint - Ensure all tests pass

- [ ] 4.4.1 Ensure all tests pass, ask the user if questions arise

---

## MVP Checklist

### Functionality:
- [ ] Users can register via /start
- [ ] Users can create playlists
- [ ] Users can add tracks to playlists
- [ ] Users can add tracks to favorites
- [ ] Users can view playlists in Mini App
- [ ] Users can view favorites in Mini App
- [ ] Users can create playlists from Mini App
- [ ] Users can add favorites from Mini App

### Technical:
- [ ] Database schema created
- [ ] RLS policies working
- [ ] Bot responds to commands
- [ ] API endpoints working
- [ ] Mini App loads
- [ ] Authentication works
- [ ] Error handling in place

### Deployment:
- [ ] Docker setup complete
- [ ] Deployed to server
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Monitoring basic logs

### Documentation:
- [ ] README written
- [ ] API documented
- [ ] .env.example created
- [ ] Deployment guide written

---

## Success Criteria

- ✅ 50+ registered users in first week
- ✅ 100+ playlists created
- ✅ 500+ tracks in favorites
- ✅ < 5 critical bugs reported
- ✅ Uptime > 95%
- ✅ Response time < 1s
- ✅ All core features working

---

## Next Steps After MVP

1. **Gather Feedback:**
   - Ask users what they like
   - Ask what's missing
   - Track usage metrics

2. **Decide on Enhanced:**
   - Review feedback
   - Check metrics
   - Decide if worth continuing

3. **Plan Enhanced Phase:**
   - Prioritize features
   - Estimate timeline
   - Start Week 5

**Ready to start? Begin with Task 1.1!** 🚀
