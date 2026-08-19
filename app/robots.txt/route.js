import { canonicalOrigin, isCanonicalHost } from '../../lib/site';

export const runtime = 'nodejs';

// Until launch the whole site sat behind the visitor password, so there was
// nothing for a crawler to read and no robots.txt to write. Now that it's
// public, spell out what should be indexed (the homepage) and what shouldn't
// (the editor, the password page, the JSON endpoints).
export async function GET(request) {
  const origin = canonicalOrigin(request);

  const body = isCanonicalHost(request)
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /access',
        'Disallow: /api/',
        '',
        `Sitemap: ${origin}/sitemap.xml`,
        ''
      ].join('\n')
    // A preview or *.vercel.app address serving the same page is a duplicate of
    // the real site. Keep it out of the index entirely.
    : ['User-agent: *', 'Disallow: /', ''].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
