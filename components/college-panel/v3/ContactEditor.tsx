'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, Globe2, Mail, MapPin, Phone } from 'lucide-react';
import type { SectionResponse } from '../../../lib/college-panel-types';
import { SubmitBar, useSubmit } from './ui';
import { externalLinkError } from './LinkGuard';

type Kind = 'phone' | 'email' | 'url' | 'text' | 'year';
export type ContactLive = { fields: Array<{ field: string; label: string; max: number; kind: Kind; value: string | number | null }> };

const GROUPS: Array<{ title: string; icon: React.ReactNode; fields: string[] }> = [
  { title: 'Phone numbers', icon: <Phone size={17} />, fields: ['phone_number_1', 'phone_number_2'] },
  { title: 'Email & website', icon: <Mail size={17} />, fields: ['email', 'website'] },
  { title: 'Campus address', icon: <MapPin size={17} />, fields: ['address_line_1', 'address_line_2'] },
  { title: 'Basic facts', icon: <CalendarDays size={17} />, fields: ['establishment_year'] }
];
const PLACEHOLDER: Record<string, string> = {
  phone_number_1: '+91 98765 43210', phone_number_2: '0821 2345678', email: 'admissions@yourcollege.edu.in', website: 'https://www.yourcollege.edu.in',
  address_line_1: 'Campus / building, street', address_line_2: 'Area, landmark, PIN code', establishment_year: 'e.g. 1998'
};
const INPUT_TYPE: Record<Kind, string> = { phone: 'tel', email: 'email', url: 'url', text: 'text', year: 'text' };

/** Same rules as the backend (college-panel-sections cleanContactValue) so mistakes show before submitting. */
function validate(kind: Kind, label: string, raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (kind === 'phone' && (!/^\+?[0-9][0-9 ()-]{5,18}[0-9]$/.test(value) || value.replace(/\D/g, '').length < 6)) return 'Use digits, spaces, + and - only (6 to 20 characters)';
  if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address';
  if (kind === 'url') {
    try { const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); if (!/\.[a-z]{2,}$/i.test(url.hostname)) return 'Enter a valid website address'; } catch { return 'Enter a valid website address'; }
  }
  if (kind === 'year' && (!/^\d{4}$/.test(value) || Number(value) < 1800 || Number(value) > new Date().getFullYear())) return `Enter a 4-digit year (1800 to ${new Date().getFullYear()})`;
  if (kind === 'text') return externalLinkError(value, label) || '';
  return '';
}

export default function ContactEditor({ instituteId, data }: { instituteId: number; data: SectionResponse<ContactLive>['data'] }) {
  const pendingValues = Object.fromEntries((data.pending?.items || []).map((item) => [item.field_name, item.new_value as string | null]));
  const live = Object.fromEntries(data.live.fields.map((f) => [f.field, f.value == null ? '' : String(f.value)]));
  const start = Object.fromEntries(data.live.fields.map((f) => [f.field, f.field in pendingValues ? String(pendingValues[f.field] ?? '') : live[f.field]]));
  const [values, setValues] = useState<Record<string, string>>(start);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'contact');
  const defs = new Map(data.live.fields.map((f) => [f.field, f]));
  const errors = useMemo(() => Object.fromEntries(data.live.fields.map((f) => [f.field, validate(f.kind, f.label, values[f.field] || '')])), [values, data.live.fields]);
  const changedFields = data.live.fields.filter((f) => (values[f.field] || '').trim() !== (live[f.field] || '').trim());
  const hasErrors = Object.values(errors).some(Boolean);
  const website = (values.website || '').trim();

  return <>
    {data.pending ? <div className="cpn-alert warn">Request #{data.pending.id} with contact changes is waiting for review. The form shows those proposed values; submitting again replaces that request. <Link href="/college/requests">See requests</Link></div> : null}
    <div className="cp3-contact-grid">
      {GROUPS.map((group) => <section className="cpn-card cp3-card" key={group.title}>
        <div className="cp3-card-head"><div><h2 className="cp3-h-icon">{group.icon}{group.title}</h2></div></div>
        <div className="cpn-form">
          {group.fields.map((field) => {
            const def = defs.get(field);
            if (!def) return null;
            const err = touched[field] ? errors[field] : '';
            const changed = (values[field] || '').trim() !== (live[field] || '').trim();
            return <label key={field}>{def.label}{changed ? <span className="cp3-badge">Changed</span> : null}
              <input type={INPUT_TYPE[def.kind]} inputMode={def.kind === 'year' ? 'numeric' : def.kind === 'phone' ? 'tel' : undefined} maxLength={def.max} value={values[field] || ''}
                placeholder={PLACEHOLDER[field]} aria-invalid={Boolean(err)} onBlur={() => setTouched((t) => ({ ...t, [field]: true }))}
                onChange={(e) => setValues((v) => ({ ...v, [field]: def.kind === 'year' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value }))} />
              {err ? <span className="cpn-field-error">{err}</span> : changed ? <span className="cpn-hint">Live now: {live[field] || '(empty)'}</span> : null}
            </label>;
          })}
          {group.title === 'Email & website' && website && !errors.website ? <span className="cpn-hint"><Globe2 size={13} style={{ verticalAlign: -2 }} /> Students will be sent to {/^https?:\/\//i.test(website) ? website : `https://${website}`}</span> : null}
        </div>
      </section>)}
    </div>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={changedFields.length}
      label="Submit contact changes" disabled={!changedFields.length}
      onSubmit={async () => {
        setTouched(Object.fromEntries(data.live.fields.map((f) => [f.field, true])));
        if (hasErrors) { setError('Please fix the highlighted fields first.'); return; }
        const payload = Object.fromEntries(data.live.fields.map((f) => [f.field, (values[f.field] || '').trim() || null]));
        if (await submit(payload, note)) setNote('');
      }} />
    <p className="cpn-hint">Leave a field empty to remove it from your profile (the founding year cannot be removed). Your city and state are fixed; write to us if they are wrong.</p>
  </>;
}
