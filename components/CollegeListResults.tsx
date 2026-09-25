import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CollegeDecisionCard from './CollegeDecisionCard';
import { getPageItems } from '../lib/pagination';
import type { LinkableEntity } from '../lib/auto-link-entities';

export type ListedCollege = {
  id: number;
  full_name: string;
  display_name: string | null;
  slug: string;
  published_slug?: string | null;
  institute_type: string | null;
  logo?: string | null;
  city: string | null;
  state: string | null;
  programme_count: number;
  course_names?: string | null;
  programme_id: number | null;
  course_id: number | null;
  programme_name: string | null;
  duration: string | number | null;
  eligibility: string | null;
  lowest_fee: number | string | null;
  average_year_fee: number | string | null;
  average_package: number | string | null;
  highest_package: number | string | null;
  nirf_rank: number | string | null;
  nirf_out_of: number | string | null;
  review_count: number | string | null;
  average_rating: number | string | null;
  admission_routes: string | null;
};

export type ListPagination = { page: number; perPage: number; total: number; totalPages: number };

export function CollegeListResults({ colleges, total, linkableEntities }: { colleges: ListedCollege[]; total: number; linkableEntities: LinkableEntity[] }) {
  return <div className="decision-results-list">
    {colleges.length ? colleges.map((college, index) => (
      college.programme_id && college.course_id ? <div id={`college-${index + 1}`} key={college.id}><CollegeDecisionCard showReviews={false} showCompare={total > 1} item={{
        instituteId: college.id,
        courseId: Number(college.course_id || 0),
        programmeId: Number(college.programme_id || 0),
        instituteName: college.display_name || college.full_name,
        publishedSlug: college.published_slug,
        instituteType: college.institute_type,
        logo: college.logo,
        city: college.city,
        state: college.state,
        programmeName: college.programme_name || college.course_names || 'College programmes',
        duration: college.duration === null || college.duration === undefined ? null : String(college.duration),
        lowestFee: college.lowest_fee,
        averageYearFee: college.average_year_fee,
        averagePackage: college.average_package,
        highestPackage: college.highest_package,
        nirfRank: college.nirf_rank,
        nirfOutOf: college.nirf_out_of,
        reviewCount: college.review_count,
        averageRating: college.average_rating,
        eligibility: college.eligibility,
        admissionRoutes: college.admission_routes
      }} linkableEntities={linkableEntities} /></div> : <article className="article-card" id={`college-${index + 1}`} key={college.id}><div className="article-card-top"><span className="pill">{college.institute_type || 'College'}</span><span className="muted">Programme data pending</span></div><h2>{college.display_name || college.full_name}</h2><p>{[college.city, college.state].filter(Boolean).join(', ') || 'India'}</p><p className="muted">Programme, fee and admission details are not listed yet.</p></article>
    )) : <div className="card"><h2>College list unavailable</h2><p>Please try again shortly.</p></div>}
  </div>;
}

export function ListPaginationNav({ page, totalPages, basePath, label = 'College pages' }: { page: number; totalPages: number; basePath: string; label?: string }) {
  const href = (value: number) => value === 1 ? basePath : `${basePath}?page=${value}`;
  return <nav className="pagination" aria-label={label}>
    {page > 1 && <Link className="page-arrow" href={href(page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}
    <div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis'
      ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span>
      : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={href(item)}>{item}</Link>)}</div>
    {page < totalPages && <Link className="page-arrow" href={href(page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}
  </nav>;
}
