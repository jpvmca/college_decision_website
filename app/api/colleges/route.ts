import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';
import { listingFetchOptions } from '../../../lib/listings';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  try {
    const result = await api(`/colleges${query ? `?${query}` : ''}`, listingFetchOptions(['listings:colleges']));
    return NextResponse.json(result, { headers: { 'cache-control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load colleges' }, { status: 502 });
  }
}
