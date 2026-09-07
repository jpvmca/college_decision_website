import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
  const perPage = Math.min(30, Math.max(1, Number(request.nextUrl.searchParams.get('perPage') || 20)));
  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(
    `${backendUrl}/articles/${encodeURIComponent(slug)}?page=${page}&perPage=${perPage}`,
    { cache: 'no-store' }
  );
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'content-type': 'application/json' }
  });
}
