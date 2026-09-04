import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';

type Course = { id: number; name: string; slug: string; mode: string | null; programme_count: number; institute_count: number; review_count: number | string | null; average_rating: number | string | null };
type CourseList = { data: Course[]; pagination: { page: number; perPage: number; total: number; totalPages: number } };
const PAGE_SIZE = 20;

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const title = page === 1 ? 'Courses in India 2026 – Colleges, Fees & Admissions' : `Courses in India 2026 – Page ${page}`;
  const description = 'Browse courses in India and see the colleges, active programmes, fees and admission routes connected with each course.';
  return { title, description, alternates: { canonical: page === 1 ? '/courses' : `/courses?page=${page}` }, openGraph: { title, description, type: 'website', images: [{ url: '/courses-hero.webp', width: 1200, height: 675, alt: 'Students exploring courses and college options' }] }, robots: { index: true, follow: true } };
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  let result: CourseList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try { result = await api<CourseList>(`/courses?page=${page}&perPage=${PAGE_SIZE}`); } catch { /* keep the page renderable */ }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = page === 1 ? `${siteUrl}/courses` : `${siteUrl}/courses?page=${page}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': ['CollectionPage', 'WebPage'], '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'Courses in India 2026', description: 'A paginated list of courses in India.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: 'Courses in India', numberOfItems: result.pagination.total, itemListElement: result.data.map((course, index) => { const courseUrl = `${pageUrl}#course-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: courseUrl, item: { '@type': 'Course', '@id': courseUrl, name: course.name } }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` }] }
    ]
  };
  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Courses</span></nav>
    <section className="articles-hero"><div className="articles-hero-copy"><p className="eyebrow">COURSE GUIDES</p><h1>Courses in India 2026</h1><p>Explore courses, programme coverage and the colleges connected with each study path. Use course information to compare fees, eligibility, admissions and outcomes.</p></div><img src="/courses-hero.webp" alt="Students exploring courses and college options" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" /></section>
    <p className="muted">{result.pagination.total.toLocaleString('en-IN')} active courses · 20 per page</p>
    <div className="article-list">{result.data.length ? result.data.map((course, index) => <article className="article-card" id={`course-${index + 1}`} key={course.id}><div className="article-card-top"><span className="pill">{course.mode || 'Course'}</span><span className="muted">{Number(course.institute_count || 0)} colleges</span></div><h2>{course.name}</h2><p>Explore {course.name} colleges, programmes and admission context in India.</p><div className="article-facts"><span>{Number(course.programme_count || 0)} active programmes</span>{course.review_count ? <span>{course.review_count} reviews · {Number(course.average_rating).toFixed(1)}/5</span> : <span>Reviews not listed</span>}</div></article>) : <div className="card"><h2>Course list unavailable</h2><p>Please try again shortly.</p></div>}</div>
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} />}
  </div></main>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const href = (value: number) => value === 1 ? '/courses' : `/courses?page=${value}`;
  return <nav className="pagination" aria-label="Course directory pages">{page > 1 && <Link className="page-arrow" href={href(page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}<div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={href(item)}>{item}</Link>)}</div>{page < totalPages && <Link className="page-arrow" href={href(page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}</nav>;
}
