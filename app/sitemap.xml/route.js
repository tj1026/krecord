import { canonicalOrigin, isCanonicalHost } from '../../lib/site';

export const runtime = 'nodejs';

// One page, one entry. It exists so the site can be submitted to Google Search
// Console and Bing Webmaster Tools by URL instead of waiting to be discovered.
export async function GET(request) {
  if (!isCanonicalHost(request)) {
    return new Response('Not found', { status: 404 });
  }

  const origin = canonicalOrigin(request);
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `  <url>\n    <loc>${origin}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
    '</urlset>\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
