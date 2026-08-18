import { NextResponse } from 'next/server';

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const body = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    `<sitemap><loc>${xml(`${base}/sitemaps/pages.xml`)}</loc></sitemap>` +
    `<sitemap><loc>${xml(`${base}/sitemaps/articles.xml`)}</loc></sitemap>` +
    `</sitemapindex>`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
    }
  });
}
