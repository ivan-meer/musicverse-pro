# Telegram Bot Specification

## Bot Commands

### Basic Commands

#### /start
- **Description**: Initialize bot and show welcome message
- **Usage**: `/start`
- **Response**: Welcome message with inline keyboard containing:
  - "🚀 Open Mini App" (Web App button)
  - "🎵 Discover Music" (Callback)
  - "⚙️ Settings" (Callback)
  - "❓ Help" (Callback)

#### /help
- **Description**: Display help information and available commands
- **Usage**: `/help`
- **Response**: List of all commands and features

#### /music
- **Description**: Get personalized music recommendations
- **Usage**: `/music`
- **Response**: 
  - Loading message
  - List of 5 recommended tracks with details
  - Button to open recommendations in Mini App

#### /search [query]
- **Description**: Search for music
- **Usage**: `/search electronic music`
- **Response**: Search results with track information

#### /playlists
- **Description**: View user's playlists
- **Usage**: `/playlists`
- **Response**: List of playlists with inline buttons

#### /favorites
- **Description**: View favorite tracks
- **Usage**: `/favorites`
- **Response**: List of favorite tracks

### Advanced Commands

#### /settings
- **Description**: Configure bot settings
- **Usage**: `/settings`
- **Options**:
  - Language selection
  - Notification preferences
  - API provider selection

#### /stats
- **Description**: View listening statistics
- **Usage**: `/stats`
- **Response**: User statistics and insights

## Callback Queries

### Main Menu Callbacks
- `open_app` - Open Mini App
- `discover` - Show music discovery options
- `settings` - Open settings menu
- `help` - Show help information

### Music Actions
- `play:track_id` - Play track
- `favorite:track_id` - Add/remove from favorites
- `playlist:playlist_id` - View playlist
- `share:track_id` - Share track

### Pagination
- `next:page_num` - Next page
- `prev:page_num` - Previous page

## Inline Keyboards

### Main Menu
```javascript
{
  inline_keyboard: [
    [
      { text: '🚀 Open Mini App', web_app: { url: MINI_APP_URL } }
    ],
    [
      { text: '🎵 Discover', callback_data: 'discover' },
      { text: '⚙️ Settings', callback_data: 'settings' }
    ],
    [
      { text: '❓ Help', callback_data: 'help' }
    ]
  ]
}
```

### Track Actions
```javascript
{
  inline_keyboard: [
    [
      { text: '▶️ Play', callback_data: 'play:123' },
      { text: '❤️ Favorite', callback_data: 'favorite:123' }
    ],
    [
      { text: '➕ Add to Playlist', callback_data: 'add_playlist:123' },
      { text: '📤 Share', callback_data: 'share:123' }
    ]
  ]
}
```

## Web App Integration

### Web App Button
```javascript
{
  text: 'Open App',
  web_app: {
    url: 'https://your-domain.com'
  }
}
```

### Receiving Data from Web App
The bot receives data when users send information from the Mini App:

```javascript
bot.on('web_app_data', (msg) => {
  const data = JSON.parse(msg.web_app_data.data);
  // Process data
});
```

**Expected Data Format:**
```json
{
  "action": "share_favorites",
  "favorites": ["track_id_1", "track_id_2"],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Bot Configuration

### Environment Variables
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
MINI_APP_URL=https://your-domain.com
```

### Bot Settings (BotFather)
1. **Name**: MusicVerse Pro
2. **Description**: Your personal music companion with AI-powered recommendations
3. **About**: Discover, organize, and enjoy music with MusicVerse Pro
4. **Commands**:
   ```
   start - Start the bot
   help - Show help information
   music - Get music recommendations
   search - Search for music
   playlists - View your playlists
   favorites - View favorite tracks
   settings - Configure bot settings
   ```

### Inline Mode (Optional)
Enable inline mode for sharing tracks:
```
@musicverse_bot electronic music
```

## Message Formatting

### Markdown Format
```markdown
*Bold text*
_Italic text_
[Link text](https://example.com)
`Code`
```

### HTML Format
```html
<b>Bold</b>
<i>Italic</i>
<a href="https://example.com">Link</a>
<code>Code</code>
```

## Error Handling

### User-Friendly Error Messages
- Connection errors: "⚠️ Connection issue. Please try again."
- API errors: "❌ Service temporarily unavailable."
- Invalid input: "❓ Invalid command. Use /help for assistance."

### Error Logging
All errors should be logged with:
- Timestamp
- User ID
- Command/action
- Error details

## Rate Limiting

### Bot Limits (Telegram)
- 30 messages per second to different users
- 1 message per second to same user

### Implementation
```javascript
const rateLimiter = new Map();

function checkRateLimit(userId) {
  const lastMessage = rateLimiter.get(userId);
  const now = Date.now();
  
  if (lastMessage && now - lastMessage < 1000) {
    return false; // Rate limited
  }
  
  rateLimiter.set(userId, now);
  return true;
}
```

## Security

### Data Validation
- Validate all user input
- Sanitize text before sending
- Verify Telegram Web App data signature

### Authentication
```javascript
const crypto = require('crypto');

function verifyTelegramWebAppData(initData, botToken) {
  // Implement verification according to Telegram documentation
  // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
}
```

## Notifications

### User Notifications
- New recommendations available
- Playlist updates
- System announcements

### Implementation
```javascript
async function sendNotification(userId, message) {
  try {
    await bot.sendMessage(userId, message, {
      parse_mode: 'Markdown',
      disable_notification: false
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}
```

## Analytics

### Track Events
- Command usage
- Button clicks
- Mini App opens
- User retention

### Metrics
- Daily active users
- Command popularity
- Error rates
- Response times
