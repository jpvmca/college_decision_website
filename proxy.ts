import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // This application has no Server Actions. Reject malformed/bot action
  // requests before Next.js tries to resolve a client reference manifest.
  if (request.headers.has('next-action')) {
    return new NextResponse('Server Actions are not supported.', { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
