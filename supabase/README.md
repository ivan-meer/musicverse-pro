# Supabase Database Setup

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended for MVP)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `musicverse-pro`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Schema**
   - Copy the entire content from `schema.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for completion (should take ~5 seconds)

4. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see 4 tables:
     - ✅ users
     - ✅ playlists
     - ✅ playlist_tracks
     - ✅ favorites

5. **Check RLS Policies**
   - Click on any table
   - Go to "Policies" tab
   - You should see policies enabled

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref pllgtkhraaxblfhxdask

# Run migrations
supabase db push
```

## Database Schema Overview

### Tables

1. **users** - User accounts from Telegram
   - `id` (UUID, PK)
   - `telegram_id` (BIGINT, Unique)
   - `username` (TEXT)
   - `first_name` (TEXT)
   - `created_at` (TIMESTAMP)

2. **playlists** - User playlists
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users)
   - `name` (TEXT)
   - `description` (TEXT)
   - `created_at` (TIMESTAMP)

3. **playlist_tracks** - Tracks in playlists
   - `id` (UUID, PK)
   - `playlist_id` (UUID, FK → playlists)
   - `track_id` (TEXT)
   - `track_data` (JSONB)
   - `added_at` (TIMESTAMP)

4. **favorites** - User favorite tracks
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → users)
   - `track_id` (TEXT)
   - `track_data` (JSONB)
   - `added_at` (TIMESTAMP)
   - UNIQUE constraint on (user_id, track_id)

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- Cascade deletes work properly

## Testing the Setup

### Test 1: Create a Test User

```sql
-- Set current user context
SET app.current_user_telegram_id = '123456789';

-- Insert test user
INSERT INTO users (telegram_id, username, first_name)
VALUES (123456789, 'testuser', 'Test');

-- Verify
SELECT * FROM users WHERE telegram_id = 123456789;
```

### Test 2: Create a Test Playlist

```sql
-- Set current user context
SET app.current_user_telegram_id = '123456789';

-- Get user ID
WITH user_data AS (
  SELECT id FROM users WHERE telegram_id = 123456789
)
-- Insert test playlist
INSERT INTO playlists (user_id, name, description)
SELECT id, 'My First Playlist', 'Test playlist'
FROM user_data;

-- Verify
SELECT * FROM playlists;
```

### Test 3: Test RLS Isolation

```sql
-- Create second user
SET app.current_user_telegram_id = '987654321';
INSERT INTO users (telegram_id, username, first_name)
VALUES (987654321, 'testuser2', 'Test2');

-- Try to view first user's playlists (should return empty)
SELECT * FROM playlists;

-- Switch back to first user
SET app.current_user_telegram_id = '123456789';

-- Should see playlists now
SELECT * FROM playlists;
```

## Troubleshooting

### Issue: Tables already exist

If you see "table already exists" errors, you can either:
1. Drop existing tables first (⚠️ will delete all data):
   ```sql
   DROP TABLE IF EXISTS favorites CASCADE;
   DROP TABLE IF EXISTS playlist_tracks CASCADE;
   DROP TABLE IF EXISTS playlists CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
2. Or skip the CREATE TABLE statements

### Issue: RLS policies already exist

If policies already exist, drop them first:
```sql
DROP POLICY IF EXISTS "Users can view own data" ON users;
-- Repeat for all policies
```

### Issue: UUID extension not available

Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Next Steps

After database setup is complete:
1. ✅ Verify all 4 tables exist
2. ✅ Verify RLS is enabled
3. ✅ Test with sample data
4. 🚀 Continue to Task 1.2: Setup Express Server
