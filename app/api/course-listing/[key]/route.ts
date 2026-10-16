import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../lib/api';
import { LISTINGS_CACHE_VERSION } from '../../../../lib/listings';

/** Next batch of a course listing (/mba-colleges etc.) for the client-side "Load more" button. Same ordering as the page. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
  const perPage = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('perPage')) || 20));
  try {
    const result = await api<{ data: unknown[]; pagination: unknown }>(`/listings/courses/${encodeURIComponent(key)}?page=${page}&perPage=${perPage}&v=${LISTINGS_CACHE_VERSION}`, { cache: 'no-store' });
    return NextResponse.json({ data: result.data, pagination: result.pagination }, { headers: { 'X-Robots-Tag': 'noindex' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load colleges' }, { status: 502 });
  }
}
