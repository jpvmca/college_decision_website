import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../../lib/backend-proxy';

/** Typeahead proxy. Query is length-capped here and sanitised again by the backend. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').slice(0, 80);
  const limit = Math.min(30, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 5));
  const response = await fetch(`${backendUrl()}/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`, { cache: 'no-store' }).catch(() => null);
  if (!response) return NextResponse.json({ error: 'Search unavailable' }, { status: 502 });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': 'application/json', 'cache-control': response.ok ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=120' : 'no-store', ...(response.headers.get('server-timing') ? { 'server-timing': response.headers.get('server-timing') as string } : {}) }
  });
}
