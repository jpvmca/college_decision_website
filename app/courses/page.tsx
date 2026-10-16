import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '../../lib/api';
import CourseDirectory from '../../components/CourseDirectory';

type Course = { id: number; name: string; slug: string; published_slug?: string | null; mode: string | null; image_url: string | null; programme_count: number; institute_count: number; review_count: number | string | null; average_rating: number | string | null };
type CourseList = { data: Course[]; pagination: { page: number; perPage: number; total: number; totalPages: number } };
const PAGE_SIZE = 20;

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
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/courses`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': ['CollectionPage', 'WebPage'], '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'Courses in India 2026', description: 'A list of courses in India.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: 'Courses in India', numberOfItems: result.pagination.total, itemListElement: result.data.map((course, index) => { const courseUrl = course.published_slug ? `${siteUrl}/courses/${course.published_slug}` : `${pageUrl}#course-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: courseUrl, item: { '@type': 'Course', '@id': courseUrl, name: course.name } }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` }] }
    ]
  };
  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Courses</span></nav>
    <section className="articles-hero"><div className="articles-hero-copy"><p className="eyebrow">COURSE GUIDES</p><h1>Courses in India 2026</h1><p>Explore courses, programme coverage and the colleges connected with each study path. Use course information to compare fees, eligibility, admissions and outcomes.</p></div><img src="/courses-hero.webp" alt="Students exploring courses and college options" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" /></section>
    <p className="muted">{result.pagination.total.toLocaleString('en-IN')} active courses · load more to continue</p>
    <CourseDirectory initial={result.data} total={result.pagination.total} perPage={PAGE_SIZE} />
  </div></main>;
}

