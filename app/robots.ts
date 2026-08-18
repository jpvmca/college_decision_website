import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/search', '/api/'] },
    sitemap: [`${base}/sitemap.xml`, `${base}/sitemap/article.xml`]
  };
}
