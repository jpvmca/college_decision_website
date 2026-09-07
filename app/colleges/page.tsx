import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';
import CollegeDecisionCard from '../../components/CollegeDecisionCard';

type College = {
  id: number;
  full_name: string;
  display_name: string | null;
  slug: string;
  institute_type: string | null;
  logo?: string | null;
  city: string | null;
  state: string | null;
  programme_count: number;
  course_names: string | null;
  programme_id: number | null;
  course_id: number | null;
  programme_name: string | null;
  duration: string | null;
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

type CollegeList = {
  data: College[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};

const PAGE_SIZE = 20;

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const baseTitle = 'Colleges in India 2026: Fees, Courses & Placements';
  const title = page === 1 ? baseTitle : `Colleges in India 2026 – Page ${page}`;
  const description = 'Browse colleges in India by location, type and programmes. Compare fees, admission routes and placements before you shortlist.';
  return {
    title,
    description,
    alternates: { canonical: '/colleges' },
    openGraph: {
      title: baseTitle,
      description,
      url: '/colleges',
      type: 'website',
      images: [{ url: '/colleges-hero.webp', width: 1200, height: 675, alt: 'Students comparing colleges in India' }]
    },
    twitter: { card: 'summary_large_image', title: baseTitle, description },
    robots: { index: true, follow: true }
  };
}

export default async function CollegesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNumber((await searchParams).page);
  let result: CollegeList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try {
    result = await api<CollegeList>(`/colleges?page=${page}&perPage=${PAGE_SIZE}`);
  } catch {
    // Keep the page renderable if the backend is temporarily unavailable.
  }
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = page === 1 ? `${siteUrl}/colleges` : `${siteUrl}/colleges?page=${page}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'CollegeDecision',
        url: siteUrl
      },
      {
        '@type': ['CollectionPage', 'WebPage'],
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page === 1 ? 'Colleges in India 2026' : `Colleges in India 2026 — Page ${page}`,
        description: 'A paginated list of active colleges in India.',
        isPartOf: { '@id': `${siteUrl}/#website` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#itemlist` }
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: 'Colleges in India',
        numberOfItems: result.pagination.total,
        itemListElement: result.data.map((college, index) => {
          const collegeUrl = `${pageUrl}#college-${index + 1}`;
          return {
            '@type': 'ListItem',
            position: (page - 1) * result.pagination.perPage + index + 1,
            url: collegeUrl,
            item: {
              '@type': 'CollegeOrUniversity',
              '@id': collegeUrl,
              name: college.display_name || college.full_name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: college.city || undefined,
                addressRegion: college.state || undefined,
                addressCountry: 'IN'
              }
            }
          };
        })
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Colleges', item: `${siteUrl}/colleges` }
        ]
      }
    ]
  };

  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Colleges</span></nav>
    <section className="articles-hero">
      <div className="articles-hero-copy">
        <p className="eyebrow">COLLEGE GUIDES</p>
        <h1>Colleges in India 2026</h1>
        <p>Browse active colleges by name, location, institute type and programme coverage. Use the list as a starting point, then compare course fees, admission routes and placements before applying.</p>
        <p><Link className="button primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link></p>
      </div>
      <img src="/colleges-hero.webp" alt="Students comparing colleges and courses" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />
    </section>
    <div className="article-card-top">
      <p className="muted">{result.pagination.total.toLocaleString('en-IN')} active colleges · 20 per page</p>
    </div>
    <div className="decision-results-list">
      {result.data.length ? result.data.map((college) => (
        college.programme_id && college.course_id ? <div id={`college-${result.data.indexOf(college) + 1}`} key={college.id}><CollegeDecisionCard showReviews={false} showCompare={result.pagination.total > 1} item={{
          instituteId: college.id,
          courseId: Number(college.course_id || 0),
          programmeId: Number(college.programme_id || 0),
          instituteName: college.display_name || college.full_name,
          instituteType: college.institute_type,
          logo: college.logo,
          city: college.city,
          state: college.state,
          programmeName: college.programme_name || college.course_names || 'College programmes',
          duration: college.duration,
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
        }} /></div> : <article className="article-card" id={`college-${result.data.indexOf(college) + 1}`} key={college.id}><div className="article-card-top"><span className="pill">{college.institute_type || 'College'}</span><span className="muted">Programme data pending</span></div><h2>{college.display_name || college.full_name}</h2><p>{[college.city, college.state].filter(Boolean).join(', ') || 'India'}</p><p className="muted">Programme, fee and admission details are not listed yet.</p></article>
      )) : <div className="card"><h2>College list unavailable</h2><p>Please try again shortly.</p></div>}
    </div>
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} />}
  </div></main>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const href = (value: number) => value === 1 ? '/colleges' : `/colleges?page=${value}`;
  return <nav className="pagination" aria-label="College pages">
    {page > 1 && <Link className="page-arrow" href={href(page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}
    <div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis'
      ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span>
      : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={href(item)}>{item}</Link>)}</div>
    {page < totalPages && <Link className="page-arrow" href={href(page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}
  </nav>;
}
