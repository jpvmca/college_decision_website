import { NextRequest, NextResponse } from 'next/server';
import { readableHtml } from '../../../lib/readable-html';

export async function GET(request: NextRequest) {
  const instituteId = request.nextUrl.searchParams.get('instituteId');
  const courseId = request.nextUrl.searchParams.get('courseId');
  if (!instituteId || !/^[0-9]+$/.test(instituteId)) {
    return NextResponse.json({ error: 'Valid instituteId is required' }, { status: 400 });
  }
  if (courseId && !/^[0-9]+$/.test(courseId)) {
    return NextResponse.json({ error: 'Valid courseId is required when provided' }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const query = new URLSearchParams({ instituteId });
  if (courseId) query.set('courseId', courseId);
  const response = await fetch(`${backendUrl}/colleges/details?${query.toString()}`, { cache: 'no-store' }).catch(() => null);
  if (!response) return NextResponse.json({ error: 'Details unavailable' }, { status: 502 });
  const body = await response.text();
  if (!response.ok) {
    return new NextResponse(body, { status: response.status, headers: { 'content-type': 'application/json' } });
  }
  try {
    const payload = JSON.parse(body) as { data?: { about?: string | null } };
    if (payload.data && payload.data.about) {
      payload.data.about = readableHtml(payload.data.about, { headingShift: 1 }) || payload.data.about;
    }
    return NextResponse.json(payload, { headers: { 'content-type': 'application/json' } });
  } catch {
    return new NextResponse(body, { status: response.status, headers: { 'content-type': 'application/json' } });
  }
}
