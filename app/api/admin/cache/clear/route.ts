import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = process.env.CACHE_CLEAR_TOKEN;
  if (!token || request.headers.get('x-cache-clear-token') !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  for (const path of ['/', '/articles', '/articles/[slug]', '/colleges', '/colleges/[slug]', '/courses', '/courses/[slug]', '/exams', '/exams/[slug]', '/search', '/sitemap.xml', '/sitemaps/pages.xml', '/sitemaps/articles.xml', '/sitemaps/colleges.xml', '/sitemaps/courses.xml', '/sitemaps/exams.xml', '/privacy-policy', '/terms-and-conditions', '/disclaimer']) {
    revalidatePath(path);
  }
  return NextResponse.json({ data: { cleared: true } });
}
