import { emptyUrlsetResponse, examCutoffEntries, getCutoffSitemapPayload, urlsetResponse } from '../../../lib/cutoff-sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return urlsetResponse(examCutoffEntries(await getCutoffSitemapPayload()));
  } catch {
    return emptyUrlsetResponse();
  }
}
