import { NextResponse } from 'next/server';
import { backendUrl } from '../../../../lib/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const response = await fetch(`${backendUrl()}/students/form-options`, { next: { revalidate: 3600, tags: ['student-form-options'] } });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': 'application/json', 'cache-control': response.ok ? 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400' : 'no-store' }
  });
}
