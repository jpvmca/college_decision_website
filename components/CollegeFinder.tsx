'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CollegeFinderForm, { type FinderCombo } from './CollegeFinderForm';
import { percentileHref, type FinderResult } from '../lib/percentile';
import { pctLevelFor, rankBucketFor, rankHref, type ClosingFacets, type ClosingResult } from '../lib/closing';

export type AnyFinderCombo = {
  id: string; mode: 'qualifying' | 'rank' | 'percentile'; courseKey: string; courseLabel: string; courseId: number; exam: string; examName: string;
  year: number; examYear: number; levels: number[]; quotas: Array<{ code: string; label: string }>; hasHomeState: boolean;
  qualifying?: FinderCombo;
};
type RankValues = { value: string; category: string; quota: string; homeState: string; gender: string; branch: string };
const EMPTY: RankValues = { value: '', category: 'OPEN', quota: '', homeState: '', gender: 'GENDER_NEUTRAL', branch: '' };
const modeLabel = (c: AnyFinderCombo) => (c.mode === 'rank' ? `${c.examName} (rank)` : c.mode === 'percentile' ? `${c.examName} (percentile)` : c.examName);

/** College Finder for every course + exam with cutoffs: minimum percentiles (CAT), closing ranks, closing percentiles. */
export default function CollegeFinder({ combos, initialId, initialFacets, initialValues, resetHref }: {
  combos: AnyFinderCombo[]; initialId: string; initialFacets?: FinderResult['facets'] | ClosingFacets | null;
  initialValues?: Record<string, string>; resetHref: string;
}) {
  const router = useRouter();
  const [id, setId] = useState(combos.some((c) => c.id === initialId) ? initialId : combos[0]?.id);
  const combo = combos.find((c) => c.id === id) || combos[0];
  const [values, setValues] = useState<RankValues>({ ...EMPTY, ...(initialValues as Partial<RankValues>) });
  const [facets, setFacets] = useState<ClosingFacets | null>(combo?.mode !== 'qualifying' && id === initialId ? (initialFacets as ClosingFacets) || null : null);
  const [error, setError] = useState('');
  const courses = useMemo(() => Array.from(new Map(combos.map((c) => [c.courseKey, c])).values()), [combos]);

  useEffect(() => {
    if (!combo || combo.mode === 'qualifying') return;
    if (id === initialId && initialFacets) { setFacets(initialFacets as ClosingFacets); return; }
    let live = true;
    setFacets(null);
    fetch(`/api/closing-finder?course=${combo.courseId}&exam=${combo.exam}&kind=${combo.mode}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d: ClosingResult | null) => { if (live) setFacets(d?.facets || null); }).catch(() => undefined);
    return () => { live = false; };
  }, [id, combo, initialId, initialFacets]);
  if (!combo) return null;

  const set = (k: keyof RankValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(values.value);
    const max = combo.mode === 'rank' ? 5_000_000 : 100;
    if (!values.value || !Number.isFinite(n) || n <= 0 || n > max) { setError(combo.mode === 'rank' ? 'Enter your rank (a whole number).' : 'Enter your percentile (0–100).'); return; }
    setError('');
    const p = new URLSearchParams();
    p.set(combo.mode === 'rank' ? 'rank' : 'percentile', String(combo.mode === 'rank' ? Math.round(n) : n));
    (['category', 'quota', 'homeState', 'gender', 'branch'] as const).forEach((k) => { const v = values[k].trim(); if (v && !(k === 'category' && v === 'OPEN') && !(k === 'gender' && v === 'GENDER_NEUTRAL')) p.set(k, v); });
    const href = combo.mode === 'rank' ? rankHref(combo.courseKey, rankBucketFor(n, combo.levels), combo.exam) : percentileHref(combo.courseKey, pctLevelFor(n, combo.levels), combo.exam);
    router.push(`${href}?${p}`);
  }
  function reset() { setValues(EMPTY); setError(''); router.push(resetHref); }

  const examOptions = combos.filter((c) => c.courseKey === combo.courseKey);
  return <section className="finder-card" aria-labelledby="college-finder-heading">
    <h2 id="college-finder-heading">College Finder</h2>
    <p className="muted">{combo.mode === 'qualifying' ? `Enter your ${combo.examName} result to see which colleges' published minimum percentiles you meet.`
      : `Enter your ${combo.examName} ${combo.mode} to see where the ${combo.year} final-round closing ${combo.mode} was within reach.`}</p>
    <div className="finder-grid">
      <label className="finder-field"><span>Course</span>
        <select value={combo.courseKey} onChange={(e) => { const next = combos.find((c) => c.courseKey === e.target.value && c.exam === combo.exam) || combos.find((c) => c.courseKey === e.target.value); if (next) setId(next.id); }}>
          {courses.map((c) => <option key={c.courseKey} value={c.courseKey}>{c.courseLabel}</option>)}
        </select></label>
      <label className="finder-field"><span>Exam</span>
        <select value={combo.id} onChange={(e) => setId(e.target.value)}>
          {examOptions.map((c) => <option key={c.id} value={c.id}>{modeLabel(c)}</option>)}
        </select></label>
    </div>
    {combo.mode === 'qualifying' && combo.qualifying
      ? <CollegeFinderForm key={combo.id} bare combos={[combo.qualifying]} initialId={combo.qualifying.id} facets={id === initialId ? (initialFacets as FinderResult['facets']) || null : null} resetHref={resetHref} initial={id === initialId ? initialValues : undefined} />
      : <form onSubmit={submit} className="finder-form" key={combo.id}>
        <div className="finder-grid" style={{ marginTop: '0.75rem' }}>
          <label className="finder-field"><span>Admission year</span><select value={combo.year} disabled><option value={combo.year}>{combo.year}</option></select></label>
          <label className="finder-field"><span>{combo.mode === 'rank' ? 'Your rank *' : 'Your percentile *'}</span>
            <input type="number" inputMode="decimal" min={0} step={combo.mode === 'rank' ? 1 : 0.01} required value={values.value} onChange={set('value')} placeholder={combo.mode === 'rank' ? 'e.g. 25000' : 'e.g. 92.5'} /></label>
          <label className="finder-field"><span>Category</span>
            <select value={values.category} onChange={set('category')}>{(facets?.categories || [{ code: 'OPEN', label: 'General / Open' }]).map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}</select></label>
          {combo.hasHomeState
            ? <label className="finder-field"><span>Home state (optional)</span>
              <select value={values.homeState} onChange={set('homeState')}><option value="">Not set (All India / Other State)</option>{(facets?.states || []).map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
            : combo.quotas.length > 1 && <label className="finder-field"><span>Quota</span>
              <select value={values.quota} onChange={set('quota')}><option value="">Default</option>{combo.quotas.map((q) => <option key={q.code} value={q.code}>{q.label}</option>)}</select></label>}
          {(facets?.genders || []).includes('FEMALE_ONLY') && <label className="finder-field"><span>Seat pool</span>
            <select value={values.gender} onChange={set('gender')}><option value="GENDER_NEUTRAL">Gender-neutral</option><option value="FEMALE_ONLY">Female (gender-neutral + female-only)</option></select></label>}
          <label className="finder-field"><span>Branch (optional)</span>
            <input list={`branches-${combo.id}`} value={values.branch} onChange={set('branch')} placeholder="e.g. Computer Science" />
            <datalist id={`branches-${combo.id}`}>{(facets?.branches || []).map((b) => <option key={b} value={b} />)}</datalist></label>
        </div>
        {error && <p role="alert" className="finder-error">{error}</p>}
        <div className="finder-actions"><button type="submit" className="button primary">Find colleges</button><button type="button" className="button" onClick={reset}>Reset</button></div>
      </form>}
  </section>;
}
