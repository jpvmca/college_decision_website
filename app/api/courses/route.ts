import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';

/** Next batch of /courses for the client-side "Load more" button. */
export async function GET(request: NextRequest) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
  const perPage = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('perPage')) || 20));
  try {
    const result = await api(`/courses?page=${page}&perPage=${perPage}`, { cache: 'no-store' });
    return NextResponse.json(result, { headers: { 'X-Robots-Tag': 'noindex' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load courses' }, { status: 502 });
  }
}
