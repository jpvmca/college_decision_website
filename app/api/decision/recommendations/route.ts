import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backend}/decision/recommendations?${request.nextUrl.searchParams.toString()}`, { cache: 'no-store' });
  return NextResponse.json(await response.json(), { status: response.status });
}
