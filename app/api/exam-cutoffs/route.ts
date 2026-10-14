import { NextRequest, NextResponse } from 'next/server';

const ALLOWED = ['year', 'round', 'category', 'quota', 'gender', 'paper', 'page', 'perPage'];

/** Proxy for client-side filters on exam cutoff pages: GET /api/exam-cutoffs?slug=<exam>&year=... */
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const slug = (input.get('slug') || '').trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'Invalid exam' }, { status: 400 });
  const params = new URLSearchParams();
  ALLOWED.forEach((key) => { const v = input.get(key); if (v) params.set(key, v.slice(0, 64)); });
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backendUrl}/exams/${encodeURIComponent(slug)}/cutoffs?${params}`, { cache: 'no-store' });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' }
  });
}
