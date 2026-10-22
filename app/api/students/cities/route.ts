import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../../lib/backend-proxy';

export async function GET(request: NextRequest) {
  const stateId = Number(request.nextUrl.searchParams.get('stateId'));
  if (!Number.isInteger(stateId) || stateId < 1) return NextResponse.json({ error: 'stateId is required' }, { status: 400 });
  const response = await fetch(`${backendUrl()}/students/form-options/cities?stateId=${stateId}`, { next: { revalidate: 3600 } });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': 'application/json', 'cache-control': response.ok ? 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400' : 'no-store' }
  });
}
