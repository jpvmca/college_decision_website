'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitChange } from '../panel-client';
import ProofPicker from './ProofPicker';
import { lpa, type ProofFile, type V2Live } from './types';
import { searchRecruiters } from './v2-client';

export default function RecruitersEditor({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const router = useRouter();
  const thisYear = new Date().getFullYear();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [picked, setPicked] = useState<{ id: number | null; name: string } | null>(null);
  const [year, setYear] = useState(String(thisYear - 1));
  const [placed, setPlaced] = useState('');
  const [highest, setHighest] = useState('');
  const [average, setAverage] = useState('');
  const [proofs, setProofs] = useState<ProofFile[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    if (picked || query.trim().length < 2) { setOptions([]); return; }
    const t = setTimeout(() => { void searchRecruiters(query.trim()).then(setOptions); }, 250);
    return () => clearTimeout(t);
  }, [query, picked]);

  async function send(items: unknown[]) {
    setBusy(true); setError(''); setOk('');
    try {
      const result = await submitChange(instituteId, 'recruiters', { items }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setPicked(null); setQuery(''); setPlaced(''); setHighest(''); setAverage(''); setProofs([]); setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!picked) { setError('Choose a company from the list, or use “Add as a new company”.'); return; }
    if (!proofs.length) { setError('Please attach a proof document before submitting.'); return; }
    void send([{ op: 'upsert', recruiterId: picked.id, newRecruiterName: picked.id ? null : picked.name, year: Number(year), studentsPlaced: placed || null,
      highestPackage: highest || null, averagePackage: average || null, proofFileIds: proofs.map((p) => p.id) }]);
  }

  return <>
    <form className="cpn-card cpn-form" onSubmit={submit}>
      <h2>Add or update a recruiter</h2>
      <label>Company
        {picked ? <div className="cpv2-picked"><strong>{picked.name}</strong>{picked.id ? null : <span className="cpn-hint"> (new company, our team adds it on approval)</span>}
          <button type="button" className="cpn-btn ghost small" onClick={() => { setPicked(null); setQuery(''); }}>Change</button></div>
          : <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type at least 2 letters, e.g. Infosys" autoComplete="off" />}
      </label>
      {!picked && (options.length || query.trim().length >= 2) ? <ul className="cpv2-options">
        {options.map((o) => <li key={o.id}><button type="button" onClick={() => setPicked(o)}>{o.name}</button></li>)}
        {query.trim().length >= 2 && !options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase()) ? <li><button type="button" onClick={() => setPicked({ id: null, name: query.trim() })}>+ Add “{query.trim()}” as a new company</button></li> : null}
      </ul> : null}
      <div className="cpv2-grid">
        <label>Year<select value={year} onChange={(e) => setYear(e.target.value)}>{Array.from({ length: 8 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
        <label>Students placed<input type="number" min={0} max={100000} value={placed} onChange={(e) => setPlaced(e.target.value)} /></label>
        <label>Highest package (LPA)<input type="number" min={0} max={1000} step="0.01" value={highest} onChange={(e) => setHighest(e.target.value)} /></label>
        <label>Average package (LPA)<input type="number" min={0} max={1000} step="0.01" value={average} onChange={(e) => setAverage(e.target.value)} /></label>
      </div>
      <ProofPicker instituteId={instituteId} purpose="recruiters" files={proofs} onChange={setProofs} required />
      <label>Note for the reviewer <span className="cpn-hint">(optional)</span><input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      {error && <div className="cpn-alert err" role="alert">{error}</div>}
      {ok && <div className="cpn-alert ok">{ok}</div>}
      <div className="cpn-actions"><button className="cpn-btn" type="submit" disabled={busy || !picked}>{busy ? 'Submitting…' : 'Submit for review'}</button></div>
    </form>
    <section className="cpn-card">
      <h2>Live recruiters ({live.recruiters.length})</h2>
      {live.recruiters.length ? <table className="cpn-table cpv2-table">
        <thead><tr><th>Company</th><th>Year</th><th>Students placed</th><th>Highest</th><th>Average</th><th /></tr></thead>
        <tbody>{live.recruiters.map((r) => <tr key={r.id}>
          <td>{r.name}</td><td>{r.year || '—'}</td><td>{r.students_placed || '—'}</td><td>{lpa(r.highest_package)}</td><td>{lpa(r.average_package)}</td>
          <td><button type="button" className="cpn-btn ghost small" disabled={busy} onClick={() => { if (window.confirm(`Ask us to remove ${r.name} from your recruiters?`)) void send([{ op: 'remove', instituteRecruiterId: r.id }]); }}>Remove</button></td>
        </tr>)}</tbody>
      </table> : <p className="cpn-hint">No recruiters listed yet.</p>}
    </section>
  </>;
}
