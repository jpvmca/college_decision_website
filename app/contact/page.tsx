'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../../lib/site-nav';
import Recaptcha, { RECAPTCHA_ENABLED, type RecaptchaHandle } from '../../components/Recaptcha';

export default function ContactPage() {
  const captcha = useRef<RecaptchaHandle>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const hasCaptcha = RECAPTCHA_ENABLED && Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const recaptchaToken = captcha.current?.getToken() || undefined;
    if (hasCaptcha && !recaptchaToken) {
      setError('Please complete the "I\'m not a robot" check.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), recaptchaToken })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not send your enquiry');
      setSubmitted(true);
      formElement.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your enquiry');
    } finally {
      captcha.current?.reset();
      setSending(false);
    }
  }
  return <main className="section ls-page"><div className="wrap">
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Contact</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner is-solo">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><Mail size={15} aria-hidden="true" /> Get in touch</span>
          <h1>Help us keep college information useful</h1>
          <p>Found an outdated fee, incorrect course mapping, missing source or admission detail that needs attention? Send us the exact page and enough evidence for the review team to investigate it responsibly.</p>
        </div>
      </div>
    </section>
    <div className="ls-prose">
    <div className="grid">
      <article className="card"><span className="pill">Corrections</span><h2>Report a data issue</h2><p>Include the institute name, course name, page URL, field that looks incorrect and the official page or document supporting your correction.</p><p><a href="mailto:mail@collegedecision.in">mail@collegedecision.in</a></p><p className="muted">Represent a college? <Link href="/for-colleges/claim">Claim your college profile</Link> to verify it and request updates directly. <Link href="/for-colleges/verification-policy">How verification works</Link>.</p></article>
      <article className="card"><span className="pill">General</span><h2>Ask a question</h2><p>For partnership, editorial or general platform questions, write to our team with a clear subject and the context we need to respond.</p><p><a href="mailto:mail@collegedecision.in">mail@collegedecision.in</a></p></article>
    </div>
    <article className="card contact-company">
      <span className="pill">Company details</span>
      <h2><Building2 size={18} aria-hidden="true" /> {COMPANY_INFO.name}</h2>
      <address>
        <p><MapPin size={15} aria-hidden="true" /> {COMPANY_INFO.addressLine}</p>
        {COMPANY_INFO.phone ? <p><Phone size={15} aria-hidden="true" /> <a href={`tel:${COMPANY_INFO.phoneE164}`}>{COMPANY_INFO.phone}</a></p> : null}
        <p><Mail size={15} aria-hidden="true" /> <a href="mailto:mail@collegedecision.in">mail@collegedecision.in</a></p>
        <p className="muted">GSTIN: {COMPANY_INFO.gstin}</p>
      </address>
    </article>
    <h2>Send an enquiry</h2>
    {submitted && <div className="notice"><strong>Thank you.</strong> Your enquiry has been received by our team.</div>}
    {error && <div className="modal-error" role="alert">{error}</div>}
    <form className="enquiry-form" onSubmit={submit}>
      <div className="detail-grid">
        <label>Name<input name="name" required maxLength={120} /></label>
        <label>Email<input name="email" type="email" required maxLength={190} /></label>
        <label>Phone <span className="muted">(optional)</span><input name="phone" maxLength={40} /></label>
        <label>Subject<input name="subject" required maxLength={180} /></label>
      </div>
      <label>Message<textarea name="message" required maxLength={10000} rows={6} /></label>
      <input type="hidden" name="pageUrl" value="/contact" />
      {hasCaptcha ? <Recaptcha ref={captcha} className="enquiry-captcha" /> : null}
      <button className="button primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send enquiry'}</button>
    </form>
    <h2>What makes a useful correction request?</h2>
    <ul><li>Use the official college or university website whenever possible.</li><li>State the academic year, programme and campus connected to the correction.</li><li>Do not send passwords, payment details, identity documents or sensitive student information.</li><li>We review evidence before changing a record; sending a request does not guarantee publication or correction.</li></ul>
    <div className="notice"><strong>Important:</strong> CollegeDecision.in is an information and comparison platform. Contacting us does not create an admission application, counselling relationship or guarantee of admission.</div>
    </div>
  </div></main>;
}
