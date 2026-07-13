import { list, put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function readContent() {
  const { blobs } = await list({ prefix: 'cms/content.json', limit: 1 });
  if (!blobs.length) return null;
  const response = await fetch(blobs[0].url, { cache: 'no-store' });
  return response.ok ? response.json() : null;
}

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
  if (password !== process.env.CMS_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect editor password.' }, { status: 401 });
  }

  try {
    const content = await request.json();
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return NextResponse.json({ error: 'Content must be an object.' }, { status: 400 });
    }
    await put('cms/content.json', JSON.stringify(content), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to save content.' }, { status: 500 });
  }
}
