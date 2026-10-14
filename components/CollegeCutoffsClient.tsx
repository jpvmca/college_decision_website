'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { CollegeCutoffResponse } from './Cutoffs';
import { cutoffValue, rankText, NOT_AVAILABLE } from './cutoff-format';

const QUOTA_SHORT: Record<string, string> = { AI: 'All India', HS: 'Home State', OS: 'Other State', JK: 'J&K', LA: 'Ladakh', GO: 'Goa', STATE: 'State', HU: 'Home Univ.', OHU: 'Other Univ.' };
const GENDER_SHORT: Record<string, string> = { GENDER_NEUTRAL: 'Gender-Neutral', FEMALE_ONLY: 'Female-only' };
type Filters = { exam?: string; year?: string; round?: string; category?: string; quota?: string; gender?: string; program?: string };

/** Shorten long JoSAA-style names for dropdowns: drop "(5 Years, …)" and cap length. */
export function shortLabel(name: string, max = 52) {
  const clean = name.replace(/\s*\((?:\d+\s*Years?)[^()]*(?:\([^)]*\))?[^)]*\)/i, '').replace(/\s+/g, ' ').trim() || name;
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Filters are React state; data comes from /api/college-cutoffs. The page URL never changes. */
export default function CollegeCutoffsClient({ slug, collegeName, initial, examHrefs, lockExam = false }: { slug: string; collegeName: string; initial: CollegeCutoffResponse; examHrefs: Record<string, string>; lockExam?: boolean }) {
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const { facets, applied, pagination, data } = state;

  async function load(filters: Filters, page = 1) {
    const id = ++request.current;
    const params = new URLSearchParams({ slug, perPage: String(initial.pagination.perPage || 25), page: String(page) });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setLoading(true); setError(false);
    try {
      const res = await fetch(`/api/college-cutoffs?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as CollegeCutoffResponse;
      if (id === request.current) setState(json);
    } catch {
      if (id === request.current) setError(true);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }
  const current: Filters = {
    exam: applied.exam, year: applied.year ? String(applied.year) : undefined, round: applied.round ? String(applied.round) : undefined,
    category: applied.category, quota: applied.quota, gender: applied.gender, program: applied.program
  };
  const change = (key: keyof Filters, value: string) => {
    const next: Filters = { ...current, [key]: value || undefined };
    // Changing exam or year resets dependent filters so the backend picks valid defaults.
    if (key === 'exam') { next.year = undefined; next.round = undefined; next.quota = undefined; next.program = undefined; next.category = undefined; next.gender = undefined; }
    if (key === 'year') next.round = undefined;
    void load(next, 1);
  };

  const exam = facets.exams.find((e) => e.slug === applied.exam) || facets.exams[0];
  const examName = exam ? exam.name.replace(/\s+/g, ' ') : '';
  const isFinal = applied.round === facets.rounds[facets.rounds.length - 1];
  const nonRank = data.length > 0 && data.every((r) => r.metric_type !== 'rank');
  const examLink = exam ? examHrefs[exam.slug] : undefined;
  const sel = (key: keyof Filters, label: string, options: Array<{ value: string; label: string; title?: string }>, allLabel?: string) =>
    <label className="cutoff-filter"><span>{label}</span>
      <select value={current[key] || ''} onChange={(e) => change(key, e.target.value)} disabled={loading}>
        {allLabel && <option value="">{allLabel}</option>}
        {options.map((o) => <option key={o.value} value={o.value} title={o.title}>{o.label}</option>)}
      </select></label>;
  const start = data.length ? (pagination.page - 1) * pagination.perPage + 1 : 0;

  return <div id="cutoffs" className="cutoff-block" aria-busy={loading}>
    <h3>{examName} Cutoff {applied.year}{applied.round ? ` – Round ${applied.round}${isFinal ? ' (final)' : ''}` : ''}</h3>
    <p className="muted">{nonRank ? 'Published cut-offs' : 'Opening and closing ranks'} for {collegeName} by programme, category, quota and seat pool. {examLink ? <>See all colleges on the <Link href={examLink}>{examName} page</Link>.</> : null}</p>
    <div className="cutoff-filters" role="group" aria-label="Cutoff filters">
      {!lockExam && facets.exams.length > 1 && sel('exam', 'Exam', facets.exams.map((e) => ({ value: e.slug, label: e.name.replace(/\s+/g, ' ') })))}
      {sel('year', 'Year', facets.years.map((y) => ({ value: String(y), label: String(y) })))}
      {facets.rounds.length > 1 && sel('round', 'Round', facets.rounds.map((r) => ({ value: String(r), label: `Round ${r}` })))}
      {sel('category', 'Category', facets.categories.map((c) => ({ value: c.code, label: c.label })), 'All categories')}
      {facets.quotas.length > 1 && sel('quota', 'Quota', facets.quotas.map((c) => ({ value: c.code, label: c.label })), 'All quotas')}
      {facets.genders.length > 1 && sel('gender', 'Seat pool', facets.genders.map((c) => ({ value: c.code, label: c.label })), 'All seat pools')}
      {facets.programmes.length > 1 && sel('program', 'Programme', facets.programmes.map((p) => ({ value: p.name, label: shortLabel(p.name), title: p.name })), 'All programmes')}
      <button type="button" className="button" onClick={() => { setError(false); setState(initial); }} disabled={loading}>Reset</button>
    </div>
    {error && <p role="alert">Could not load cutoffs. Please try again.</p>}
    {data.length ? <div className="detail-table-wrap"><table className="detail-table cutoff-table" style={loading ? { opacity: 0.55 } : undefined}>
      <thead><tr><th scope="col">Programme</th><th scope="col">Category</th><th scope="col">Quota</th><th scope="col">Seat pool</th><th scope="col">Opening</th><th scope="col">{nonRank ? 'Cutoff' : 'Closing'}</th></tr></thead>
      <tbody>{data.map((row) => <tr key={row.id}>
        <th scope="row">{row.program_name}</th>
        <td>{row.category}</td>
        <td>{row.quota ? (QUOTA_SHORT[row.quota] || row.quota) : '—'}{row.seat_type ? <small className="muted"> · {row.seat_type}</small> : null}</td>
        <td>{row.gender_pool ? (GENDER_SHORT[row.gender_pool] || row.gender_pool) : '—'}</td>
        <td>{row.metric_type === 'rank' ? rankText(row.opening_rank) : '—'}</td>
        <td>{cutoffValue(row)}{row.source_url ? <> <a href={row.source_url} target="_blank" rel="noopener nofollow"><small>{row.quality_flag === 'source_aggregator' ? 'Source (aggregator)' : 'Source'}</small></a></> : null}{row.quality_flag === 'opening_gt_closing' ? <small className="muted" title="Opening rank recorded above closing rank in source; verify on JoSAA"> *</small> : null}</td>
      </tr>)}</tbody></table></div> : <p>Cutoffs: {NOT_AVAILABLE} for these filters. Try another category, quota or round.</p>}
    <p className="muted cutoff-count">Showing {start}–{start ? start + data.length - 1 : 0} of {pagination.total.toLocaleString('en-IN')} rows. Verify on the official counselling portal before choice filling.</p>
    {pagination.totalPages > 1 && <nav className="pagination" aria-label="Cutoff pages">
      <button type="button" className="page-arrow" disabled={loading || pagination.page <= 1} onClick={() => load(current, pagination.page - 1)}>Prev</button>
      <span className="page-number current" aria-current="page">{pagination.page} / {pagination.totalPages}</span>
      <button type="button" className="page-arrow" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => load(current, pagination.page + 1)}>Next</button>
    </nav>}
  </div>;
}
