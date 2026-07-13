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

  const target = designPages.find((page, i) => content?.[`design-${i + 1}-visibility`] !== 'hide') || designPages[0];
  redirect(target);
}
