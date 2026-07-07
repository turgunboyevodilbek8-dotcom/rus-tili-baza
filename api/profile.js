const { verifyTelegramInitData } = require('./_lib/telegram');
const { getSupabase } = require('./_lib/supabase');

const MAX_AVATAR_LEN = 400000; // ~300KB base64, plenty for a resized 200x200 avatar

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { initData, nickname, avatar } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgUser = verifyTelegramInitData(initData, botToken);
  if (!tgUser) return res.status(401).json({ error: 'Invalid Telegram data' });

  if (typeof avatar === 'string' && avatar.length > MAX_AVATAR_LEN) {
    return res.status(400).json({ error: 'Avatar too large' });
  }
  if (typeof nickname === 'string' && nickname.length > 30) {
    return res.status(400).json({ error: 'Nickname too long' });
  }

  const supabase = getSupabase();
  const { data: existing, error: findErr } = await supabase
    .from('users')
    .select('id, banned')
    .eq('tg_id', tgUser.id)
    .maybeSingle();
  if (findErr) return res.status(500).json({ error: findErr.message });
  if (!existing) return res.status(404).json({ error: 'User not found — call /api/user first' });
  if (existing.banned) return res.status(403).json({ error: 'banned' });

  const patch = { updated_at: new Date().toISOString() };
  if (typeof nickname === 'string') patch.nickname = nickname.slice(0, 30);
  if (typeof avatar === 'string') patch.avatar = avatar;

  const { data, error } = await supabase.from('users').update(patch).eq('id', existing.id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, user: data });
};
