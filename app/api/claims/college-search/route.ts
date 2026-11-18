import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.slice(0, 120) || '';
  const college = request.nextUrl.searchParams.get('college')?.slice(0, 255) || '';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (college) params.set('college', college);
  const response = await fetch(`${backendUrl()}/claims/college-search?${params}`, { headers: visitorIpHeaders(request), cache: 'no-store' });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
