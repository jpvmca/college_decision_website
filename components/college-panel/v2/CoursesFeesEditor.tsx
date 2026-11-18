'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitChange } from '../panel-client';
import { periodLabel, rupees, type V2Fee, type V2Live } from './types';

type NewFee = { key: number; feesTypeId: number; duration: 'year' | 'semester' | 'total'; value: number; fees: string };

const clean = (v: string | null | undefined) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/\s+\n/g, '\n').trim();

export default function CoursesFeesEditor({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const router = useRouter();
  const [programmeId, setProgrammeId] = useState<number>(live.programmes[0]?.id || 0);
  const programme = live.programmes.find((p) => p.id === programmeId);
  const fees = useMemo(() => live.fees.filter((f) => f.programme_id === programmeId), [live.fees, programmeId]);

  if (!live.programmes.length) return <div className="cpn-card"><p>No courses are listed for your college yet. Please write to us from the contact page to add courses.</p></div>;

  return <>
    <div className="cpn-card cpv2-picker">
      <label>Course
        <select value={programmeId} onChange={(e) => setProgrammeId(Number(e.target.value))}>
          {live.programmes.map((p) => <option key={p.id} value={p.id}>{p.name}{p.course_name && p.course_name !== p.name ? ` (${p.course_name})` : ''}</option>)}
        </select>
      </label>
      <span className="cpn-hint">{live.programmes.length} courses listed. To add a new course or rename one, please contact us.</span>
    </div>
    {programme ? <>
      <FeesForm key={`fees-${programme.id}`} instituteId={instituteId} programmeId={programme.id} fees={fees} live={live} onDone={() => router.refresh()} />
      <CourseForm key={`course-${programme.id}`} instituteId={instituteId} programme={programme} onDone={() => router.refresh()} />
    </> : null}
  </>;
}

function FeesForm({ instituteId, programmeId, fees, live, onDone }: { instituteId: number; programmeId: number; fees: V2Fee[]; live: V2Live; onDone: () => void }) {
  const [amounts, setAmounts] = useState<Record<number, string>>(() => Object.fromEntries(fees.map((f) => [f.id, String(Number(f.fees))])));
  const [removed, setRemoved] = useState<Record<number, boolean>>({});
  const [added, setAdded] = useState<NewFee[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const changes = useMemo(() => {
    const items: Array<Record<string, unknown>> = [];
    for (const f of fees) {
      if (removed[f.id]) { items.push({ op: 'remove', feeId: f.id }); continue; }
      const v = Number(amounts[f.id]);
      if (amounts[f.id] !== undefined && v !== Number(f.fees)) items.push({ op: 'upsert', feeId: f.id, programmeId, feesTypeId: f.fees_type_id, duration: f.duration, value: f.value, fees: v });
    }
    for (const a of added) if (a.fees.trim()) items.push({ op: 'upsert', programmeId, feesTypeId: a.feesTypeId, duration: a.duration, value: a.duration === 'total' ? 1 : a.value, fees: Number(a.fees) });
    return items;
  }, [fees, amounts, removed, added, programmeId]);

  const nextYear = () => {
    const used = new Set([...fees.filter((f) => f.fees_type_id === live.tuitionFeeTypeId && f.duration === 'year').map((f) => f.value), ...added.filter((a) => a.feesTypeId === live.tuitionFeeTypeId && a.duration === 'year').map((a) => a.value)]);
    let y = 1; while (used.has(y) && y < 8) y += 1; return y;
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setOk('');
    try {
      const result = await submitChange(instituteId, 'fees', { items: changes }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setAdded([]); setRemoved({}); setNote('');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally { setBusy(false); }
  }

  return <form className="cpn-card cpn-form" onSubmit={submit}>
    <h2>Fees</h2>
    <p className="cpn-hint">Annual tuition goes under <strong>Tuition Fees</strong>, one row per year of study (Year 1, Year 2, …). One-time registration goes under <strong>Registration Fees</strong>. Amounts in ₹.</p>
    <table className="cpn-table cpv2-table">
      <thead><tr><th>Fee type</th><th>Period</th><th>Live amount</th><th>New amount (₹)</th><th>Remove</th></tr></thead>
      <tbody>
        {fees.length ? fees.map((f) => <tr key={f.id} className={removed[f.id] ? 'cpv2-removed' : ''}>
          <td>{f.fee_type}</td><td>{periodLabel(f.duration, f.value)}</td><td>{rupees(f.fees)}</td>
          <td><input type="number" min={1} step={1} inputMode="numeric" value={amounts[f.id] ?? ''} disabled={removed[f.id]} onChange={(e) => setAmounts((s) => ({ ...s, [f.id]: e.target.value }))} aria-label={`New amount for ${f.fee_type} ${periodLabel(f.duration, f.value)}`} /></td>
          <td><input type="checkbox" checked={Boolean(removed[f.id])} onChange={(e) => setRemoved((s) => ({ ...s, [f.id]: e.target.checked }))} aria-label="Remove this fee" /></td>
        </tr>) : <tr><td colSpan={5} className="cpn-hint">No fees listed for this course yet.</td></tr>}
        {added.map((a) => <tr key={a.key} className="cpv2-new">
          <td><select value={a.feesTypeId} onChange={(e) => setAdded((s) => s.map((x) => (x.key === a.key ? { ...x, feesTypeId: Number(e.target.value) } : x)))}>
            {live.feeTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></td>
          <td className="cpv2-period"><select value={a.duration} onChange={(e) => setAdded((s) => s.map((x) => (x.key === a.key ? { ...x, duration: e.target.value as NewFee['duration'] } : x)))}>
            <option value="year">Year</option><option value="semester">Semester</option><option value="total">Full course</option></select>
            {a.duration !== 'total' ? <input type="number" min={1} max={a.duration === 'year' ? 8 : 16} value={a.value} onChange={(e) => setAdded((s) => s.map((x) => (x.key === a.key ? { ...x, value: Number(e.target.value) } : x)))} aria-label="Year or semester number" /> : null}</td>
          <td>New</td>
          <td><input type="number" min={1} step={1} inputMode="numeric" value={a.fees} required onChange={(e) => setAdded((s) => s.map((x) => (x.key === a.key ? { ...x, fees: e.target.value } : x)))} aria-label="Amount" /></td>
          <td><button type="button" className="cpn-btn ghost small" onClick={() => setAdded((s) => s.filter((x) => x.key !== a.key))}>✕</button></td>
        </tr>)}
      </tbody>
    </table>
    <div className="cpn-actions">
      <button type="button" className="cpn-btn ghost small" onClick={() => setAdded((s) => [...s, { key: Date.now(), feesTypeId: live.tuitionFeeTypeId, duration: 'year', value: nextYear(), fees: '' }])}>+ Add tuition fee (per year)</button>
      <button type="button" className="cpn-btn ghost small" onClick={() => setAdded((s) => [...s, { key: Date.now(), feesTypeId: live.registrationFeeTypeId, duration: 'total', value: 1, fees: '' }])}>+ Add registration fee</button>
    </div>
    <label>Note for the reviewer <span className="cpn-hint">(optional: e.g. “Fee notice 2026-27, page 2”)</span>
      <input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
    </label>
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok">{ok}</div>}
    <div className="cpn-actions">
      <button className="cpn-btn" type="submit" disabled={busy || !changes.length}>{busy ? 'Submitting…' : `Submit ${changes.length || ''} fee change${changes.length === 1 ? '' : 's'} for review`}</button>
    </div>
  </form>;
}

function CourseForm({ instituteId, programme, onDone }: { instituteId: number; programme: V2Live['programmes'][number]; onDone: () => void }) {
  const [seats, setSeats] = useState(programme.total_seats ? String(programme.total_seats) : '');
  const [eligibility, setEligibility] = useState(clean(programme.eligibility));
  const [description, setDescription] = useState(clean(programme.description));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const item: Record<string, unknown> = { programmeId: programme.id };
  if (seats !== (programme.total_seats ? String(programme.total_seats) : '')) item.totalSeats = seats ? Number(seats) : null;
  if (eligibility !== clean(programme.eligibility)) item.eligibility = eligibility;
  if (description !== clean(programme.description)) item.description = description;
  const changed = Object.keys(item).length > 1;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setOk('');
    try {
      const result = await submitChange(instituteId, 'courses', { items: [item] }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setNote('');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally { setBusy(false); }
  }

  return <form className="cpn-card cpn-form" onSubmit={submit}>
    <h2>Course details</h2>
    <label>Total seats<input type="number" min={1} max={50000} value={seats} onChange={(e) => setSeats(e.target.value)} /></label>
    <label>Eligibility<textarea rows={4} maxLength={4000} value={eligibility} onChange={(e) => setEligibility(e.target.value)} /></label>
    <label>Course description<textarea rows={6} maxLength={8000} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
    <label>Note for the reviewer <span className="cpn-hint">(optional)</span><input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label>
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok">{ok}</div>}
    <div className="cpn-actions"><button className="cpn-btn" type="submit" disabled={busy || !changed}>{busy ? 'Submitting…' : 'Submit course details for review'}</button>
      {!changed ? <span className="cpn-hint">No changes yet.</span> : null}</div>
  </form>;
}
