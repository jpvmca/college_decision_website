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
  cutoff_basis?: string | null;
  section?: string | null;
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
    best: { program_name: string; quota?: string | null; round: number; opening_rank?: number | null; cutoff_type?: string | null; cutoff_basis?: string | null; source_url?: string | null } | null;
    qualifying?: { categories: Record<string, Record<string, number>>; sections: string[]; overall: Record<string, number>; basis: string | null; programme: string | null; source_url: string | null; source_flag: string | null } | null;
  }>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
};

import { NOT_AVAILABLE, rankText, cutoffValue } from './cutoff-format';
import CollegeCutoffsClient from './CollegeCutoffsClient';
export { NOT_AVAILABLE, rankText, cutoffValue };
/** Student-facing label for institute_cutoffs.cutoff_basis. */
export function basisLabel(basis?: string | null) {
  return basis === 'eligibility' ? 'Eligibility' : basis === 'shortlist' ? 'Shortlist' : basis === 'final' ? 'Final closing' : basis === 'closing' ? 'Round closing' : basis === 'reported' ? 'Reported' : '—';
}
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

export function ExamCutoffs({ examLabel, cutoffs, collegeHref, heading }: { examLabel: string; cutoffs: ExamCutoffResponse | null; collegeHref: (slug: string) => string | null; /** Overrides the H2; null hides it (the page renders its own year heading). */ heading?: string | null }) {
  if (!cutoffs || !cutoffs.data.length) {
    return <section id="cutoffs"><h2>{examLabel} cutoff by college</h2><p>College-wise {examLabel} cutoffs: {NOT_AVAILABLE}. We only show cutoffs from official counselling or institute data; check the official {examLabel} counselling or institute notices for the latest cutoffs.</p></section>;
  }
  const { applied, metric } = cutoffs;
  // Exams keyed by admission year (CAT) are labelled with the exam year users know: "CAT 2025", not the 2026 intake.
  const examYear = cutoffs.examYear || applied.year;
  const admissionKeyed = Boolean(cutoffs.examYear && cutoffs.examYear !== applied.year);
  const qualifying = cutoffs.data.some((row) => /^qualifying|shortlist/.test(row.best?.cutoff_type || ''));
  if (qualifying) {
    const isScore = metric === 'score';
    const unit = isScore ? 'score' : 'percentile';
    const cats: Array<[string, string]> = [['OPEN', 'General'], ['EWS', 'EWS'], ['OBC_NCL', 'NC-OBC'], ['SC', 'SC'], ['ST', 'ST'], ['PWD', 'PwD'], ['OPEN_PWD', 'General PwD'], ['EWS_PWD', 'EWS PwD'], ['OBC_NCL_PWD', 'NC-OBC PwD'], ['SC_PWD', 'SC PwD'], ['ST_PWD', 'ST PwD']];
    const secLabel = (s: string) => (s === 'overall' ? 'Overall' : s === 'sectional' ? 'Each section' : s);
    const cell = (v: number | undefined) => (v === undefined ? '—' : v);
    const generalSections = Array.from(new Set(cutoffs.data.flatMap((r) => (r.qualifying?.sections || []).filter((s) => s !== 'overall'))));
    const shown = cutoffs.data.length;
    const anyAggregator = cutoffs.data.some((r) => r.qualifying?.source_flag === 'source_aggregator');
    return <section id="cutoffs">
      {heading !== null && <h2>{heading ?? `${examLabel} ${examYear} cutoffs: published minimum ${unit}s by college`}</h2>}
      <p className="muted">Published minimum eligibility or shortlisting criteria, depending on the institute, in {examLabel} {examYear} {isScore ? `scores${examLabel === 'NMAT' ? ' (overall out of 360, sections out of 120)' : ''}` : 'percentiles'}. {shown} {shown === 1 ? 'college' : 'colleges'} listed, sorted by the General-category overall figure. The <strong>Type</strong> column says what each figure is; open “All categories” under a college for every category{generalSections.length ? ' and section' : ''}.{admissionKeyed ? ` Used for ${applied.year}–${String((applied.year || 0) + 2).slice(-2)} admissions.` : ''}</p>
      <p className="muted"><strong>Meeting a published minimum does not guarantee an interview call or admission. Criteria and selection processes vary by institute.</strong></p>
      <div className="detail-table-wrap"><table className="detail-table cutoff-table">
        <thead><tr><th scope="col">College</th><th scope="col">Type</th><th scope="col">General overall</th>{generalSections.map((s) => <th scope="col" key={s}>General {secLabel(s)}</th>)}<th scope="col">Source</th></tr></thead>
        <tbody>{cutoffs.data.map((row) => {
          const href = row.published_slug ? collegeHref(row.published_slug) : null;
          const q = row.qualifying;
          const src = q?.source_url || row.best?.source_url;
          const gen = q?.categories?.OPEN || {};
          const rowCats = cats.filter(([code]) => q?.categories?.[code]);
          const secs = q?.sections || [];
          const basis = q?.basis || row.best?.cutoff_basis || null;
          return <tr key={row.institute_id}>
            <th scope="row">{href ? <Link href={href}>{row.institute_name}</Link> : row.institute_name}{row.city ? <small className="muted"> · {row.city}</small> : null}
              {isScore && q?.programme ? <small className="muted"><br />{q.programme}</small> : null}
              {rowCats.length > 0 && <details className="cutoff-cats"><summary>All categories</summary>
                <table className="detail-table"><thead><tr><th scope="col">Category</th>{secs.map((s) => <th scope="col" key={s}>{secLabel(s)}</th>)}</tr></thead>
                  <tbody>{rowCats.map(([code, label]) => <tr key={code}><th scope="row">{label}</th>{secs.map((s) => <td key={s}>{cell(q!.categories[code][s])}</td>)}</tr>)}</tbody></table>
                {!secs.includes('overall') && <p className="muted">This institute publishes sectional minimums only, with no overall {unit} cut-off.</p>}
              </details>}
            </th>
            <td>{basisLabel(basis)}</td>
            <td><strong>{row.best_value == null ? 'Not published' : Number(row.best_value)}</strong></td>
            {generalSections.map((s) => <td key={s}>{cell(gen[s])}</td>)}
            <td>{src ? <a href={src} target="_blank" rel="noopener nofollow">{q?.source_flag === 'source_aggregator' ? 'Secondary source*' : 'Official'}</a> : '—'}</td>
          </tr>;
        })}</tbody></table></div>
      <p className="muted"><strong>Type:</strong> Eligibility = the minimum to be considered at all; Shortlist = the cut-off the institute says it used for its interview shortlist; Reported = a figure reported after the process rather than a policy minimum. {isScore ? 'Scores, not percentiles or ranks.' : 'Percentiles, not ranks.'}{anyAggregator ? ' * Secondary source - not independently verified: the official document could not be retrieved, so the figures are as published by a secondary source.' : ''}</p>
    </section>;
  }
  const metricLabel = metric === 'score' ? 'Highest closing score' : metric === 'percentile' ? 'Highest closing percentile' : 'Best closing rank';
  const quotaNote = applied.quota === 'AI_OS' ? 'All-India / Other-State quota' : applied.quota ? (QUOTA_SHORT[applied.quota] || applied.quota) + ' quota' : 'all quotas';
  return <section id="cutoffs">
    {heading !== null && <h2>{heading ?? <>{examLabel} {examYear} cutoffs: top colleges by {metric === 'rank' || !metric ? 'closing rank' : `closing ${metric}`}</>}</h2>}
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
