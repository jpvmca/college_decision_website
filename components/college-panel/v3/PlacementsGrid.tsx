'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BriefcaseBusiness, RotateCcw, Trash2 } from 'lucide-react';
import ProofPicker from '../v2/ProofPicker';
import type { ProofFile, V2Live } from '../v2/types';
import { Card, EmptyState, SearchSelect, SubmitBar, useSubmit } from './ui';

type Row = { key: string; id: number | null; year: number; highest: string; average: string; lowest: string; removed?: boolean };
const fmt = (n: number | null | undefined) => (n && Number(n) > 0 ? String(Number(n)) : '');

/** Year-wise placement grid per course (packages in LPA). One proof set covers the whole request. */
export default function PlacementsGrid({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const [programmeId, setProgrammeId] = useState<number | null>(live.programmes[0]?.id ?? null);
  if (!live.programmes.length) return <Card><EmptyState icon={<BriefcaseBusiness size={28} />} title="Add a course first">Placements are recorded per course. <Link href="/college/courses">Add your courses</Link> first.</EmptyState></Card>;
  const options = live.programmes.map((p) => ({ id: p.id, name: p.name, hint: `${p.course_name} · ${live.placements.filter((x) => x.programme_id === p.id).length} year(s) listed` }));
  const programme = live.programmes.find((p) => p.id === programmeId) || live.programmes[0];
  return <>
    <Card title="Choose a course"><SearchSelect options={options} value={programme.id} label="Course" onChange={(id) => setProgrammeId(id)} /></Card>
    <Grid key={programme.id} instituteId={instituteId} live={live} programmeId={programme.id} />
  </>;
}

function Grid({ instituteId, live, programmeId }: { instituteId: number; live: V2Live; programmeId: number }) {
  const thisYear = new Date().getFullYear();
  const existing = useMemo(() => live.placements.filter((p) => p.programme_id === programmeId), [live.placements, programmeId]);
  const original = useMemo(() => new Map(existing.map((p) => [p.id, p])), [existing]);
  const [rows, setRows] = useState<Row[]>(() => existing.map((p) => ({ key: `p${p.id}`, id: p.id, year: p.year, highest: fmt(p.highest_package), average: fmt(p.average_package), lowest: fmt(p.lowest_package) })));
  const [proofs, setProofs] = useState<ProofFile[]>([]);
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'placements');
  const freeYears = Array.from({ length: 12 }, (_, i) => thisYear - i).filter((y) => !rows.some((r) => r.year === y));

  const state = (r: Row) => {
    if (r.removed) return 'removed';
    if (!r.id) return 'added';
    const o = original.get(r.id)!;
    return fmt(o.highest_package) !== r.highest || fmt(o.average_package) !== r.average || fmt(o.lowest_package) !== r.lowest ? 'changed' : '';
  };
  const problems = (r: Row) => {
    const h = Number(r.highest) || 0; const a = Number(r.average) || 0; const l = Number(r.lowest) || 0;
    if (!h && !a) return 'Enter the highest or average package';
    if ([h, a, l].some((v) => v < 0 || v > 1000)) return 'Packages are in LPA (0 to 1000)';
    if (h && a && a > h) return 'Average cannot be more than highest';
    if (l && a && l > a) return 'Lowest cannot be more than average';
    return '';
  };
  const touched = rows.filter((r) => state(r));
  const upserts = touched.filter((r) => !r.removed);
  const firstProblem = upserts.map(problems).find(Boolean);
  const set = (key: string, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const dec = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 7);

  return <>
    <Card title={<><BriefcaseBusiness size={19} /> Placement record by year</>} description="Packages in lakh per annum (LPA), e.g. 6.5 for ₹6,50,000. Enter at least the highest or the average package for each year."
      actions={freeYears.length ? <div style={{ minWidth: 200 }}><SearchSelect options={freeYears.map((y) => ({ id: y, name: `Add ${y}` }))} value={null} label="Add a year" placeholder="+ Add a year"
        onChange={(y) => { if (y) setRows((list) => [...list, { key: `n${y}`, id: null, year: y, highest: '', average: '', lowest: '' }].sort((a, b) => b.year - a.year)); }} /></div> : null}>
      {rows.length ? <div className="cp3-table-wrap"><table className="cp3-edit-table">
        <thead><tr><th>Year</th><th>Highest (LPA)</th><th>Average (LPA)</th><th>Lowest (LPA)</th><th>Check</th><th aria-label="Actions" /></tr></thead>
        <tbody>{rows.map((r) => {
          const s = state(r); const p = !r.removed && s ? problems(r) : '';
          return <tr key={r.key} className={s}>
            <th scope="row">{r.year}{!r.id ? <small>new</small> : null}</th>
            {(['highest', 'average', 'lowest'] as const).map((k) => <td key={k}><input className="cpn-input" inputMode="decimal" value={r[k]} disabled={r.removed} aria-label={`${k} package ${r.year}`} aria-invalid={Boolean(p)} onChange={(e) => set(r.key, { [k]: dec(e.target.value) } as Partial<Row>)} placeholder="—" /></td>)}
            <td>{p ? <span className="cpn-field-error">{p}</span> : s === 'removed' ? <span className="cpn-hint">Will be removed</span> : s ? <span className="cp3-badge">Changed</span> : <span className="cpn-hint">Live</span>}</td>
            <td className="cp3-row-tools">{r.id ? <button type="button" aria-label={r.removed ? 'Keep' : 'Remove'} title={r.removed ? 'Keep' : 'Remove'} onClick={() => set(r.key, { removed: !r.removed })}>{r.removed ? <RotateCcw size={14} /> : <Trash2 size={14} />}</button>
              : <button type="button" aria-label="Discard" title="Discard" onClick={() => setRows((l) => l.filter((x) => x.key !== r.key))}><Trash2 size={14} /></button>}</td>
          </tr>;
        })}</tbody>
      </table></div> : <EmptyState icon={<BriefcaseBusiness size={28} />} title="No placement records for this course">Use “+ Add a year” to add one.</EmptyState>}
      {upserts.length ? <div style={{ marginTop: 14 }}><ProofPicker instituteId={instituteId} purpose="placements" files={proofs} onChange={setProofs} required /></div> : null}
    </Card>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={touched.length} label="Submit placement changes" disabled={!touched.length || Boolean(firstProblem)}
      onSubmit={async () => {
        if (upserts.length && !proofs.length) { setError('Attach a proof document (placement report or offer letters) first.'); return; }
        const ids = proofs.map((p) => p.id);
        const items = touched.map((r) => r.removed ? { op: 'remove', placementId: r.id, proofFileIds: ids }
          : { op: 'upsert', programmeId, year: r.year, highestPackage: r.highest || null, averagePackage: r.average || null, lowestPackage: r.lowest || null, proofFileIds: ids });
        if (await submit({ items }, note)) { setProofs([]); setNote(''); }
      }} />
  </>;
}
