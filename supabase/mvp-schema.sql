-- MusicVerse Pro MVP Database Schema
-- Created for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist Tracks Table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (telegram_id = current_setting('app.current_user_telegram_id')::BIGINT);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (telegram_id = current_setting('app.current_user_telegram_id')::BIGINT);

-- RLS Policies for playlists table
CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

-- RLS Policies for playlist_tracks table
CREATE POLICY "Users can view own playlist tracks"
  ON playlist_tracks FOR SELECT
  USING (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

CREATE POLICY "Users can insert own playlist tracks"
  ON playlist_tracks FOR INSERT
  WITH CHECK (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

CREATE POLICY "Users can delete own playlist tracks"
  ON playlist_tracks FOR DELETE
  USING (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

-- RLS Policies for favorites table
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT));
