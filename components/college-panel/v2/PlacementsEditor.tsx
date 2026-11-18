'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitChange } from '../panel-client';
import ProofPicker from './ProofPicker';
import { lpa, type ProofFile, type V2Live } from './types';

export default function PlacementsEditor({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const router = useRouter();
  const thisYear = new Date().getFullYear();
  const [programmeId, setProgrammeId] = useState<number>(live.programmes[0]?.id || 0);
  const [year, setYear] = useState(String(thisYear - 1));
  const [highest, setHighest] = useState('');
  const [average, setAverage] = useState('');
  const [lowest, setLowest] = useState('');
  const [proofs, setProofs] = useState<ProofFile[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const name = (id: number) => live.programmes.find((p) => p.id === id)?.name || `Course #${id}`;
  const existing = live.placements.find((p) => p.programme_id === programmeId && String(p.year) === year);

  function edit(p: V2Live['placements'][number]) {
    setProgrammeId(p.programme_id); setYear(String(p.year));
    setHighest(Number(p.highest_package) ? String(Number(p.highest_package)) : '');
    setAverage(Number(p.average_package) ? String(Number(p.average_package)) : '');
    setLowest(Number(p.lowest_package) ? String(Number(p.lowest_package)) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function send(items: unknown[]) {
    setBusy(true); setError(''); setOk('');
    try {
      const result = await submitChange(instituteId, 'placements', { items }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setHighest(''); setAverage(''); setLowest(''); setProofs([]); setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!proofs.length) { setError('Please attach a proof document before submitting.'); return; }
    void send([{ op: 'upsert', programmeId, year: Number(year), highestPackage: highest || null, averagePackage: average || null, lowestPackage: lowest || null, proofFileIds: proofs.map((p) => p.id) }]);
  }

  return <>
    <form className="cpn-card cpn-form" onSubmit={submit}>
      <h2>{existing ? 'Update placement record' : 'Add placement record'}</h2>
      <div className="cpv2-grid">
        <label>Course<select value={programmeId} onChange={(e) => setProgrammeId(Number(e.target.value))}>{live.programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>Placement year<select value={year} onChange={(e) => setYear(e.target.value)}>{Array.from({ length: 8 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
        <label>Highest package (LPA)<input type="number" min={0} max={1000} step="0.01" value={highest} onChange={(e) => setHighest(e.target.value)} /></label>
        <label>Average package (LPA)<input type="number" min={0} max={1000} step="0.01" value={average} onChange={(e) => setAverage(e.target.value)} /></label>
        <label>Lowest package (LPA)<input type="number" min={0} max={1000} step="0.01" value={lowest} onChange={(e) => setLowest(e.target.value)} /></label>
      </div>
      {existing ? <p className="cpn-hint">Live now for {existing.year}: highest {lpa(existing.highest_package)}, average {lpa(existing.average_package)}, lowest {lpa(existing.lowest_package)}. Your values will replace these after review.</p> : null}
      <ProofPicker instituteId={instituteId} purpose="placements" files={proofs} onChange={setProofs} required />
      <label>Note for the reviewer <span className="cpn-hint">(optional)</span><input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      {error && <div className="cpn-alert err" role="alert">{error}</div>}
      {ok && <div className="cpn-alert ok">{ok}</div>}
      <div className="cpn-actions"><button className="cpn-btn" type="submit" disabled={busy || (!highest && !average)}>{busy ? 'Submitting…' : 'Submit for review'}</button></div>
    </form>
    <section className="cpn-card">
      <h2>Live placement records</h2>
      {live.placements.length ? <table className="cpn-table cpv2-table">
        <thead><tr><th>Course</th><th>Year</th><th>Highest</th><th>Average</th><th>Lowest</th><th /></tr></thead>
        <tbody>{live.placements.map((p) => <tr key={p.id}>
          <td>{name(p.programme_id)}</td><td>{p.year}</td><td>{lpa(p.highest_package)}</td><td>{lpa(p.average_package)}</td><td>{lpa(p.lowest_package)}</td>
          <td className="cpv2-row-actions"><button type="button" className="cpn-btn ghost small" onClick={() => edit(p)}>Edit</button>
            <button type="button" className="cpn-btn ghost small" disabled={busy} onClick={() => { if (window.confirm(`Ask us to remove the ${p.year} placement record for ${name(p.programme_id)}?`)) void send([{ op: 'remove', placementId: p.id }]); }}>Remove</button></td>
        </tr>)}</tbody>
      </table> : <p className="cpn-hint">No placement records yet.</p>}
    </section>
  </>;
}
