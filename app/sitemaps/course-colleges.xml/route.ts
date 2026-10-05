import { NextResponse } from 'next/server';
import { courseListingHref, listingFetchOptions } from '../../../lib/listings';

export const runtime = 'nodejs';
// Rollout toggles must be visible without waiting for the previous sitemap cache.
export const dynamic = 'force-dynamic';

type SitemapEntry = { key: string; label: string; count: number; lastmod: string | null };
type StatePageEntry = { courseSlug: string; stateSlug: string; count: number };
type CityPageEntry = { courseSlug: string; stateSlug: string; citySlug: string; count: number };

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
    const stateResponse = await fetch(`${backend}/colleges/state-pages`, { cache: 'no-store' });
    const statePayload = stateResponse.ok ? await stateResponse.json() as { data?: StatePageEntry[] } : { data: [] };
    const cityResponse = await fetch(`${backend}/colleges/city-pages`, { cache: 'no-store' });
    const cityPayload = cityResponse.ok ? await cityResponse.json() as { data?: CityPageEntry[] } : { data: [] };
    const allowed = allowlist();
    // Backend only returns eligible courses (>= MIN_COLLEGES_FOR_LISTING), sorted by college count desc. Page-1 URLs only.
    const entries = (payload.data || []).filter((entry) => !allowed || allowed.has(entry.key)).sort((a, b) => b.count - a.count);
    const body = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      entries.map((entry) => `<url><loc>${xml(`${base}${courseListingHref(entry.key)}`)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('') +
      // The backend returns only courses enabled in the admin rollout control.
      (statePayload.data || []).filter((entry) => !allowed || allowed.has(entry.courseSlug)).map((entry) => `<url><loc>${xml(`${base}/${entry.courseSlug}-colleges-in-${entry.stateSlug}`)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('') +
      (cityPayload.data || []).filter((entry) => !allowed || allowed.has(entry.courseSlug)).map((entry) => `<url><loc>${xml(`${base}/${entry.courseSlug}-colleges-in-${entry.citySlug}-${entry.stateSlug}`)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join('') +
      `</urlset>`;
    return new NextResponse(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store, max-age=0' } });
  } catch {
    return new NextResponse(EMPTY, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store, max-age=0' } });
  }
}
