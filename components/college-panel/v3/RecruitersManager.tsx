'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import ProofPicker from '../v2/ProofPicker';
import type { ProofFile, V2Live } from '../v2/types';
import { searchRecruiters } from '../v2/v2-client';
import { Card, EmptyState, SubmitBar, useSubmit } from './ui';
import { externalLinkError, LinkWarning } from './LinkGuard';

type Row = { key: string; id: number | null; recruiterId: number | null; name: string; isNew?: boolean; year: string; placed: string; highest: string; average: string; removed?: boolean };
const s = (v: number | null | undefined) => (v && Number(v) > 0 ? String(Number(v)) : '');

/** Recruiters: pick companies from our master list (or propose a new one), fill the numbers, one proof set per request. */
export default function RecruitersManager({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const thisYear = new Date().getFullYear();
  const original = useMemo(() => new Map(live.recruiters.map((r) => [r.id, r])), [live.recruiters]);
  const [rows, setRows] = useState<Row[]>(() => live.recruiters.map((r) => ({ key: `r${r.id}`, id: r.id, recruiterId: r.recruiter_id, name: r.name, year: r.year ? String(r.year) : '', placed: s(r.students_placed), highest: s(r.highest_package), average: s(r.average_package) })));
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [proofs, setProofs] = useState<ProofFile[]>([]);
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'recruiters');

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setOptions([]); return; }
    let alive = true;
    const t = setTimeout(() => {
      setSearching(true);
      void searchRecruiters(term).then((r) => { if (alive) setOptions(r); }).catch(() => { if (alive) setOptions([]); }).finally(() => { if (alive) setSearching(false); });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [query]);

  const state = (r: Row) => {
    if (r.removed) return 'removed';
    if (!r.id) return 'added';
    const o = original.get(r.id)!;
    return (o.year ? String(o.year) : '') !== r.year || s(o.students_placed) !== r.placed || s(o.highest_package) !== r.highest || s(o.average_package) !== r.average ? 'changed' : '';
  };
  const touched = rows.filter((r) => state(r));
  const upserts = touched.filter((r) => !r.removed);
  const add = (o: { id: number | null; name: string }) => {
    if (!o.id) {
      const linkErr = externalLinkError(o.name, 'Company name');
      if (linkErr) { setError(linkErr); return; }
    }
    if (rows.some((r) => (o.id ? r.recruiterId === o.id : r.name.toLowerCase() === o.name.toLowerCase()))) { setError(`${o.name} is already in your list.`); return; }
    setRows((l) => [{ key: `n${Date.now()}`, id: null, recruiterId: o.id, name: o.name, isNew: !o.id, year: String(thisYear - 1), placed: '', highest: '', average: '' }, ...l]);
    setQuery(''); setOptions([]); setError('');
  };
  const set = (key: string, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const dec = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 7);

  return <>
    <Card title={<><Plus size={19} /> Add a recruiter</>} description="Search our company list first so the same company is not listed twice. If it is not there, you can propose it as a new company.">
      <div className="cp3-search-box"><Search size={16} aria-hidden="true" /><input className="cpn-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a company name, e.g. Infosys, Deloitte, Amazon" autoComplete="off" aria-label="Search companies" /></div>
      <LinkWarning value={query} label="Company name" />
      {query.trim().length >= 2 ? <ul className="cp3-results">
        {options.map((o) => <li key={o.id}><button type="button" onClick={() => add(o)}><Building size={15} /> {o.name}{rows.some((r) => r.recruiterId === o.id) ? <small>already listed</small> : null}</button></li>)}
        {!searching && !options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase()) ? <li><button type="button" className="new" onClick={() => add({ id: null, name: query.trim() })}><Plus size={15} /> Propose “{query.trim()}” as a new company</button></li> : null}
        {searching ? <li className="cp3-results-muted">Searching…</li> : null}
      </ul> : null}
    </Card>
    <Card title={<><Building size={19} /> Recruiters ({rows.filter((r) => !r.removed).length})</>} description="Year of the placement drive, number of students hired and packages in LPA. Leave a number empty if you do not have it.">
      {rows.length ? <div className="cp3-table-wrap"><table className="cp3-edit-table">
        <thead><tr><th>Company</th><th>Year</th><th>Students placed</th><th>Highest (LPA)</th><th>Average (LPA)</th><th aria-label="Actions" /></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.key} className={state(r)}>
          <th scope="row">{r.name}{r.isNew ? <small>new company</small> : !r.id ? <small>new</small> : null}</th>
          <td><select className="cpn-input" value={r.year} disabled={r.removed} onChange={(e) => set(r.key, { year: e.target.value })} aria-label={`Year for ${r.name}`}><option value="">—</option>{Array.from({ length: 10 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}</select></td>
          <td><input className="cpn-input" inputMode="numeric" value={r.placed} disabled={r.removed} onChange={(e) => set(r.key, { placed: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="—" aria-label={`Students placed at ${r.name}`} /></td>
          <td><input className="cpn-input" inputMode="decimal" value={r.highest} disabled={r.removed} onChange={(e) => set(r.key, { highest: dec(e.target.value) })} placeholder="—" aria-label={`Highest package at ${r.name}`} /></td>
          <td><input className="cpn-input" inputMode="decimal" value={r.average} disabled={r.removed} onChange={(e) => set(r.key, { average: dec(e.target.value) })} placeholder="—" aria-label={`Average package at ${r.name}`} /></td>
          <td className="cp3-row-tools">{r.id ? <button type="button" aria-label={r.removed ? 'Keep' : 'Remove'} title={r.removed ? 'Keep' : 'Remove'} onClick={() => set(r.key, { removed: !r.removed })}>{r.removed ? <RotateCcw size={14} /> : <Trash2 size={14} />}</button>
            : <button type="button" aria-label="Discard" title="Discard" onClick={() => setRows((l) => l.filter((x) => x.key !== r.key))}><Trash2 size={14} /></button>}</td>
        </tr>)}</tbody>
      </table></div> : <EmptyState icon={<Building size={28} />} title="No recruiters listed yet">Search above to add the companies that hire your students.</EmptyState>}
      {upserts.length ? <div style={{ marginTop: 14 }}><ProofPicker instituteId={instituteId} purpose="recruiters" files={proofs} onChange={setProofs} required /></div> : null}
    </Card>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={touched.length} label="Submit recruiter changes" disabled={!touched.length}
      onSubmit={async () => {
        if (upserts.length && !proofs.length) { setError('Attach a proof document (placement report or offer letters) first.'); return; }
        const ids = proofs.map((p) => p.id);
        const items = touched.map((r) => r.removed ? { op: 'remove', instituteRecruiterId: r.id }
          : { op: 'upsert', recruiterId: r.recruiterId, newRecruiterName: r.recruiterId ? null : r.name, year: r.year ? Number(r.year) : null, studentsPlaced: r.placed || null, highestPackage: r.highest || null, averagePackage: r.average || null, proofFileIds: ids });
        if (await submit({ items }, note)) { setProofs([]); setNote(''); }
      }} />
  </>;
}
