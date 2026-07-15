import { NextResponse } from 'next/server';
import { isValidSiteAccessToken } from './lib/auth';
import { isSitePasswordEnabled } from './lib/db';

const unprotectedPaths = ['/access', '/api/site-access', '/api/content', '/api/site-settings'];

// The gate can be turned off from the admin page, which flips a row in the
// database. Reading that row on every single request would add a round trip to
// each page load, so cache it briefly. Default to "on" so a storage hiccup can
// never fling a private site open, and keep the last known value if a refresh
// fails.
const GATE_CACHE_MS = 10_000;
let gateCache = { enabled: true, at: 0 };

async function sitePasswordEnabled() {
  const now = Date.now();
  if (now - gateCache.at < GATE_CACHE_MS) return gateCache.enabled;
  try {
    const enabled = await isSitePasswordEnabled();
    gateCache = { enabled, at: now };
    return enabled;
  } catch {
    return gateCache.enabled;
  }
}

export async function proxy(request) {
  if (!process.env.SITE_PASSWORD || unprotectedPaths.some(path => request.nextUrl.pathname === path) || request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Tim can turn the visitor password off from the admin page; when it's off
  // the site is public and no cookie is required.
  if (!(await sitePasswordEnabled())) {
    return NextResponse.next();
  }

  if (isValidSiteAccessToken(request.cookies.get('krecord_site_access')?.value)) {
    return NextResponse.next();
  }

  const url = new URL('/access', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
