import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      {
        source: '/articles',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' }]
      },
      {
        source: '/articles/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' }]
      },
      {
        source: '/sitemaps/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=3600' }]
      },
      {
        // Cutoff sitemaps and the index: cached for an hour by browsers/CDNs (data is also cached in Next).
        source: '/sitemaps/:name(cutoffs|cutoff-percentile|cutoff-rank|exam-cutoffs).xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' }]
      },
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' }]
      }
    ];
  },
  async redirects() {
    return [
      // Duplicate college 35726 (IMDR Pune) merged into canonical 1737
      {
        source: '/colleges/imdr-pune-maharashtra-pune/:path*',
        destination: '/colleges/institute-of-management-development-and-research-maharashtra-pune/:path*',
        statusCode: 301
      },
      { source: '/courses/btech', destination: '/courses/engineering', permanent: true },
      { source: '/btech-colleges', destination: '/engineering-colleges', permanent: true },
      {
        source: '/articles/chandigarh-university-cu-vs-chitkara-university-chandigarh-engineering-decision-guide',
        destination: '/articles/chandigarh-university-vs-chitkara-university-chandigarh-btech-engineering-decision-guide',
        permanent: true
      },
      {
        source: '/articles/chandigarh-university-cu-chandigarh-vs-chitkara-university-chandigarh-engineering-decision-guide',
        destination: '/articles/chandigarh-university-vs-chitkara-university-chandigarh-btech-engineering-decision-guide',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
