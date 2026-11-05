import Link from 'next/link';
import type { Metadata } from 'next';
import { api, ArticleList, mediaUrl } from '../lib/api';
import CollegeDecisionFilter from '../components/CollegeDecisionFilter';
import ExamLogo from '../components/ExamLogo';
import InstituteLogo from '../components/InstituteLogo';
import AdSlot from '../components/ads/AdSlot';
import CourseImage from '../components/CourseImage';
import { formatLpa } from '../lib/packages';
import { daysUntil, formatDate as examFormatDate } from '../lib/exam-format';
import { ArrowLeftRight, ArrowRight, BadgeCheck, BookOpen, Building2, CalendarDays, ChartNoAxesCombined, ClipboardCheck, FileText, GraduationCap, IndianRupee, MapPin, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';
import HeroPhoto from '../components/HeroPhoto';
import HeroStats from '../components/HeroStats';

type CourseSummary = { id: number; name: string; slug?: string; image_url?: string | null; published_slug?: string | null; institute_count: number; programme_count: number; review_count: number | string | null; average_rating: number | string | null };
type ExamSummary = { id: number; name: string; published_slug?: string | null; course_name: string | null; institute_count: number; programme_count: number; review_count: number | string | null; average_rating: number | string | null; logo?: string | null };
type CollegeSummary = {
  id: number;
  display_name?: string | null;
  full_name?: string | null;
  published_slug?: string | null;
  institute_type?: string | null;
  logo?: string | null;
  city?: string | null;
  state?: string | null;
  programme_count?: number | null;
  course_names?: string | null;
  lowest_fee?: number | string | null;
  average_package?: number | string | null;
  nirf_rank?: number | null;
  review_count?: number | string | null;
  average_rating?: number | string | null;
};
type UpcomingExam = { name: string; slug: string; exam_start_date: string };

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

const homeTitle = 'Compare College Fees, Admission & Placements in India';
const homeDescription = 'Compare college fees, courses, entrance exams, admission routes and placements in India with structured programme data.';

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: '/' },
  openGraph: { title: homeTitle, description: homeDescription, url: '/' },
  twitter: { card: 'summary_large_image', title: homeTitle, description: homeDescription }
};

function getGuideImageSources(rawImageUrl: string) {
  const imageUrl = mediaUrl(rawImageUrl);
  const widths = [320, 480, 640];
  const addQuery = (width: number) => `${imageUrl}?w=${width}&h=${Math.round(width * 0.5625)}&q=78&convert=webp`;
  return { src: addQuery(480), srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', ') };
}

