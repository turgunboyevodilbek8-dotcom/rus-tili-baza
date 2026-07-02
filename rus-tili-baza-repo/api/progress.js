const { verifyTelegramInitData } = require('./_lib/telegram');
const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { initData, streak, lastDay, done, words } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgUser = verifyTelegramInitData(initData, botToken);
  if (!tgUser) return res.status(401).json({ error: 'Invalid Telegram data' });

  const supabase = getSupabase();

  const { data: existing, error: findErr } = await supabase
    .from('users')
    .select('id, banned')
    .eq('tg_id', tgUser.id)
    .maybeSingle();
  if (findErr) return res.status(500).json({ error: findErr.message });
  if (!existing) return res.status(404).json({ error: 'User not found — call /api/user first' });
  if (existing.banned) return res.status(403).json({ error: 'banned' });

  const safeWords = Array.isArray(words) ? words : [];
  const safeDone = Array.isArray(done) ? done : [];
  const xp = safeWords.reduce((sum, w) => sum + (w.c || 0) * 10, 0) + safeDone.length * 50;

  const { error: updErr } = await supabase
    .from('users')
    .update({
      streak: typeof streak === 'number' ? streak : 0,
      last_day: lastDay || '',
      done: safeDone,
      words: safeWords,
      xp,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
  if (updErr) return res.status(500).json({ error: updErr.message });

  return res.status(200).json({ ok: true, xp });
};
