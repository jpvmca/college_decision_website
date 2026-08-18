import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const instituteId = request.nextUrl.searchParams.get('instituteId');
  const courseId = request.nextUrl.searchParams.get('courseId');
  if (!instituteId || !courseId) {
    return NextResponse.json({ error: 'instituteId and courseId are required' }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backendUrl}/colleges/details?instituteId=${encodeURIComponent(instituteId)}&courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'content-type': 'application/json' }
  });
}
