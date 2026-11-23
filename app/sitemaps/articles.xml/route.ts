import { NextResponse } from 'next/server';
import { formatLastUpdatedIst } from '../../../lib/page-byline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_URLS_PER_FILE = 45_000;

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** IST YYYY-MM-DD, same value as the byline <time dateTime>. Omit lastmod when there is no usable date. */
function lastmodTag(value: string | null | undefined) {
  const lastmod = formatLastUpdatedIst(value)?.dateTime;
  return lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
}

async function getPublishedArticles(backend: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${backend}/articles/published-slugs?limit=${MAX_URLS_PER_FILE}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Article sitemap API failed: ${response.status}`);
    return response.json() as Promise<{ data: Array<string | { slug: string; published_at?: string | null; updated_at?: string | null }> }>;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  let articles: Array<{ slug: string; published_at?: string | null; updated_at?: string | null }> = [];
  try {
    const result = await getPublishedArticles(backend);
    articles = result.data.slice(0, MAX_URLS_PER_FILE).map((item) => (
      typeof item === 'string' ? { slug: item } : { slug: item.slug, published_at: item.published_at, updated_at: item.updated_at }
    )).filter((item) => item.slug);
  } catch {
    // Backend unavailable: answer 503 so crawlers retry instead of caching an empty article sitemap.
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 503,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '300' }
    });
  }

  try {
    const urls = articles.map((article) =>
      `<url><loc>${xml(`${base}/articles/${article.slug}`)}</loc>${lastmodTag(article.updated_at || article.published_at)}<changefreq>weekly</changefreq><priority>0.8</priority></url>`
    ).join('');
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
      }
    });
  } catch {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
    });
  }
}
