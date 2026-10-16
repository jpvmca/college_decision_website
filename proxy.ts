import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Listing pages load further results client-side ("Load more") and filter tabs client-side, so these query
 * parameters never select a distinct page. Any request carrying them gets a 301 to the same path without them
 * (other parameters are kept). The target never carries a stripped parameter, so a redirect cannot loop.
 */
function strippedParams(pathname: string): string[] {
  if (pathname === '/exams') return ['page', 'course'];
  if (pathname === '/colleges' || pathname === '/courses') return ['page'];
  // Course, state and city college listings: /mba-colleges, /mba-colleges-in-maharashtra, /mba-colleges-in-pune-maharashtra.
  // Percentile/rank finder pages (/...-colleges-accepting-...) use their query string as a search form and are excluded.
  if (/^\/[a-z0-9-]+-colleges(-in-[a-z0-9-]+)?$/.test(pathname) && !pathname.includes('-colleges-accepting-')) return ['page'];
  return [];
}

export function proxy(request: NextRequest) {
  // This application has no Server Actions. Reject malformed/bot action
  // requests before Next.js tries to resolve a client reference manifest.
  if (request.headers.has('next-action')) {
    return new NextResponse('Server Actions are not supported.', { status: 400 });
  }
  const { pathname, searchParams } = request.nextUrl;
  // /articles keeps server pagination: only a valid ?page=N (N > 1) survives; everything else (type, budget, page=1, ...) goes.
  if (pathname === '/articles' && request.method === 'GET' && searchParams.size > 0) {
    const raw = searchParams.get('page');
    const n = raw && /^\d+$/.test(raw) ? Number(raw) : 1;
    const keep = n > 1 ? `?page=${n}` : '';
    if (request.nextUrl.search !== keep) {
      const url = request.nextUrl.clone();
      url.search = keep;
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }
  const strip = strippedParams(pathname).filter((name) => searchParams.has(name));
  if (strip.length && request.method === 'GET') {
    const url = request.nextUrl.clone();
    strip.forEach((name) => url.searchParams.delete(name));
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
