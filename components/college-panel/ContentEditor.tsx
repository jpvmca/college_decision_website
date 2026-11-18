'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIst, type SectionResponse } from '../../lib/college-panel-types';
import { submitChange, withdrawRequest } from './panel-client';

type Live = { contentId: number | null; html: string; text: string; minLength: number; maxLength: number };

export default function ContentEditor({ instituteId, section, label, data }: { instituteId: number; section: string; label: string; data: SectionResponse<Live>['data'] }) {
  const router = useRouter();
  const initial = data.pendingText ?? data.live.text;
  const [text, setText] = useState(initial);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const changed = useMemo(() => text.trim() !== data.live.text.trim(), [text, data.live.text]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setOk('');
    try {
      const result = await submitChange(instituteId, section, { text }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return <>
    {data.pending ? <div className="cpn-alert warn">
      Request #{data.pending.id} for this section is waiting for review (submitted {formatIst(data.pending.created_at)}). The editor shows your proposed text; submitting again replaces that request.{' '}
      <button type="button" className="cpn-btn ghost small" disabled={busy} onClick={async () => { setBusy(true); try { await withdrawRequest(instituteId, data.pending!.id); setText(data.live.text); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not withdraw'); } finally { setBusy(false); } }}>Withdraw request</button>
    </div> : null}
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok">{ok}</div>}
    <form className="cpn-card cpn-form" onSubmit={submit}>
      <label>{label} text
        <textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} maxLength={data.live.maxLength} required />
        <span className="cpn-hint">Separate paragraphs with a blank line. Start a line with “- ” for a bullet list or “## ” for a sub-heading. Links and HTML are not accepted. {text.length.toLocaleString('en-IN')} / {data.live.maxLength.toLocaleString('en-IN')} characters (minimum {data.live.minLength}).</span>
      </label>
      <label>Note for the reviewer <span className="cpn-hint">(optional: where this information comes from)</span>
        <input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. From our 2026 prospectus, page 4" />
      </label>
      <div className="cpn-actions">
        <button className="cpn-btn" type="submit" disabled={busy || !changed}>{busy ? 'Submitting…' : 'Submit for review'}</button>
        {changed ? <button className="cpn-btn ghost" type="button" disabled={busy} onClick={() => setText(data.live.text)}>Reset to live text</button> : <span className="cpn-hint">No changes compared with the live profile yet.</span>}
      </div>
    </form>
    <section className="cpn-card">
      <h2>Live on your profile now</h2>
      {data.live.html ? <div className="cpn-preview" dangerouslySetInnerHTML={{ __html: sanitizePreview(data.live.html) }} /> : <p className="muted">Nothing published yet.</p>}
    </section>
  </>;
}

/** The live HTML is our own published content; strip scripts/handlers anyway before previewing it. */
function sanitizePreview(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}
