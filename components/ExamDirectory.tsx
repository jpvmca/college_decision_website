'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import ExamLogo from './ExamLogo';
import { STATE_LABEL, applicationFee, compactMoney, examDateFact, modeLabel, registrationFact } from '../lib/exam-format';

/**
 * Exam directory body for /exams: course tabs filter client-side (no URL change, no ?course=), and "Load more"
 * fetches the next batch without ?page=. The first batch of "All exams" is server-rendered by the page.
 */
export type ScheduleState = 'registration_open' | 'registration_closed' | 'upcoming' | 'completed' | 'date_not_announced';
export type Schedule = {
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
export type CourseFacet = { slug: string; name: string; exam_count: number };
export type UpcomingExam = { name: string; slug: string; exam_start_date: string; application_end_date: string | null };
export type ExamList = {
  data: Exam[];
  courses?: CourseFacet[];
  upcoming?: UpcomingExam[];
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};

type ListState = { items: Exam[]; total: number; page: number };


export default function ExamDirectory({ initial, total, courses, perPage }: { initial: Exam[]; total: number; courses: CourseFacet[]; perPage: number }) {
  const cache = useRef(new Map<string, ListState>([['', { items: initial, total, page: 1 }]]));
  const [course, setCourse] = useState('');
  const [list, setList] = useState<ListState>({ items: initial, total, page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = courses.find((item) => item.slug === course) || null;

  async function fetchPage(slug: string, page: number) {
    const response = await fetch(`/api/exams?page=${page}&perPage=${perPage}${slug ? `&course=${encodeURIComponent(slug)}` : ''}`);
    if (!response.ok) throw new Error('failed');
    return await response.json() as ExamList;
  }

  async function selectCourse(slug: string) {
    if (slug === course || loading) return;
    setError(null);
    const cached = cache.current.get(slug);
    if (cached) { setCourse(slug); setList(cached); return; }
    setLoading(true);
    try {
      const result = await fetchPage(slug, 1);
      const next = { items: result.data, total: result.pagination.total, page: 1 };
      cache.current.set(slug, next);
      setCourse(slug); setList(next);
    } catch { setError('Unable to load exams. Please try again.'); } finally { setLoading(false); }
  }

  async function loadMore() {
    if (loading || list.items.length >= list.total) return;
    setLoading(true); setError(null);
    try {
      const result = await fetchPage(course, list.page + 1);
      const seen = new Set(list.items.map((item) => item.id));
      const next = { items: [...list.items, ...result.data.filter((item) => !seen.has(item.id))], total: result.pagination.total, page: list.page + 1 };
      cache.current.set(course, next); setList(next);
    } catch { setError('Unable to load more exams. Please try again.'); } finally { setLoading(false); }
  }

  return <>
    {courses.length > 0 ? <div className="exam-course-filter" role="group" aria-label="Filter exams by course">
      <button type="button" className={!course ? 'active' : undefined} aria-pressed={!course} onClick={() => selectCourse('')}>All exams</button>
      {courses.map((item) => <button type="button" key={item.slug} className={course === item.slug ? 'active' : undefined} aria-pressed={course === item.slug} onClick={() => selectCourse(item.slug)}>{item.name} <span>{item.exam_count}</span></button>)}
    </div> : null}
    <p className="muted" aria-live="polite">{list.total.toLocaleString('en-IN')} {active ? `${active.name} ` : ''}exams · sorted by colleges accepting the exam</p>
    <div className="article-list">{list.items.length ? list.items.map((exam, index) => {
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
    {(list.items.length < list.total || error) && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>{loading ? 'Loading exams…' : error ? 'Try again' : 'Load more'} <ArrowDown size={16} aria-hidden="true" /></button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
