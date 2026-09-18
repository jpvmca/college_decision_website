import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  const path = (await params).path || [];
  const page = Math.max(1, Number(String(path[path.length - 1] || '1').replace(/\.xml$/, '')) || 1);
  try {
    const response = await fetch(`${backend}/colleges/published-slugs`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const payload = await response.json() as { data?: Array<{ slug: string; updatedAt?: string | null }> };
    const start = (page - 1) * 40000;
    const rows = (payload.data || []).slice(start, start + 40000);
    const body = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      rows.map((row) => `<url><loc>${xml(`${base}/colleges/${row.slug}`)}</loc>${row.updatedAt ? `<lastmod>${new Date(row.updatedAt).toISOString()}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('') +
      `</urlset>`;
    return new NextResponse(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
  } catch {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
    });
  }
}
