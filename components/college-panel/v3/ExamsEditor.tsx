'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ClipboardCheck, CopyCheck } from 'lucide-react';
import { Card, EmptyState, MultiSelect, SubmitBar, useSubmit } from './ui';

export type ExamsLive = {
  programmes: Array<{ id: number; name: string; course_name: string; exams: Array<{ mappingId: number; id: number; name: string }> }>;
  exams: Array<{ id: number; name: string; level: string }>;
};

/** Entrance exams accepted, per course, picked from our exam list (no free text). */
export default function ExamsEditor({ instituteId, live }: { instituteId: number; live: ExamsLive }) {
  const options = useMemo(() => live.exams.map((e) => ({ id: e.id, name: e.name, hint: e.level })), [live.exams]);
  const start = useMemo(() => Object.fromEntries(live.programmes.map((p) => [p.id, p.exams.map((e) => e.id)])), [live.programmes]);
  const [picked, setPicked] = useState<Record<number, number[]>>(start);
  const [filter, setFilter] = useState('');
  const [note, setNote] = useState('');
  const { busy, error, ok, submit } = useSubmit(instituteId, 'exams');
  const same = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));
  const changed = live.programmes.filter((p) => !same(picked[p.id] || [], start[p.id] || []));
  const shown = live.programmes.filter((p) => !filter || `${p.name} ${p.course_name}`.toLowerCase().includes(filter.toLowerCase()));

  if (!live.programmes.length) return <Card><EmptyState icon={<ClipboardCheck size={28} />} title="Add a course first">Exams are linked to courses. <Link href="/college/courses">Add your courses</Link> first.</EmptyState></Card>;
  return <>
    <Card title={<><ClipboardCheck size={19} /> Exams accepted per course</>} description="Choose every entrance exam you accept for admission to each course. These appear in the Admission and Entrance exams sections of your profile."
      actions={live.programmes.length > 6 ? <input className="cpn-input" type="search" placeholder="Filter courses" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 220 }} /> : null}>
      <div className="cp3-exam-rows">
        {shown.map((p) => <div className={`cp3-exam-row${changed.includes(p) ? ' changed' : ''}`} key={p.id}>
          <div className="cp3-exam-course"><strong>{p.name}</strong><small>{p.course_name}</small>
            {(picked[p.id] || []).length ? <button type="button" className="cpn-link" title="Use these exams for every course of this degree"
              onClick={() => setPicked((s) => { const n = { ...s }; for (const q of live.programmes) if (q.course_name === p.course_name) n[q.id] = [...(s[p.id] || [])]; return n; })}><CopyCheck size={13} /> Use for all {p.course_name}</button> : null}
          </div>
          <MultiSelect options={options} values={picked[p.id] || []} label={`Exams for ${p.name}`} placeholder="Add an exam" onChange={(ids) => setPicked((s) => ({ ...s, [p.id]: ids }))} />
        </div>)}
      </div>
    </Card>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={changed.length} label="Submit exam changes" disabled={!changed.length}
      onSubmit={async () => { if (await submit({ items: changed.map((p) => ({ programmeId: p.id, examIds: picked[p.id] || [] })) }, note)) setNote(''); }} />
    <p className="cpn-hint">Exam missing from the list? Mention it in the note and our team will add it.</p>
  </>;
}
