const { verifyTelegramInitData } = require('./_lib/telegram');
const { getSupabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { initData } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgUser = verifyTelegramInitData(initData, botToken);
  if (!tgUser) return res.status(401).json({ error: 'Invalid Telegram data' });

  const supabase = getSupabase();

  const { data: existing, error: findErr } = await supabase
    .from('users')
    .select('*')
    .eq('tg_id', tgUser.id)
    .maybeSingle();
  if (findErr) return res.status(500).json({ error: findErr.message });

  if (existing) {
    // Keep display name fresh in case they changed it in Telegram
    await supabase
      .from('users')
      .update({
        first_name: tgUser.first_name || existing.first_name,
        last_name: tgUser.last_name || existing.last_name,
        username: tgUser.username || existing.username,
      })
      .eq('tg_id', tgUser.id);
    return res.status(200).json({ user: existing });
  }

  const { data: created, error: insErr } = await supabase
    .from('users')
    .insert({
      tg_id: tgUser.id,
      first_name: tgUser.first_name || '',
      last_name: tgUser.last_name || '',
      username: tgUser.username || '',
      xp: 0,
      streak: 0,
      last_day: '',
      done: [],
      words: [],
      dialogues_done: [],
      banned: false,
    })
    .select()
    .single();
  if (insErr) return res.status(500).json({ error: insErr.message });

  return res.status(200).json({ user: created });
};
