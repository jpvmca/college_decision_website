import type { MetadataRoute } from 'next';

// Filter/finder query parameters never select a distinct page (301'd away or noindex). Both the first (?x=) and later (&x=)
// position are listed exactly, so clean URLs and ?page= (articles pagination) stay crawlable.
const BLOCKED_PARAMS = ['budget', 'type', 'course', 'percentile', 'category', 'rank'];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/search', '/api/', ...BLOCKED_PARAMS.flatMap((p) => [`/*?${p}=`, `/*&${p}=`])] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/automate' }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
