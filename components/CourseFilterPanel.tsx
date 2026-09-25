import Link from 'next/link';
import CourseFilterMobile from './CourseFilterMobile';
import { courseListingHref, type CourseFacet } from '../lib/listings';

type Props = { facets: CourseFacet[]; totalColleges: number; selectedKey?: string | null };

export type CourseFilterOption = { key: string; label: string; count: number; href: string };

function toOptions(facets: CourseFacet[]): CourseFilterOption[] {
  return facets.map((facet) => ({ key: facet.key, label: facet.label, count: facet.count, href: courseListingHref(facet.key) }));
}

const formatCount = (value: number) => value.toLocaleString('en-IN');

/**
 * Right-hand "Filter by Course" sidebar. Options are real <a href> links styled as radios
 * so crawlers can follow them; selecting one navigates to /{key}-colleges.
 */
export function CourseFilterSidebar({ facets, totalColleges, selectedKey = null }: Props) {
  if (!facets.length) return null;
  return <aside className="course-filter-panel" aria-labelledby="course-filter-heading">
    <h2 id="course-filter-heading">Filter by Course</h2>
    <nav aria-label="Filter colleges by course">
      <ul className="course-filter-list">
        <li><Link prefetch={false} href="/colleges" className="course-filter-option" aria-current={!selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">All courses</span>{totalColleges > 0 && <span className="course-filter-count">({formatCount(totalColleges)})</span>}</Link></li>
        {facets.map((facet) => <li key={facet.key}><Link prefetch={false} href={courseListingHref(facet.key)} className="course-filter-option" aria-current={facet.key === selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">{facet.label}</span><span className="course-filter-count">({formatCount(facet.count)})</span></Link></li>)}
      </ul>
    </nav>
  </aside>;
}

export function CourseFilterMobileButton({ facets, totalColleges, selectedKey = null }: Props) {
  if (!facets.length) return null;
  const selected = facets.find((facet) => facet.key === selectedKey) || null;
  return <CourseFilterMobile options={toOptions(facets)} totalColleges={totalColleges} selectedKey={selected?.key || null} selectedLabel={selected?.label || null} />;
}
