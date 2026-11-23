import { api } from './api';

export type CourseFacet = {
  key: string;
  label: string;
  courseIds: number[];
  primaryCourseId: number;
  courseSlug: string;
  count: number;
};

export type CourseFacetList = { data: CourseFacet[]; totalColleges: number };

/** Matches /{key}-colleges top-level listing URLs, e.g. /mba-colleges, /ba-llb-colleges. */
export const COURSE_LISTING_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)-colleges$/;
/** Never served as listings even if a course derived to them (collide with other routes). */
const RESERVED_KEYS = new Set(['compare', 'compare-colleges', 'all', 'top', 'best', 'search', 'colleges', 'college', 'api']);

/**
 * Listing fetches are tagged ('listings', 'listings:facets', 'listing:{key}', 'listings:sitemap') and
 * revalidated on demand by the backend via /api/admin/cache/clear, with a time-based fallback.
 * This value is part of the fetch URL only for continuity with already-cached entries;
 * it no longer needs bumping.
 */
export const LISTINGS_CACHE_VERSION = '2';
/** Fallback revalidate window (seconds) if on-demand revalidation is not configured. */
export const LISTINGS_REVALIDATE_SECONDS = 900;

export function listingFetchOptions(tags: string[]) {
  return { next: { revalidate: LISTINGS_REVALIDATE_SECONDS, tags: ['listings', ...tags] } };
}

export function courseListingHref(key: string) {
  return `/${key}-colleges`;
}

export function parseCourseListingSegment(segment: string) {
  const match = COURSE_LISTING_PATTERN.exec(String(segment || ''));
  if (!match || RESERVED_KEYS.has(match[1])) return null;
  return match[1];
}

export async function getCourseFacets(): Promise<CourseFacetList> {
  try {
    return await api<CourseFacetList>(`/listings/courses?v=${LISTINGS_CACHE_VERSION}`, listingFetchOptions(['listings:facets']));
  } catch {
    return { data: [], totalColleges: 0 };
  }
}

export type ListingSummary = {
  total: number;
  privateCount: number;
  publicCount: number;
  cities: Array<{ name: string; slug: string; count: number }>;
  states?: Array<{ name: string; slug: string; count: number }>;
  exams?: Array<{ name: string; slug: string; count: number }>;
  topColleges?: Array<{ name: string; slug: string; city: string | null; state: string | null }>;
  fees: { n: number; min: number; max: number; median: number | null } | null;
  lastUpdated?: string | null;
};

export async function getListingSummary(courseSlug: string, stateSlug?: string | null, citySlug?: string | null): Promise<ListingSummary | null> {
  const params = new URLSearchParams({ course: courseSlug });
  if (stateSlug) params.set('state', stateSlug);
  if (citySlug) params.set('city', citySlug);
  params.set('v', 'lu1');
  try {
    const result = await api<{ data: ListingSummary }>(`/colleges/listing-summary?${params}`, listingFetchOptions([`listing-summary:${courseSlug}:${stateSlug || ''}:${citySlug || ''}`]));
    return result?.data || null;
  } catch {
    return null;
  }
}
