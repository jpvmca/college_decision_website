import Link from 'next/link';
import CourseFilterMobile from './CourseFilterMobile';
import { courseListingHref, type CourseFacet } from '../lib/listings';

export type StatePageOption = { courseSlug: string; stateSlug: string; stateName: string; count: number };
export type CityPageOption = StatePageOption & { citySlug: string; cityName: string };
type Props = { facets: CourseFacet[]; totalColleges: number; selectedKey?: string | null; selectedState?: string | null; selectedCity?: string | null; statePages?: StatePageOption[]; cityPages?: CityPageOption[] };

export type CourseFilterOption = { key: string; label: string; count: number; href: string };

function toOptions(facets: CourseFacet[]): CourseFilterOption[] {
  return facets.map((facet) => ({ key: facet.key, label: facet.label, count: facet.count, href: courseListingHref(facet.key) }));
}

const formatCount = (value: number) => value.toLocaleString('en-IN');

/**
 * Right-hand "Filter by Course" sidebar. Options are real <a href> links styled as radios
 * so crawlers can follow them; selecting one navigates to /{key}-colleges.
 */
export function CourseFilterSidebar({ facets, totalColleges, selectedKey = null, selectedState = null, selectedCity = null, statePages = [], cityPages = [] }: Props) {
  if (!facets.length) return null;
  const selectedFacet = facets.find((facet) => facet.key === selectedKey);
  const states = selectedFacet
    ? statePages.filter((item) => item.courseSlug === selectedFacet.courseSlug).sort((a, b) => b.count - a.count)
    : [];
  const cities = selectedFacet && selectedState
    ? cityPages.filter((item) => item.courseSlug === selectedFacet.courseSlug && item.stateSlug === selectedState).sort((a, b) => b.count - a.count || a.cityName.localeCompare(b.cityName))
    : [];
  return <aside className="course-filter-panel" aria-labelledby="course-filter-heading">
    <h2 id="course-filter-heading">Filter by Course</h2>
    <nav aria-label="Filter colleges by course">
      <ul className="course-filter-list">
        <li><Link prefetch={false} href="/colleges" className="course-filter-option" aria-current={!selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">All courses</span>{totalColleges > 0 && <span className="course-filter-count">({formatCount(totalColleges)})</span>}</Link></li>
        {facets.map((facet) => <li key={facet.key}><Link prefetch={false} href={courseListingHref(facet.key)} className="course-filter-option" aria-current={facet.key === selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">{facet.label}</span><span className="course-filter-count">({formatCount(facet.count)})</span></Link></li>)}
      </ul>
    </nav>
    {selectedFacet && states.length > 0 && <section className="state-filter-section" aria-labelledby="state-filter-heading">
      <h3 id="state-filter-heading">Filter by State</h3>
      <nav aria-label={`Filter ${selectedFacet.label} colleges by state`}>
        <ul className="course-filter-list state-filter-list">
          <li><Link prefetch={false} href={courseListingHref(selectedFacet.key)} className="course-filter-option" aria-current={!selectedState ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">All states</span><span className="course-filter-count">({formatCount(selectedFacet.count)})</span></Link></li>
          {states.map((state) => <li key={state.stateSlug}><Link prefetch={false} href={`/${selectedFacet.key}-colleges-in-${state.stateSlug}`} className="course-filter-option" aria-current={state.stateSlug === selectedState ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">{state.stateName}</span><span className="course-filter-count">({formatCount(Number(state.count))})</span></Link></li>)}
        </ul>
      </nav>
      {cities.length > 0 && <section className="state-filter-section city-filter-section" aria-labelledby="city-filter-heading">
        <h3 id="city-filter-heading">Filter by City</h3>
        <nav aria-label={`Filter ${selectedFacet.label} colleges by city`}>
          <ul className="course-filter-list state-filter-list">
            {cities.map((city) => <li key={city.citySlug}><Link prefetch={false} href={`/${selectedFacet.key}-colleges-in-${city.citySlug}-${city.stateSlug}`} className="course-filter-option" aria-current={city.citySlug === selectedCity ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">{city.cityName}</span><span className="course-filter-count">({formatCount(Number(city.count))})</span></Link></li>)}
          </ul>
        </nav>
      </section>}
    </section>}
  </aside>;
}

export function CourseFilterMobileButton({ facets, totalColleges, selectedKey = null, selectedState = null, selectedCity = null, statePages = [], cityPages = [] }: Props) {
  if (!facets.length) return null;
  const selected = facets.find((facet) => facet.key === selectedKey) || null;
  return <CourseFilterMobile options={toOptions(facets)} totalColleges={totalColleges} selectedKey={selected?.key || null} selectedLabel={selected?.label || null} stateOptions={selected ? statePages.filter((item) => item.courseSlug === selected.courseSlug).sort((a, b) => b.count - a.count) : []} cityOptions={selected && selectedState ? cityPages.filter((item) => item.courseSlug === selected.courseSlug && item.stateSlug === selectedState).sort((a, b) => b.count - a.count || a.cityName.localeCompare(b.cityName)) : []} selectedState={selectedState} selectedCity={selectedCity} />;
}
