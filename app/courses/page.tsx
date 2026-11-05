import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpen, Building2, GraduationCap } from 'lucide-react';
import { api } from '../../lib/api';
import { getCourseFacets } from '../../lib/listings';
import CourseDirectory from '../../components/CourseDirectory';
import AdSlot from '../../components/ads/AdSlot';
import { getAdSlot } from '../../lib/ads';

type Course = { id: number; name: string; slug: string; published_slug?: string | null; mode: string | null; image_url: string | null; programme_count: number; institute_count: number; review_count: number | string | null; average_rating: number | string | null };
type CourseList = { data: Course[]; pagination: { page: number; perPage: number; total: number; totalPages: number } };
const PAGE_SIZE = 20;

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

// ?page= is 301'd to /courses in proxy.ts; further courses load client-side.
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Courses in India 2026 – Colleges, Fees & Admissions';
  const description = 'Browse courses in India and see the colleges, active programmes, fees and admission routes connected with each course.';
  return { title, description, alternates: { canonical: '/courses' }, openGraph: { title, description, type: 'website', images: [{ url: '/courses-hero.webp', width: 1200, height: 675, alt: 'Students exploring courses and college options' }] }, robots: { index: true, follow: true } };
}

export default async function CoursesPage() {
  const page = 1;
  let result: CourseList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try { result = await api<CourseList>(`/courses?page=${page}&perPage=${PAGE_SIZE}`); } catch { /* keep the page renderable */ }
  const facets = await getCourseFacets();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/courses`;
  const listingAdFeed = await getAdSlot('listing_feed');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': ['CollectionPage', 'WebPage'], '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'Courses in India 2026', description: 'A list of courses in India.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: 'Courses in India', numberOfItems: result.pagination.total, itemListElement: result.data.map((course, index) => { const courseUrl = course.published_slug ? `${siteUrl}/courses/${course.published_slug}` : `${pageUrl}#course-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: courseUrl, item: { '@type': 'Course', '@id': courseUrl, name: course.name } }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` }] }
    ]
  };
  const stats = [
    result.pagination.total ? { icon: GraduationCap, value: result.pagination.total, label: 'Courses listed' } : null,
    facets.totalColleges ? { icon: Building2, value: facets.totalColleges, label: 'Colleges covered' } : null,
    facets.data.length ? { icon: BookOpen, value: facets.data.length, label: 'Study paths' } : null
  ].filter((item): item is { icon: typeof GraduationCap; value: number; label: string } => Boolean(item));
  return <main className="section ls-page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Courses</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> Course guides</span>
          <h1>Courses in India 2026</h1>
          <p>Explore courses, programme coverage and the colleges connected with each study path. Use course information to compare fees, eligibility, admissions and outcomes.</p>
          <div className="ls-hero-actions">
            <Link className="button ls-btn-primary" href="/colleges">Browse colleges <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="button ls-btn-ghost" href="/compare-colleges-2026">Compare colleges</Link>
          </div>
        </div>
        <div className="ls-hero-visual">
          <img src="/courses-hero.webp" alt="Students exploring courses and college options" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />
        </div>
      </div>
      {stats.length > 0 && <dl className="ls-stats">{stats.map((item) => <div key={item.label}>
        <span className="ls-stat-icon"><item.icon size={18} aria-hidden="true" /></span>
        <dt>{item.label}</dt>
        <dd>{formatCount(item.value)}{item.value >= 20 ? '+' : ''}</dd>
      </div>)}</dl>}
    </section>
    <AdSlot slotKey="listing_top" className="listing-ad" />
    <div className="ls-head">
      <p className="ls-eyebrow"><GraduationCap size={14} aria-hidden="true" /> Directory</p>
      <h2>Browse courses</h2>
    </div>
    <p className="ls-count">{formatCount(result.pagination.total)} active courses · load more to continue</p>
    <CourseDirectory initial={result.data} total={result.pagination.total} perPage={PAGE_SIZE} adFeed={listingAdFeed} />
    <AdSlot slotKey="listing_bottom" className="listing-ad" />
  </div></main>;
}
