# Supabase Database Setup Instructions

## Step 1: Apply Database Schema

1. Open your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `supabase/mvp-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

## Step 2: Verify Tables Created

After running the schema, verify that the following tables exist:
- `users`
- `playlists`
- `playlist_tracks`
- `favorites`

You can check this in the **Table Editor** section.

## Step 3: Verify RLS Policies

1. Go to **Authentication** → **Policies**
2. Verify that RLS is enabled for all tables
3. Check that policies are created for each table

## Step 4: Test Connection

Run the test script to verify everything works:

```bash
node scripts/test-db-connection.js
```

You should see: ✅ Connection successful!

## Troubleshooting

### Error: "Could not find the table"
- Make sure you ran the SQL schema in Step 1
- Refresh the schema cache in Supabase dashboard

### Error: "Missing Supabase credentials"
- Check that `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
- Make sure the values are correct

### RLS Policies Not Working
- Verify RLS is enabled on all tables
- Check that policies are created correctly
- For MVP, we'll use service role key which bypasses RLS for backend operations
