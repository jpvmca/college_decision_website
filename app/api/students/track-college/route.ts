import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.length > 1000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const response = await fetch(`${backendUrl()}/students/track-college`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...visitorIpHeaders(request) },
    body,
    cache: 'no-store'
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
