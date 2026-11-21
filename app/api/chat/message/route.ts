import { NextRequest } from 'next/server';
import { backendUrl, visitorIpHeaders } from '../../../../lib/backend-proxy';

/** Proxy SSE chat stream from the backend. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    if (body.length > 5000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413 });
    }
    const response = await fetch(`${backendUrl()}/chat/message`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream', ...visitorIpHeaders(request) },
      body,
      cache: 'no-store'
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive'
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Chat unavailable' }), { status: 502 });
  }
}
