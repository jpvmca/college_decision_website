'use client';

import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Trash2, UsersRound } from 'lucide-react';
import { Card, EmptyState, SubmitBar, useSubmit } from './ui';
import { firstLinkError } from './LinkGuard';

type Member = { id: number; name: string | null; position: string | null; education: string | null; speciality: string | null };
export type FacultyLive = { faculty: Member[]; maxPerRequest: number };
type Row = { key: string; id: number | null; name: string; position: string; education: string; speciality: string; removed?: boolean };
const FIELDS: Array<[keyof Row, string, string]> = [['name', 'Name', 'Dr. A. Sharma'], ['position', 'Designation', 'Professor & Head'], ['education', 'Qualification', 'Ph.D. (IIT Bombay)'], ['speciality', 'Specialisation', 'Machine learning']];
const toRow = (m: Member): Row => ({ key: `f${m.id}`, id: m.id, name: m.name || '', position: m.position || '', education: m.education || '', speciality: m.speciality || '' });

/** Faculty list shown on the public profile: edit inline, add rows, mark rows for removal. */
export default function FacultyEditor({ instituteId, live }: { instituteId: number; live: FacultyLive }) {
  const [rows, setRows] = useState<Row[]>(() => live.faculty.map(toRow));
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'faculty');
  const byId = useMemo(() => new Map(live.faculty.map((m) => [m.id, toRow(m)])), [live.faculty]);
  const items = useMemo(() => rows.flatMap((r): Array<Record<string, unknown>> => {
    const data = { name: r.name.trim(), position: r.position.trim(), education: r.education.trim(), speciality: r.speciality.trim() };
    if (!r.id) return data.name || data.position ? [{ op: 'add', ...data }] : [];
    if (r.removed) return [{ op: 'remove', id: r.id }];
    const o = byId.get(r.id)!;
    return FIELDS.some(([k]) => String(o[k]).trim() !== String(r[k]).trim()) ? [{ op: 'update', id: r.id, ...data }] : [];
  }), [rows, byId]);
  const invalid = rows.some((r) => !r.removed && (r.id || r.name || r.position) && r.name.trim().length < 3);
  const linkError = useMemo(() => firstLinkError(rows.flatMap((r) => r.removed ? [] : FIELDS.map(([k, label]) => [r[k], label] as [unknown, string]))), [rows]);
  const update = (key: string, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return <>
    <Card title={<><UsersRound size={19} /> Faculty members ({live.faculty.length})</>} description="Shown in the Faculty section of your profile. Add your key faculty with designation and highest qualification."
      actions={<button type="button" className="cpn-btn" onClick={() => setRows((l) => [...l, { key: `n${Date.now()}`, id: null, name: '', position: '', education: '', speciality: '' }])}><Plus size={16} /> Add faculty</button>}>
      {rows.length ? <div className="cp3-table-wrap"><table className="cp3-edit-table">
        <thead><tr>{FIELDS.map(([, label]) => <th key={label}>{label}</th>)}<th aria-label="Actions" /></tr></thead>
        <tbody>{rows.map((r) => {
          const o = r.id ? byId.get(r.id) : null;
          const state = r.removed ? 'removed' : !r.id ? 'added' : o && FIELDS.some(([k]) => String(o[k]).trim() !== String(r[k]).trim()) ? 'changed' : '';
          return <tr key={r.key} className={state}>
            {FIELDS.map(([k, label, ph]) => <td key={k}><input className="cpn-input" value={String(r[k])} maxLength={255} disabled={r.removed} placeholder={ph} aria-label={label}
              aria-invalid={k === 'name' && !r.removed && (Boolean(r.id) || Boolean(r.name) || Boolean(r.position)) && r.name.trim().length < 3}
              onChange={(e) => update(r.key, { [k]: e.target.value } as Partial<Row>)} /></td>)}
            <td className="cp3-row-tools">{r.id ? <button type="button" title={r.removed ? 'Keep' : 'Remove'} aria-label={r.removed ? 'Keep' : 'Remove'} onClick={() => update(r.key, { removed: !r.removed })}>{r.removed ? <RotateCcw size={14} /> : <Trash2 size={14} />}</button>
              : <button type="button" title="Discard" aria-label="Discard" onClick={() => setRows((l) => l.filter((x) => x.key !== r.key))}><Trash2 size={14} /></button>}</td>
          </tr>;
        })}</tbody>
      </table></div> : <EmptyState icon={<UsersRound size={28} />} title="No faculty listed yet">Click “Add faculty” to add your first faculty member.</EmptyState>}
    </Card>
    {linkError ? <div className="cpn-alert warn" role="alert">{linkError}</div> : null}
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={items.length} label="Submit faculty changes" disabled={!items.length || items.length > live.maxPerRequest || Boolean(linkError)}
      onSubmit={async () => { if (invalid) { setError('Every faculty member needs a name (at least 3 characters).'); return; } if (linkError) { setError(linkError); return; } if (await submit({ items }, note)) setNote(''); }} />
  </>;
}
