'use client';

import { useRef, useState } from 'react';
import { ExamCutoffs, type ExamCutoffResponse } from './Cutoffs';

type Facet = { code: string; label: string };
type WithFacets = ExamCutoffResponse & { facets?: { categories: Facet[]; quotas: Facet[]; genders: Facet[] } };

/** Exam cutoff table with in-place filters (state + /api/exam-cutoffs); the page URL never changes. */
export default function ExamCutoffsClient({ slug, examLabel, initial, heading }: { slug: string; examLabel: string; initial: WithFacets; heading?: string | null }) {
  const [state, setState] = useState<WithFacets>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const req = useRef(0);
  const facets = initial.facets;
  const a = state.applied as Record<string, string | number | null | undefined>;
  const current: Record<string, string> = {
    category: String(a.category || ''), quota: String(a.quota || ''), gender: String(a.gender || ''), paper: String(a.paper || '')
  };
  async function load(next: Record<string, string>, page = 1) {
    const id = ++req.current;
    const params = new URLSearchParams({ slug, year: String(initial.applied.year || ''), perPage: String(initial.pagination.perPage || 100), page: String(page) });
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v); });
    setLoading(true); setError(false);
    try {
      const res = await fetch(`/api/exam-cutoffs?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as WithFacets;
      if (id === req.current) setState({ ...json, facets });
    } catch { if (id === req.current) setError(true); } finally { if (id === req.current) setLoading(false); }
  }
  const change = (key: string, value: string) => void load({ ...current, [key]: value }, 1);
  const qualifying = initial.data.some((r) => /^(qualifying|shortlist|reported)/.test(r.best?.cutoff_type || ''));
  const sel = (key: string, label: string, options: Array<{ value: string; label: string }>) =>
    <label className="cutoff-filter"><span>{label}</span>
      <select value={current[key]} onChange={(e) => change(key, e.target.value)} disabled={loading}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select></label>;
  const { pagination } = state;
  return <div aria-busy={loading}>
    {!qualifying && facets && <div className="cutoff-filters" role="group" aria-label="Cutoff filters">
      {facets.categories.length > 1 && sel('category', 'Category', facets.categories.map((c) => ({ value: c.code, label: c.label })))}
      {facets.quotas.length > 1 && sel('quota', 'Quota', [...(facets.quotas.some((q) => q.code === 'AI' || q.code === 'OS') ? [{ value: 'AI_OS', label: 'All India / Other State' }] : []), ...facets.quotas.map((c) => ({ value: c.code, label: c.label }))])}
      {facets.genders.length > 1 && sel('gender', 'Seat pool', facets.genders.map((c) => ({ value: c.code, label: c.label })))}
      {slug === 'jee-main' && sel('paper', 'Programme type', [{ value: 'btech', label: 'B.E./B.Tech (Paper 1)' }, { value: 'barch', label: 'B.Arch / B.Planning (Paper 2)' }])}
      <button type="button" className="button" onClick={() => { setError(false); setState(initial); }} disabled={loading}>Reset</button>
    </div>}
    {error && <p role="alert">Could not load cutoffs. Please try again.</p>}
    <div style={loading ? { opacity: 0.55 } : undefined}>
      <ExamCutoffs examLabel={examLabel} cutoffs={state} heading={heading} collegeHref={(s) => `/colleges/${s}/cutoff`} />
    </div>
    {pagination.totalPages > 1 && <nav className="pagination cutoff-block" aria-label="Cutoff pages">
      <button type="button" className="page-arrow" disabled={loading || pagination.page <= 1} onClick={() => load(current, pagination.page - 1)}>Prev</button>
      <span className="page-number current" aria-current="page">{pagination.page} / {pagination.totalPages}</span>
      <button type="button" className="page-arrow" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => load(current, pagination.page + 1)}>Next</button>
    </nav>}
  </div>;
}
