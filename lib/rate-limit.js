// Best-effort in-memory throttle. Each serverless instance keeps its own
// counters, so this only slows down a single warm instance, not a
// distributed attacker — it is a speed bump, not a real defense. Turn on
// Vercel's Attack Challenge Mode / Firewall (or an edge KV limiter like
// Upstash) for real protection on a production domain.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

export function isRateLimited(key) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function clientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
