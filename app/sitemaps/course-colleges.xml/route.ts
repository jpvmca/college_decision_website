import { NextResponse } from 'next/server';
import { courseListingHref, listingFetchOptions } from '../../../lib/listings';

export const runtime = 'nodejs';
// Cached like the listing pages: time-based fallback + on-demand via the 'listings' / 'listings:sitemap' tags.
export const revalidate = 900;

type SitemapEntry = { key: string; label: string; count: number; lastmod: string | null };

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Optional rollout allowlist: LISTING_SITEMAP_KEYS="mba,btech,bba". Unset/empty = all eligible courses. */
function allowlist() {
  const raw = (process.env.LISTING_SITEMAP_KEYS || '').trim();
  if (!raw) return null;
  return new Set(raw.split(',').map((key) => key.trim().toLowerCase()).filter(Boolean));
}

const EMPTY = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  try {
    const response = await fetch(`${backend}/listings/sitemap`, listingFetchOptions(['listings:sitemap']));
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const payload = await response.json() as { data?: SitemapEntry[] };
    const allowed = allowlist();
    // Backend only returns eligible courses (>= MIN_COLLEGES_FOR_LISTING), sorted by college count desc. Page-1 URLs only.
    const entries = (payload.data || []).filter((entry) => !allowed || allowed.has(entry.key)).sort((a, b) => b.count - a.count);
    const body = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      entries.map((entry) => `<url><loc>${xml(`${base}${courseListingHref(entry.key)}`)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('') +
      `</urlset>`;
    return new NextResponse(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
  } catch {
    return new NextResponse(EMPTY, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  }
}
