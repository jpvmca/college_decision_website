import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, visitorIpHeaders } from './backend-proxy';

/** Largest claim upload the website forwards: 5 files at the backend limit plus form fields. */
const MAX_MULTIPART_BYTES = 5 * 10 * 1024 * 1024 + 256 * 1024;

function json(text: string, status: number) {
  return new NextResponse(text, { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

/** Forwards a small JSON POST to the backend with the visitor IP. */
export async function forwardJson(request: NextRequest, path: string, maxBytes = 8000) {
  const body = await request.text();
  if (body.length > maxBytes) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  const response = await fetch(`${backendUrl()}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...visitorIpHeaders(request) },
    body,
    cache: 'no-store'
  });
  return json(await response.text(), response.status);
}

/** Streams a multipart upload (claim documents) to the backend without buffering it in Next. */
export async function forwardMultipart(request: NextRequest, path: string) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return NextResponse.json({ error: 'Expected a form upload' }, { status: 415 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_MULTIPART_BYTES) return NextResponse.json({ error: 'The upload is too large. Each file must be 10 MB or smaller.' }, { status: 413 });
  const headers: Record<string, string> = { 'content-type': contentType, ...visitorIpHeaders(request) };
  if (length) headers['content-length'] = String(length);
  const userAgent = request.headers.get('user-agent');
  if (userAgent) headers['user-agent'] = userAgent.slice(0, 300);
  const response = await fetch(`${backendUrl()}${path}`, {
    method: 'POST',
    headers,
    body: request.body,
    cache: 'no-store',
    // Required by Node fetch when the body is a stream.
    duplex: 'half'
  } as RequestInit & { duplex: 'half' });
  return json(await response.text(), response.status);
}
