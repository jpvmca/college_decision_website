import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';

/** Exam directory batches for the client-side course tabs and "Load more" on /exams. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const page = Math.max(1, Number(q.get('page')) || 1);
  const perPage = Math.min(30, Math.max(1, Number(q.get('perPage')) || 20));
  const course = (q.get('course') || '').trim().toLowerCase();
  if (course && !/^[a-z0-9-]{1,80}$/.test(course)) return NextResponse.json({ error: 'Invalid course' }, { status: 400 });
  try {
    const result = await api(`/exams?page=${page}&perPage=${perPage}${course ? `&course=${encodeURIComponent(course)}` : ''}`, { cache: 'no-store' });
    return NextResponse.json(result, { headers: { 'X-Robots-Tag': 'noindex' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load exams' }, { status: 502 });
  }
}
