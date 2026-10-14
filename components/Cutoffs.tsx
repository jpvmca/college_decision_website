import Link from 'next/link';

/* Server-rendered cutoff UI (no client JS): GET-form filters + paginated table. */

export type CutoffRow = {
  id: number;
  program_name: string;
  exam_name?: string | null;
  round: number;
  year: number;
  category: string;
  category_code?: string | null;
  quota?: string | null;
  seat_type?: string | null;
  gender_pool?: string | null;
  metric_type?: 'rank' | 'score' | 'percentile' | null;
  cutoff_type?: string | null;
  opening_rank?: number | null;
  closing_rank?: number | null;
  cutoff_score?: number | string | null;
  cutoff_percentile?: number | string | null;
  source_url?: string | null;
  quality_flag?: string | null;
};
type Facet = { code: string; label: string };
export type CollegeCutoffResponse = {
  data: CutoffRow[];
  facets: {
    exams: Array<{ exam_id: number; slug: string; name: string; rows: number; latest_year: number }>;
    years: number[];
    rounds: number[];
    categories: Facet[];
    quotas: Facet[];
    genders: Facet[];
    programmes: Array<{ name: string; institute_program_id: number | null }>;
  };
  applied: { exam?: string; year?: number; round?: number; category?: string; quota?: string; gender?: string; program?: string };
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};
export type ExamCutoffResponse = {
  exam: { id: number; slug: string; name: string };
  metric?: 'rank' | 'score' | 'percentile';
  years: number[];
  examYear?: number;
  applied: { year?: number; category?: string; gender?: string; quota?: string | null; paper?: string | null };
  data: Array<{
    institute_id: number;
    institute_name: string;
    published_slug: string | null;
    city?: string | null;
    state?: string | null;
    best_value: number | string | null;
    programmes: number;
    best: { program_name: string; quota?: string | null; round: number; opening_rank?: number | null; cutoff_type?: string | null; source_url?: string | null } | null;
    qualifying?: { overall: Record<string, number>; sectional: Record<string, string>; source_url: string | null; source_flag: string | null } | null;
  }>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};

import { NOT_AVAILABLE, rankText, cutoffValue } from './cutoff-format';
import CollegeCutoffsClient from './CollegeCutoffsClient';
export { NOT_AVAILABLE, rankText, cutoffValue };
const QUOTA_SHORT: Record<string, string> = { AI: 'All India', HS: 'Home State', OS: 'Other State', JK: 'J&K', LA: 'Ladakh', GO: 'Goa', STATE: 'State', HU: 'Home Univ.', OHU: 'Other Univ.' };

export function CollegeCutoffs({ slug, collegeName, cutoffs, examHref }: { slug: string; collegeName: string; cutoffs: CollegeCutoffResponse | null; examHref?: (examSlug: string) => string | null }) {
  if (!cutoffs || !cutoffs.facets.exams.length) {
    return <div id="cutoffs"><h3>Cutoff Trends</h3><p>Cutoffs: {NOT_AVAILABLE}. Branch-wise and category-wise cutoffs for {collegeName} are not published in the current dataset. Check the official counselling website for the latest cutoffs.</p></div>;
  }
  const examHrefs: Record<string, string> = {};
  cutoffs.facets.exams.forEach((e) => { const h = examHref?.(e.slug); if (h) examHrefs[e.slug] = h; });
  // Default table is server-rendered (client component SSR); filters then update in place without touching the URL.
  return <CollegeCutoffsClient slug={slug} collegeName={collegeName} initial={cutoffs} examHrefs={examHrefs} />;
}

