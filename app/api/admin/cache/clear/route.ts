import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand cache clear / revalidation, called by the backend.
 * Auth: header x-cache-clear-token must equal CACHE_CLEAR_TOKEN (or REVALIDATE_SECRET).
 * Body (optional JSON): { "tags": ["listings", "listing:mba", ...] } revalidates just those fetch tags.
 * Without tags it clears the standard page paths plus every listing tag (full manual clear).
 */
const TAG_PATTERN = /^[a-z0-9:_-]{1,128}$/i;

export async function POST(request: NextRequest) {
  const tokens = [process.env.CACHE_CLEAR_TOKEN, process.env.REVALIDATE_SECRET].filter((value): value is string => Boolean(value));
  const provided = request.headers.get('x-cache-clear-token');
  if (!tokens.length || !provided || !tokens.includes(provided)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body = await request.json() as { tags?: unknown };
    if (Array.isArray(body?.tags)) tags = body.tags.filter((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag)).slice(0, 200);
  } catch {
    // No/invalid JSON body: full clear.
  }

  if (tags.length) {
    // expire: 0 => the next request refetches instead of serving the stale copy once.
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ data: { cleared: true, tags } });
  }

  for (const path of ['/', '/articles', '/articles/[slug]', '/colleges', '/colleges/[slug]', '/courses', '/courses/[slug]', '/exams', '/exams/[slug]', '/search', '/sitemap.xml', '/sitemaps/pages.xml', '/sitemaps/articles.xml', '/sitemaps/colleges.xml', '/sitemaps/courses.xml', '/sitemaps/exams.xml', '/sitemaps/course-colleges.xml', '/privacy-policy', '/terms-and-conditions', '/disclaimer']) {
    revalidatePath(path);
  }
  revalidateTag('listings', { expire: 0 });
  return NextResponse.json({ data: { cleared: true } });
}
