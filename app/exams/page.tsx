import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, BookOpen, CalendarDays, ClipboardCheck } from 'lucide-react';
import { api } from '../../lib/api';
import ExamDirectory, { type ExamList } from '../../components/ExamDirectory';
import AdSlot from '../../components/ads/AdSlot';
import { getAdSlot } from '../../lib/ads';
import { daysUntil, formatDate as examFormatDate } from '../../lib/exam-format';

const PAGE_SIZE = 20;

// ?course= and ?page= are 301'd to /exams in proxy.ts: course tabs and "Load more" work client-side, so /exams is the only URL.
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Entrance Exams in India 2026–27: Dates, Fees & Colleges';
  const description = 'Compare entrance exams in India: next exam dates, registration status, application fees, linked programmes, fee ranges and colleges accepting each exam.';
  return { title, description, alternates: { canonical: '/exams' }, openGraph: { title, description, type: 'website', images: [{ url: '/exams-hero.webp', width: 1200, height: 675, alt: 'Students preparing for college entrance exams' }] }, robots: { index: true, follow: true } };
}

export default async function ExamsPage() {
  let result: ExamList = { data: [], pagination: { page: 1, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try { result = await api<ExamList>(`/exams?page=1&perPage=${PAGE_SIZE}`); } catch { /* keep the page renderable */ }
  const courses = result.courses || [];
  const activeCourse = null as { name: string } | null;
  const page = 1;
  const upcoming = (result.upcoming || []).filter((item) => daysUntil(item.exam_start_date) >= 0);
  const heading = 'Entrance Exams in India 2026–27';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/exams`;
  const listingAdFeed = await getAdSlot('listing_feed');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${pageUrl}#collectionpage`, url: pageUrl, name: heading, description: 'Entrance exams in India with next exam dates, registration status, fees, linked programmes and colleges accepting each exam.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: heading, numberOfItems: result.pagination.total, itemListElement: result.data.map((exam, index) => { const examUrl = exam.published_slug ? `${siteUrl}/exams/${exam.published_slug}` : `${pageUrl}#exam-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: examUrl, name: exam.name }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Exams', item: `${siteUrl}/exams` }, ...(activeCourse ? [{ '@type': 'ListItem', position: 3, name: activeCourse.name, item: pageUrl }] : [])] }
    ]
  };
  const stats = [
    result.pagination.total ? { icon: ClipboardCheck, value: result.pagination.total, label: 'Exams listed' } : null,
    upcoming.length ? { icon: CalendarDays, value: upcoming.length, label: 'Dates this season' } : null,
    courses.length ? { icon: BookOpen, value: courses.length, label: 'Course paths' } : null
  ].filter((item): item is { icon: typeof ClipboardCheck; value: number; label: string } => Boolean(item));
  return <main className="section ex-page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb ex-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Exams</span></nav>

    <section className="ex-hero">
      <div className="ex-hero-inner">
        <div className="ex-hero-copy">
          <span className="ex-kicker"><BadgeCheck size={15} aria-hidden="true" /> Entrance exam guides</span>
          <h1>{heading}</h1>
          <p>Compare exam dates, registration status, application fees, linked programmes and the colleges that accept each exam, then open the full exam profile before you apply.</p>
        </div>
        <div className="ex-hero-visual">
          <img src="/exams-hero.webp" alt="Students preparing for college entrance exams" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />
        </div>
      </div>
      {stats.length > 0 && <dl className="ex-stats">{stats.map((item) => <div key={item.label}>
        <span className="ex-stat-icon"><item.icon size={18} aria-hidden="true" /></span>
        <dt>{item.label}</dt>
        <dd>{item.value.toLocaleString('en-IN')}{item.value >= 20 ? '+' : ''}</dd>
      </div>)}</dl>}
    </section>

    <AdSlot slotKey="listing_top" className="listing-ad" />

    {upcoming.length > 0 ? <section className="ex-upcoming" aria-labelledby="upcoming-exams">
      <div className="ex-upcoming-head">
        <p className="ex-eyebrow"><CalendarDays size={14} aria-hidden="true" /> Exam calendar</p>
        <h2 id="upcoming-exams">Upcoming exam dates</h2>
      </div>
      <ol className="ex-upcoming-list">{upcoming.map((item) => {
        const days = daysUntil(item.exam_start_date);
        const date = new Date(`${item.exam_start_date.slice(0, 10)}T00:00:00Z`);
        return <li key={item.slug}><Link href={`/exams/${item.slug}`}>
          <span className="ex-date"><strong>{date.getUTCDate()}</strong><small>{date.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })}</small></span>
          <span className="ex-upcoming-copy"><strong>{item.name}</strong><small>{examFormatDate(item.exam_start_date)}</small></span>
          <em className={days <= 14 ? 'is-soon' : undefined}>{days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} left`}</em>
        </Link></li>;
      })}</ol>
    </section> : null}

    <ExamDirectory initial={result.data} total={result.pagination.total} courses={courses} perPage={PAGE_SIZE} adFeed={listingAdFeed} />
    <AdSlot slotKey="listing_bottom" className="listing-ad" />
  </div></main>;
}
