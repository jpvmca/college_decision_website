import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../../lib/backend-proxy';

/** Impression / click beacon for admin-managed ad units (counts only; no visitor data is stored). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { unitId?: unknown; event?: unknown };
    const unitId = Number(body?.unitId);
    if (Number.isInteger(unitId) && unitId > 0) {
      await fetch(`${backendUrl()}/ads/track`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, event: body.event === 'click' ? 'click' : 'impression' }), signal: AbortSignal.timeout(3000)
      });
    }
  } catch { /* ignore */ }
  return new NextResponse(null, { status: 204 });
}
