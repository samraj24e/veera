const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing in server/.env');
  console.error('Please update server/.env with your actual Supabase credentials.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDb() {
  // Supabase client handles connection implicitly, but we can verify it's working
  return supabase;
}

module.exports = { supabase, getDb };
