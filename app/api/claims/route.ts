import { NextRequest } from 'next/server';
import { forwardMultipart } from '../../../lib/claim-proxy';

export async function POST(request: NextRequest) {
  return forwardMultipart(request, '/claims');
}
