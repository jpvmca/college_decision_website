import { NextResponse } from 'next/server';
import { formatLastUpdatedIst } from '../../../lib/page-byline';

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
    const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
    let examsLastmod = lastmod;
    try {
      const response = await fetch(`${backend}/exams?page=1&perPage=1`, { cache: 'no-store' });
      if (response.ok) {
        const payload = await response.json() as { updatedAt?: string | null };
        examsLastmod = formatLastUpdatedIst(payload.updatedAt)?.dateTime || lastmod;
      }
    } catch {
      // Directory timestamp unavailable: keep today's date for /exams only as a last resort.
    }
    const pages = [
      [`${base}/`, 'weekly', '1.0'],
      [`${base}/articles`, 'daily', '0.9'],
      [`${base}/colleges`, 'daily', '0.9'],
      [`${base}/exams`, 'weekly', '0.8'],
      [`${base}/courses`, 'weekly', '0.8'],
      [`${base}/compare-colleges-2026`, 'weekly', '0.9'],
      [`${base}/about`, 'monthly', '0.5'],
      [`${base}/contact`, 'monthly', '0.4'],
      [`${base}/for-colleges`, 'monthly', '0.4'],
      [`${base}/for-colleges/verification-policy`, 'yearly', '0.3'],
      [`${base}/privacy-policy`, 'yearly', '0.2'],
      [`${base}/terms-and-conditions`, 'yearly', '0.2'],
      [`${base}/disclaimer`, 'yearly', '0.2']
    ];
    const urls = pages.map(([url, changeFrequency, priority]) => {
      const pageLastmod = url === `${base}/exams` ? examsLastmod : lastmod;
      return `<url><loc>${xml(url)}</loc><lastmod>${pageLastmod}</lastmod><changefreq>${changeFrequency}</changefreq><priority>${priority}</priority></url>`;
    }).join('');
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
