const crypto = require('crypto');

// Verifies Telegram Mini App initData per Telegram's official spec:
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// Returns the parsed user object if valid, or null if invalid/expired.
function verifyTelegramInitData(initData, botToken, maxAgeSeconds) {
  if (!initData || !botToken) return null;
  maxAgeSeconds = maxAgeSeconds || 86400; // 24h default

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const pairs = [];
  params.forEach((value, key) => pairs.push(key + '=' + value));
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const authDate = parseInt(params.get('auth_date') || '0', 10);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > maxAgeSeconds) return null;

  let user = null;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch (e) {
    return null;
  }
  if (!user || !user.id) return null;

  return user; // { id, first_name, last_name, username, ... }
}

module.exports = { verifyTelegramInitData };
