import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../../../lib/backend-proxy';

/** Public summary for an unpublished college search popup. Safe fields only. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9]+$/.test(id)) {
    return NextResponse.json({ error: 'Valid college id is required' }, { status: 400 });
  }
  const response = await fetch(`${backendUrl()}/colleges/unpublished/${id}`, { next: { revalidate: 1800, tags: ['colleges', `college-id:${id}`] } }).catch(() => null);
  if (!response) return NextResponse.json({ error: 'Details unavailable' }, { status: 502 });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      'content-type': 'application/json',
      'cache-control': response.ok ? 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600' : 'no-store'
    }
  });
}
