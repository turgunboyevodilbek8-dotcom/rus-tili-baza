const crypto = require('crypto');

function getSecret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET env var is missing');
  return s;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return body + '.' + sig;
}

function verify(token) {
  if (!token || token.indexOf('.') === -1) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach(function (part) {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function requireAdmin(req) {
  const cookies = parseCookies(req);
  const payload = verify(cookies.baza_admin);
  return payload && payload.role === 'admin';
}

module.exports = { sign, verify, parseCookies, requireAdmin };
