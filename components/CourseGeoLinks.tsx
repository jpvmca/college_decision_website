import { getGeoLandingPages } from '../lib/geo-pages';

const MAX_STATES = 40;
const MAX_CITIES = 40;
const MAX_LINKS = 100;

/** Crawlable links from /courses/{slug} to the state and city landing pages served for that course. */
export default async function CourseGeoLinks({ courseSlug }: { courseSlug: string }) {
  const { statePages, cityPages } = await getGeoLandingPages();
  const seen = new Set<string>();
  const unique = <T extends { href: string }>(items: T[]) => items.filter((item) => !seen.has(item.href) && seen.add(item.href));
  const states = unique(statePages
    .filter((entry) => entry.courseSlug === courseSlug)
    .sort((a, b) => Number(b.count) - Number(a.count) || a.stateName.localeCompare(b.stateName))).slice(0, MAX_STATES);
  const courseCities = cityPages.filter((entry) => entry.courseSlug === courseSlug);
  const nameCounts = new Map<string, number>();
  courseCities.forEach((entry) => nameCounts.set(entry.cityName.toLowerCase(), (nameCounts.get(entry.cityName.toLowerCase()) || 0) + 1));
  const cities = unique(courseCities
    .sort((a, b) => Number(b.count) - Number(a.count) || a.cityName.localeCompare(b.cityName))).slice(0, Math.min(MAX_CITIES, MAX_LINKS - states.length));
  if (!states.length && !cities.length) return null;
  const label = (states[0] || cities[0]).facet.label;
  return <section className="course-geo-links" aria-label={`${label} colleges by location`}>
    {states.length > 0 && <div><h2>{label} Colleges by State</h2><ul>{states.map((entry) => <li key={entry.href}><a href={entry.href}>{label} Colleges in {entry.stateName}</a> <span>({Number(entry.count)})</span></li>)}</ul></div>}
    {cities.length > 0 && <div><h2>{label} Colleges in Top Cities</h2><ul>{cities.map((entry) => <li key={entry.href}><a href={entry.href}>{label} Colleges in {entry.cityName}{(nameCounts.get(entry.cityName.toLowerCase()) || 0) > 1 ? `, ${entry.stateName}` : ''}</a> <span>({Number(entry.count)})</span></li>)}</ul></div>}
  </section>;
}
