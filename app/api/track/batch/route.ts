import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

/** Same list the backend uses; checked here too so bot hits never cost a backend round trip. */
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|headless|lighthouse|pingdom|uptimerobot|semrush|ahrefs|bytespider|gptbot|claudebot|perplexity|google-inspectiontool/i;
/** Client batches are capped at ~60 KB (lib/journey/track.ts). */
const MAX_BODY_BYTES = 64_000;

const noContent = () => new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_UA.test(ua)) return noContent();
    const declared = Number(request.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const body = await request.text();
    if (!body || body.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: body ? 'Request too large' : 'Empty batch' }, { status: body ? 413 : 400 });
    }
    const response = await fetch(`${backendUrl()}/track/batch`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': ua,
        ...visitorIpHeaders(request)
      },
      body,
      cache: 'no-store'
    });
    if (response.status === 204) return noContent();
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  } catch {
    // Never break the page for tracking failures.
    return NextResponse.json({ error: 'Track unavailable' }, { status: 502 });
  }
}
