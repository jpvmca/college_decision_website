import { NextResponse } from 'next/server';

const MAX_URLS_PER_FILE = 45_000;

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function getPublishedSlugs(backend: string) {
  const response = await fetch(`${backend}/articles/published-slugs?limit=${MAX_URLS_PER_FILE}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Article sitemap API failed: ${response.status}`);
  return response.json() as Promise<{ data: string[] }>;
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  let articles: Array<{ slug: string }> = [];
  try {
    const result = await getPublishedSlugs(backend);
    articles = result.data.slice(0, MAX_URLS_PER_FILE).map((slug) => ({ slug }));
  } catch {
    articles = [];
  }
  const urls = articles.map((article) =>
    `<url><loc>${xml(`${base}/articles/${article.slug}`)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  ).join('');
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
    }
  });
}
