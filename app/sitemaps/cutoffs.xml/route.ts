import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function xml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

type Payload = { colleges?: Array<{ slug: string; updatedAt?: string | null }>; exams?: Array<{ slug: string; years?: number[] }> };

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const backend = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
  try {
    const response = await fetch(`${backend}/cutoffs/sitemap`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const raw = await response.json() as { data?: Payload } & Payload;
    const payload: Payload = raw.data || raw;
    const urls: string[] = [];
    (payload.colleges || []).forEach((c) => urls.push(`<url><loc>${xml(`${base}/colleges/${c.slug}/cutoff`)}</loc>${c.updatedAt ? `<lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.6</priority></url>`));
    // /{course}-colleges-accepting-{80|90|95}-percentile-{exam}: only course+exam combos with published percentile minimums.
    try {
      const [combosRes, facetsRes] = await Promise.all([
        fetch(`${backend}/cutoffs/percentile-combos`, { cache: 'no-store' }),
        fetch(`${backend}/listings/courses`, { cache: 'no-store' })
      ]);
      const combos = combosRes.ok ? ((await combosRes.json()) as { data?: Array<{ course_id: number; course_slug: string; exam_slug: string }> }).data || [] : [];
      const facets = facetsRes.ok ? ((await facetsRes.json()) as { data?: Array<{ key: string; courseIds: number[]; courseSlug: string }> }).data || [] : [];
      combos.forEach((c) => {
        const f = facets.find((x) => x.courseIds.includes(c.course_id) || x.courseSlug === c.course_slug);
        if (f) [95, 90, 80].forEach((n) => urls.push(`<url><loc>${xml(`${base}/${f.key}-colleges-accepting-${n}-percentile-${c.exam_slug}`)}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`));
      });
      const closingRes = await fetch(`${backend}/cutoffs/closing-combos`, { cache: 'no-store' });
      const closing = closingRes.ok ? ((await closingRes.json()) as { data?: Array<{ course_id: number; course_slug: string; exam_slug: string; kind: string; levels: number[] }> }).data || [] : [];
      closing.forEach((c) => {
        const f = facets.find((x) => x.courseIds.includes(c.course_id) || x.courseSlug === c.course_slug);
        if (!f) return;
        c.levels.forEach((n) => urls.push(`<url><loc>${xml(`${base}/${f.key}-colleges-accepting-${n}-${c.kind === 'rank' ? 'rank-in' : 'percentile'}-${c.exam_slug}`)}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`));
      });
    } catch { /* percentile pages are optional in the sitemap */ }
    (payload.exams || []).forEach((e) => {
      if (!e.years?.length) return;
      urls.push(`<url><loc>${xml(`${base}/exams/${e.slug}/cutoff`)}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
      if (e.years.length > 1) e.years.forEach((y) => urls.push(`<url><loc>${xml(`${base}/exams/${e.slug}/cutoff/${y}`)}</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`));
    });
    const body = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.join('') +
      `</urlset>`;
    return new NextResponse(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
  } catch {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
    });
  }
}
