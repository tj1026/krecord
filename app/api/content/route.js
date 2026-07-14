import { NextResponse } from 'next/server';
import { readContent, writeContent } from '../../../lib/db';
import { safeEquals } from '../../../lib/auth';
import { clientKey, isRateLimited } from '../../../lib/rate-limit';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ content: await readContent() });
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
    return NextResponse.json({ error: 'Unable to save content.' }, { status: 500 });
  }
}
