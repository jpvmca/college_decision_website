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
      // Soft-deleted duplicate NMIMS Bangalore (3188) -> canonical 20589
      {
        source: '/colleges/narsee-monjee-institute-of-management-studies-karnataka-bangalore/:path*',
        destination: '/colleges/narsee-monjee-institute-of-management-studies-nmims-karnataka-bangalore/:path*',
        statusCode: 301
      },
      // Soft-deleted duplicate IIIT Dharwad (61553) -> canonical 17380
      {
        source: '/colleges/indian-institute-of-information-technology-dharwad-c-56451/:path*',
        destination: '/colleges/indian-institute-of-information-technology-iiit-dharwad-karnataka-dharwad/:path*',
        statusCode: 301
      },
      // Soft-deleted duplicate SKNCOE (580, former girls'-only name; co-ed since 2006-07, same AICTE file/address) -> canonical 573
      {
        source: '/colleges/smt-kashibai-navale-college-of-engineering-for-girls-maharashtra-pune/:path*',
        destination: '/colleges/stes-smt-kashibai-navale-college-of-engineering-maharashtra-pune/:path*',
        statusCode: 301
      },
      // AITS Rajkot (227) became a constituent college of Atmiya University in 2018 (GoG letter 06/06/2018) -> 9524
      {
        source: '/colleges/atmiya-institute-of-technology-and-science-gujarat-rajkot/:path*',
        destination: '/colleges/atmiya-university-gujarat-rajkot/:path*',
        statusCode: 301
      },
      // Soft-deleted empty duplicate SKNCOE (71080, same college/address as 573) -> canonical 573
      {
        source: '/colleges/sinhgad-technical-education-societys-smt-kashibai-navale-college-of-engineering-vadgaon-bk-sinhgad-road-pune-41-c-41958/:path*',
        destination: '/colleges/stes-smt-kashibai-navale-college-of-engineering-maharashtra-pune/:path*',
        statusCode: 301
      },
      // Unpublished Surya World (1877; on MRSPTU unapproved list, not in 2025-26 affiliated list) -> Punjab engineering listing
      {
        source: '/colleges/surya-world-punjab-patiala/:path*',
        destination: '/engineering-colleges-in-punjab',
        statusCode: 301
      },
      // Inactive duplicate / alias exam slugs -> canonical published exam (duplicates consolidated 15 Oct 2026)
      { source: '/exams/neet-ug/:path*', destination: '/exams/neet/:path*', statusCode: 301 },
      { source: '/exams/neet-ug-1/:path*', destination: '/exams/neet/:path*', statusCode: 301 },
      { source: '/exams/mht-cet/:path*', destination: '/exams/mh-cet/:path*', statusCode: 301 },
      { source: '/exams/mht-cet-1/:path*', destination: '/exams/mh-cet/:path*', statusCode: 301 },
      { source: '/exams/mh-cet-1/:path*', destination: '/exams/mh-cet/:path*', statusCode: 301 },
      { source: '/exams/mh-cet-2/:path*', destination: '/exams/mh-cet/:path*', statusCode: 301 },
      // TS EAMCET renamed TG EAPCET; eamcet-2's Telangana data moved to ts-eapcet (AP rows to ap-eapcet)
      { source: '/exams/eamcet-2/:path*', destination: '/exams/ts-eapcet/:path*', statusCode: 301 },
      { source: '/exams/eamcet-1/:path*', destination: '/exams/ts-eapcet/:path*', statusCode: 301 },
      { source: '/exams/comedk/:path*', destination: '/exams/comedk-uget/:path*', statusCode: 301 },
      { source: '/exams/comedk-uget-3/:path*', destination: '/exams/comedk-uget/:path*', statusCode: 301 },
      { source: '/exams/comedk-uget-4/:path*', destination: '/exams/comedk-uget/:path*', statusCode: 301 },
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
