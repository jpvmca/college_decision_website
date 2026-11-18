import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for the college panel: /api/college-panel/<path> -> {BACKEND_API_URL}/college/<path>.
 * Adds the session from the httpOnly cookie as a Bearer token, and on a successful sign-in moves the
 * token from the response body into that cookie (the token is never exposed to page scripts).
 */
const COOKIE = 'cd_college_session';
const HINT_COOKIE = 'cd_college_hint';
const SEGMENT = /^[A-Za-z0-9_-]{1,80}$/;
const backendUrl = () => process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

type Ctx = { params: Promise<{ path: string[] }> };

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function handle(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  if (!path?.length || path.length > 8 || !path.every((segment) => SEGMENT.test(segment))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (request.method !== 'GET' && !sameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const route = path.join('/');
  const headers: Record<string, string> = { accept: 'application/json' };
  const contentType = request.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;
  const token = request.cookies.get(COOKIE)?.value;
  if (token) headers.authorization = `Bearer ${token}`;
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  if (forwarded) headers['x-forwarded-for'] = forwarded;
  const userAgent = request.headers.get('user-agent');
  if (userAgent) headers['user-agent'] = userAgent.slice(0, 255);

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl()}/college/${route}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      signal: AbortSignal.timeout(60_000)
    });
  } catch {
    return NextResponse.json({ error: 'The college panel is temporarily unavailable. Please try again.' }, { status: 503 });
  }
  const text = await upstream.text();
  const secure = process.env.NODE_ENV === 'production';

  if (route === 'auth/verify' && upstream.ok) {
    try {
      const body = JSON.parse(text) as { data?: { token?: string; expiresInSeconds?: number } };
      const sessionToken = body.data?.token;
      const maxAge = Number(body.data?.expiresInSeconds) || 72 * 3600;
      if (body.data) delete body.data.token;
      const response = NextResponse.json(body, { status: upstream.status, headers: { 'cache-control': 'no-store' } });
      if (sessionToken) {
        response.cookies.set(COOKIE, sessionToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge });
        // Non-secret UI hint for the public header ("College panel" instead of "College login").
        response.cookies.set(HINT_COOKIE, '1', { httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge });
      }
      return response;
    } catch {
      return NextResponse.json({ error: 'Sign-in failed. Please try again.' }, { status: 502 });
    }
  }

  const response = new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' }
  });
  if (route === 'auth/logout' || (upstream.status === 401 && !route.startsWith('auth/'))) {
    response.cookies.set(COOKIE, '', { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 });
    response.cookies.set(HINT_COOKIE, '', { httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: 0 });
  }
  return response;
}

export const GET = handle;
export const POST = handle;
