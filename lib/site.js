// Every public URL the site emits — the canonical link, og:url, the sitemap —
// has to name the same host. Left to the request's own Host header, the
// deploy's *.vercel.app address self-canonicalizes and Google is free to index
// it as a second, duplicate copy of the real site. Setting SITE_URL pins all of
// them to the production domain; without it we fall back to the request host,
// which is what a preview deploy or a local `next dev` should do.

function normalize(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return '';
  }
}

export function configuredOrigin() {
  return normalize(process.env.SITE_URL);
}

export function requestOrigin(request) {
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = requestHost(request);
  return host ? `${proto}://${host}` : '';
}

function requestHost(request) {
  return request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
}

export function canonicalOrigin(request) {
  return configuredOrigin() || requestOrigin(request);
}

// True when this request arrived on the address the site is meant to be known
// by. When SITE_URL isn't set we can't tell one host from another, so treat
// every host as canonical rather than accidentally hiding the live site from
// search engines.
export function isCanonicalHost(request) {
  const configured = configuredOrigin();
  if (!configured) return true;
  // Hosts only. The scheme isn't the question being asked here, and behind a
  // proxy that terminates TLS it isn't reliably reported anyway.
  return requestHost(request).toLowerCase() === new URL(configured).host.toLowerCase();
}
