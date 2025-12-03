require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting database setup verification...\n');
  console.log('⚠️  Note: Supabase requires SQL to be executed via Dashboard SQL Editor\n');
  console.log('📋 Instructions:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/pllgtkhraaxblfhxdask/sql');
  console.log('   2. Click "New Query"');
  console.log('   3. Copy content from: supabase/mvp-schema.sql');
  console.log('   4. Paste and click "Run"\n');
  
  console.log('🔍 Checking if schema is already applied...\n');
  
  const tables = ['users', 'playlists', 'playlist_tracks', 'favorites'];
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${table}' not found`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`   ❌ Table '${table}' check failed: ${err.message}`);
      allTablesExist = false;
    }
  }
  
  if (allTablesExist) {
    console.log('\n✅ Database setup complete! All tables exist.');
    console.log('✅ Ready to proceed with development.');
    return true;
  } else {
    console.log('\n⏳ Please apply the schema using the instructions above.');
    console.log('   Then run this script again to verify.');
    return false;
  }
}

setupDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
