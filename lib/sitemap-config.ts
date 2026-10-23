// Max URLs per paginated sitemap file (sitemaps.org limit is 50,000; we use 5,000 for faster, smaller files).
export const SITEMAP_PAGE_SIZE = 5000;

export function sitemapPageCount(total: number) {
  return Math.max(1, Math.ceil(total / SITEMAP_PAGE_SIZE));
}

// Number of /sitemaps/colleges/N.xml files, derived from the live published-college count.
export async function collegeSitemapPageCount(): Promise<number> {
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const response = await fetch(`${backend}/colleges/published-slugs`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  const payload = await response.json() as { data?: unknown[] };
  return sitemapPageCount((payload.data || []).length);
}
