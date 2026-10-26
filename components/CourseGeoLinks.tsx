import { api } from '../lib/api';

type StatePage = { courseSlug: string; stateSlug: string; stateName: string; count: number | string };
type CityPage = StatePage & { citySlug: string; cityName: string };
type ListingEntry = { key: string; label: string };

const MAX_STATES = 40;
const MAX_CITIES = 40;
const MAX_LINKS = 100;
const FETCH = { next: { revalidate: 300, tags: ['listings', 'listings:geo-links'] } };

async function safe<T>(path: string): Promise<T[]> {
  try {
    const response = await api<{ data?: T[] }>(path, FETCH);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

/** Crawlable links from /courses/{slug} to the enabled state and city landing pages for that course. */
export default async function CourseGeoLinks({ courseSlug }: { courseSlug: string }) {
  const [statePages, cityPages, listings] = await Promise.all([
    safe<StatePage>('/colleges/state-pages'),
    safe<CityPage>('/colleges/city-pages'),
    safe<ListingEntry>('/listings/sitemap')
  ]);
  const seen = new Set<string>();
  const unique = <T extends { href: string }>(items: T[]) => items.filter((item) => !seen.has(item.href) && seen.add(item.href));
  const states = unique(statePages
    .filter((entry) => entry.courseSlug === courseSlug && entry.stateSlug)
    .sort((a, b) => Number(b.count) - Number(a.count) || a.stateName.localeCompare(b.stateName))
    .map((entry) => ({ ...entry, href: `/${courseSlug}-colleges-in-${entry.stateSlug}` }))).slice(0, MAX_STATES);
  const courseCities = cityPages.filter((entry) => entry.courseSlug === courseSlug && entry.citySlug && entry.stateSlug);
  const nameCounts = new Map<string, number>();
  courseCities.forEach((entry) => nameCounts.set(entry.cityName.toLowerCase(), (nameCounts.get(entry.cityName.toLowerCase()) || 0) + 1));
  const cities = unique(courseCities
    .sort((a, b) => Number(b.count) - Number(a.count) || a.cityName.localeCompare(b.cityName))
    .map((entry) => ({ ...entry, href: `/${courseSlug}-colleges-in-${entry.citySlug}-${entry.stateSlug}` }))).slice(0, Math.min(MAX_CITIES, MAX_LINKS - states.length));
  if (!states.length && !cities.length) return null;
  const label = listings.find((entry) => entry.key === courseSlug)?.label || courseSlug.toUpperCase();
  return <section className="course-geo-links" aria-label={`${label} colleges by location`}>
    {states.length > 0 && <div><h2>{label} Colleges by State</h2><ul>{states.map((entry) => <li key={entry.href}><a href={entry.href}>{label} Colleges in {entry.stateName}</a> <span>({Number(entry.count)})</span></li>)}</ul></div>}
    {cities.length > 0 && <div><h2>{label} Colleges in Top Cities</h2><ul>{cities.map((entry) => <li key={entry.href}><a href={entry.href}>{label} Colleges in {entry.cityName}{(nameCounts.get(entry.cityName.toLowerCase()) || 0) > 1 ? `, ${entry.stateName}` : ''}</a> <span>({Number(entry.count)})</span></li>)}</ul></div>}
  </section>;
}
