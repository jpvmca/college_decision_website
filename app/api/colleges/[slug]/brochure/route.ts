import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../../lib/backend-proxy';

/** Brochure download gate: student token (from the enquiry form) -> short-lived PDF link. */
export async function POST(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,255}$/.test(slug)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.text();
  if (body.length > 1000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const response = await fetch(`${backendUrl()}/colleges/${slug}/brochure`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...visitorIpHeaders(request) },
    body,
    cache: 'no-store'
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
