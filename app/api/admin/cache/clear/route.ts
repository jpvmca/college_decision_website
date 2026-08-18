import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = process.env.CACHE_CLEAR_TOKEN;
  if (!token || request.headers.get('x-cache-clear-token') !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  for (const path of ['/', '/articles', '/search', '/sitemap.xml', '/sitemaps/pages.xml', '/sitemaps/articles.xml', '/privacy-policy', '/terms-and-conditions', '/disclaimer']) {
    revalidatePath(path);
  }
  return NextResponse.json({ data: { cleared: true } });
}
