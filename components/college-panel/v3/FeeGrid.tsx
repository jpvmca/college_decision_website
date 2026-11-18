'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Copy, IndianRupee, Plus, X } from 'lucide-react';
import { periodLabel, type V2Fee, type V2Live } from '../v2/types';
import { programmeYears } from './CoursesManager';
import { Card, EmptyState, SearchSelect, SubmitBar, inr, useSubmit } from './ui';

type Dur = 'year' | 'semester' | 'total';
const key = (typeId: number, duration: Dur, value: number) => `${typeId}:${duration}:${value}`;
const parse = (k: string) => { const [t, d, v] = k.split(':'); return { typeId: Number(t), duration: d as Dur, value: Number(v) }; };
const num = (s: string | undefined) => (s && s.trim() !== '' ? Number(s) : null);

/**
 * Year-wise fee grid for one course: rows = fee types, columns = Year 1..N plus "One-time / full course".
 * Each changed cell becomes one change item (upsert or remove); an emptied cell removes that fee.
 */
export default function FeeGrid({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const [programmeId, setProgrammeId] = useState<number | null>(live.programmes[0]?.id ?? null);
  if (!live.programmes.length) return <Card><EmptyState icon={<IndianRupee size={28} />} title="Add a course first">Fees are entered per course. <Link href="/college/courses">Add your courses</Link>, then come back here.</EmptyState></Card>;
  const options = live.programmes.map((p) => ({ id: p.id, name: p.name, hint: `${p.course_name} · ${live.fees.filter((f) => f.programme_id === p.id).length ? 'fees listed' : 'no fees yet'}` }));
  const programme = live.programmes.find((p) => p.id === programmeId) || live.programmes[0];
  return <>
    <Card title="Choose a course" description={`${live.programmes.length} course${live.programmes.length === 1 ? '' : 's'} listed. Courses without fees are marked “no fees yet”.`}>
      <SearchSelect options={options} value={programme.id} label="Course" onChange={(id) => setProgrammeId(id)} />
    </Card>
    <Grid key={programme.id} instituteId={instituteId} live={live} programmeId={programme.id} years={programmeYears(programme.duration)} />
  </>;
}

function Grid({ instituteId, live, programmeId, years }: { instituteId: number; live: V2Live; programmeId: number; years: number | null }) {
  const fees = useMemo(() => live.fees.filter((f) => f.programme_id === programmeId), [live.fees, programmeId]);
  const liveByKey = useMemo(() => {
    const map = new Map<string, V2Fee>();
    for (const f of fees) if (!map.has(key(f.fees_type_id, f.duration, f.value))) map.set(key(f.fees_type_id, f.duration, f.value), f);
    return map;
  }, [fees]);
  const typeName = (id: number) => live.feeTypes.find((t) => t.id === id)?.name || `Fee type ${id}`;
  const maxYear = Math.max(0, ...fees.filter((f) => f.duration === 'year').map((f) => f.value));
  const [columns, setColumns] = useState(Math.min(8, Math.max(1, years || 0, maxYear)));
  const [rows, setRows] = useState<number[]>(() => {
    const used = Array.from(new Set(fees.filter((f) => f.duration !== 'semester').map((f) => f.fees_type_id)));
    return used.includes(live.tuitionFeeTypeId) ? used : [live.tuitionFeeTypeId, ...used];
  });
  const [cells, setCells] = useState<Record<string, string>>(() => Object.fromEntries([...liveByKey.entries()].map(([k, f]) => [k, String(Math.round(Number(f.fees)))])));
  const [note, setNote] = useState('');
  const { busy, error, ok, submit } = useSubmit(instituteId, 'fees');
  const semesterKeys = [...liveByKey.keys()].filter((k) => parse(k).duration === 'semester');

  const changes = useMemo(() => {
    const items: Array<Record<string, unknown>> = [];
    const keys = new Set([...Object.keys(cells), ...liveByKey.keys()]);
    for (const k of keys) {
      const { typeId, duration, value } = parse(k);
      const liveFee = liveByKey.get(k);
      const next = num(cells[k]);
      if (next === null) { if (liveFee) items.push({ op: 'remove', feeId: liveFee.id }); continue; }
      if (liveFee && Math.round(Number(liveFee.fees)) === next) continue;
      items.push({ op: 'upsert', feeId: liveFee?.id, programmeId, feesTypeId: typeId, duration, value, fees: next });
    }
    return items;
  }, [cells, liveByKey, programmeId]);
  const invalid = Object.entries(cells).some(([, v]) => v.trim() !== '' && (!/^\d+$/.test(v.trim()) || Number(v) < 1 || Number(v) > 100_000_000));

  const set = (k: string, v: string) => setCells((c) => ({ ...c, [k]: v.replace(/[^\d]/g, '').slice(0, 9) }));
  const rowTotal = (typeId: number) => Array.from({ length: columns }, (_, i) => num(cells[key(typeId, 'year', i + 1)]) || 0).reduce((a, b) => a + b, 0) + (num(cells[key(typeId, 'total', 1)]) || 0);
  const colTotal = (year: number) => rows.reduce((sum, t) => sum + (num(cells[key(t, 'year', year)]) || 0), 0);
  const oneTimeTotal = rows.reduce((sum, t) => sum + (num(cells[key(t, 'total', 1)]) || 0), 0);
  const grand = rows.reduce((sum, t) => sum + rowTotal(t), 0);
  const cellClass = (k: string) => {
    const liveFee = liveByKey.get(k); const v = num(cells[k]);
    if (liveFee && v === null) return 'removed';
    if (!liveFee && v !== null) return 'added';
    if (liveFee && v !== null && Math.round(Number(liveFee.fees)) !== v) return 'changed';
    return '';
  };
  const cell = (k: string, label: string) => {
    const liveFee = liveByKey.get(k);
    return <td className={`cp3-fee-cell ${cellClass(k)}`}>
      <div className="cp3-money"><span>₹</span><input inputMode="numeric" value={cells[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={liveFee ? '' : '—'} aria-label={label} /></div>
      {liveFee && Math.round(Number(liveFee.fees)) !== num(cells[k]) ? <small>was {inr(liveFee.fees)}</small> : null}
    </td>;
  };
  const unusedTypes = live.feeTypes.filter((t) => !rows.includes(t.id)).map((t) => ({ id: t.id, name: t.name }));

  return <>
    <Card title={<><IndianRupee size={19} /> Fee structure</>} description="Enter amounts in rupees for each year of study. Use “One-time” for charges paid once (registration, caution deposit) or a single full-course fee. Leave a cell empty for “not applicable”; clearing a live amount removes it."
      actions={<button type="button" className="cpn-btn ghost small" disabled={columns >= 8} onClick={() => setColumns((c) => Math.min(8, c + 1))}><Plus size={14} /> Add year</button>}>
      <div className="cp3-table-wrap">
        <table className="cp3-fee-grid">
          <thead><tr><th>Fee type</th>{Array.from({ length: columns }, (_, i) => <th key={i}>Year {i + 1}</th>)}<th>One-time</th><th>Total</th><th aria-label="Row actions" /></tr></thead>
          <tbody>
            {rows.map((t) => <tr key={t}>
              <th scope="row">{typeName(t)}{t === live.tuitionFeeTypeId ? <small>Annual tuition</small> : null}</th>
              {Array.from({ length: columns }, (_, i) => <FragmentCell key={i}>{cell(key(t, 'year', i + 1), `${typeName(t)} year ${i + 1}`)}</FragmentCell>)}
              {cell(key(t, 'total', 1), `${typeName(t)} one-time`)}
              <td className="cp3-fee-total">{inr(rowTotal(t))}</td>
              <td className="cp3-row-tools">
                <button type="button" title="Copy Year 1 to every year" aria-label={`Copy Year 1 ${typeName(t)} to every year`} disabled={!num(cells[key(t, 'year', 1)])}
                  onClick={() => setCells((c) => { const n = { ...c }; for (let y = 2; y <= columns; y++) n[key(t, 'year', y)] = c[key(t, 'year', 1)]; return n; })}><Copy size={14} /></button>
                {t !== live.tuitionFeeTypeId ? <button type="button" title="Remove this row" aria-label={`Clear ${typeName(t)}`}
                  onClick={() => { setCells((c) => { const n = { ...c }; for (const k of Object.keys(n)) if (parse(k).typeId === t && parse(k).duration !== 'semester') n[k] = ''; return n; }); if (![...liveByKey.keys()].some((k) => parse(k).typeId === t)) setRows((r) => r.filter((x) => x !== t)); }}><X size={14} /></button> : null}
              </td>
            </tr>)}
          </tbody>
          <tfoot><tr><th>Total</th>{Array.from({ length: columns }, (_, i) => <td key={i}>{inr(colTotal(i + 1))}</td>)}<td>{inr(oneTimeTotal)}</td><td className="cp3-fee-total">{inr(grand)}</td><td /></tr></tfoot>
        </table>
      </div>
      <div className="cp3-fee-add">
        <span>Add another fee type (hostel, exam fee, …):</span>
        <div style={{ minWidth: 260 }}><SearchSelect options={unusedTypes} value={null} label="Fee type" placeholder="Choose a fee type" onChange={(id) => { if (id) setRows((r) => [...r, id]); }} /></div>
      </div>
      {semesterKeys.length ? <div className="cp3-semester">
        <h3>Semester-wise fees listed today</h3>
        <table className="cp3-fee-grid"><tbody>{semesterKeys.map((k) => { const { typeId, value } = parse(k); return <tr key={k}><th scope="row">{typeName(typeId)} · {periodLabel('semester', value)}</th>{cell(k, `${typeName(typeId)} semester ${value}`)}</tr>; })}</tbody></table>
        <p className="cpn-hint">Prefer year-wise amounts above; clear a semester amount to remove it.</p>
      </div> : null}
      {invalid ? <div className="cpn-alert err">Amounts must be whole rupees between ₹1 and ₹10 crore.</div> : null}
    </Card>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={changes.length} label="Submit fee changes" disabled={!changes.length || invalid || changes.length > 60}
      onSubmit={async () => { if (await submit({ items: changes }, note)) setNote(''); }} />
  </>;
}

function FragmentCell({ children }: { children: React.ReactNode }) { return <>{children}</>; }
