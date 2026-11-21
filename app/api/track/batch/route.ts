import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    if (body.length > 100_000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const response = await fetch(`${backendUrl()}/track/batch`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': request.headers.get('user-agent') || '',
        ...visitorIpHeaders(request)
      },
      body,
      cache: 'no-store'
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  } catch {
    // Never break the page for tracking failures.
    return NextResponse.json({ error: 'Track unavailable' }, { status: 502 });
  }
}
