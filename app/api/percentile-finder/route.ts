import { NextRequest, NextResponse } from 'next/server';

const ALLOWED = ['course', 'exam', 'year', 'percentile', 'category', 'varc', 'dilr', 'qa', 'state', 'city', 'programme', 'budget'];

/** Proxy used by the College Finder form to load options (years, states, programmes) for a course + exam. */
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const params = new URLSearchParams();
  ALLOWED.forEach((key) => { const v = input.get(key); if (v) params.set(key, v.slice(0, 80)); });
  if (!/^[a-z0-9-]+$/.test(params.get('exam') || '') || !params.get('course')) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backendUrl}/cutoffs/percentile-finder?${params}`, { cache: 'no-store' });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
