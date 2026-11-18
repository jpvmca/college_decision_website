'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Recaptcha, { RECAPTCHA_ENABLED, type RecaptchaHandle } from '../Recaptcha';
import OtpStep from './OtpStep';
import { ACCEPT_DOCS, fileProblem, MAX_FILE_MB } from './claim-shared';

type Details = { claimId: number; status: string; collegeName: string; note: string | null; emailMasked: string };

/** Claimant answers an "information needed" request: confirm the claim email by OTP, then add a note / documents. */
export default function ClaimInfoForm({ claimId }: { claimId: number | null }) {
  const captcha = useRef<RecaptchaHandle>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!claimId) {
    return <section className="cl-card"><h2>Claim not found</h2><p>Open the link from the email we sent you. It looks like <code>/for-colleges/claim/info?claim=123</code>.</p></section>;
  }

  const onVerified = async (value: string | null) => {
    setToken(value);
    if (!value) return;
    setError('');
    try {
      const response = await fetch(`/api/claims/${claimId}/info-request`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ emailVerificationToken: value }) });
      const body = await response.json().catch(() => ({})) as { error?: string; data?: Details };
      if (!response.ok || !body.data) { setError(body.error || 'This email does not match the claim.'); setToken(null); return; }
      setDetails(body.data);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const fileError = files.map(fileProblem).find(Boolean) || null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!token) { setError('Verify the claim email first.'); return; }
    if (!note.trim() && !files.length) { setError('Add a note or upload at least one document.'); return; }
    if (fileError) { setError(fileError); return; }
    const form = new FormData();
    form.set('emailVerificationToken', token);
    form.set('note', note.trim());
    form.set('company_website', (event.currentTarget.elements.namedItem('company_website') as HTMLInputElement | null)?.value || '');
    files.slice(0, 3).forEach((file) => form.append('other', file));
    setBusy(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/info`, { method: 'POST', body: form });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(body.error || 'Could not send. Please try again.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <section className="cl-card cl-done" aria-live="polite"><CheckCircle2 size={34} aria-hidden="true" /><h2>Thank you</h2><p>Your reply for claim #{claimId}{details?.collegeName ? ` (${details.collegeName})` : ''} has been sent. The claim is back in review and we will email you the result.</p><div className="cl-actions"><Link className="button" href="/for-colleges">For colleges</Link></div></section>;
  }

  return <form className="cl-card cl-form" onSubmit={submit} noValidate>
    <fieldset>
      <legend><span className="cl-step">1</span> Confirm the claim email</legend>
      <p className="cl-hint">Enter the official email you used for claim #{claimId}. We will send it a one-time code.</p>
      <label>Official email<input type="email" autoComplete="email" maxLength={190} value={email} onChange={(event) => setEmail(event.target.value)} disabled={Boolean(token)} /></label>
      {RECAPTCHA_ENABLED ? <Recaptcha ref={captcha} className="cl-captcha" /> : null}
      <OtpStep channel="email" destination={email} verified={Boolean(token)} onVerified={onVerified}
        getCaptchaToken={() => captcha.current?.getToken() || null} resetCaptcha={() => captcha.current?.reset()} />
    </fieldset>
    {details && <fieldset>
      <legend><span className="cl-step">2</span> Send the information</legend>
      <p><strong>{details.collegeName}</strong> · claim #{details.claimId}</p>
      {details.status !== 'needs_info'
        ? <p className="cl-warn">This claim is not waiting for more information right now (status: {details.status.replace('_', ' ')}).</p>
        : <>
          {details.note && <div className="cl-request"><strong>Our team asked for:</strong><p>{details.note}</p></div>}
          <label>Your reply<textarea rows={5} maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add any details for our team" /></label>
          <label className="cl-file">Documents (optional, up to 3)<small>PDF, JPG, PNG or WebP, up to {MAX_FILE_MB} MB each</small><input type="file" multiple accept={ACCEPT_DOCS} onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 3))} /></label>
          <input type="text" name="company_website" className="cl-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {fileError && <p className="cl-error">{fileError}</p>}
          <div className="cl-actions"><button type="submit" className="button primary" disabled={busy}>{busy ? 'Sending…' : 'Send to our team'}</button></div>
        </>}
    </fieldset>}
    {error && <p className="cl-error" role="alert">{error}</p>}
  </form>;
}
