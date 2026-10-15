import { cutoffSitemapResponse } from '../../../lib/cutoff-sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// XML is built from the backend at most once per hour (Next data cache, tag 'cutoffs'); see lib/cutoff-sitemap.ts.
export async function GET() {
  return cutoffSitemapResponse('rank');
}
