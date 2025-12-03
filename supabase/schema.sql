-- MusicVerse Pro MVP Database Schema
-- Created: 2024
-- Description: Basic schema for users, playlists, and favorites

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- ============================================
-- PLAYLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user playlist lookups
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);

-- ============================================
-- PLAYLIST TRACKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster playlist track lookups
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Index for faster user favorites lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (telegram_id = current_setting('app.current_user_telegram_id')::BIGINT);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.current_user_telegram_id')::BIGINT);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (telegram_id = current_setting('app.current_user_telegram_id')::BIGINT);

-- Playlists table policies
-- Users can view their own playlists
CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Users can insert their own playlists
CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Users can update their own playlists
CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Users can delete their own playlists
CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Playlist tracks table policies
-- Users can view tracks in their own playlists
CREATE POLICY "Users can view own playlist tracks"
  ON playlist_tracks FOR SELECT
  USING (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

-- Users can insert tracks to their own playlists
CREATE POLICY "Users can insert own playlist tracks"
  ON playlist_tracks FOR INSERT
  WITH CHECK (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

-- Users can delete tracks from their own playlists
CREATE POLICY "Users can delete own playlist tracks"
  ON playlist_tracks FOR DELETE
  USING (playlist_id IN (
    SELECT id FROM playlists WHERE user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
    )
  ));

-- Favorites table policies
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_user_telegram_id')::BIGINT
  ));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'playlists', 'playlist_tracks', 'favorites');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'playlists', 'playlist_tracks', 'favorites');
