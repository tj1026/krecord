import { redirect } from 'next/navigation';
import { readContent } from '../lib/content';

export const dynamic = 'force-dynamic';

const designPages = ['/index.html', '/v2.html', '/v3.html', '/v4.html', '/v5.html'];

export default async function Home() {
  let content = null;
  try {
    content = await readContent();
  } catch {
    content = null;
  }

  // Design 5 is the live default. If the CMS hasn't set anything yet (fresh
  // database, or a design explicitly hidden), fall back to it rather than
  // Design 1.
  const target = designPages.find((page, i) => content?.[`design-${i + 1}-visibility`] === 'show') || '/v5.html';
  redirect(target);
}
