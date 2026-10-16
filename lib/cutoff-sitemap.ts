import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

/** Cutoff sitemaps are rebuilt at most once an hour (or on revalidateTag('cutoffs') from the admin cache clear). */
export const SITEMAP_REVALIDATE = 3600;
const SITEMAP_TAGS = ['cutoffs', 'sitemaps'];
export const SITEMAP_CACHE_CONTROL = `public, max-age=${SITEMAP_REVALIDATE}, s-maxage=${SITEMAP_REVALIDATE}, stale-while-revalidate=86400`;

export type SitemapEntry = { loc: string; lastmod?: string | null; changefreq: string; priority: string };

type Payload = { colleges?: Array<{ slug: string; updatedAt?: string | null }>; exams?: Array<{ slug: string; years?: number[] }> };
type Facet = { key: string; courseIds: number[]; courseSlug: string };
type PercentileCombo = { course_id: number; course_slug: string; exam_slug: string };
type ClosingCombo = { course_id: number; course_slug: string; exam_slug: string; kind: string; levels: number[] };

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

function backendBase() {
  return process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${backendBase()}${path}`, { next: { revalidate: SITEMAP_REVALIDATE, tags: SITEMAP_TAGS } });
  if (!res.ok) throw new Error(`Backend ${path} returned ${res.status}`);
  return (await res.json()) as T;
}

/** College + exam cutoff data used by every cutoff sitemap. */
export async function getCutoffSitemapPayload(): Promise<Payload> {
  const raw = await getJson<{ data?: Payload } & Payload>('/cutoffs/sitemap');
  return (raw && (raw.data || raw)) || {};
}

/** Most recent cutoff update across colleges: used as lastmod for derived pages. */
export function latestCutoffUpdate(payload: Payload): string {
  let max = 0;
  (payload.colleges || []).forEach((c) => {
    const t = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
    if (Number.isFinite(t) && t > max) max = t;
  });
  return new Date(max || Date.now()).toISOString();
}

async function getFacets(): Promise<Facet[]> {
  return (await getJson<{ data?: Facet[] }>('/listings/courses'))?.data || [];
}

function facetFor(facets: Facet[], c: { course_id: number; course_slug: string }) {
  return facets.find((x) => x.courseIds.includes(c.course_id) || x.courseSlug === c.course_slug);
}

/** /colleges/{slug}/cutoff. The backend lists only colleges with a published exam, so every page returns 200. */
export function collegeCutoffEntries(payload: Payload): SitemapEntry[] {
  const base = siteBase();
  const fallback = latestCutoffUpdate(payload);
  return (payload.colleges || []).map((c) => ({
    loc: `${base}/colleges/${c.slug}/cutoff`,
    lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString() : fallback,
    changefreq: 'monthly',
    priority: '0.6'
  }));
}

/** /exams/{slug}/cutoff and /exams/{slug}/cutoff/{year} for multi-year exams. */
export function examCutoffEntries(payload: Payload): SitemapEntry[] {
  const base = siteBase();
  const lastmod = latestCutoffUpdate(payload);
  const out: SitemapEntry[] = [];
  (payload.exams || []).forEach((e) => {
    if (!e.years?.length) return;
    out.push({ loc: `${base}/exams/${e.slug}/cutoff`, lastmod, changefreq: 'monthly', priority: '0.7' });
    if (e.years.length > 1) e.years.forEach((y) => out.push({ loc: `${base}/exams/${e.slug}/cutoff/${y}`, lastmod, changefreq: 'yearly', priority: '0.6' }));
  });
  return out;
}

/** /{course}-colleges-accepting-{N}-percentile-{exam} or -{N}-rank-in-{exam}. */
export async function finderEntries(kind: 'percentile' | 'rank', payload: Payload): Promise<SitemapEntry[]> {
  const base = siteBase();
  const lastmod = latestCutoffUpdate(payload);
  const [facets, closingRaw, percentileRaw] = await Promise.all([
    getFacets(),
    getJson<{ data?: ClosingCombo[] }>('/cutoffs/closing-combos'),
    kind === 'percentile' ? getJson<{ data?: PercentileCombo[] }>('/cutoffs/percentile-combos') : Promise.resolve(null)
  ]);
  const seen = new Set<string>();
  const out: SitemapEntry[] = [];
  const add = (path: string, priority: string) => {
    const loc = `${base}${path}`;
    if (seen.has(loc)) return;
    seen.add(loc);
    out.push({ loc, lastmod, changefreq: 'monthly', priority });
  };
  if (kind === 'percentile') {
    (percentileRaw?.data || []).forEach((c) => {
      const f = facetFor(facets, c);
      if (f) [95, 90, 80].forEach((n) => add(`/${f.key}-colleges-accepting-${n}-percentile-${c.exam_slug}`, '0.7'));
    });
  }
  (closingRaw?.data || []).forEach((c) => {
    if ((c.kind === 'rank') !== (kind === 'rank')) return;
    const f = facetFor(facets, c);
    if (!f) return;
    c.levels.forEach((n) => add(`/${f.key}-colleges-accepting-${n}-${kind === 'rank' ? 'rank-in' : 'percentile'}-${c.exam_slug}`, '0.6'));
  });
  return out;
}

function urlsetXml(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    entries.map((e) => `<url><loc>${xml(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`).join('') +
    `</urlset>`;
}

export type CutoffSitemapKind = 'colleges' | 'percentile' | 'rank' | 'exams';

async function buildSitemapXml(kind: CutoffSitemapKind): Promise<string> {
  const payload = await getCutoffSitemapPayload();
  if (kind === 'colleges') return urlsetXml(collegeCutoffEntries(payload));
  if (kind === 'exams') return urlsetXml(examCutoffEntries(payload));
  return urlsetXml(await finderEntries(kind, payload));
}

/** Built XML is cached in the Next data cache; a backend error throws, so failures are never cached. */
const cachedSitemapXml = unstable_cache(buildSitemapXml, ['cutoff-sitemap-xml-v2'], { revalidate: SITEMAP_REVALIDATE, tags: SITEMAP_TAGS });

export async function cutoffSitemapResponse(kind: CutoffSitemapKind) {
  try {
    const body = await cachedSitemapXml(kind);
    return new NextResponse(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': SITEMAP_CACHE_CONTROL } });
  } catch {
    return emptyUrlsetResponse();
  }
}

export function emptyUrlsetResponse() {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
    // 503 + no-store: a backend failure must not be served (or cached by Cloudflare/crawlers) as an empty but valid sitemap.
    status: 503,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '300' }
  });
}
