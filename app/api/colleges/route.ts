import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  try {
    const result = await api(`/colleges${query ? `?${query}` : ''}`, { cache: 'no-store' });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Unable to load colleges' }, { status: 502 });
  }
}
