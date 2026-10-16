'use client';

import { useState, type ReactNode } from 'react';
import { Filter } from 'lucide-react';
import ArticleDirectory from './ArticleDirectory';
import type { ArticleList } from '../lib/api';

type Choice = { id: string; label: string; type: string; budget: number; pill: string };

/**
 * Article filter tabs for /articles. They filter client-side (no ?type= / ?budget= in the URL): with no filter the
 * server-rendered, paginated list (children) shows; picking a filter fetches that guide type and lists it with "Load more".
 */
export default function ArticleFilters({ visibleTypes, children }: { visibleTypes: string[]; children: ReactNode }) {
  const choices: Choice[] = [
    ...(visibleTypes.includes('fees') ? [{ id: 'fees', label: 'Course fees', type: 'fees', budget: 5, pill: 'Course fees' }] : []),
    ...(visibleTypes.includes('admission') ? [{ id: 'admission', label: 'Admission & eligibility', type: 'admission', budget: 5, pill: 'Admission & eligibility' }] : []),
    ...(visibleTypes.includes('gov-avg-package') ? [{ id: 'gov-avg-package', label: 'Gov by avg package', type: 'gov-avg-package', budget: 5, pill: 'Gov · avg package' }] : []),
    ...(visibleTypes.includes('exam-admission') ? [{ id: 'exam-admission', label: 'MBA by entrance exam', type: 'exam-admission', budget: 5, pill: 'MBA · entrance exam' }] : []),
    ...(visibleTypes.includes('budget') ? [1, 3, 5, 10].map((b) => ({ id: `budget-${b}`, label: `Top colleges 2026 · Under ₹${b} lakh fees`, type: 'budget', budget: b, pill: `Up to ₹${b} lakh` })) : [])
  ];
  const [active, setActive] = useState<Choice | null>(null);
  const [result, setResult] = useState<ArticleList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(choice: Choice | null) {
    if (loading) return;
    setError(null);
    if (!choice || choice.id === active?.id) { setActive(null); setResult(null); return; }
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?page=1&perPage=20&type=${encodeURIComponent(choice.type)}&budget=${choice.budget}`);
      if (!response.ok) throw new Error('failed');
      setResult(await response.json() as ArticleList);
      setActive(choice);
    } catch { setError('Unable to load these guides. Please try again.'); } finally { setLoading(false); }
  }

  return <>
    {choices.length > 0 && <div className="budget-tabs" role="group" aria-label="Article filters"><span className="filter-label"><Filter size={16} aria-hidden="true" /> Filter guides</span>
      {active && <button type="button" className="budget-tab" onClick={() => pick(null)}>All guides</button>}
      {choices.map((c) => <button type="button" key={c.id} className={active?.id === c.id ? 'budget-tab active' : 'budget-tab'} aria-pressed={active?.id === c.id} onClick={() => pick(c)}>{c.label}</button>)}
    </div>}
    {error && <p className="muted" role="alert">{error}</p>}
    {active && result
      ? <ArticleDirectory key={active.id} initial={result.data} total={result.pagination.total} perPage={result.pagination.perPage || 20} type={active.type} budget={active.budget} pill={active.pill} />
      : children}
  </>;
}
