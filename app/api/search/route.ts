import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('q') || '';
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backendUrl}/search?q=${encodeURIComponent(keyword)}`, { cache: 'no-store' });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=30, stale-while-revalidate=120'
    }
  });
}
