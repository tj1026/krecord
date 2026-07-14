import { NextResponse } from 'next/server';
import { isValidSiteAccessToken } from './lib/auth';

const unprotectedPaths = ['/access', '/api/site-access', '/api/content'];

export function proxy(request) {
  if (!process.env.SITE_PASSWORD || unprotectedPaths.some(path => request.nextUrl.pathname === path) || request.nextUrl.pathname.startsWith('/_next/')) {
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