export default async function HomePage() {
  let popularGuides: ArticleList['data'] = [];
  let courses: CourseSummary[] = [];
  let exams: ExamSummary[] = [];
  let colleges: CollegeSummary[] = [];
  let upcoming: UpcomingExam[] = [];
  const totals = { colleges: 0, courses: 0, exams: 0, guides: 0 };
  try {
    const [guidesResult, coursesResult, examsResult, collegesResult] = await Promise.all([
      api<ArticleList>('/articles?type=all&latest=true&perPage=4'),
      api<{ data: CourseSummary[]; pagination?: { total: number } }>('/courses?page=1&perPage=6'),
      api<{ data: ExamSummary[]; pagination?: { total: number }; upcoming?: UpcomingExam[] }>('/exams?page=1&perPage=6'),
      api<{ data: CollegeSummary[]; pagination?: { total: number } }>('/colleges?page=1&perPage=6')
    ]);
    popularGuides = guidesResult.data.slice(0, 4);
    courses = coursesResult.data;
    exams = examsResult.data;
    colleges = collegesResult.data.slice(0, 6);
    upcoming = (examsResult.upcoming || []).filter((item) => daysUntil(item.exam_start_date) >= 0).slice(0, 6);
    totals.colleges = Number(collegesResult.pagination?.total) || 0;
    totals.courses = Number(coursesResult.pagination?.total) || 0;
    totals.exams = Number(examsResult.pagination?.total) || 0;
    totals.guides = Number(guidesResult.pagination?.total) || 0;
  } catch {
    popularGuides = [];
    courses = [];
    exams = [];
    colleges = [];
  }
  const typeLabel = (type?: string) => type === 'fees' ? 'Course fees' : type === 'admission' ? 'Admission' : type === 'gov-avg-package' ? 'Placement' : type === 'exam-admission' ? 'MBA entrance' : 'Budget';
  const stats = [
    { icon: Building2, value: totals.colleges, label: 'Colleges profiled' },
    { icon: BookOpen, value: totals.courses, label: 'Courses compared' },
    { icon: ClipboardCheck, value: totals.exams, label: 'Entrance exams' },
    { icon: FileText, value: totals.guides, label: 'Decision guides' }
  ].filter((item) => item.value > 0);
  const quickLinks = [
    ...courses.slice(0, 3).filter((course) => course.published_slug).map((course) => ({ href: `/courses/${course.published_slug}`, label: course.name })),
    ...exams.slice(0, 3).filter((exam) => exam.published_slug).map((exam) => ({ href: `/exams/${exam.published_slug}`, label: exam.name }))
  ];
  return (
    <div className="hp">
      <section className="hp-hero">
        <div className="wrap hp-hero-inner">
          <div className="hp-hero-copy">
            <span className="hp-kicker"><BadgeCheck size={15} aria-hidden="true" /> Evidence-backed college data</span>
            <h1>Compare College Fees, Admission & Placements in India</h1>
            <p>Compare fees, admission routes, placements, hostel costs and real decision trade-offs from structured college data.</p>
            <div className="hp-hero-actions">
              <Link className="button hp-btn-primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="button hp-btn-ghost" href="/articles">Explore decision articles <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            {quickLinks.length > 0 && <div className="hp-quick"><span>Popular:</span>{quickLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>}
          </div>
          <div className="hp-hero-visual" aria-hidden="true">
            <div className="hp-hero-glow" />
            <HeroPhoto src="/college-decision-hero.webp" alt="" width={1536} height={1024} sizes="(max-width: 760px) 80vw, 420px" />
            <span className="hp-float hp-float-top"><ShieldCheck size={15} /> Compare with confidence</span>
            <span className="hp-float hp-float-bottom"><Sparkles size={15} /> Fees · Exams · Placements</span>
          </div>
        </div>
        {stats.length > 0 && <div className="wrap"><HeroStats prefix="hp" stats={stats.map((item) => ({ icon: item.icon, label: item.label, value: `${item.value.toLocaleString('en-IN')}${item.value >= 1000 ? '+' : ''}` }))} /></div>}
      </section>

      <section className="section home-decision-section hp-tool">
        <div className="wrap">
          <CollegeDecisionFilter />
        </div>
      </section>

      {upcoming.length > 0 && <section className="hp-section hp-upcoming" aria-labelledby="hp-upcoming-heading">
        <div className="wrap">
          <div className="hp-heading">
            <div><p className="hp-eyebrow"><CalendarDays size={14} aria-hidden="true" /> Exam calendar</p><h2 id="hp-upcoming-heading">Upcoming entrance exams</h2></div>
            <Link className="hp-view-all" href="/exams">All exam dates <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ol className="hp-upcoming-list">{upcoming.map((item) => {
            const days = daysUntil(item.exam_start_date);
            const date = new Date(`${item.exam_start_date.slice(0, 10)}T00:00:00Z`);
            return <li key={item.slug}><Link href={`/exams/${item.slug}`}>
              <span className="hp-date"><strong>{date.getUTCDate()}</strong><small>{date.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })}</small></span>
              <span className="hp-upcoming-copy"><strong>{item.name}</strong><small>{examFormatDate(item.exam_start_date)}</small></span>
              <em className={days <= 14 ? 'is-soon' : undefined}>{days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} left`}</em>
            </Link></li>;
          })}</ol>
        </div>
      </section>}

      <section className="hp-section">
        <div className="wrap">
          <div className="hp-heading is-center">
            <div><p className="hp-eyebrow">Our approach</p><h2>What makes a useful college decision?</h2><p>Our pages explain the number, its source, its date and what it does not include.</p></div>
          </div>
          <div className="hp-features">
            <article className="hp-feature"><span className="hp-feature-icon is-blue"><IndianRupee size={22} aria-hidden="true" /></span><span className="hp-feature-tag">Fees</span><h3>Total cost, not just tuition</h3><p>Separate tuition, hostel, mess, deposits and other charges before comparing colleges.</p></article>
            <article className="hp-feature"><span className="hp-feature-icon is-teal"><GraduationCap size={22} aria-hidden="true" /></span><span className="hp-feature-tag">Admission</span><h3>Route and eligibility</h3><p>Understand entrance exams, counselling, eligibility and the evidence behind each claim.</p></article>
            <article className="hp-feature"><span className="hp-feature-icon is-amber"><ChartNoAxesCombined size={22} aria-hidden="true" /></span><span className="hp-feature-tag">Outcomes</span><h3>Placement context</h3><p>Show placement year and units instead of turning an unverified number into a promise.</p></article>
          </div>
        </div>
      </section>

      {colleges.length > 0 && <section className="hp-section hp-band">
        <div className="wrap">
          <div className="hp-heading">
            <div><p className="hp-eyebrow">Start your shortlist</p><h2>Popular colleges</h2></div>
            <Link className="hp-view-all" href="/colleges">View all colleges <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="hp-grid">
            {colleges.map((college) => {
              const programmeCount = Number(college.programme_count || 0);
              const courseNames = (college.course_names || '').split(',').map((item) => item.trim()).filter(Boolean);
              const collegeName = college.display_name || college.full_name || 'College';
              const href = college.published_slug ? `/colleges/${college.published_slug}` : '/colleges';
              const fee = Number(college.lowest_fee) || 0;
              const pkg = Number(college.average_package) || 0;
              const rating = Number(college.average_rating) || 0;
              const facts = [
                fee ? { label: 'Fees from', value: money(fee) } : null,
                pkg ? { label: 'Avg pkg', value: formatLpa(pkg) } : null,
                rating ? { label: 'Rating', value: `${rating.toFixed(1)} ★` } : null
              ].filter((item): item is { label: string; value: string } => Boolean(item));
              return (
                <article className="hp-card hp-college" key={college.id}>
                  <div className="hp-college-top">
                    <span className="hp-logo"><InstituteLogo src={college.logo} alt={`${collegeName} college logo`} /></span>
                    <div className="hp-tags">
                      <span className="hp-tag">{college.institute_type === 'public' ? 'Public' : college.institute_type === 'private' ? 'Private' : 'College'}</span>
                      {college.nirf_rank ? <span className="hp-tag is-rank"><Trophy size={12} aria-hidden="true" /> NIRF #{college.nirf_rank}</span> : null}
                    </div>
                  </div>
                  <h3>{college.published_slug ? <Link href={href}>{collegeName}</Link> : collegeName}</h3>
                  <p className="hp-loc"><MapPin size={14} aria-hidden="true" /> {[college.city, college.state].filter(Boolean).join(', ') || 'India'}</p>
                  {facts.length > 0 && <dl className="hp-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
                  <p className="hp-college-courses"><strong>{programmeCount.toLocaleString('en-IN')} programmes</strong>{courseNames.length ? <> · {courseNames.slice(0, 4).join(', ')}{courseNames.length > 4 ? ` +${courseNames.length - 4} more` : ''}</> : null}</p>
                  <Link className="hp-card-link" href={href}>{college.published_slug ? 'View college profile' : 'View more'} <ArrowRight size={14} aria-hidden="true" /></Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>}

      {courses.length > 0 && <section className="hp-section">
        <div className="wrap">
          <div className="hp-heading">
            <div><p className="hp-eyebrow">Explore study paths</p><h2>Popular courses</h2></div>
            <Link className="hp-view-all" href="/courses">View all courses <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="hp-grid">
            {courses.map((course) => {
              const href = course.published_slug ? `/courses/${course.published_slug}` : null;
              const rating = Number(course.average_rating) || 0;
              return <article className="hp-card hp-course" key={course.id}>
                <div className="hp-course-media"><CourseImage src={course.image_url} alt={`${course.name} course guide`} />{course.review_count ? <span className="hp-media-tag">{Number(course.review_count).toLocaleString('en-IN')} reviews</span> : null}</div>
                <div className="hp-course-body">
                  <h3>{href ? <Link href={href}>{course.name}</Link> : course.name}</h3>
                  <dl className="hp-facts is-two">
                    <div><dt>Colleges</dt><dd>{Number(course.institute_count || 0).toLocaleString('en-IN')}</dd></div>
                    <div><dt>Programmes</dt><dd>{Number(course.programme_count || 0).toLocaleString('en-IN')}</dd></div>
                  </dl>
                  {rating ? <p className="hp-rating"><Star size={14} aria-hidden="true" /> <strong>{rating.toFixed(1)}/5</strong> average rating</p> : null}
                  {href ? <Link className="hp-card-link" href={href}>View course profile <ArrowRight size={14} aria-hidden="true" /></Link> : null}
                </div>
              </article>;
            })}
          </div>
        </div>
      </section>}

      {exams.length > 0 && <section className="hp-section hp-band">
        <div className="wrap">
          <div className="hp-heading">
            <div><p className="hp-eyebrow">Plan your application</p><h2>Popular entrance exams</h2></div>
            <Link className="hp-view-all" href="/exams">View all exams <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="hp-grid">
            {exams.map((exam) => {
              const href = exam.published_slug ? `/exams/${exam.published_slug}` : null;
              return <article className="hp-card hp-exam" key={exam.id}>
                <div className="hp-exam-top">
                  <span className="hp-logo"><ExamLogo src={exam.logo} examName={exam.name} courseName={exam.course_name} size={44} /></span>
                  <div><h3>{href ? <Link href={href}>{exam.name}</Link> : exam.name}</h3><span className="hp-tag">{exam.course_name || 'Entrance exam'}</span></div>
                </div>
                <dl className="hp-facts is-two">
                  <div><dt>Colleges</dt><dd>{Number(exam.institute_count || 0).toLocaleString('en-IN')}</dd></div>
                  <div><dt>Programmes</dt><dd>{Number(exam.programme_count || 0).toLocaleString('en-IN')}</dd></div>
                </dl>
                {exam.review_count ? <p className="hp-rating"><Star size={14} aria-hidden="true" /> <strong>{Number(exam.average_rating).toFixed(1)}/5</strong> from {Number(exam.review_count).toLocaleString('en-IN')} course reviews</p> : null}
                {href ? <Link className="hp-card-link" href={href}>View exam profile <ArrowRight size={14} aria-hidden="true" /></Link> : null}
              </article>;
            })}
          </div>
        </div>
      </section>}

      <section className="hp-section">
        <div className="wrap">
          <div className="hp-heading">
            <div><p className="hp-eyebrow">Start with a useful question</p><h2>Popular decision guides</h2><p>Explore current course guides organised around the questions students ask before applying.</p></div>
            <Link className="hp-view-all" href="/articles">View all decision guides <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="hp-guides">
            {popularGuides.map((guide) => <article className="hp-card hp-guide" key={guide.slug}>
              {guide.imageUrl && (() => { const image = getGuideImageSources(guide.imageUrl); return <Link className="hp-guide-media" href={`/articles/${guide.slug}`} tabIndex={-1} aria-hidden="true"><img src={image.src} srcSet={image.srcSet} sizes="(max-width: 760px) 100vw, 360px" alt={guide.title} width="640" height="360" loading="lazy" decoding="async" /></Link>; })()}
              <div className="hp-guide-body">
                <span className="hp-tag">{typeLabel(guide.articleType)}</span>
                <h3><Link href={`/articles/${guide.slug}`}>{guide.title}</Link></h3>
                <p>{guide.content || 'Review the latest published course, fee and admission information before applying.'}</p>
                <Link className="hp-card-link" href={`/articles/${guide.slug}`}>Read guide <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </article>)}
            {!popularGuides.length && <p className="muted">New decision guides will appear here after they are published.</p>}
          </div>
        </div>
      </section>

      <section className="hp-section">
        <div className="wrap">
          <div className="hp-cta">
            <div><h2>Shortlisted a few colleges?</h2><p>Put them side by side on fees, cutoffs, placements and ratings before you apply.</p></div>
            <div className="hp-cta-actions">
              <Link className="button hp-btn-primary" href="/compare-colleges-2026"><ArrowLeftRight size={17} aria-hidden="true" /> Compare colleges</Link>
              <Link className="button hp-btn-ghost" href="/colleges">Browse colleges</Link>
            </div>
          </div>
          <AdSlot slotKey="home_bottom" />
        </div>
      </section>
    </div>
  );
}
