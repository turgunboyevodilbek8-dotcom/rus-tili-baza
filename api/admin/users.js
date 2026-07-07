const { requireAdmin } = require('../_lib/adminAuth');
const { getSupabase } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('id, tg_id, first_name, last_name, username, xp, streak, banned, created_at, updated_at')
      .order('xp', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data });
  }

  if (req.method === 'PATCH') {
    const { id, xp, streak, banned } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    const patch = { updated_at: new Date().toISOString() };
    if (typeof xp === 'number') patch.xp = xp;
    if (typeof streak === 'number') patch.streak = streak;
    if (typeof banned === 'boolean') patch.banned = banned;
    const { data, error } = await supabase.from('users').update(patch).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ user: data && data[0] });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
