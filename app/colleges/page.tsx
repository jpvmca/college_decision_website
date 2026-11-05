import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { breadcrumbJsonLd } from '../../lib/structured-data';
import { ArrowRight, BadgeCheck, BookOpen, Building2 } from 'lucide-react';
import { api } from '../../lib/api';
import { getLinkableEntities } from '../../lib/linkable-entities';
import { getCourseFacets } from '../../lib/listings';
import { type ListedCollege } from '../../components/CollegeListResults';
import LoadMoreColleges from '../../components/LoadMoreColleges';
import AdSlot from '../../components/ads/AdSlot';
import { getAdSlot } from '../../lib/ads';
import { CourseFilterMobileButton, CourseFilterSidebar } from '../../components/CourseFilterPanel';
import HeroPhoto from '../../components/HeroPhoto';
import HeroStats from '../../components/HeroStats';

type College = ListedCollege;

type CollegeList = {
  data: College[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};

const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const baseTitle = 'Colleges in India 2026: Fees, Courses & Placements';
  const description = 'Browse colleges in India by location, type and programmes. Compare fees, admission routes and placements before you shortlist.';
  return {
    title: baseTitle,
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

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

export default async function CollegesPage() {
  const page = 1;
  let result: CollegeList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try {
    result = await api<CollegeList>(`/colleges?page=${page}&perPage=${PAGE_SIZE}`);
  } catch {
    // Keep the page renderable if the backend is temporarily unavailable.
  }
  const [linkableEntities, facets] = await Promise.all([
    getLinkableEntities(),
    getCourseFacets()
  ]);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/colleges`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'WebPage'],
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: 'Colleges in India 2026',
        description: 'A load-more list of active colleges in India.',
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
      }
    ]
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: `${siteUrl}/` },
    { name: 'Colleges', url: `${siteUrl}/colleges` }
  ], `${pageUrl}#breadcrumb`);
  const listingAdFeed = await getAdSlot('listing_feed');
  const totalColleges = facets.totalColleges || result.pagination.total;
  const stats = [
    result.pagination.total ? { icon: Building2, value: result.pagination.total, label: 'Colleges listed' } : null,
    facets.data.length ? { icon: BookOpen, value: facets.data.length, label: 'Course paths' } : null
  ].filter((item): item is { icon: typeof Building2; value: number; label: string } => Boolean(item));

  return <main className="section ls-page"><div className="wrap">
    <JsonLd data={jsonLd} />
    <JsonLd data={breadcrumbLd} />
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Colleges</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> College guides</span>
          <h1>Colleges in India 2026</h1>
          <p>Browse active colleges by name, location, institute type and programme coverage. Use the list as a starting point, then compare course fees, admission routes and placements before applying.</p>
          <div className="ls-hero-actions">
            <Link className="button ls-btn-primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="button ls-btn-ghost" href="/courses">Browse courses</Link>
          </div>
        </div>
        <div className="ls-hero-visual">
          <HeroPhoto src="/colleges-hero.webp" alt="Students comparing colleges and courses" />
        </div>
      </div>
      <HeroStats prefix="ls" stats={stats.map((item) => ({ icon: item.icon, label: item.label, value: `${formatCount(item.value)}${item.value >= 20 ? '+' : ''}` }))} />
    </section>
    <AdSlot slotKey="listing_top" className="listing-ad" />
    <div className="listing-layout">
      <div className="listing-main">
        <CourseFilterMobileButton facets={facets.data} totalColleges={totalColleges} />
        <div className="ls-head">
          <p className="ls-eyebrow"><Building2 size={14} aria-hidden="true" /> Directory</p>
          <h2>Browse Colleges</h2>
        </div>
        <p className="ls-count">{formatCount(result.pagination.total)} active colleges · load more to continue</p>
        <LoadMoreColleges initial={result.data} total={result.pagination.total} perPage={result.pagination.perPage} query="" linkableEntities={linkableEntities} adFeed={listingAdFeed} />
      </div>
      <CourseFilterSidebar facets={facets.data} totalColleges={totalColleges} />
    </div>
    <AdSlot slotKey="listing_bottom" className="listing-ad" />
  </div></main>;
}
