const { sign } = require('../_lib/adminAuth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  if (!password || password !== real) {
    return res.status(401).json({ error: 'Notoʻgʻri parol' });
  }

  const token = sign({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 12 }); // 12h
  res.setHeader(
    'Set-Cookie',
    `baza_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 12}`
  );
  return res.status(200).json({ ok: true });
};
