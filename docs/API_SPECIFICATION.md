# MusicVerse Pro API Specification

## Overview
This document describes the API endpoints for the MusicVerse Pro Telegram Mini App and Bot integration.

## Base URL
```
Production: https://your-domain.com
Development: http://localhost:3000
```

## Authentication
All API requests should include Telegram Web App initialization data for verification.

### Headers
```
Content-Type: application/json
X-Telegram-Init-Data: <telegram_init_data>
```

## Endpoints

### 1. Authentication

#### Verify Telegram Web App Data
```http
POST /api/auth/verify
```

**Request Body:**
```json
{
  "initData": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "jwt_token"
}
```

### 2. User Management

#### Get User Data
```http
GET /api/user/:userId
```

**Response:**
```json
{
  "userId": "123456",
  "playlists": [],
  "favorites": [],
  "settings": {
    "language": "en",
    "theme": "dark"
  }
}
```

#### Update User Settings
```http
PUT /api/user/:userId/settings
```

**Request Body:**
```json
{
  "language": "en",
  "theme": "dark"
}
```

### 3. Music Recommendations

#### Get Recommendations
```http
GET /api/recommendations/:userId
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)
- `genre` (optional): Filter by genre

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Track Name",
      "artist": "Artist Name",
      "genre": "Electronic",
      "duration": "3:45",
      "preview_url": "https://example.com/preview.mp3",
      "cover_url": "https://example.com/cover.jpg"
    }
  ]
}
```

### 4. Search

#### Search Music
```http
GET /api/search
```

**Query Parameters:**
- `q`: Search query (required)
- `type`: Type of search (track, artist, album) (default: track)
- `limit`: Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "1",
      "title": "Track Name",
      "artist": "Artist Name",
      "type": "track"
    }
  ]
}
```

### 5. Playlists

#### Get User Playlists
```http
GET /api/playlists/:userId
```

**Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "id": "1",
      "name": "My Playlist",
      "description": "Description",
      "track_count": 15,
      "cover_url": "https://example.com/cover.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Playlist
```http
POST /api/playlists
```

**Request Body:**
```json
{
  "userId": "123456",
  "name": "My Playlist",
  "description": "Description"
}
```

#### Add Track to Playlist
```http
POST /api/playlists/:playlistId/tracks
```

**Request Body:**
```json
{
  "trackId": "123"
}
```

### 6. Favorites

#### Get User Favorites
```http
GET /api/favorites/:userId
```

**Response:**
```json
{
  "success": true,
  "favorites": [
    {
      "id": "1",
      "title": "Track Name",
      "artist": "Artist Name",
      "added_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Add to Favorites
```http
POST /api/favorites/:userId
```

**Request Body:**
```json
{
  "trackId": "123"
}
```

#### Remove from Favorites
```http
DELETE /api/favorites/:userId/:trackId
```

### 7. Health Check

#### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): User doesn't have permission
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting
- Rate limit: 100 requests per minute per user
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks

### Bot Webhook
```http
POST /webhook/bot
```

Receives updates from Telegram Bot API.

## External API Provider Integration

### Music API Provider Configuration

The bot integrates with external music API providers (Spotify, Deezer, etc.).

**Required Configuration:**
```env
MUSIC_API_BASE_URL=https://api.music-provider.com
MUSIC_API_KEY=your_api_key
MUSIC_API_SECRET=your_api_secret
```

**Provider Endpoints Used:**
- `/search` - Search for tracks, artists, albums
- `/recommendations` - Get personalized recommendations
- `/tracks/:id` - Get track details
- `/playlists/:id` - Get playlist information

## WebSocket Support (Future)

Real-time features will use WebSocket connections:

```javascript
ws://localhost:3000/ws?userId=123456
```

**Events:**
- `track.play` - Track playback started
- `playlist.update` - Playlist modified
- `recommendation.new` - New recommendations available
