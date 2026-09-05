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
      }
    ];
  },
  async redirects() {
    return [
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
