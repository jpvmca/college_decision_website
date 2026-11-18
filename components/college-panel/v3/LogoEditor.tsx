'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { imageUrl } from '../../../lib/api';
import type { SectionResponse } from '../../../lib/college-panel-types';
import { DropZone, SubmitBar, useSubmit } from './ui';
import { uploadLogo } from './v3-client';

export type LogoLive = { logo: { path: string | null; url: string | null } | null; maxSize: number; minSize: number };

/** Logo: upload (server converts to WebP, max 512 px) -> preview at the sizes the site uses -> change request. */
export default function LogoEditor({ instituteId, data, collegeName }: { instituteId: number; data: SectionResponse<LogoLive>['data']; collegeName: string }) {
  const current = data.live.logo;
  const currentSrc = current?.path ? imageUrl(current.path, 192) : current?.url || '';
  const pendingItem = data.pending?.items.find((i) => i.field_name === 'logo');
  const pendingValue = pendingItem?.new_value as { path?: string; url?: string } | undefined;
  const [uploaded, setUploaded] = useState<{ path: string; preview: string; width: number; height: number; bytes: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'logo');

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setError('');
    if (!/^image\/(jpeg|png|webp|avif)$/i.test(file.type)) { setError('Choose a JPG, PNG, WebP or AVIF image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('The logo must be 5 MB or smaller.'); return; }
    setUploading(true);
    try {
      const result = await uploadLogo(instituteId, file);
      setUploaded({ path: result.data.path, preview: URL.createObjectURL(file), width: result.data.width, height: result.data.height, bytes: result.data.bytes });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally { setUploading(false); }
  }

  const shown = uploaded?.preview || (pendingValue?.path ? imageUrl(pendingValue.path, 192) : '') || currentSrc;
  return <>
    {data.pending ? <div className="cpn-alert warn">A new logo (request #{data.pending.id}) is waiting for review. Uploading another one replaces that request. <Link href="/college/requests">See requests</Link></div> : null}
    <div className="cp3-split">
      <section className="cpn-card cp3-card">
        <div className="cp3-card-head"><div><h2>Upload a new logo</h2><p>Use the official logo on a white or transparent background. Square logos look best (at least 256 × 256 px).</p></div></div>
        <DropZone accept="image/jpeg,image/png,image/webp,image/avif" busy={uploading} onFiles={onFiles} title="Drop your logo here or click to choose" hint="JPG, PNG, WebP or AVIF · up to 5 MB · converted to WebP automatically" />
        {uploaded ? <p className="cpn-hint" style={{ marginTop: 10 }}>Ready: converted to WebP, {uploaded.width} × {uploaded.height} px, {Math.max(1, Math.round(uploaded.bytes / 1024))} KB.</p> : null}
      </section>
      <aside className="cpn-card cp3-card">
        <div className="cp3-card-head"><div><h2>Preview</h2><p>How it appears on CollegeDecision.</p></div></div>
        <div className="cp3-logo-previews">
          <div className="cp3-logo-hero">{shown ? <img src={shown} alt="Logo preview" /> : <ImageIcon size={34} aria-hidden="true" />}</div>
          <div className="cp3-logo-card">{shown ? <img src={shown} alt="" /> : <ImageIcon size={18} aria-hidden="true" />}<div><strong>{collegeName}</strong><small>Search results &amp; listings</small></div></div>
        </div>
        <div className="cp3-logo-compare">
          <div><small>Live now</small>{currentSrc ? <img src={currentSrc} alt="Current logo" /> : <span className="muted">No logo</span>}</div>
          <div><small>{uploaded ? 'New (not submitted)' : pendingValue ? 'Waiting for review' : 'New'}</small>{uploaded ? <img src={uploaded.preview} alt="New logo" /> : pendingValue?.path ? <img src={imageUrl(pendingValue.path, 192)} alt="Pending logo" /> : <span className="muted">—</span>}</div>
        </div>
      </aside>
    </div>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} label="Submit new logo for review" disabled={!uploaded || uploading}
      onSubmit={async () => { if (uploaded && await submit({ path: uploaded.path }, note)) { setUploaded(null); setNote(''); } }} />
  </>;
}
