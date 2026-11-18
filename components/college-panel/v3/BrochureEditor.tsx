'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { SectionResponse } from '../../../lib/college-panel-types';
import { DropZone, SubmitBar, useSubmit } from './ui';
import { uploadBrochure } from './v3-client';

export type BrochureLive = { brochure: { name: string; sizeBytes: number; updatedAt?: string } | null; maxBytes: number };

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Brochure (PDF, max 10 MB): upload -> change request -> admin approval -> "Download brochure" on the public profile.
 * Students fill an enquiry form before the download starts; those leads reach CollegeDecision counsellors.
 */
export default function BrochureEditor({ instituteId, data }: { instituteId: number; data: SectionResponse<BrochureLive>['data'] }) {
  const current = data.live.brochure;
  const pendingItem = data.pending?.items.find((i) => i.entity_type === 'institute_brochure');
  const pendingValue = pendingItem?.new_value as { name?: string; sizeBytes?: number } | null | undefined;
  const [uploaded, setUploaded] = useState<{ id: number; name: string; sizeBytes: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'brochure');
  const maxBytes = data.live.maxBytes || 10 * 1024 * 1024;

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setError('');
    if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) { setError('Choose a PDF file.'); return; }
    if (file.size > maxBytes) { setError(`The brochure must be ${kb(maxBytes)} or smaller.`); return; }
    setUploading(true);
    try {
      const result = await uploadBrochure(instituteId, file);
      setUploaded(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally { setUploading(false); }
  }

  return <section className="cpn-card cp3-card cp3-brochure" id="brochure">
    <div className="cp3-card-head"><div><h2>Brochure (PDF)</h2><p>Students see a <strong>Download brochure</strong> button on your profile. They share their contact details before the download starts. Every new or replaced brochure is reviewed before it goes live.</p></div></div>
    {data.pending ? <div className="cpn-alert warn">A brochure change (request #{data.pending.id}{pendingItem?.action === 'delete' ? ', remove brochure' : pendingValue?.name ? `, ${pendingValue.name}` : ''}) is waiting for review. Submitting again replaces that request. <Link href="/college/requests">See requests</Link></div> : null}
    <div className="cp3-brochure-live">
      <FileText size={20} aria-hidden="true" />
      {current ? <span>Live now: <strong>{current.name}</strong> · {kb(current.sizeBytes)}</span> : <span className="muted">No brochure is live yet.</span>}
    </div>
    <DropZone accept="application/pdf,.pdf" busy={uploading} onFiles={onFiles} title={current ? 'Drop a new PDF here to replace the brochure' : 'Drop your brochure PDF here or click to choose'} hint={`PDF only · up to ${kb(maxBytes)} · no links to other admission portals`} />
    {uploaded ? <p className="cpn-hint" style={{ marginTop: 10 }}>Ready to submit: {uploaded.name} · {kb(uploaded.sizeBytes)}</p> : null}
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} sticky={false}
      label={current ? 'Submit replacement for review' : 'Submit brochure for review'} disabled={!uploaded || uploading}
      onSubmit={async () => { if (uploaded && await submit({ proofFileId: uploaded.id }, note)) { setUploaded(null); setNote(''); } }}
      extra={current ? <button type="button" className="cpn-btn ghost" disabled={busy} onClick={async () => {
        if (window.confirm('Remove the brochure from your public profile? This also goes to review.')) await submit({ remove: true }, note);
      }}>Remove brochure</button> : null} />
  </section>;
}
