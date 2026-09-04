import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
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
