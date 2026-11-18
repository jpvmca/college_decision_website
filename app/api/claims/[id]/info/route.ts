import { NextRequest, NextResponse } from 'next/server';
import { forwardMultipart } from '../../../../../lib/claim-proxy';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  return forwardMultipart(request, `/claims/${id}/info`);
}
