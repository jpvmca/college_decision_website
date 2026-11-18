'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmReverification } from './v2-client';

/** Section labels that read as plural ("Placements are correct"). */
const PLURAL = new Set(['contact', 'admissions', 'courses', 'fees', 'exams', 'placements', 'recruiters']);
const SECTIONS: Array<[string, string]> = [
  ['logo', 'Logo'], ['about', 'About'], ['contact', 'Contact details'], ['admissions', 'Admissions'], ['gallery', 'Photo gallery'], ['courses', 'Courses'],
  ['fees', 'Fees'], ['exams', 'Entrance exams'], ['placements', 'Placements'], ['recruiters', 'Recruiters'], ['faculty', 'Faculty']
];

export default function ReverifyForm({ instituteId }: { instituteId: number }) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const all = SECTIONS.every(([k]) => checked[k]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setOk('');
    try {
      const result = await confirmReverification(instituteId, SECTIONS.filter(([k]) => checked[k]).map(([k]) => k), note);
      setOk(result.message);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm');
    } finally { setBusy(false); }
  }

  return <form className="cpn-card cpn-form" onSubmit={submit}>
    <h2>Confirm your profile data</h2>
    <p className="cpn-hint">Open each section, update anything that changed (updates go to our team for review), then tick it here.</p>
    <div className="cpv2-checks">{SECTIONS.map(([k, label]) => <label key={k} className="cpv2-check"><input type="checkbox" checked={Boolean(checked[k])} onChange={(e) => setChecked((s) => ({ ...s, [k]: e.target.checked }))} /> {label} {PLURAL.has(k) ? 'are' : 'is'} correct and up to date</label>)}</div>
    <label>Note <span className="cpn-hint">(optional)</span><input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label>
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok">{ok}</div>}
    <div className="cpn-actions"><button className="cpn-btn" type="submit" disabled={busy || !all}>{busy ? 'Saving…' : 'Confirm data is correct'}</button></div>
  </form>;
}
