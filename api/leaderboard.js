const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('tg_id, first_name, nickname, avatar, xp, streak')
    .eq('banned', false)
    .order('xp', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ leaderboard: data || [] });
};
