import { createHmac, timingSafeEqual } from 'crypto';

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function siteAccessToken() {
  const secret = process.env.SITE_PASSWORD;
  if (!secret) return null;
  return sign('krecord-site-access', secret);
}

export function isValidSiteAccessToken(token) {
  const expected = siteAccessToken();
  if (!expected || !token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function safeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
