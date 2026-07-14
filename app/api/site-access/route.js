import { NextResponse } from 'next/server';
import { safeEquals, siteAccessToken } from '../../../lib/auth';
import { clientKey, isRateLimited } from '../../../lib/rate-limit';

export async function POST(request) {
  const form = await request.formData();
  const password = form.get('password');
  const requested = form.get('next');
  const next = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/index.html';

  if (isRateLimited('site-access:' + clientKey(request))) {
    const url = new URL('/access', request.url);
    url.searchParams.set('next', next);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }

  const token = siteAccessToken();
  if (!token || typeof password !== 'string' || !safeEquals(password, process.env.SITE_PASSWORD)) {
    const url = new URL('/access', request.url);
    url.searchParams.set('next', next);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set('krecord_site_access', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });
  return response;
}
