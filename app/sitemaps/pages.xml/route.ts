import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
    const lastmod = today();
    const pages = [
      [`${base}/`, 'weekly', '1.0'],
      [`${base}/articles`, 'daily', '0.9'],
      [`${base}/colleges`, 'daily', '0.9'],
      [`${base}/exams`, 'weekly', '0.8'],
      [`${base}/courses`, 'weekly', '0.8'],
      [`${base}/compare-colleges-2026`, 'weekly', '0.9'],
      [`${base}/about`, 'monthly', '0.5'],
      [`${base}/contact`, 'monthly', '0.4'],
      [`${base}/privacy-policy`, 'yearly', '0.2'],
      [`${base}/terms-and-conditions`, 'yearly', '0.2'],
      [`${base}/disclaimer`, 'yearly', '0.2']
    ];
    const urls = pages.map(([url, changeFrequency, priority]) =>
      `<url><loc>${xml(url)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changeFrequency}</changefreq><priority>${priority}</priority></url>`
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
