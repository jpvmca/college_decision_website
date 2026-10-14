'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORY_OPTIONS, levelFor, percentileHref, type FinderResult } from '../lib/percentile';

export type FinderCombo = { id: string; courseKey: string; courseLabel: string; courseId: number; exam: string; examName: string; years: Array<{ year: number; exam_year: number }> };
type Values = { percentile: string; category: string; varc: string; dilr: string; qa: string; state: string; city: string; programme: string; budget: string; year: string };
const EMPTY: Values = { percentile: '', category: 'OPEN', varc: '', dilr: '', qa: '', state: '', city: '', programme: '', budget: '', year: '' };

/** College Finder: course + exam preselected from page context; submits to the clean percentile URL with query parameters. */
export default function CollegeFinderForm({ combos, initialId, initial, facets: initialFacets, resetHref, bare = false }: {
  combos: FinderCombo[]; initialId: string; initial?: Partial<Values>; facets: FinderResult['facets'] | null; resetHref: string; bare?: boolean;
}) {
  const router = useRouter();
  const [comboId, setComboId] = useState(initialId);
  const [values, setValues] = useState<Values>({ ...EMPTY, ...initial });
  const [facets, setFacets] = useState(initialFacets);
  const [error, setError] = useState('');
  const combo = combos.find((c) => c.id === comboId) || combos[0];

  useEffect(() => {
    if (comboId === initialId && initialFacets) { setFacets(initialFacets); return; }
    let live = true;
    fetch(`/api/percentile-finder?course=${combo.courseId}&exam=${combo.exam}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d: FinderResult | null) => { if (live) setFacets(d?.facets || null); }).catch(() => { if (live) setFacets(null); });
    return () => { live = false; };
  }, [comboId, combo.courseId, combo.exam, initialId, initialFacets]);

  if (!combo) return null;
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [k]: e.target.value, ...(k === 'state' ? { city: '' } : {}) }));
  const cities = (facets?.cities || []).filter((c) => !values.state || c.state === values.state);
  const num = (s: string) => s !== '' && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 100;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!num(values.percentile)) { setError('Enter your overall percentile (0–100).'); return; }
    for (const k of ['varc', 'dilr', 'qa'] as const) if (values[k] !== '' && !num(values[k])) { setError('Sectional percentiles must be between 0 and 100.'); return; }
    setError('');
    const params = new URLSearchParams();
    (Object.keys(values) as Array<keyof Values>).forEach((k) => { const v = values[k].trim(); if (v && !(k === 'year' && v === String(combo.years[0]?.year))) params.set(k, v); });
    router.push(`${percentileHref(combo.courseKey, levelFor(Number(values.percentile)), combo.exam)}?${params}`);
  }
  function reset() { setValues(EMPTY); setComboId(initialId); setError(''); router.push(resetHref); }

  const input = (k: keyof Values, label: string, extra: Record<string, unknown> = {}) => <label className="finder-field"><span>{label}</span>
    <input type="number" inputMode="decimal" min={0} max={100} step="0.01" value={values[k]} onChange={set(k)} {...extra} /></label>;
  const form = <form onSubmit={submit} className="finder-form">
      <div className="finder-grid">
        {!bare && <><label className="finder-field"><span>Course</span>
          <select value={comboId} onChange={(e) => setComboId(e.target.value)}>
            {Array.from(new Map(combos.map((c) => [c.courseKey, c])).values()).map((c) => <option key={c.courseKey} value={combos.find((x) => x.courseKey === c.courseKey && x.exam === combo.exam)?.id || c.id}>{c.courseLabel}</option>)}
          </select></label>
        <label className="finder-field"><span>Exam</span>
          <select value={comboId} onChange={(e) => setComboId(e.target.value)}>
            {combos.filter((c) => c.courseKey === combo.courseKey).map((c) => <option key={c.id} value={c.id}>{c.examName}</option>)}
          </select></label></>}
        <label className="finder-field"><span>Admission year</span>
          <select value={values.year || String(combo.years[0]?.year || '')} onChange={set('year')}>
            {combo.years.map((y) => <option key={y.year} value={y.year}>{y.year}{y.exam_year !== y.year ? ` (${combo.examName} ${y.exam_year})` : ''}</option>)}
          </select></label>
        {input('percentile', 'Overall percentile *', { required: true, placeholder: 'e.g. 92.5' })}
        <label className="finder-field"><span>Category</span>
          <select value={values.category} onChange={set('category')}>
            {CATEGORY_OPTIONS.filter(([c]) => !facets || facets.categories.includes(c)).map(([c, l]) => <option key={c} value={c}>{l}</option>)}
          </select></label>
        {input('varc', 'VARC percentile (optional)')}
        {input('dilr', 'DILR percentile (optional)')}
        {input('qa', 'QA percentile (optional)')}
        <label className="finder-field"><span>State</span>
          <select value={values.state} onChange={set('state')}><option value="">Any</option>{(facets?.states || []).map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <label className="finder-field"><span>City</span>
          <select value={values.city} onChange={set('city')}><option value="">Any</option>{cities.map((c) => <option key={`${c.city}|${c.state}`} value={c.city}>{c.city}</option>)}</select></label>
        {(facets?.programmes.length || 0) > 1 && <label className="finder-field"><span>Programme</span>
          <select value={values.programme} onChange={set('programme')}><option value="">Any</option>{facets!.programmes.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>}
        {facets?.hasFees && <label className="finder-field"><span>Max total fee, ₹ (optional)</span>
          <input type="number" inputMode="numeric" min={0} step={10000} value={values.budget} onChange={set('budget')} placeholder="e.g. 2000000" /></label>}
      </div>
      {error && <p role="alert" className="finder-error">{error}</p>}
      <div className="finder-actions"><button type="submit" className="button primary">Find colleges</button><button type="button" className="button" onClick={reset}>Reset</button></div>
    </form>;
  if (bare) return form;
  return <section className="finder-card" aria-labelledby="college-finder-heading">
    <h2 id="college-finder-heading">College Finder</h2>
    <p className="muted">Enter your {combo.examName} result to see which colleges&apos; published minimum percentiles you meet.</p>
    {form}
  </section>;
}
