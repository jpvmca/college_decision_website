'use client';

import { Fragment, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, Star } from 'lucide-react';
import ExamLogo from './ExamLogo';
import { STATE_LABEL, applicationFee, compactMoney, examDateFact, modeLabel, registrationFact } from '../lib/exam-format';
import AdSlotClient from './ads/AdSlotClient';
import { feedPositions } from '../lib/ad-feed';
import type { AdFeed } from '../lib/ads';

/**
 * Exam directory body for /exams. The server renders every exam on /exams (All tab) so the HTML stays
 * complete for search engines. Course tabs only update client state — they do not change the URL or
 * send a ?course= / ?page= parameter.
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
  updatedAt?: string | null;
};

export default function ExamDirectory({ initial, total, courses, adFeed = null }: { initial: Exam[]; total: number; courses: CourseFacet[]; adFeed?: AdFeed | null }) {
  const [course, setCourse] = useState('');
  const active = courses.find((item) => item.slug === course) || null;
  const items = course ? initial.filter((exam) => exam.course_slug === course) : initial;
  const shown = course ? items.length : total;
  const adAt = feedPositions(adFeed, items.length, 5);

  function onTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0 || !tabs.length) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
      : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % tabs.length
      : (index - 1 + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }

  return <div className="ex-dir">
    {courses.length > 0 ? <div className="exam-course-filter ex-filter" role="tablist" aria-label="Filter exams by course" onKeyDown={onTabListKeyDown}>
      <button type="button" role="tab" id="exam-tab-all" aria-controls="exam-directory-panel" aria-selected={!course} tabIndex={!course ? 0 : -1} className={!course ? 'active' : undefined} onClick={() => setCourse('')}>All exams</button>
      {courses.map((item) => <button type="button" role="tab" id={`exam-tab-${item.slug}`} key={item.slug} aria-controls="exam-directory-panel" aria-selected={course === item.slug} tabIndex={course === item.slug ? 0 : -1} className={course === item.slug ? 'active' : undefined} onClick={() => setCourse(item.slug)}>{item.name} <span>{item.exam_count}</span></button>)}
    </div> : null}
    <p className="ex-count" aria-live="polite">{shown.toLocaleString('en-IN')} {active ? `${active.name} ` : ''}exams · sorted by colleges accepting the exam</p>
    <div className="article-list ex-list" id="exam-directory-panel" role="tabpanel" aria-labelledby={active ? `exam-tab-${active.slug}` : 'exam-tab-all'}>{items.length ? items.map((exam, index) => {
      const profileHref = exam.published_slug ? `/exams/${exam.published_slug}` : null;
      const dateFact = examDateFact(exam.schedule);
      const registration = registrationFact(exam.schedule);
      const fee = applicationFee(exam.application_fees);
      const mode = modeLabel(exam.mode);
      const state = exam.schedule?.state || 'date_not_announced';
      const extraColleges = Math.max(0, Number(exam.institute_count || 0) - exam.colleges.length);
      const initials = exam.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'EX';
      const facts = [
        { label: 'Exam date', value: dateFact || 'Not announced' },
        registration ? { label: 'Registration', value: registration } : null,
        exam.schedule?.admission_window ? { label: 'Admissions', value: exam.schedule.admission_window } : null,
        exam.conducted_by ? { label: 'Conducted by', value: exam.conducted_by } : null,
        mode ? { label: 'Mode', value: mode } : null,
        fee ? { label: 'Application fee', value: fee } : null,
        exam.fee ? { label: 'Programme fees', value: `${compactMoney(exam.fee.min)} – ${compactMoney(exam.fee.max)} ${exam.fee.basis === 'year' ? '/ year' : 'total'}` } : null
      ].filter((item): item is { label: string; value: string } => Boolean(item));
      const mark = <ExamLogo src={exam.logo} examName={exam.name} courseName={exam.course_name} size={56} fallback={<span aria-hidden="true">{initials}</span>} />;
      return <Fragment key={exam.id}><article className={`article-card exam-card ex-card is-${state}`} id={course ? undefined : `exam-${index + 1}`}>
        <div className="exam-card-heading">
          {profileHref ? <Link prefetch={false} className="ex-logo" href={profileHref}>{mark}</Link> : <span className="ex-logo">{mark}</span>}
          <div className="exam-card-copy">
            <div className="ex-card-top">
              {exam.course_published_slug ? <Link prefetch={false} className="ex-tag" href={`/courses/${exam.course_published_slug}`}>{exam.course_name}</Link> : <span className="ex-tag">{exam.course_name || 'Entrance exam'}</span>}
              <span className={`exam-state exam-state-${state}`}>{STATE_LABEL[state]}</span>
            </div>
            <h2>{profileHref ? <Link prefetch={false} href={profileHref}>{exam.name}</Link> : exam.name}</h2>
            {exam.full_name && exam.full_name.toLowerCase() !== exam.name.toLowerCase() ? <p className="exam-card-fullname">{exam.full_name}</p> : null}
          </div>
        </div>

        <dl className="exam-card-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>

        {exam.programmes.length > 0 ? <div className="exam-card-row">
          <span className="exam-card-label">Popular programmes</span>
          <div className="profile-chips">{exam.programmes.map((item) => <span key={item.name}>{item.name}</span>)}</div>
        </div> : null}

        {exam.colleges.length > 0 ? <div className="exam-card-row">
          <span className="exam-card-label">Accepted by</span>
          <div className="ex-colleges">
            {exam.colleges.slice(0, 4).map((college) => <Link prefetch={false} key={college.slug} href={`/colleges/${college.slug}`}>{college.name}</Link>)}
            {extraColleges > 0 ? <span className="ex-more">+{extraColleges.toLocaleString('en-IN')} more</span> : null}
          </div>
        </div> : null}

        <div className="exam-card-footer">
          <div className="ex-metrics">
            <span><Building2 size={14} aria-hidden="true" /> {Number(exam.institute_count || 0).toLocaleString('en-IN')} colleges</span>
            <span><BookOpen size={14} aria-hidden="true" /> {Number(exam.programme_count || 0).toLocaleString('en-IN')} programmes</span>
            {exam.review_count ? <span className="is-rating"><Star size={14} aria-hidden="true" /> {Number(exam.average_rating).toFixed(1)}/5 · {Number(exam.review_count).toLocaleString('en-IN')} reviews</span> : null}
          </div>
          {profileHref ? <Link prefetch={false} className="ex-card-link" href={profileHref}>View exam profile <ArrowRight size={14} aria-hidden="true" /></Link> : null}
        </div>
      </article>{adAt.has(index + 1) && adFeed ? <AdSlotClient slot={adFeed.slot} settings={adFeed.settings} className="ad-in-list" /> : null}</Fragment>;
    }) : <div className="card ex-empty"><h2>Exam list unavailable</h2><p>Please try again shortly.</p></div>}</div>
  </div>;
}
