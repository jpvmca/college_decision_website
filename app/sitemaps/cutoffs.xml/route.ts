import { collegeCutoffEntries, emptyUrlsetResponse, getCutoffSitemapPayload, urlsetResponse } from '../../../lib/cutoff-sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// College cutoff pages only (/colleges/{slug}/cutoff). Finder and exam cutoff URLs live in
// cutoff-percentile.xml, cutoff-rank.xml and exam-cutoffs.xml.
export async function GET() {
  try {
    return urlsetResponse(await collegeCutoffEntries(await getCutoffSitemapPayload()));
  } catch {
    return emptyUrlsetResponse();
  }
}
