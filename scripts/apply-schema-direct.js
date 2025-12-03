require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env file');
    process.exit(1);
  }
  
  console.log('🚀 Connecting to PostgreSQL database...\n');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'mvp-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Applying schema...\n');
    
    // Execute the entire schema
    await client.query(schema);
    
    console.log('✅ Schema applied successfully!\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...\n');
    
    const tables = ['users', 'playlists', 'playlist_tracks', 'favorites'];
    
    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Table '${table}' created`);
      } else {
        console.log(`   ❌ Table '${table}' not found`);
      }
    }
    
    console.log('\n✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
