import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';
import ExamLogo from '../../components/ExamLogo';

type Exam = {
  id: number;
  name: string;
  slug: string;
  course_name: string | null;
  course_slug: string | null;
  programme_count: number;
  institute_count: number;
  review_count: number | string | null;
  average_rating: number | string | null;
  logo?: string | null;
};
type ExamList = { data: Exam[]; pagination: { page: number; perPage: number; total: number; totalPages: number } };
const PAGE_SIZE = 20;

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const title = page === 1 ? 'Entrance Exams in India 2026 – Eligibility & College Admissions' : `Entrance Exams in India 2026 – Page ${page}`;
  const description = 'Browse entrance exams linked with active college programmes and see the courses and colleges connected with each exam.';
  return { title, description, alternates: { canonical: page === 1 ? '/exams' : `/exams?page=${page}` }, openGraph: { title, description, type: 'website', images: [{ url: '/exams-hero.webp', width: 1200, height: 675, alt: 'Students preparing for college entrance exams' }] }, robots: { index: true, follow: true } };
}

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  let result: ExamList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try { result = await api<ExamList>(`/exams?page=${page}&perPage=${PAGE_SIZE}`); } catch { /* keep the page renderable */ }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = page === 1 ? `${siteUrl}/exams` : `${siteUrl}/exams?page=${page}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'Entrance Exams in India 2026', description: 'A paginated list of entrance exams in India.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'CollectionPage', '@id': `${pageUrl}#collectionpage`, url: pageUrl, name: 'Entrance Exams in India 2026', description: 'A paginated collection of entrance exams in India.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: 'Entrance Exams in India', numberOfItems: result.pagination.total, itemListElement: result.data.map((exam, index) => { const examUrl = `${pageUrl}#exam-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: examUrl, item: { '@type': 'Thing', '@id': examUrl, name: exam.name } }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Exams', item: `${siteUrl}/exams` }] }
    ]
  };
  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Exams</span></nav>
    <section className="articles-hero"><div className="articles-hero-copy"><p className="eyebrow">ENTRANCE EXAM GUIDES</p><h1>Entrance Exams in India 2026</h1><p>Browse entrance exams connected with active college programmes. Check the course, college coverage and admission route before planning your application.</p></div><img src="/exams-hero.webp" alt="Students preparing for college entrance exams" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" /></section>
    <p className="muted">{result.pagination.total.toLocaleString('en-IN')} active exams · 20 per page</p>
    <div className="article-list">{result.data.length ? result.data.map((exam, index) => (
      <article className="article-card exam-card" id={`exam-${index + 1}`} key={exam.id}>
        <div className="exam-card-top">
          <div className="exam-card-heading">
            <ExamLogo src={exam.logo} examName={exam.name} courseName={exam.course_name} size={64} />
            <div className="exam-card-copy">
              <div className="article-card-top">
                <span className="pill">{exam.course_name || 'Entrance exam'}</span>
                {Number(exam.institute_count || 0) > 0 ? <span className="muted">{Number(exam.institute_count)} colleges</span> : null}
              </div>
              <h2>{exam.name}</h2>
            </div>
          </div>
        </div>
        <p>{exam.course_name ? `${exam.name} is connected with ${exam.course_name} programmes and admission routes.` : `Explore colleges and programmes connected with ${exam.name}.`}</p>
        <div className="article-facts">
          <span>{Number(exam.programme_count || 0)} mapped programmes</span>
          {exam.review_count ? <span>{exam.review_count} reviews · {Number(exam.average_rating).toFixed(1)}/5</span> : <span>Reviews not listed</span>}
        </div>
      </article>
    )) : <div className="card"><h2>Exam list unavailable</h2><p>Please try again shortly.</p></div>}</div>
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} />}
  </div></main>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const href = (value: number) => value === 1 ? '/exams' : `/exams?page=${value}`;
  return <nav className="pagination" aria-label="Exam directory pages">{page > 1 && <Link className="page-arrow" href={href(page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}<div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={href(item)}>{item}</Link>)}</div>{page < totalPages && <Link className="page-arrow" href={href(page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}</nav>;
}
