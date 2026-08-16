import fs from 'node:fs';
import path from 'node:path';
import { readContent } from '../lib/db';

export const runtime = 'nodejs';

// The homepage is the standalone design in public/index.html. Serving it
// through this handler (instead of a static rewrite) lets us fill in the
// social-preview tags from the published content before the HTML leaves the
// server — social crawlers don't run the client-side JavaScript that would
// otherwise set them, so a static file alone gives blank link previews.
let template = null;
function loadTemplate() {
  if (template === null) {
    template = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8');
  }
  return template;
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceMeta(html, attr, key, value) {
  if (value == null || value === '') return html;
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(">)`);
  return re.test(html) ? html.replace(re, (m, a, b) => a + esc(value) + b) : html;
}

function replaceLink(html, rel, value) {
  if (value == null || value === '') return html;
  const re = new RegExp(`(<link rel="${rel}"[^>]*? href=")[^"]*(")`);
  return re.test(html) ? html.replace(re, (m, a, b) => a + esc(value) + b) : html;
}

// Resolve a social image to an absolute URL a crawler can actually fetch.
// Blank values and uploaded data: URIs fall back to the hosted default, since
// scrapers can't read data URIs.
function absoluteImage(value, origin) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) return origin + value;
  return origin + '/score-photo.png';
}

// Serialize the published content for the <script type="application/json">
// block the page reads on load. The browser doesn't parse entities inside a
// script element, so the one thing that must not survive is a literal "<":
// a "</script>" inside the published copy would close the tag early and spill
// the rest of the content into the document as markup.
function inlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function injectContent(html, content) {
  const re = /(<script id="cms-content" type="application\/json">)[^<]*(<\/script>)/;
  return re.test(html) ? html.replace(re, (m, a, b) => a + inlineJson(content) + b) : html;
}

function originFrom(request) {
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  return host ? `${proto}://${host}` : '';
}

export async function GET(request) {
  let html = loadTemplate();
  const origin = originFrom(request);

  // null means "the read failed", which is different from "there is nothing
  // published yet" ({}). Only the failure case leaves the page to fall back to
  // /api/content, so a storage hiccup at render time still resolves itself.
  let published = null;
  try {
    published = (await readContent()) || {};
  } catch {
    // Storage unavailable: serve the static defaults baked into the template.
  }

  const content = published || {};
  const title = content['seo-title'];
  const description = content['seo-description'];
  const pageUrl = origin ? origin + '/' : '';
  const image = absoluteImage(content['seo-social-image'], origin);

  if (title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'name', 'keywords', content['seo-keywords']);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'property', 'og:site_name', content['publication']);
  html = replaceMeta(html, 'property', 'og:url', pageUrl);
  html = replaceMeta(html, 'property', 'og:image', image);
  html = replaceMeta(html, 'name', 'twitter:image', image);
  html = replaceLink(html, 'canonical', pageUrl);
  html = replaceLink(html, 'icon', content['favicon']);

  // Ship the copy with the page. Without this every visitor also fetches
  // /api/content to hydrate the page, which turns one traffic spike into two
  // function calls per reader and leaves the page blank until the second one
  // answers. With it, a cached page load costs nothing beyond the HTML.
  html = injectContent(html, published);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Cache the rendered page at the edge so a traffic spike is served from
      // the CDN instead of hitting the database on every request. A page
      // rendered without content (storage was down) gets a short cache so the
      // degraded version can't stick around for the full window.
      'Cache-Control': published
        ? 'public, s-maxage=60, stale-while-revalidate=600'
        : 'public, s-maxage=5'
    }
  });
}
