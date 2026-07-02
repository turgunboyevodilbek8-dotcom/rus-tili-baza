const { requireAdmin } = require('../_lib/adminAuth');
const { getSupabase } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getSupabase();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { data, error } = await supabase.from('users').select('words');
  if (error) return res.status(500).json({ error: error.message });

  const agg = {}; // key: ru|uz -> {ru,uz,correct,attempts,learners}
  (data || []).forEach(function (row) {
    const words = row.words || [];
    words.forEach(function (w) {
      const key = w.ru + '||' + w.uz;
      if (!agg[key]) agg[key] = { ru: w.ru, uz: w.uz, correct: 0, attempts: 0, learners: 0 };
      agg[key].correct += w.c || 0;
      agg[key].attempts += w.a || 0;
      agg[key].learners += 1;
    });
  });

  const list = Object.values(agg).map(function (w) {
    w.accuracy = w.attempts > 0 ? Math.round((w.correct / w.attempts) * 100) : 0;
    return w;
  });
  list.sort(function (a, b) {
    return a.accuracy - b.accuracy; // hardest words first
  });

  return res.status(200).json({ words: list });
};