export function ExamCutoffs({ examLabel, cutoffs, collegeHref }: { examLabel: string; cutoffs: ExamCutoffResponse | null; collegeHref: (slug: string) => string | null }) {
  if (!cutoffs || !cutoffs.data.length) {
    return <section id="cutoffs"><h2>{examLabel} cutoff by college</h2><p>College-wise {examLabel} cutoffs: {NOT_AVAILABLE}. We only show cutoffs from official counselling or institute data; check the official {examLabel} counselling or institute notices for the latest cutoffs.</p></section>;
  }
  const { applied, metric } = cutoffs;
  const qualifying = cutoffs.data.some((row) => /^qualifying|shortlist/.test(row.best?.cutoff_type || ''));
  if (qualifying) {
    const cols: Array<[string, string]> = [['EWS', 'EWS'], ['OBC_NCL', 'NC-OBC'], ['SC', 'SC'], ['ST', 'ST']];
    const val = (v: number | undefined) => (v === undefined ? NOT_AVAILABLE : v);
    const pwd = (o: Record<string, number>) => o.PWD ?? o.OPEN_PWD;
    return <section id="cutoffs">
      <h2>{examLabel} cutoff {applied.year}: minimum percentile by college</h2>
      <p className="muted">Official minimum {examLabel} {applied.year} percentiles (overall) that each institute uses for its first shortlist, by category, sorted by the General-category minimum. Clearing these does not guarantee an interview call; final shortlists also weigh academics, work experience, diversity and interviews. {cutoffs.pagination.total} college(s) on record.{cutoffs.examYear && cutoffs.examYear !== applied.year ? ` Based on ${examLabel} ${cutoffs.examYear} exam scores, used for ${applied.year}–${String((applied.year || 0) + 2).slice(-2)} admissions.` : ''}</p>
      <div className="detail-table-wrap"><table className="detail-table cutoff-table">
        <thead><tr><th scope="col">College</th><th scope="col">General</th><th scope="col">General sectional</th>{cols.map(([, l]) => <th scope="col" key={l}>{l}</th>)}<th scope="col">PwD</th><th scope="col">Source</th></tr></thead>
        <tbody>{cutoffs.data.map((row) => {
          const href = row.published_slug ? collegeHref(row.published_slug) : null;
          const q = row.qualifying;
          const src = q?.source_url || row.best?.source_url;
          return <tr key={row.institute_id}>
            <th scope="row">{href ? <Link href={href}>{row.institute_name}</Link> : row.institute_name}{row.city ? <small className="muted"> · {row.city}</small> : null}</th>
            <td><strong>{row.best_value == null ? NOT_AVAILABLE : Number(row.best_value)}</strong></td>
            <td>{q?.sectional.OPEN || NOT_AVAILABLE}</td>
            {cols.map(([code]) => <td key={code}>{val(q?.overall[code])}</td>)}
            <td>{val(q ? pwd(q.overall) : undefined)}</td>
            <td>{src ? <a href={src} target="_blank" rel="noopener nofollow">{q?.source_flag === 'source_aggregator' ? 'Aggregator*' : 'Official'}</a> : '—'}</td>
          </tr>;
        })}</tbody></table></div>
      <p className="muted">Percentiles, not ranks. * Official {applied.year} document not retrievable; values from a secondary source that match the institute&apos;s published policy for adjacent years. Colleges not listed: cutoff {NOT_AVAILABLE.toLowerCase()} in our dataset.</p>
    </section>;
  }
  const metricLabel = metric === 'score' ? 'Highest closing score' : metric === 'percentile' ? 'Highest closing percentile' : 'Best closing rank';
  const quotaNote = applied.quota === 'AI_OS' ? 'All-India / Other-State quota' : applied.quota ? (QUOTA_SHORT[applied.quota] || applied.quota) + ' quota' : 'all quotas';
  return <section id="cutoffs">
    <h2>{examLabel} cutoff {applied.year}: top colleges by {metric === 'rank' || !metric ? 'closing rank' : `closing ${metric}`}</h2>
    <p className="muted">{metricLabel} per college for the General/Open category, gender-neutral seats, final round, {quotaNote}{applied.paper === 'btech' ? ', B.E./B.Tech (Paper 1) programmes' : ''}. {cutoffs.pagination.total} colleges have {applied.year} data.</p>
    <div className="detail-table-wrap"><table className="detail-table cutoff-table">
      <thead><tr><th scope="col">#</th><th scope="col">College</th><th scope="col">Programme</th><th scope="col">{metric === 'rank' || !metric ? 'Closing rank' : metric === 'score' ? 'Closing score' : 'Closing percentile'}</th></tr></thead>
      <tbody>{cutoffs.data.map((row, index) => {
        const href = row.published_slug ? collegeHref(row.published_slug) : null;
        return <tr key={row.institute_id}>
          <td>{(cutoffs.pagination.page - 1) * cutoffs.pagination.perPage + index + 1}</td>
          <th scope="row">{href ? <Link href={href.endsWith("/cutoff") ? href : `${href}#cutoffs`}>{row.institute_name}</Link> : row.institute_name}{row.city ? <small className="muted"> · {row.city}</small> : null}</th>
          <td>{row.best?.program_name || '—'}{row.best?.quota ? <small className="muted"> · {QUOTA_SHORT[row.best.quota] || row.best.quota}</small> : null}</td>
          <td>{metric === 'rank' || !metric ? rankText(row.best_value) : row.best_value == null ? NOT_AVAILABLE : Number(row.best_value)}</td>
        </tr>;
      })}</tbody></table></div>
    <p className="muted">Lower closing rank = more competitive. Category, quota and home-state rules change the cutoff; open a college to see every branch, category and round.</p>
  </section>;
}
