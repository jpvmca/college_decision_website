import { NextResponse } from 'next/server';
import { backendUrl } from '../../../../lib/backend-proxy';

export async function GET() {
  try {
    const response = await fetch(`${backendUrl()}/chat/consent`, { cache: 'no-store' });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  } catch {
    return NextResponse.json({ error: 'Consent unavailable' }, { status: 502 });
  }
}
