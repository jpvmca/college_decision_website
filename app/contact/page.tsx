'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not send your enquiry');
      setSubmitted(true);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your enquiry');
    } finally {
      setSending(false);
    }
  }
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">GET IN TOUCH</p>
    <h1>Help us keep college information useful</h1>
    <p>Found an outdated fee, incorrect course mapping, missing source or admission detail that needs attention? Send us the exact page and enough evidence for the review team to investigate it responsibly.</p>
    <div className="grid">
      <article className="card"><span className="pill">Corrections</span><h2>Report a data issue</h2><p>Include the institute name, course name, page URL, field that looks incorrect and the official page or document supporting your correction.</p><p><a href="mailto:review@collegedecision.in">review@collegedecision.in</a></p></article>
      <article className="card"><span className="pill">General</span><h2>Ask a question</h2><p>For partnership, editorial or general platform questions, write to our team with a clear subject and the context we need to respond.</p><p><a href="mailto:hello@collegedecision.in">hello@collegedecision.in</a></p></article>
    </div>
    <h2>Send an enquiry</h2>
    {submitted && <div className="notice"><strong>Thank you.</strong> Your enquiry has been received by our team.</div>}
    {error && <div className="modal-error">{error}</div>}
    <form className="enquiry-form" onSubmit={submit}>
      <div className="detail-grid">
        <label>Name<input name="name" required maxLength={120} /></label>
        <label>Email<input name="email" type="email" required maxLength={190} /></label>
        <label>Phone <span className="muted">(optional)</span><input name="phone" maxLength={40} /></label>
        <label>Subject<input name="subject" required maxLength={180} /></label>
      </div>
      <label>Message<textarea name="message" required maxLength={10000} rows={6} /></label>
      <input type="hidden" name="pageUrl" value="/contact" />
      <button className="button primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send enquiry'}</button>
    </form>
    <h2>What makes a useful correction request?</h2>
    <ul><li>Use the official college or university website whenever possible.</li><li>State the academic year, programme and campus connected to the correction.</li><li>Do not send passwords, payment details, identity documents or sensitive student information.</li><li>We review evidence before changing a record; sending a request does not guarantee publication or correction.</li></ul>
    <div className="notice"><strong>Important:</strong> CollegeDecision.in is an information and comparison platform. Contacting us does not create an admission application, counselling relationship or guarantee of admission.</div>
  </div></main>;
}
