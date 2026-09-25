import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { getLinkableEntities } from '../../lib/linkable-entities';
import { getCourseFacets } from '../../lib/listings';
import { CollegeListResults, ListPaginationNav, type ListedCollege } from '../../components/CollegeListResults';
import { CourseFilterMobileButton, CourseFilterSidebar } from '../../components/CourseFilterPanel';

type College = ListedCollege;

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
  const [linkableEntities, facets] = await Promise.all([getLinkableEntities(), getCourseFacets()]);
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
    <div className="listing-layout">
      <div className="listing-main">
        <CourseFilterMobileButton facets={facets.data} totalColleges={facets.totalColleges || result.pagination.total} />
        <div className="article-card-top">
          <p className="muted">{result.pagination.total.toLocaleString('en-IN')} active colleges · 20 per page</p>
        </div>
        <h2>Browse Colleges</h2>
        <CollegeListResults colleges={result.data} total={result.pagination.total} linkableEntities={linkableEntities} />
        {result.pagination.totalPages > 1 && <ListPaginationNav page={page} totalPages={result.pagination.totalPages} basePath="/colleges" />}
      </div>
      <CourseFilterSidebar facets={facets.data} totalColleges={facets.totalColleges || result.pagination.total} />
    </div>
  </div></main>;
}
