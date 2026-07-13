import { get } from '@vercel/blob';

export async function readContent() {
  const result = await get('cms/content.json', { access: 'private', useCache: false });
  if (!result) return null;
  return new Response(result.stream).json();
}
