'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Recaptcha, { RECAPTCHA_ENABLED, type RecaptchaHandle } from '../Recaptcha';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginForm() {
  const router = useRouter();
  const captcha = useRef<RecaptchaHandle>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const hasCaptcha = RECAPTCHA_ENABLED && Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => { if (step === 'code') codeInput.current?.focus(); }, [step]);

  async function post(path: string, body: unknown) {
    const response = await fetch(`/api/college-panel/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
    return json;
  }

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setError('');
    setInfo('');
    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value)) { setError('Enter a valid email address, e.g. admissions@yourcollege.edu.in'); return; }
    const recaptchaToken = captcha.current?.getToken() || undefined;
    if (hasCaptcha && !recaptchaToken) { setError('Please tick “I’m not a robot” first.'); return; }
    setBusy(true);
    try {
      const result = await post('auth/send-otp', { email: value, recaptchaToken });
      setEmail(value);
      setInfo(result.message || 'If this email belongs to a college owner, a code has been sent.');
      setResendIn(Number(result.data?.resendAfterSeconds) || 60);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code');
    } finally {
      captcha.current?.reset();
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!/^\d{4,8}$/.test(code)) { setError('Enter the 6-digit code from the email.'); return; }
    setBusy(true);
    try {
      await post('auth/verify', { email, code: code.trim() });
      router.replace('/college');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
      setBusy(false);
    }
  }

  return <div className="cpn-login-form">
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {info && !error && <div className="cpn-alert info" role="status">{info}</div>}
    {step === 'email' ? <form className="cpn-form" onSubmit={sendCode} noValidate>
      <label>Owner email
        <span className="cpn-input-icon"><Mail size={17} aria-hidden="true" />
          <input type="email" required maxLength={190} autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@yourcollege.edu.in" />
        </span>
      </label>
      {hasCaptcha ? <Recaptcha ref={captcha} /> : null}
      <button className="cpn-btn block" type="submit" disabled={busy || !email.trim()}>{busy ? 'Sending…' : 'Email me a code'}</button>
    </form> : <form className="cpn-form" onSubmit={verify} noValidate>
      <label>Enter the code sent to <strong className="cpn-login-email">{email}</strong>
        <input ref={codeInput} className="cpn-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" aria-describedby="cpn-code-hint" />
        <span className="cpn-hint" id="cpn-code-hint">The code expires in 10 minutes and works once. Check your spam folder if it is not in your inbox.</span>
      </label>
      <button className="cpn-btn block" type="submit" disabled={busy || code.length < 4}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <div className="cpn-login-links">
        <button className="cpn-link" type="button" disabled={busy} onClick={() => { setStep('email'); setCode(''); setInfo(''); setError(''); }}><ArrowLeft size={14} aria-hidden="true" /> Use another email</button>
        <button className="cpn-link" type="button" disabled={busy || resendIn > 0 || hasCaptcha} onClick={() => sendCode()} title={hasCaptcha ? 'Go back to request a new code' : undefined}>{resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}</button>
      </div>
    </form>}
  </div>;
}
