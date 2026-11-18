import { NextRequest } from 'next/server';
import { forwardJson } from '../../../../lib/claim-proxy';

export async function POST(request: NextRequest) {
  return forwardJson(request, '/otp/verify', 2000);
}
