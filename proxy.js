import { NextResponse } from 'next/server';

const unprotectedPaths = ['/access', '/api/site-access', '/cms.html', '/api/content'];

export function proxy(request) {
  if (!process.env.SITE_PASSWORD || unprotectedPaths.some(path => request.nextUrl.pathname === path) || request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  if (request.cookies.get('krecord_site_access')?.value === process.env.SITE_PASSWORD) {
    return NextResponse.next();
  }

  const url = new URL('/access', request.url);
  url.searchParams.set('next', '/index.html');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
