require('dotenv').config();
const { supabase } = require('../bot/services/supabaseClient');

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('Database is accessible');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
