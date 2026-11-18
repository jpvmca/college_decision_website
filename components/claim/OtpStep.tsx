'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RECAPTCHA_ENABLED } from '../Recaptcha';

export type OtpChannel = 'email' | 'sms';

type Props = {
  channel: OtpChannel;
  destination: string;
  /** Current reCAPTCHA token (POST /otp/send needs one); reset after each send. */
  getCaptchaToken: () => string | null;
  resetCaptcha: () => void;
  onVerified: (token: string | null) => void;
  verified: boolean;
  disabled?: boolean;
  /** Extra check before sending (e.g. business email only). Return an error message to block. */
  validate?: (destination: string) => string | null;
};

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({})) as { error?: string; data?: Record<string, unknown>; retryAfterSeconds?: number };
  return { ok: response.ok, status: response.status, data };
}

/** "Send code" + "Verify" for one email address or mobile number (OTP purpose: claim). */
export default function OtpStep({ channel, destination, getCaptchaToken, resetCaptcha, onVerified, verified, disabled, validate }: Props) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [masked, setMasked] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // The form dropped the verification (e.g. the server said the token was already used): start over.
  const wasVerified = useRef(verified);
  useEffect(() => {
    if (wasVerified.current && !verified) { setSentTo(null); setCode(''); setError(''); }
    wasVerified.current = verified;
  }, [verified]);

  // Changing the address after a code was sent / verified starts over.
  useEffect(() => {
    if (sentTo !== null && destination.trim().toLowerCase() !== sentTo) {
      setSentTo(null);
      setCode('');
      if (verified) onVerified(null);
    }
  }, [destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = channel === 'email' ? 'email' : 'mobile number';

  const send = async () => {
    setError('');
    const value = destination.trim();
    if (!value) { setError(`Enter your ${label} first.`); return; }
    const blocked = validate?.(value);
    if (blocked) { setError(blocked); return; }
    setBusy(true);
    try {
      const result = await postJson('/api/otp/send', { channel, destination: value, purpose: 'claim', recaptchaToken: getCaptchaToken() || undefined });
      resetCaptcha();
      if (!result.ok) {
        if (result.data.retryAfterSeconds) setCooldown(Math.min(3600, Number(result.data.retryAfterSeconds)));
        setError(result.data.error || 'Could not send the code. Please try again.');
        return;
      }
      setSentTo(value.toLowerCase());
      setMasked(String(result.data.data?.destination || value));
      setCooldown(Number(result.data.data?.resendAfterSeconds) || 60);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError('');
    if (!/^\d{4,8}$/.test(code.trim())) { setError('Enter the code from the message.'); return; }
    setBusy(true);
    try {
      const result = await postJson('/api/otp/verify', { channel, destination: destination.trim(), purpose: 'claim', code: code.trim() });
      if (!result.ok) { setError(result.data.error || 'The code is invalid or has expired.'); return; }
      onVerified(String(result.data.data?.verificationToken || ''));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (verified) {
    return <p className="cl-verified"><CheckCircle2 size={16} aria-hidden="true" /> {channel === 'email' ? 'Email' : 'Mobile number'} verified</p>;
  }

  return <div className="cl-otp">
    <div className="cl-otp-row">
      <button type="button" className="button" onClick={send} disabled={disabled || busy || cooldown > 0}>
        {busy && !sentTo ? 'Sending…' : sentTo ? (cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code') : 'Send code'}
      </button>
      {sentTo && <>
        <input className="cl-otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="6-digit code" aria-label={`Code sent to your ${label}`} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} />
        <button type="button" className="button primary" onClick={verify} disabled={busy || !code}>{busy ? 'Checking…' : 'Verify'}</button>
      </>}
    </div>
    {sentTo && <p className="cl-hint">We sent a code to {masked}. It expires in 10 minutes.{RECAPTCHA_ENABLED ? " Tick “I’m not a robot” again if you need a new code." : ""}</p>}
    {error && <p className="cl-error" role="alert">{error}</p>}
  </div>;
}
