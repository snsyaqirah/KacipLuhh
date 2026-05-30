import crypto from 'crypto';

function secret() {
  if (!process.env.TOKEN_SECRET) throw new Error('TOKEN_SECRET not set');
  return process.env.TOKEN_SECRET;
}

export function generateToken(payload) {
  const data = JSON.stringify({ ...payload, jti: crypto.randomUUID() });
  const sig = crypto.createHmac('sha256', secret()).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, sig })).toString('base64url');
}

export function verifyToken(raw) {
  try {
    const { data, sig } = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const expected = crypto.createHmac('sha256', secret()).update(data).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}
