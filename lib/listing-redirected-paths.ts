/**
 * Listing URLs that next.config.ts permanently redirects (301/308) elsewhere.
 * A redirected URL must not be listed in a sitemap. Keep in sync with the
 * `-colleges` sources in next.config.ts redirects(); this list never adds or
 * removes a redirect itself.
 * /bsc-colleges-in-himachal-pradesh is deliberately not listed here: its redirect vs
 * state-page eligibility is waiting on an owner decision.
 */
export const REDIRECTED_LISTING_PATHS: ReadonlySet<string> = new Set([
  '/architecture-colleges',
  '/aviation-pg-colleges',
  '/b-chem-eng-colleges',
  '/btech-colleges',
  '/bums-colleges',
  '/dental-colleges',
  '/diploma-design-colleges',
  '/diploma-in-library-science-colleges',
  '/m-chem-eng-colleges',
  '/m-ed-colleges',
  '/mph-colleges',
  '/online-ma-colleges',
  '/online-mca-colleges',
  '/online-msc-colleges',
  '/physiotherapy-colleges',
  '/polytechnic-diploma-colleges'
]);
