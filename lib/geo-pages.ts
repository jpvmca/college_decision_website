import { api } from './api';
import { getCourseFacets, listingFetchOptions, type CourseFacet } from './listings';

/**
 * Single source of truth for state/city course landing URLs.
 * The backend returns pages keyed by course slug (e.g. "commerce"); the public URL uses the
 * listing facet key (e.g. "bcom"), exactly as app/[listing]/page.tsx resolves them.
 */
export type StateGeoPage = { courseSlug: string; stateSlug: string; stateName: string; count: number | string };
export type CityGeoPage = StateGeoPage & { citySlug: string; cityName: string };
export type GeoLink<T> = T & { href: string; facet: CourseFacet };

async function list<T>(path: string, tag: string): Promise<T[]> {
  try {
    const response = await api<{ data?: T[] }>(path, listingFetchOptions([tag]));
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

export function stateLandingHref(facetKey: string, stateSlug: string) {
  return `/${facetKey}-colleges-in-${stateSlug}`;
}

export function cityLandingHref(facetKey: string, citySlug: string, stateSlug: string) {
  return `/${facetKey}-colleges-in-${citySlug}-${stateSlug}`;
}

/** First facet for a course slug, matching the route's first-match lookup. */
function facetFor(facets: CourseFacet[], courseSlug: string) {
  return facets.find((facet) => facet.courseSlug === courseSlug) || null;
}

export async function getGeoLandingPages() {
  const [facets, states, cities] = await Promise.all([
    getCourseFacets(),
    list<StateGeoPage>('/colleges/state-pages', 'listings:locations'),
    list<CityGeoPage>('/colleges/city-pages', 'listings:locations')
  ]);
  const statePages: GeoLink<StateGeoPage>[] = [];
  for (const entry of states) {
    const facet = facetFor(facets.data, entry.courseSlug);
    if (facet && entry.stateSlug) statePages.push({ ...entry, facet, href: stateLandingHref(facet.key, entry.stateSlug) });
  }
  const cityPages: GeoLink<CityGeoPage>[] = [];
  for (const entry of cities) {
    const facet = facetFor(facets.data, entry.courseSlug);
    if (facet && entry.citySlug && entry.stateSlug) cityPages.push({ ...entry, facet, href: cityLandingHref(facet.key, entry.citySlug, entry.stateSlug) });
  }
  return { statePages, cityPages };
}
