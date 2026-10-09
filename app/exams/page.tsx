import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';
import ExamLogo from '../../components/ExamLogo';

type ScheduleState = 'registration_open' | 'registration_closed' | 'upcoming' | 'completed' | 'date_not_announced';
type Schedule = {
  application_start_date: string | null;
  application_end_date: string | null;
  exam_start_date: string | null;
  exam_end_date: string | null;
  admission_window: string | null;
  expected_month: string | null;
  state: ScheduleState;
};
type Exam = {
  id: number;
  name: string;
  slug: string;
  full_name: string | null;
  conducted_by: string | null;
  mode: string | null;
  application_fees: string | null;
  published_slug?: string | null;
  course_name: string | null;
  course_slug: string | null;
  course_published_slug: string | null;
  programme_count: number;
  institute_count: number;
  review_count: number | string | null;
  average_rating: number | string | null;
  logo?: string | null;
  schedule: Schedule | null;
  programmes: Array<{ name: string; count: number }>;
  colleges: Array<{ name: string; slug: string; city: string | null }>;
  fee: { basis: 'total' | 'year'; min: number; max: number; programmes: number } | null;
};
type CourseFacet = { slug: string; name: string; exam_count: number };
type UpcomingExam = { name: string; slug: string; exam_start_date: string; application_end_date: string | null };
type ExamList = {
  data: Exam[];
  courses?: CourseFacet[];
  upcoming?: UpcomingExam[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};
type Search = { page?: string; course?: string };
const PAGE_SIZE = 20;

const STATE_LABEL: Record<ScheduleState, string> = {
  registration_open: 'Registration open',
  registration_closed: 'Registration closed',
  upcoming: 'Upcoming',
  completed: 'Exam held',
  date_not_announced: 'Dates not announced'
};

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function courseParam(value: string | undefined) {
  const clean = String(value || '').trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(clean) ? clean : '';
}

function listHref(page: number, course: string) {
  const params = new URLSearchParams();
  if (course) params.set('course', course);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/exams?${query}` : '/exams';
}

function formatDate(value: string | null | undefined, withYear = true) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
}

function daysUntil(value: string) {
  const today = new Date();
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${value.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((target - start) / 86400000);
}

function compactMoney(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(value >= 1000000 ? 1 : 2).replace(/\.?0+$/, '')}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(value)}`;
}

// Application fee text varies from a bare number to a full sentence; show the lowest rupee amount it mentions.
function applicationFee(value: string | null) {
  if (!value) return null;
  const rupees = value.match(/₹\s*\d[\d,]*/g);
  const amounts = (rupees || (/^\s*\d[\d,]*\s*$/.test(value) ? [value] : []))
    .map((item) => Number(item.replace(/[^\d]/g, '')))
    .filter((amount) => amount >= 100 && amount <= 100000);
  if (!amounts.length) return null;
  const min = Math.min(...amounts);
  const formatted = `₹${min.toLocaleString('en-IN')}`;
  return amounts.length > 1 && Math.max(...amounts) !== min ? `From ${formatted}` : formatted;
}

function modeLabel(value: string | null) {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (clean === 'online') return 'Online (CBT)';
  if (clean === 'offline') return 'Offline';
  if (clean === 'hybrid') return 'Online & offline';
  return value;
}

function examDateFact(schedule: Schedule | null) {
  if (!schedule) return null;
  const start = formatDate(schedule.exam_start_date);
  if (start) {
    const end = schedule.exam_end_date && schedule.exam_end_date !== schedule.exam_start_date ? formatDate(schedule.exam_end_date) : null;
    return end ? `${formatDate(schedule.exam_start_date, false)} – ${end}` : start;
  }
  return schedule.expected_month ? `Expected: ${schedule.expected_month}` : null;
}

function registrationFact(schedule: Schedule | null) {
  if (!schedule?.application_end_date) return null;
  const end = formatDate(schedule.application_end_date);
  if (schedule.state === 'registration_open') return `Open till ${end}`;
  if (schedule.application_start_date && daysUntil(schedule.application_start_date) > 0) return `Opens ${formatDate(schedule.application_start_date)}`;
  return daysUntil(schedule.application_end_date) < 0 ? `Closed on ${end}` : `Closes ${end}`;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const params = await searchParams;
  const page = pageNumber(params.page);
  const course = courseParam(params.course);
  let courseName = '';
  if (course) {
    try { courseName = (await api<ExamList>(`/exams?page=1&perPage=1`)).courses?.find((item) => item.slug === course)?.name || ''; } catch { /* fall back to the generic title */ }
  }
  const subject = courseName ? `${courseName} Entrance Exams` : 'Entrance Exams in India';
  const title = page === 1 ? `${subject} 2026–27: Dates, Fees & Colleges` : `${subject} 2026–27 – Page ${page}`;
  const description = courseName
    ? `Compare ${courseName} entrance exams: next exam dates, registration status, application fees, linked programmes and colleges accepting each exam.`
    : 'Compare entrance exams in India: next exam dates, registration status, application fees, linked programmes, fee ranges and colleges accepting each exam.';
  const canonical = course ? '/exams' : listHref(page, '');
  return { title, description, alternates: { canonical }, openGraph: { title, description, type: 'website', images: [{ url: '/exams-hero.webp', width: 1200, height: 675, alt: 'Students preparing for college entrance exams' }] }, robots: { index: true, follow: true } };
}

export default async function ExamsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const page = pageNumber(params.page);
  const course = courseParam(params.course);
  let result: ExamList = { data: [], pagination: { page, perPage: PAGE_SIZE, total: 0, totalPages: 0 } };
  try { result = await api<ExamList>(`/exams?page=${page}&perPage=${PAGE_SIZE}${course ? `&course=${encodeURIComponent(course)}` : ''}`); } catch { /* keep the page renderable */ }
  const courses = result.courses || [];
  const activeCourse = courses.find((item) => item.slug === course) || null;
  if (course && courses.length && !activeCourse) redirect('/exams');
  const upcoming = (result.upcoming || []).filter((item) => daysUntil(item.exam_start_date) >= 0);
  const heading = activeCourse ? `${activeCourse.name} Entrance Exams 2026–27` : 'Entrance Exams in India 2026–27';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}${listHref(page, activeCourse ? course : '')}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${pageUrl}#collectionpage`, url: pageUrl, name: heading, description: 'Entrance exams in India with next exam dates, registration status, fees, linked programmes and colleges accepting each exam.', isPartOf: { '@id': `${siteUrl}/#website` }, breadcrumb: { '@id': `${pageUrl}#breadcrumb` }, mainEntity: { '@id': `${pageUrl}#itemlist` } },
      { '@type': 'ItemList', '@id': `${pageUrl}#itemlist`, name: heading, numberOfItems: result.pagination.total, itemListElement: result.data.map((exam, index) => { const examUrl = exam.published_slug ? `${siteUrl}/exams/${exam.published_slug}` : `${pageUrl}#exam-${index + 1}`; return { '@type': 'ListItem', position: (page - 1) * result.pagination.perPage + index + 1, url: examUrl, name: exam.name }; }) },
      { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Exams', item: `${siteUrl}/exams` }, ...(activeCourse ? [{ '@type': 'ListItem', position: 3, name: activeCourse.name, item: pageUrl }] : [])] }
    ]
  };
  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span>{activeCourse ? <><Link href="/exams">Exams</Link><span aria-hidden="true">›</span><span aria-current="page">{activeCourse.name}</span></> : <span aria-current="page">Exams</span>}</nav>
    <section className="articles-hero"><div className="articles-hero-copy"><p className="eyebrow">ENTRANCE EXAM GUIDES</p><h1>{heading}</h1><p>Compare exam dates, registration status, application fees, linked programmes and the colleges that accept each exam, then open the full exam profile before you apply.</p></div><img src="/exams-hero.webp" alt="Students preparing for college entrance exams" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" /></section>

    {page === 1 && !course && upcoming.length > 0 ? <section className="exam-upcoming" aria-labelledby="upcoming-exams">
      <h2 id="upcoming-exams"><CalendarDays size={18} aria-hidden="true" /> Upcoming exam dates</h2>
      <ol className="exam-upcoming-list">{upcoming.map((item) => {
        const days = daysUntil(item.exam_start_date);
        return <li key={item.slug}><Link href={`/exams/${item.slug}`}><strong>{item.name}</strong><span>{formatDate(item.exam_start_date)}</span><em>{days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} left`}</em></Link></li>;
      })}</ol>
    </section> : null}

    {courses.length > 0 ? <nav className="exam-course-filter" aria-label="Filter exams by course">
      <Link className={!activeCourse ? 'active' : undefined} aria-current={!activeCourse ? 'page' : undefined} href="/exams">All exams</Link>
      {courses.map((item) => <Link key={item.slug} className={activeCourse?.slug === item.slug ? 'active' : undefined} aria-current={activeCourse?.slug === item.slug ? 'page' : undefined} href={listHref(1, item.slug)}>{item.name} <span>{item.exam_count}</span></Link>)}
    </nav> : null}

    <p className="muted">{result.pagination.total.toLocaleString('en-IN')} {activeCourse ? `${activeCourse.name} ` : ''}exams · sorted by colleges accepting the exam</p>
    <div className="article-list">{result.data.length ? result.data.map((exam, index) => {
      const profileHref = exam.published_slug ? `/exams/${exam.published_slug}` : null;
      const dateFact = examDateFact(exam.schedule);
      const registration = registrationFact(exam.schedule);
      const fee = applicationFee(exam.application_fees);
      const mode = modeLabel(exam.mode);
      const state = exam.schedule?.state || 'date_not_announced';
      const extraColleges = Math.max(0, Number(exam.institute_count || 0) - exam.colleges.length);
      return <article className="article-card exam-card" id={`exam-${index + 1}`} key={exam.id}>
        <div className="exam-card-top">
          <div className="exam-card-heading">
            {profileHref ? <Link href={profileHref}><ExamLogo src={exam.logo} examName={exam.name} courseName={exam.course_name} size={64} /></Link> : <ExamLogo src={exam.logo} examName={exam.name} courseName={exam.course_name} size={64} />}
            <div className="exam-card-copy">
              <div className="article-card-top">
                {exam.course_published_slug ? <Link className="pill" href={`/courses/${exam.course_published_slug}`}>{exam.course_name}</Link> : <span className="pill">{exam.course_name || 'Entrance exam'}</span>}
                <span className={`exam-state exam-state-${state}`}>{STATE_LABEL[state]}</span>
              </div>
              <h2>{profileHref ? <Link href={profileHref}>{exam.name}</Link> : exam.name}</h2>
              {exam.full_name && exam.full_name.toLowerCase() !== exam.name.toLowerCase() ? <p className="exam-card-fullname">{exam.full_name}</p> : null}
            </div>
          </div>
        </div>

        <dl className="exam-card-facts">
          <div><dt>Exam date</dt><dd>{dateFact || 'Not announced'}</dd></div>
          {registration ? <div><dt>Registration</dt><dd>{registration}</dd></div> : null}
          {exam.schedule?.admission_window ? <div><dt>Admissions</dt><dd>{exam.schedule.admission_window}</dd></div> : null}
          {exam.conducted_by ? <div><dt>Conducted by</dt><dd>{exam.conducted_by}</dd></div> : null}
          {mode ? <div><dt>Mode</dt><dd>{mode}</dd></div> : null}
          {fee ? <div><dt>Application fee</dt><dd>{fee}</dd></div> : null}
          {exam.fee ? <div><dt>Programme fees</dt><dd>{compactMoney(exam.fee.min)} – {compactMoney(exam.fee.max)} {exam.fee.basis === 'year' ? '/ year' : 'total'}</dd></div> : null}
        </dl>

        {exam.programmes.length > 0 ? <div className="exam-card-row">
          <span className="exam-card-label">Popular programmes</span>
          <div className="profile-chips">{exam.programmes.map((item) => <span key={item.name}>{item.name}</span>)}</div>
        </div> : null}

        {exam.colleges.length > 0 ? <div className="exam-card-row">
          <span className="exam-card-label">Accepted by</span>
          <p className="exam-card-colleges">
            {exam.colleges.map((college, collegeIndex) => <span key={college.slug}>{collegeIndex > 0 ? ', ' : ''}<Link href={`/colleges/${college.slug}`}>{college.name}</Link></span>)}
            {extraColleges > 0 ? <span> and {extraColleges.toLocaleString('en-IN')} more</span> : null}
          </p>
        </div> : null}

        <div className="exam-card-footer">
          <div className="article-facts">
            <span>{Number(exam.institute_count || 0).toLocaleString('en-IN')} colleges</span>
            <span>{Number(exam.programme_count || 0).toLocaleString('en-IN')} programmes</span>
            {exam.review_count ? <span>{Number(exam.review_count).toLocaleString('en-IN')} reviews · {Number(exam.average_rating).toFixed(1)}/5</span> : null}
          </div>
          {profileHref ? <Link className="home-card-more exam-card-more" href={profileHref}>Dates, eligibility & colleges <ArrowRight size={14} aria-hidden="true" /></Link> : null}
        </div>
      </article>;
    }) : <div className="card"><h2>Exam list unavailable</h2><p>Please try again shortly.</p></div>}</div>
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} course={activeCourse ? course : ''} />}
  </div></main>;
}

function Pagination({ page, totalPages, course }: { page: number; totalPages: number; course: string }) {
  const href = (value: number) => listHref(value, course);
  return <nav className="pagination" aria-label="Exam directory pages">{page > 1 && <Link className="page-arrow" href={href(page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}<div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={href(item)}>{item}</Link>)}</div>{page < totalPages && <Link className="page-arrow" href={href(page + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}</nav>;
}
