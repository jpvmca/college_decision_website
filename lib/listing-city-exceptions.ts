/**
 * Mirror of CITY_PAGE_MIN_EXCEPTIONS in the backend course-listing-keys.ts.
 * Keep the two lists identical. The website uses this to skip the 15-college
 * city check for the named Online MBA Lucknow and Kanpur pages only.
 */
export const CITY_PAGE_MIN_COLLEGES = 15;

export const CITY_PAGE_MIN_EXCEPTIONS = [
  { courseSlug: 'online-mba', courseKey: 'online-mba', citySlug: 'lucknow', stateSlug: 'uttar-pradesh' },
  { courseSlug: 'online-mba', courseKey: 'online-mba', citySlug: 'kanpur', stateSlug: 'uttar-pradesh' }
] as const;

export function isCityPageMinException(courseSlugOrKey: string, citySlug: string, stateSlug: string): boolean {
  const course = courseSlugOrKey.toLowerCase();
  const city = citySlug.toLowerCase();
  const state = stateSlug.toLowerCase();
  return CITY_PAGE_MIN_EXCEPTIONS.some((entry) => (
    (entry.courseSlug === course || entry.courseKey === course)
    && entry.citySlug === city
    && entry.stateSlug === state
  ));
}
