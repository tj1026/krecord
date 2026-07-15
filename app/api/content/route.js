import { NextResponse } from 'next/server';
import { readContent, writeContent } from '../../../lib/db';
import { safeEquals } from '../../../lib/auth';
import { clientKey, isRateLimited } from '../../../lib/rate-limit';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(
      { content: await readContent() },
      {
        // Cache at the edge so a traffic spike is served from the CDN rather
        // than querying the database on every page load. Edits go live within
        // s-maxage; stale-while-revalidate keeps it fast while it refreshes.
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' }
      }
    );
  } catch (error) {
    return NextResponse.json({ content: null, error: 'Content storage is not configured yet.' }, { status: 503 });
  }
}

export async function PUT(request) {
  const password = request.headers.get('x-cms-password');
  if (!process.env.CMS_PASSWORD) {
    return NextResponse.json({ error: 'CMS_PASSWORD is not configured.' }, { status: 503 });
  }
  if (isRateLimited('cms-save:' + clientKey(request))) {
    return NextResponse.json({ error: 'Too many attempts. Wait a minute and try again.' }, { status: 429 });
  }
  if (typeof password !== 'string' || !safeEquals(password, process.env.CMS_PASSWORD)) {
    return NextResponse.json({ error: 'Incorrect editor password.' }, { status: 401 });
  }

  try {
    const content = await request.json();
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return NextResponse.json({ error: 'Content must be an object.' }, { status: 400 });
    }
    await writeContent(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.message?.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Content storage is not configured: set a DATABASE_URL environment variable pointing to your Postgres database, then redeploy.' },
        { status: 503 }
      );
    }
    // Surface the underlying database error to the (already password-gated)
    // editor so a failing DATABASE_URL can be diagnosed instead of guessed.
    console.error('CMS save failed:', error);
    return NextResponse.json(
      { error: 'Unable to save content — the database rejected the write. Details: ' + (error?.message || 'unknown error') },
      { status: 500 }
    );
  }
}
