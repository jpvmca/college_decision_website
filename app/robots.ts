import type { MetadataRoute } from 'next';

// Filter/finder query parameters never select a distinct page (301'd away or noindex). Both the first (?x=) and later (&x=)
// position are listed exactly, so clean URLs and ?page= (articles pagination) stay crawlable.
// Claim form and college panel: private, never crawled (pages are also noindex).
const PRIVATE_PATHS = ['/for-colleges/claim', '/college/'];
const BLOCKED_PARAMS = ['budget', 'type', 'course', 'percentile', 'category', 'rank'];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  return {
    rules: [
      {
        userAgent: '*',
        // The longest matching rule wins (RFC 9309), so /for-colleges/claim stays blocked under the /for-colleges allow.
        allow: ['/', '/for-colleges', '/for-colleges/verification-policy'],
        disallow: ['/search', '/api/', ...PRIVATE_PATHS, ...BLOCKED_PARAMS.flatMap((p) => [`/*?${p}=`, `/*&${p}=`])]
      },
      { userAgent: 'GPTBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'ClaudeBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'PerplexityBot', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: 'Google-Extended', allow: '/automate' }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
