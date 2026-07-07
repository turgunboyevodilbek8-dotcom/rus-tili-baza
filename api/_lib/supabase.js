const { createClient } = require('@supabase/supabase-js');

// Uses the SERVICE ROLE key — this must NEVER be exposed to the browser.
// It only ever runs inside Vercel serverless functions (server-side).
let client = null;
function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars are missing');
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

module.exports = { getSupabase };
