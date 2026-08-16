import { NextResponse } from 'next/server';
import { readContent, writeContent } from '../../../lib/db';
import { safeEquals } from '../../../lib/auth';
import { clientKey, isRateLimited } from '../../../lib/rate-limit';
import { allFields } from '../../../lib/cms-schema';

export const runtime = 'nodejs';

// Uploaded images are stored inline as base64 data URIs, and the published
// content now ships inside the page itself. A serverless response can only
// carry about 4.5 MB, so a handful of uploads would stop being a heavy page
// and start being a homepage that returns nothing at all. Refuse the save
// while it can still be undone, and say which field caused it.
const MAX_CONTENT_BYTES = 2_500_000;
const fieldLabels = new Map(allFields.map(field => [field.key, field.label]));

function megabytes(bytes) {
  return (bytes / 1_000_000).toFixed(1) + ' MB';
}

function largestField(content) {
  let key = null;
  let bytes = 0;
  for (const [candidate, value] of Object.entries(content)) {
    if (typeof value !== 'string') continue;
    const size = Buffer.byteLength(value);
    if (size > bytes) {
      bytes = size;
      key = candidate;
    }
  }
  return { key, bytes };
}

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

    const totalBytes = Buffer.byteLength(JSON.stringify(content));
    if (totalBytes > MAX_CONTENT_BYTES) {
      const largest = largestField(content);
      const label = fieldLabels.get(largest.key) || largest.key;
      return NextResponse.json(
        {
          error:
            `This save is ${megabytes(totalBytes)}, over the ${megabytes(MAX_CONTENT_BYTES)} limit — publishing it would break the homepage. ` +
            `The biggest item is “${label}” at ${megabytes(largest.bytes)}. ` +
            'Uploaded images are stored inside the page, so use a hosted image URL for the large ones instead of uploading the file.'
        },
        { status: 413 }
      );
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
