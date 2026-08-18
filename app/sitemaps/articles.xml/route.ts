import { NextResponse } from 'next/server';

type ArticleIndex = { data: Array<{ slug: string }>; pagination: { totalPages: number } };
const MAX_URLS_PER_FILE = 45_000;

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function getPage(backend: string, page: number) {
  const response = await fetch(`${backend}/articles?type=all&page=${page}&perPage=50`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Article sitemap API failed: ${response.status}`);
  return response.json() as Promise<ArticleIndex>;
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  let articles: Array<{ slug: string }> = [];
  try {
    const first = await getPage(backend, 1);
    articles = [...first.data];
    const totalPages = Math.min(first.pagination.totalPages || 1, Math.ceil(MAX_URLS_PER_FILE / 50));
    for (let page = 2; page <= totalPages; page += 1) {
      const result = await getPage(backend, page);
      articles.push(...result.data);
    }
    articles = articles.slice(0, MAX_URLS_PER_FILE);
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
