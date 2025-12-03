require('dotenv').config();
const { supabase } = require('../bot/services/supabaseClient');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  console.log('📝 Reading schema file...');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'mvp-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('🔄 Applying schema to Supabase...');
  console.log('⚠️  Note: This requires direct SQL execution.');
  console.log('');
  console.log('Please apply the schema manually:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Copy content from supabase/mvp-schema.sql');
  console.log('4. Paste and run in SQL Editor');
  console.log('');
  console.log('Or use Supabase CLI:');
  console.log('  supabase db push');
  console.log('');
  
  // For now, we'll just test if tables exist
  console.log('Testing if schema is already applied...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Schema already applied! Tables exist.');
      return true;
    }
    
    console.log('❌ Schema not yet applied. Please follow instructions above.');
    return false;
  } catch (err) {
    console.log('❌ Schema not yet applied. Please follow instructions above.');
    return false;
  }
}

applySchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Database is ready!');
    } else {
      console.log('\n⏳ Waiting for schema to be applied...');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
