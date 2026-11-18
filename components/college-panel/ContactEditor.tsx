'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIst, type SectionResponse } from '../../lib/college-panel-types';
import { submitChange, withdrawRequest } from './panel-client';

export type ContactLive = { fields: Array<{ field: string; label: string; max: number; kind: 'phone' | 'email' | 'url' | 'text'; value: string | null }> };

const INPUT_TYPE = { phone: 'tel', email: 'email', url: 'text', text: 'text' } as const;

export default function ContactEditor({ instituteId, data }: { instituteId: number; data: SectionResponse<ContactLive>['data'] }) {
  const router = useRouter();
  const pendingValues = Object.fromEntries((data.pending?.items || []).map((item) => [item.field_name, item.new_value as string | null]));
  const live = Object.fromEntries(data.live.fields.map((f) => [f.field, f.value ?? '']));
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(data.live.fields.map((f) => [f.field, f.field in pendingValues ? String(pendingValues[f.field] ?? '') : f.value ?? ''])));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const changed = data.live.fields.some((f) => (values[f.field] || '').trim() !== String(live[f.field] || '').trim());

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setOk('');
    try {
      const changes = Object.fromEntries(data.live.fields.filter((f) => (values[f.field] || '').trim() !== String(live[f.field] || '').trim()).map((f) => [f.field, values[f.field].trim() || null]));
      const result = await submitChange(instituteId, 'contact', changes, note);
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
      Request #{data.pending.id} is waiting for review (submitted {formatIst(data.pending.created_at)}). The form shows your proposed values; submitting again replaces that request.{' '}
      <button type="button" className="cpn-btn ghost small" disabled={busy} onClick={async () => { setBusy(true); try { await withdrawRequest(instituteId, data.pending!.id); setValues(live as Record<string, string>); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not withdraw'); } finally { setBusy(false); } }}>Withdraw request</button>
    </div> : null}
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok">{ok}</div>}
    <form className="cpn-card cpn-form" onSubmit={submit}>
      <div className="cpn-fields">
        {data.live.fields.map((f) => {
          const differs = (values[f.field] || '').trim() !== String(live[f.field] || '').trim();
          return <label key={f.field}>{f.label}
            <input type={INPUT_TYPE[f.kind]} maxLength={f.max} value={values[f.field] || ''} onChange={(e) => setValues((v) => ({ ...v, [f.field]: e.target.value }))} placeholder={f.kind === 'url' ? 'https://www.yourcollege.edu.in' : undefined} />
            {differs ? <span className="cpn-live">Live now: {live[f.field] || '(empty)'}</span> : null}
          </label>;
        })}
      </div>
      <label>Note for the reviewer <span className="cpn-hint">(optional)</span>
        <input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. New admissions helpline from 2026" />
      </label>
      <div className="cpn-actions">
        <button className="cpn-btn" type="submit" disabled={busy || !changed}>{busy ? 'Submitting…' : 'Submit for review'}</button>
        {!changed ? <span className="cpn-hint">No changes compared with the live profile yet.</span> : null}
      </div>
    </form>
  </>;
}
