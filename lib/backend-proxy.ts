import type { NextRequest } from 'next/server';

export const backendUrl = () => process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

/** Visitor IP as seen by the website (nginx sets X-Forwarded-For / X-Real-IP), forwarded to the backend. */
export function visitorIpHeaders(request: NextRequest): Record<string, string> {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim();
  return forwarded ? { 'x-forwarded-for': forwarded } : {};
}
