const { requireAdmin } = require('../_lib/adminAuth');
const { getSupabase } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('dialogues').select('*').order('sort_order', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dialogues: data });
  }

  if (req.method === 'POST') {
    const { id, t, tr, icon, cat, lv, turns, sort_order } = req.body || {};
    if (!id || !t || !lv) return res.status(400).json({ error: 'id, t, lv are required' });
    const { data, error } = await supabase
      .from('dialogues')
      .insert({ id, t, tr: tr || '', icon: icon || '💬', cat: cat || '', lv, turns: turns || [], sort_order: sort_order || id })
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dialogue: data && data[0] });
  }

  if (req.method === 'PUT') {
    const { id, t, tr, icon, cat, lv, turns, sort_order } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    const patch = {};
    if (t !== undefined) patch.t = t;
    if (tr !== undefined) patch.tr = tr;
    if (icon !== undefined) patch.icon = icon;
    if (cat !== undefined) patch.cat = cat;
    if (lv !== undefined) patch.lv = lv;
    if (turns !== undefined) patch.turns = turns;
    if (sort_order !== undefined) patch.sort_order = sort_order;
    const { data, error } = await supabase.from('dialogues').update(patch).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dialogue: data && data[0] });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await supabase.from('dialogues').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
