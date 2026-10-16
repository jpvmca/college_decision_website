import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';

/** Next batch of /articles (same type/budget filter) for the client-side "Load more" button. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const page = Math.max(1, Number(q.get('page')) || 1);
  const perPage = Math.min(50, Math.max(1, Number(q.get('perPage')) || 20));
  const type = /^[a-z-]{1,40}$/.test(q.get('type') || '') ? q.get('type') : 'all';
  const budget = [1, 3, 5, 10].includes(Number(q.get('budget'))) ? Number(q.get('budget')) : 5;
  try {
    const result = await api(`/articles?page=${page}&perPage=${perPage}&budget=${budget}&type=${type}`, { cache: 'no-store' });
    return NextResponse.json(result, { headers: { 'X-Robots-Tag': 'noindex' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load articles' }, { status: 502 });
  }
}
