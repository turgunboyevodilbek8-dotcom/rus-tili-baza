const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabase();
  const { data, error } = await supabase.from('lessons').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  // Empty DB (not seeded yet) -> tell the client to use its built-in fallback lessons
  return res.status(200).json({ lessons: data || [] });
};
