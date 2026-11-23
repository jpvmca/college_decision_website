import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand cache clear / revalidation, called by the backend.
 * Auth: header x-cache-clear-token must equal CACHE_CLEAR_TOKEN (or REVALIDATE_SECRET).
 * Body (optional JSON): { "tags": ["listings", "listing:mba", ...], "paths": ["/colleges/<slug>"] } revalidates just those tags / pages.
 * Without tags it clears the standard page paths plus every listing tag (full manual clear).
 *
 * Paths: a concrete path ('/colleges/<slug>') is revalidated as-is; a route pattern with a dynamic segment
 * ('/colleges/[slug]') needs the 'page' type, otherwise Next logs "revalidatePath type parameter missing"
 * and silently refreshes nothing. The full clear revalidates the root layout, which covers every ISR page
 * and every fetch made while rendering them, plus all data tags used by the public pages.
 */
const TAG_PATTERN = /^[a-z0-9:_-]{1,128}$/i;
const PATH_PATTERN = /^\/[a-z0-9/_\-\[\]]{1,200}$/i;
const FULL_CLEAR_TAGS = ['public', 'listings', 'listings:facets', 'listings:locations', 'listings:sitemap', 'cutoffs', 'closing', 'percentile', 'colleges', 'profiles', 'exams', 'courses', 'articles', 'ads', 'seo:linkable-entities', 'seo:internal-link-index', 'student-form-options'];

/** '/colleges/[slug]' (route pattern) => type 'page'; '/colleges/some-slug' (concrete URL) => no type. */
function revalidateOnePath(value: string) {
  if (value.includes('[')) revalidatePath(value, 'page');
  else revalidatePath(value);
}

export async function POST(request: NextRequest) {
  const tokens = [process.env.CACHE_CLEAR_TOKEN, process.env.REVALIDATE_SECRET].filter((value): value is string => Boolean(value));
  const provided = request.headers.get('x-cache-clear-token');
  if (!tokens.length || !provided || !tokens.includes(provided)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tags: string[] = [];
  let paths: string[] = [];
  try {
    const body = await request.json() as { tags?: unknown; paths?: unknown };
    if (Array.isArray(body?.tags)) tags = body.tags.filter((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag)).slice(0, 200);
    // Concrete page paths, e.g. "/colleges/<slug>" after a college claim is approved.
    if (Array.isArray(body?.paths)) paths = body.paths.filter((value): value is string => typeof value === 'string' && PATH_PATTERN.test(value)).slice(0, 50);
  } catch {
    // No/invalid JSON body: full clear.
  }

  if (tags.length || paths.length) {
    // expire: 0 => the next request refetches instead of serving the stale copy once.
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    for (const value of paths) revalidateOnePath(value);
    return NextResponse.json({ data: { cleared: true, tags, paths } });
  }

  // Full clear: every page under the root layout (all ISR pages, incl. dynamic [slug]/[listing] routes) ...
  revalidatePath('/', 'layout');
  // ... and every data tag the public pages fetch with, so shared fetches are refetched too.
  for (const tag of FULL_CLEAR_TAGS) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ data: { cleared: true } });
}
