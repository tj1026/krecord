import { NextResponse } from 'next/server';

export async function POST(request) {
  const form = await request.formData();
  const password = form.get('password');
  const requestedPath = form.get('next');
  const next = typeof requestedPath === 'string' && requestedPath.startsWith('/') ? requestedPath : '/index.html';

  if (!process.env.SITE_PASSWORD || password !== process.env.SITE_PASSWORD) {
    const url = new URL('/access', request.url);
    url.searchParams.set('next', next);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set('krecord_site_access', process.env.SITE_PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });
  return response;
}
