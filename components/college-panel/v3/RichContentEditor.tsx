'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Eye, PencilLine, RotateCcw } from 'lucide-react';
import type { ChangeItem, ChangeRequest } from '../../../lib/college-panel-types';
import RichTextEditor from './RichTextEditor';
import { externalLinkError } from './LinkGuard';
import { SubmitBar, useSubmit } from './ui';

export type RichLive = { contentId: number | null; html: string; text: string; minLength: number; maxLength: number };

const visibleLength = (text: string) => text.replace(/\s+/g, ' ').trim().length;

/** About / Admissions: WYSIWYG editor -> one change request with the new HTML (sanitized again on the server). */
export default function RichContentEditor({ instituteId, section, label, live, pending, pendingHtml, tips }: {
  instituteId: number; section: 'about' | 'admissions'; label: string; live: RichLive;
  pending: (ChangeRequest & { items: ChangeItem[] }) | null; pendingHtml: string | null; tips: string[];
}) {
  const start = pendingHtml || live.html || '';
  const [html, setHtml] = useState(start);
  const [text, setText] = useState(live.text || '');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState(false);
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, section);
  const length = useMemo(() => visibleLength(text), [text]);
  const changed = html !== start;
  const tooShort = length < live.minLength;
  const tooLong = length > live.maxLength;
  const linkError = useMemo(() => externalLinkError(html, label) || externalLinkError(text, label), [html, text, label]);

  return <>
    {pending ? <div className="cpn-alert warn">Your {label.toLowerCase()} update (request #{pending.id}) is waiting for review. The editor shows that proposal; submitting again replaces it. <Link href="/college/requests">See requests</Link></div> : null}
    <div className="cp3-split">
      <section className="cpn-card cp3-card">
        <div className="cp3-card-head">
          <div><h2>{label}</h2><p>Write it the way you would explain it to a student and their parents. Use headings and lists to keep it easy to scan.</p></div>
          <div className="cp3-seg" role="tablist" aria-label="Mode">
            <button type="button" role="tab" aria-selected={!preview} className={!preview ? 'on' : ''} onClick={() => setPreview(false)}><PencilLine size={15} /> Edit</button>
            <button type="button" role="tab" aria-selected={preview} className={preview ? 'on' : ''} onClick={() => setPreview(true)}><Eye size={15} /> Preview</button>
          </div>
        </div>
        <div hidden={preview}><RichTextEditor value={html} onChange={(h, t) => { setHtml(h); setText(t); }} ariaLabel={`${label} text`} placeholder={`Introduce ${label === 'About' ? 'your college: history, campus, approvals and what makes it different' : 'your admission process: eligibility, how to apply, important dates and documents'}…`} /></div>
        {preview ? <div className="cp3-preview cp3-prose" dangerouslySetInnerHTML={{ __html: html || '<p><em>Nothing written yet.</em></p>' }} /> : null}
        {linkError ? <div className="cpn-alert warn" role="alert">{linkError}</div> : null}
        <div className="cp3-editor-foot">
          <span className={tooShort || tooLong ? 'bad' : 'good'}>{length.toLocaleString('en-IN')} characters · minimum {live.minLength}, maximum {live.maxLength.toLocaleString('en-IN')}</span>
          {changed ? <button type="button" className="cpn-link" onClick={() => { setHtml(start); setError(''); }}><RotateCcw size={14} /> Discard changes</button> : <span className="muted">No changes yet</span>}
        </div>
      </section>
      <aside className="cp3-tips cpn-card">
        <h3>Tips</h3>
        <ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="muted">Website links and web addresses are not allowed (they are treated as spam). Put your official website, email and phone in Contact details. Pasted formatting (fonts, colours, images) is removed automatically.</p>
      </aside>
    </div>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} label={`Submit ${label.toLowerCase()} for review`}
      disabled={!changed || tooShort || tooLong || Boolean(linkError)}
      onSubmit={async () => { if (await submit({ html }, note)) setNote(''); }} />
  </>;
}
