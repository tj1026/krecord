import { NextResponse } from 'next/server';
import { isSitePasswordEnabled, setSitePasswordEnabled } from '../../../lib/db';
import { safeEquals } from '../../../lib/auth';
import { clientKey, isRateLimited } from '../../../lib/rate-limit';

export const runtime = 'nodejs';

// Whether a visitor password is even possible on this deployment. Without
// SITE_PASSWORD the proxy never gates anything, so the toggle is moot.
function isConfigured() {
  return Boolean(process.env.SITE_PASSWORD);
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, passwordEnabled: false });
  }
  try {
    return NextResponse.json({ configured: true, passwordEnabled: await isSitePasswordEnabled() });
  } catch (error) {
    // If storage is unreachable, report the gate as on — that matches the
    // proxy's fail-safe default so the admin UI doesn't imply the site is open.
    return NextResponse.json(
      { configured: true, passwordEnabled: true, error: 'Content storage is not configured yet.' },
      { status: 503 }
    );
  }
}

export async function PUT(request) {
  const password = request.headers.get('x-cms-password');
  if (!process.env.CMS_PASSWORD) {
    return NextResponse.json({ error: 'CMS_PASSWORD is not configured.' }, { status: 503 });
  }
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'No site password is configured, so there is nothing to turn on or off.' },
      { status: 409 }
    );
  }
  if (isRateLimited('site-settings:' + clientKey(request))) {
    return NextResponse.json({ error: 'Too many attempts. Wait a minute and try again.' }, { status: 429 });
  }
  if (typeof password !== 'string' || !safeEquals(password, process.env.CMS_PASSWORD)) {
    return NextResponse.json({ error: 'Incorrect editor password.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.passwordEnabled !== 'boolean') {
      return NextResponse.json({ error: 'passwordEnabled must be true or false.' }, { status: 400 });
    }
    await setSitePasswordEnabled(body.passwordEnabled);
    return NextResponse.json({ ok: true, passwordEnabled: body.passwordEnabled });
  } catch (error) {
    if (error?.message?.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Content storage is not configured: set a DATABASE_URL environment variable pointing to your Postgres database, then redeploy.' },
        { status: 503 }
      );
    }
    console.error('Site setting save failed:', error);
    return NextResponse.json(
      { error: 'Unable to save the setting — the database rejected the write. Details: ' + (error?.message || 'unknown error') },
      { status: 500 }
    );
  }
}
