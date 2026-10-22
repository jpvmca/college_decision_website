import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const response = await fetch(`${backendUrl()}/students/geo`, { headers: visitorIpHeaders(request), cache: 'no-store' });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } });
}
