import { NextResponse } from 'next/server';

type ArticleIndex = { data: Array<{ slug: string }>; pagination: { totalPages: number } };

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  let articles: Array<{ slug: string }> = [];
  try {
    const firstResponse = await fetch(`${backend}/articles?type=all&page=1&perPage=50`, { cache: 'no-store' });
    const first = await firstResponse.json() as ArticleIndex;
    articles = [...first.data];
    const totalPages = Math.min(first.pagination.totalPages || 1, 100);
    if (totalPages > 1) {
      const pages = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => fetch(`${backend}/articles?type=all&page=${index + 2}&perPage=50`, { cache: 'no-store' }).then((response) => response.json() as Promise<ArticleIndex>)));
      articles.push(...pages.flatMap((page) => page.data));
    }
  } catch {
    articles = [];
  }

  const urls = articles.map((article) => `<url><loc>${escapeXml(`${base}/articles/${article.slug}`)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('');
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' }
  });
}
