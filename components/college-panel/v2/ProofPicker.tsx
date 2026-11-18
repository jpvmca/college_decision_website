'use client';

import { useState } from 'react';
import type { ProofFile } from './types';
import { uploadProof } from './v2-client';

/** Upload one or more proof files (PDF / JPG / PNG / WebP, max 8 MB each). */
export default function ProofPicker({ instituteId, purpose, files, onChange, required }: {
  instituteId: number; purpose: 'placements' | 'recruiters'; files: ProofFile[]; onChange: (files: ProofFile[]) => void; required?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function pick(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true); setError('');
    const added: ProofFile[] = [];
    try {
      for (const file of Array.from(list).slice(0, 10 - files.length)) {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is larger than 8 MB`);
        added.push((await uploadProof(instituteId, file, purpose)).data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (added.length) onChange([...files, ...added]);
      setBusy(false);
    }
  }
  return <div className="cpv2-proof">
    <label className="cpv2-proof-btn">
      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple disabled={busy || files.length >= 10} onChange={(e) => { void pick(e.target.files); e.target.value = ''; }} />
      {busy ? 'Uploading…' : `Attach proof${required ? ' (required)' : ''}`}
    </label>
    <span className="cpn-hint">Placement report, offer letters or an audited summary. PDF, JPG, PNG or WebP, up to 8 MB. Only our review team can open these files.</span>
    {files.length ? <ul className="cpv2-proof-list">{files.map((f) => <li key={f.id}>📎 {f.originalName} <small>({Math.max(1, Math.round(f.sizeBytes / 1024))} KB)</small>
      <button type="button" className="cpn-btn ghost small" onClick={() => onChange(files.filter((x) => x.id !== f.id))}>Remove</button></li>)}</ul> : null}
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
  </div>;
}
