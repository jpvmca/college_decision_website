'use client';

import { DragEvent, FormEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle, BadgeCheck, Building2, Check, CheckCircle2, ClipboardCheck, Clock, CloudUpload, FileImage, FileText, Loader2, Lock, Mail,
  Search, Send, ShieldCheck, Trash2, UserRound, X
} from 'lucide-react';
import Recaptcha, { RECAPTCHA_ENABLED, type RecaptchaHandle } from '../Recaptcha';
import OtpStep from './OtpStep';
import {
  ACCEPT_DOCS, ClaimCollege, collegeLabel, designationProblem, emailProblem, fileProblem, MAX_FILE_MB, MAX_OTHER_DOCS, nameProblem,
  normalizeIndianMobile, phoneProblem
} from './claim-shared';

type Done = { claimId: number | null; college: ClaimCollege; email: string };

type FieldKey = 'college' | 'name' | 'designation' | 'recaptcha' | 'phone' | 'phoneOtp' | 'email' | 'emailOtp' | 'id_proof' | 'authorization_letter' | 'other' | 'docs' | 'consent';
const FIELD_ORDER: FieldKey[] = ['college', 'name', 'designation', 'recaptcha', 'phone', 'phoneOtp', 'email', 'emailOtp', 'id_proof', 'authorization_letter', 'other', 'docs', 'consent'];
const FIELD_LABELS: Record<FieldKey, string> = {
  college: 'Your college', name: 'Full name', designation: 'Designation', phone: 'Mobile number', phoneOtp: 'Mobile verification code', email: 'Official email',
  emailOtp: 'Email verification code', recaptcha: '“I’m not a robot” check', id_proof: 'ID proof', authorization_letter: 'Authorization letter',
  other: 'Supporting documents', docs: 'Documents', consent: 'Confirmation'
};
/** Backend POST /claims field names -> form fields. */
const SERVER_FIELDS: Record<string, FieldKey> = {
  institute_id: 'college', name: 'name', designation: 'designation', phone: 'phone', official_email: 'email',
  emailVerificationToken: 'emailOtp', phoneVerificationToken: 'phoneOtp', id_proof: 'id_proof', authorization_letter: 'authorization_letter', other: 'other',
  documents: 'docs', consent: 'consent', recaptcha: 'recaptcha'
};
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldError({ id, message }: { id: string; message?: string | null }) {
  if (!message) return null;
  return <p className="cl-field-error" id={id} role="alert"><AlertCircle size={14} aria-hidden="true" /> {message}</p>;
}

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const problem = fileProblem(file);
  const isPdf = /\.pdf$/i.test(file.name);
  const Icon = isPdf ? FileText : FileImage;
  return <li className={`cl-chip${problem ? ' is-bad' : ''}`}>
    <span className={`cl-chip-icon ${isPdf ? 'pdf' : 'img'}`}><Icon size={18} aria-hidden="true" /></span>
    <span className="cl-chip-text"><strong title={file.name}>{file.name}</strong><small>{problem ? 'Cannot be uploaded' : formatSize(file.size)}</small></span>
    {!problem && <Check className="cl-chip-ok" size={16} aria-label="Ready" />}
    <button type="button" className="cl-chip-remove" onClick={onRemove} aria-label={`Remove ${file.name}`}><Trash2 size={15} aria-hidden="true" /></button>
  </li>;
}

/** Drag-and-drop file picker. The real <input type="file"> stays in the DOM (visually hidden) so keyboard, focus and tests work. */
function Dropzone({ id, title, required, help, multiple, files, onAdd, onRemove, max, error }: {
  id: string; title: string; required?: boolean; help: string; multiple?: boolean; files: File[]; max: number; error?: string | null;
  onAdd: (files: File[]) => void; onRemove: (index: number) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const full = files.length >= max;
  const ok = files.length > 0 && !files.some((file) => fileProblem(file));

  const take = (list: FileList | null) => {
    const picked = Array.from(list || []);
    if (picked.length) onAdd(picked);
    if (input.current) input.current.value = '';
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setOver(false);
    if (!full) take(event.dataTransfer.files);
  };

  return <div className={`cl-drop-field${ok && !error ? ' is-done' : ''}${error ? ' is-invalid' : ''}`} id={`${id}-field`}>
    <div className="cl-drop-head">
      <span className="cl-drop-title">{title}</span>
      <span className={`cl-tag${required ? ' req' : ''}`}>{required ? 'Required' : `Optional · up to ${max}`}</span>
    </div>
    <p className="cl-drop-help">{help}</p>
    {!full && <label htmlFor={id} className={`cl-dropzone${over ? ' is-over' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
      <input ref={input} id={id} className="cl-sr cl-file-input" type="file" accept={ACCEPT_DOCS} multiple={multiple} aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => take(event.target.files)} />
      <span className="cl-drop-icon"><CloudUpload size={22} aria-hidden="true" /></span>
      <span className="cl-drop-text"><span className="cl-drop-line"><strong>Drag a file here</strong> or <u>browse</u></span><small>PDF, JPG, PNG or WebP · max {MAX_FILE_MB} MB{multiple ? ` · ${max - files.length} more allowed` : ''}</small></span>
    </label>}
    {files.length > 0 && <ul className="cl-chips">{files.map((file, index) => <FileChip key={`${file.name}-${file.size}-${index}`} file={file} onRemove={() => onRemove(index)} />)}</ul>}
    <FieldError id={`${id}-error`} message={error} />
  </div>;
}

function Section({ id, n, title, icon, done, children, subtitle }: { id: string; n: number; title: string; icon: ReactNode; done: boolean; subtitle?: string; children: ReactNode }) {
  return <fieldset id={id} className={`cl-section${done ? ' is-done' : ''}`}>
    <legend className="cl-sr">{`Step ${n}: ${title}`}</legend>
    <div className="cl-section-head" aria-hidden="true">
      <span className="cl-step">{done ? <Check size={15} /> : n}</span>
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      <span className="cl-section-icon">{icon}</span>
    </div>
    <div className="cl-section-body">{children}</div>
  </fieldset>;
}

export default function ClaimForm({ initialCollege, phoneOtpRequired = true }: { initialCollege: ClaimCollege | null; phoneOtpRequired?: boolean }) {
  const [college, setCollege] = useState<ClaimCollege | null>(initialCollege);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClaimCollege[]>([]);
  const [searching, setSearching] = useState(false);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [letter, setLetter] = useState<File | null>(null);
  const [others, setOthers] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);

  const captcha = useRef<RecaptchaHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Done | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [attempted, setAttempted] = useState(false);
  const uid = useId().replace(/:/g, '');

  const ids: Record<FieldKey, string> = {
    college: college ? `${uid}-college` : 'cl-college', name: `${uid}-name`, designation: `${uid}-designation`, phone: `${uid}-phone`, phoneOtp: `${uid}-phone-otp`,
    email: `${uid}-email`, emailOtp: `${uid}-otp`, recaptcha: `${uid}-captcha`, id_proof: `${uid}-id`, authorization_letter: `${uid}-letter`,
    other: `${uid}-other`, docs: `${uid}-docs`, consent: `${uid}-consent`
  };

  useEffect(() => {
    const term = query.trim();
    if (college || term.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/claims/college-search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const body = await response.json().catch(() => ({})) as { data?: ClaimCollege[] };
        setResults(Array.isArray(body.data) ? body.data : []);
      } catch {
        // aborted / offline: keep the old list
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query, college]);

  const emailDomain = email.includes('@') ? email.split('@')[1]?.trim().toLowerCase() : '';
  const domainHint = college?.websiteDomain && emailDomain && !(emailDomain === college.websiteDomain || emailDomain.endsWith(`.${college.websiteDomain}`) || college.websiteDomain.endsWith(`.${emailDomain}`))
    ? `This email is not on ${college.websiteDomain}, the domain of the college website we have on file. You can still continue; our team will check it manually.`
    : '';

  // reCAPTCHA is required whenever it is enabled, configured and has loaded (if it fails to load, the backend decides).
  const captchaRequired = RECAPTCHA_ENABLED && Boolean(SITE_KEY) && captchaReady !== false;
  const clientErrors: Partial<Record<FieldKey, string>> = {};
  if (!college) clientErrors.college = 'Search for your college and pick it from the list.';
  const nameErr = nameProblem(name); if (nameErr) clientErrors.name = nameErr;
  const designationErr = designationProblem(designation); if (designationErr) clientErrors.designation = designationErr;
  const phoneErr = phoneProblem(phone); if (phoneErr) clientErrors.phone = phoneErr;
  if (phoneOtpRequired && !phoneToken) clientErrors.phoneOtp = phoneErr ? 'Enter a valid mobile number, then verify it with the code we send by SMS.' : 'Click “Send code” and enter the 6-digit code from the SMS to verify this number.';
  const emailErr = emailProblem(email); if (emailErr) clientErrors.email = emailErr;
  if (!emailToken) clientErrors.emailOtp = emailErr ? 'Enter a valid official email, then verify it with the code we send.' : 'Click “Send code” and enter the code from the email to verify this address.';
  if (captchaRequired && !captchaToken) clientErrors.recaptcha = 'Tick “I’m not a robot”. It expires after 2 minutes and resets after a code is sent, so tick it again if needed.';
  const idErr = idProof ? fileProblem(idProof) : 'Upload your ID proof (college ID card or a government photo ID).'; if (idErr) clientErrors.id_proof = idErr;
  const letterErr = letter ? fileProblem(letter) : 'Upload the authorization letter on college letterhead.'; if (letterErr) clientErrors.authorization_letter = letterErr;
  const othersErr = others.length > MAX_OTHER_DOCS ? `Upload at most ${MAX_OTHER_DOCS} supporting documents.` : others.map(fileProblem).find(Boolean); if (othersErr) clientErrors.other = othersErr;
  if (!consent) clientErrors.consent = 'Please confirm that you are authorised to represent this college.';

  const shown = (key: FieldKey) => serverErrors[key] || ((touched[key] || attempted) ? clientErrors[key] : undefined) || null;
  const touch = (key: FieldKey) => setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  const edited = (key: FieldKey) => setServerErrors((prev) => {
    if (!prev[key] && !(key === 'id_proof' || key === 'authorization_letter' || key === 'other') ) return prev;
    const next = { ...prev }; delete next[key];
    if (key === 'id_proof' || key === 'authorization_letter' || key === 'other') delete next.docs;
    return next;
  });
  const missing = FIELD_ORDER.filter((key) => clientErrors[key]);

  const focusField = (key: FieldKey) => {
    const target = document.getElementById(ids[key]);
    const box = (key === 'id_proof' || key === 'authorization_letter' || key === 'other') ? document.getElementById(`${ids[key]}-field`) : target;
    (box || target)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
  };

  const steps = [
    { id: `${uid}-s1`, label: 'College', done: !clientErrors.college },
    { id: `${uid}-s2`, label: 'About you', done: !clientErrors.name && !clientErrors.designation },
    { id: `${uid}-s3`, label: phoneOtpRequired ? 'Mobile & email' : 'Contact', short: phoneOtpRequired ? 'Contact' : '', done: Boolean(emailToken) && !clientErrors.phone && (!phoneOtpRequired || Boolean(phoneToken)) },
    { id: `${uid}-s4`, label: 'Documents', done: !clientErrors.id_proof && !clientErrors.authorization_letter && !clientErrors.other },
    { id: `${uid}-s5`, label: 'Submit', done: consent }
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const current = steps.findIndex((step) => !step.done);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setAttempted(true);
    const firstInvalid = FIELD_ORDER.find((key) => clientErrors[key] || serverErrors[key]);
    if (firstInvalid) {
      setError(`Please fix ${missing.length === 1 ? 'the highlighted field' : `the ${Math.max(missing.length, 1)} highlighted fields`} before submitting.`);
      focusField(firstInvalid);
      return;
    }
    if (!college || !emailToken || (phoneOtpRequired && !phoneToken) || !idProof || !letter) return;
    const honeypot = (event.currentTarget.elements.namedItem('company_website') as HTMLInputElement | null)?.value || '';
    const form = new FormData();
    form.set('institute_id', String(college.id));
    form.set('name', name.trim().replace(/\s+/g, ' '));
    form.set('designation', designation.trim());
    form.set('official_email', email.trim());
    form.set('phone', normalizeIndianMobile(phone) || phone.trim());
    form.set('emailVerificationToken', emailToken);
    if (phoneToken) form.set('phoneVerificationToken', phoneToken);
    form.set('consent', consent ? 'true' : '');
    form.set('company_website', honeypot);
    const token = captcha.current?.getToken();
    if (token) form.set('recaptchaToken', token);
    form.append('id_proof', idProof);
    form.append('authorization_letter', letter);
    others.slice(0, MAX_OTHER_DOCS).forEach((file) => form.append('other', file));
    setSubmitting(true);
    try {
      const response = await fetch('/api/claims', { method: 'POST', body: form });
      const body = await response.json().catch(() => ({})) as { error?: string; code?: string; field?: string; fields?: Record<string, string>; data?: { claimId?: number | null } };
      if (!response.ok) {
        const mapped: Partial<Record<FieldKey, string>> = {};
        for (const [field, message] of Object.entries(body.fields || (body.field && body.error ? { [body.field]: body.error } : {}))) {
          const key = SERVER_FIELDS[field];
          if (key) mapped[key] = message;
        }
        if (body.code?.startsWith('recaptcha')) mapped.recaptcha = body.error || 'Please complete the “I’m not a robot” check.';
        if (body.code === 'file_too_large' && !Object.keys(mapped).length) mapped.docs = body.error || `Each file must be ${MAX_FILE_MB} MB or smaller.`;
        // A spent ("already used"), expired or mismatched verification needs a fresh code.
        if (body.code === 'email_not_verified') mapped.emailOtp = `${body.error || 'This email verification was already used.'} Click “Send code” to get a new code.`;
        if (body.code === 'phone_not_verified') mapped.phoneOtp = `${body.error || 'This mobile verification was already used.'} Click “Send code” to get a new code.`;
        if (mapped.emailOtp) setEmailToken(null);
        if (mapped.phoneOtp) setPhoneToken(null);
        setServerErrors(mapped);
        setError(body.error || 'Could not submit the claim. Please try again.');
        const first = FIELD_ORDER.find((key) => mapped[key]);
        if (first) window.setTimeout(() => focusField(first), 50);
        return;
      }
      setDone({ claimId: body.data?.claimId ?? null, college, email: email.trim() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      captcha.current?.reset();
      setSubmitting(false);
    }
  };

  const aside = <aside className="cl-aside">
    <div className="cl-card cl-aside-college">
      <p className="cl-eyebrow">Claiming</p>
      {college ? <div className="cl-aside-pick">
        <span className="cl-avatar"><Building2 size={20} aria-hidden="true" /></span>
        <div><strong>{college.name}</strong><small>{[college.city, college.state].filter(Boolean).join(', ') || 'India'}</small>
          {college.websiteDomain && <small className="cl-domain">{college.websiteDomain}</small>}</div>
      </div> : <p className="cl-muted">Choose your college in step 1.</p>}
      <div className="cl-progress" aria-label={`${doneCount} of 5 steps complete`}>
        <div className="cl-progress-bar"><span style={{ width: `${doneCount * 20}%` }} /></div>
        <small>{doneCount} of 5 steps complete</small>
      </div>
    </div>
    <div className="cl-card cl-next">
      <h2>What happens next</h2>
      <ol className="cl-timeline">
        <li><span><Send size={14} aria-hidden="true" /></span><div><strong>You submit the claim</strong><small>We email a confirmation with your reference number.</small></div></li>
        <li><span><ClipboardCheck size={14} aria-hidden="true" /></span><div><strong>We review it</strong><small>Our team checks your email domain and documents, usually in 2 to 3 working days.</small></div></li>
        <li><span><BadgeCheck size={14} aria-hidden="true" /></span><div><strong>Profile verified</strong><small>The profile gets a “Verified by college” badge and you can sign in to the college panel.</small></div></li>
      </ol>
    </div>
    <div className="cl-card cl-good">
      <h2>Good to know</h2>
      <ul>
        <li><Check size={14} aria-hidden="true" /> Each college has one owner account.</li>
        <li><Check size={14} aria-hidden="true" /> Claiming never changes ratings, reviews or rankings.</li>
        <li><Check size={14} aria-hidden="true" /> Documents are private and used only for verification.</li>
      </ul>
      <Link className="cl-more" href="/for-colleges/verification-policy">Read the verification policy →</Link>
    </div>
  </aside>;

  if (done) {
    return <div className="cl-layout">
      <section className="cl-card cl-done" aria-live="polite">
        <span className="cl-done-icon"><CheckCircle2 size={38} aria-hidden="true" /></span>
        <h2>Thank you, your claim is in review</h2>
        <p>We received your claim for <strong>{done.college.name}</strong>{done.claimId ? <> (reference #{done.claimId})</> : null}. A confirmation has been sent to <strong>{done.email}</strong>.</p>
        <p>Our team checks every claim against the college website and your documents, usually within 2 to 3 working days. If we need anything else we will email you.</p>
        <div className="cl-actions">{done.college.slug && <Link className="button primary" href={`/colleges/${done.college.slug}`}>Back to the college profile</Link>}<Link className="button" href="/for-colleges/verification-policy">How verification works</Link></div>
      </section>
      {aside}
    </div>;
  }

  const inputProps = (key: FieldKey) => ({
    id: ids[key],
    'aria-invalid': Boolean(shown(key)),
    'aria-describedby': shown(key) ? `${ids[key]}-error` : undefined,
    onBlur: () => touch(key),
    className: shown(key) ? 'is-invalid' : undefined
  });

  return <div className="cl-layout">
    <form className="cl-form" onSubmit={submit} noValidate>
      <nav className="cl-card cl-stepper" aria-label="Claim steps">
        <ol>
          {steps.map((step, index) => <li key={step.id} className={step.done ? 'is-done' : index === current ? 'is-current' : ''}>
            <a href={`#${step.id}`}><span className="cl-dot">{step.done ? <Check size={14} aria-hidden="true" /> : index + 1}</span><span className="cl-step-label">{'short' in step && step.short ? <><span className="cl-step-full">{step.label}</span><span className="cl-step-short" aria-hidden="true">{step.short}</span></> : step.label}</span></a>
          </li>)}
        </ol>
      </nav>

      <Section id={steps[0].id} n={1} title="Your college" subtitle="The profile you want to claim" icon={<Building2 size={18} />} done={steps[0].done}>
        {college ? <div className="cl-selected" id={ids.college} tabIndex={-1}>
          <span className="cl-avatar"><Building2 size={20} aria-hidden="true" /></span>
          <div><strong>{college.name}</strong><small>{[college.city, college.state].filter(Boolean).join(', ')}{college.websiteDomain ? ` · ${college.websiteDomain}` : ''}</small></div>
          <button type="button" className="cl-link" onClick={() => { setCollege(null); setQuery(''); }}><X size={14} aria-hidden="true" /> Change</button>
        </div> : <div className="cl-search">
          <label htmlFor="cl-college">Search for your college</label>
          <div className={`cl-search-box${shown('college') ? ' is-invalid' : ''}`}><Search size={16} aria-hidden="true" /><input id="cl-college" type="search" autoComplete="off" placeholder="Type the college name" value={query}
            aria-invalid={Boolean(shown('college'))} aria-describedby={shown('college') ? 'cl-college-error' : undefined}
            onBlur={() => touch('college')} onChange={(event) => setQuery(event.target.value)} />{searching && <Loader2 className="cl-spin" size={16} aria-hidden="true" />}</div>
          {searching && <p className="cl-hint">Searching…</p>}
          {results.length > 0 && <ul className="cl-results" role="listbox" aria-label="Colleges">
            {results.map((item) => <li key={item.id}><button type="button" role="option" aria-selected="false" onClick={() => { setCollege(item); setResults([]); edited('college'); }}><Building2 size={15} aria-hidden="true" /> {collegeLabel(item)}</button></li>)}
          </ul>}
          {!searching && query.trim().length >= 2 && results.length === 0 && <p className="cl-hint">No published college matches “{query.trim()}”. Check the spelling or contact us.</p>}
          <FieldError id="cl-college-error" message={shown('college')} />
        </div>}
        {college && <FieldError id={`${ids.college}-error`} message={serverErrors.college} />}
      </Section>

      <Section id={steps[1].id} n={2} title="About you" subtitle="So our team knows who to contact" icon={<UserRound size={18} />} done={steps[1].done}>
        <div className="cl-grid">
          <div className="cl-field"><label htmlFor={ids.name}>Full name</label>
            <input {...inputProps('name')} required autoComplete="name" maxLength={100} placeholder="Your full name" value={name} onChange={(event) => { setName(event.target.value); edited('name'); }} />
            <FieldError id={`${ids.name}-error`} message={shown('name')} /></div>
          <div className="cl-field"><label htmlFor={ids.designation}>Designation</label>
            <input {...inputProps('designation')} required placeholder="e.g. Registrar, Admissions Head" maxLength={120} value={designation} onChange={(event) => { setDesignation(event.target.value); edited('designation'); }} />
            <FieldError id={`${ids.designation}-error`} message={shown('designation')} /></div>
        </div>
        <input type="text" name="company_website" className="cl-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </Section>

      <Section id={steps[2].id} n={3} title={phoneOtpRequired ? 'Verify your mobile and official email' : 'Verify your official email'} subtitle={phoneOtpRequired ? 'We send a one-time code by SMS and to your college address' : 'We send a one-time code to your college address'} icon={<Mail size={18} />} done={steps[2].done}>
        {RECAPTCHA_ENABLED ? <div id={ids.recaptcha} tabIndex={-1} className={`cl-captcha-wrap${shown('recaptcha') ? ' is-invalid' : ''}`}>
          <Recaptcha ref={captcha} className="cl-captcha" onToken={(token) => { setCaptchaToken(token); if (token) edited('recaptcha'); }} onReady={setCaptchaReady} />
          <p className="cl-hint">Tick this before each “Send code”. It resets after every code we send.</p>
          <FieldError id={`${ids.recaptcha}-error`} message={shown('recaptcha')} />
        </div> : null}
        <div className="cl-verify-block">
          <div className="cl-field"><label htmlFor={ids.phone}>Mobile number</label>
            <div className="cl-phone-input"><span aria-hidden="true">+91</span>
              <input {...inputProps('phone')} required type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" maxLength={16} value={phone} disabled={Boolean(phoneToken)}
                onChange={(event) => { setPhone(event.target.value); edited('phone'); edited('phoneOtp'); }}
                onBlur={() => { touch('phone'); const normal = normalizeIndianMobile(phone); if (normal) setPhone(normal); }} /></div>
            {shown('phone') ? <FieldError id={`${ids.phone}-error`} message={shown('phone')} /> : <p className="cl-hint">10-digit Indian mobile starting with 6, 7, 8 or 9. Our team may call this number to confirm the claim.</p>}</div>
          {phoneOtpRequired ? <div id={ids.phoneOtp} tabIndex={-1} className="cl-otp-wrap">
            <OtpStep channel="sms" destination={normalizeIndianMobile(phone) || phone} verified={Boolean(phoneToken)} onVerified={(token) => { setPhoneToken(token); edited('phoneOtp'); }}
              getCaptchaToken={() => captcha.current?.getToken() || null} resetCaptcha={() => captcha.current?.reset()}
              validate={(value) => phoneProblem(value)} />
            {phoneToken ? <button type="button" className="cl-link" onClick={() => { setPhoneToken(null); }}>Change number</button> : null}
            {!phoneToken && <FieldError id={`${ids.phoneOtp}-error`} message={shown('phoneOtp')} />}
          </div> : null}
        </div>
        <div className="cl-field"><label htmlFor={ids.email}>Official college email</label>
          <input {...inputProps('email')} required type="email" autoComplete="email" placeholder={college?.websiteDomain ? `name@${college.websiteDomain}` : 'name@yourcollege.ac.in'} maxLength={190} value={email}
            onChange={(event) => { setEmail(event.target.value); edited('email'); edited('emailOtp'); }} disabled={Boolean(emailToken)} />
          {shown('email') ? <FieldError id={`${ids.email}-error`} message={shown('email')} />
            : domainHint && !clientErrors.email ? <p className="cl-warn">{domainHint}</p>
              : <p className="cl-hint">Use an address on your college’s own domain. Personal addresses (Gmail, Yahoo, Outlook…) are not accepted.</p>}
        </div>
        <div id={ids.emailOtp} tabIndex={-1} className="cl-otp-wrap">
          <OtpStep channel="email" destination={email} verified={Boolean(emailToken)} onVerified={(token) => { setEmailToken(token); edited('emailOtp'); }}
            getCaptchaToken={() => captcha.current?.getToken() || null} resetCaptcha={() => captcha.current?.reset()}
            validate={(value) => emailProblem(value)} />
          {!emailToken && <FieldError id={`${ids.emailOtp}-error`} message={shown('emailOtp')} />}
        </div>
      </Section>

      <Section id={steps[3].id} n={4} title="Verification documents" subtitle="Stored privately and seen only by our verification team" icon={<FileText size={18} />} done={steps[3].done}>
        <div className="cl-drops">
          <div className="cl-drops-pair">
          <Dropzone id={ids.id_proof} title="ID proof" required help="Your college ID card or a government photo ID" max={1} error={shown('id_proof')}
            files={idProof ? [idProof] : []} onAdd={(files) => { setIdProof(files[0] || null); touch('id_proof'); edited('id_proof'); }} onRemove={() => { setIdProof(null); touch('id_proof'); }} />
          <Dropzone id={ids.authorization_letter} title="Authorization letter" required help="On college letterhead, signed by the principal, director or registrar, naming you as the contact for this profile" max={1} error={shown('authorization_letter')}
            files={letter ? [letter] : []} onAdd={(files) => { setLetter(files[0] || null); touch('authorization_letter'); edited('authorization_letter'); }} onRemove={() => { setLetter(null); touch('authorization_letter'); }} />
          </div>
          <Dropzone id={ids.other} title="Other supporting documents" multiple help="For example an appointment letter or a screenshot of the college website listing you" max={MAX_OTHER_DOCS} error={shown('other')}
            files={others} onAdd={(files) => { setOthers((prev) => [...prev, ...files].slice(0, MAX_OTHER_DOCS)); touch('other'); edited('other'); }} onRemove={(index) => setOthers((prev) => prev.filter((_, i) => i !== index))} />
        </div>
        <div id={ids.docs} tabIndex={-1}><FieldError id={`${ids.docs}-error`} message={serverErrors.docs} /></div>
        <p className="cl-secure"><Lock size={14} aria-hidden="true" /> Files are encrypted in transit and kept in private storage. They are never shown on the public profile.</p>
      </Section>

      <Section id={steps[4].id} n={5} title="Confirm and submit" icon={<ShieldCheck size={18} />} done={steps[4].done}>
        <label className={`cl-check${consent ? ' is-on' : ''}${shown('consent') ? ' is-invalid' : ''}`}>
          <input id={ids.consent} type="checkbox" checked={consent} aria-invalid={Boolean(shown('consent'))} aria-describedby={shown('consent') ? `${ids.consent}-error` : undefined}
            onChange={(event) => { setConsent(event.target.checked); touch('consent'); edited('consent'); }} />
          <span className="cl-box" aria-hidden="true"><Check size={14} /></span>
          <span>I confirm that I am authorised to represent this college, that the information and documents are genuine, and I agree to the <Link href="/for-colleges/verification-policy" target="_blank">verification policy</Link> and <Link href="/privacy-policy" target="_blank">privacy policy</Link>.</span>
        </label>
        <FieldError id={`${ids.consent}-error`} message={shown('consent')} />
        {missing.length > 0 && <div className="cl-missing" aria-live="polite">
          <strong>Still needed before you can submit</strong>
          <ul>{missing.map((key) => <li key={key}><button type="button" onClick={() => { touch(key); focusField(key); }}>{FIELD_LABELS[key]}</button></li>)}</ul>
        </div>}
        {!missing.length && <p className="cl-ready"><CheckCircle2 size={15} aria-hidden="true" /> Everything looks good. You can submit your claim.</p>}
        {RECAPTCHA_ENABLED ? <p className="cl-hint"><Clock size={13} aria-hidden="true" /> Tick “I’m not a robot” in step 3 again before submitting if it has expired.</p> : null}
        {error && <p className="cl-error" role="alert">{error}</p>}
        <div className="cl-submit-row">
          <button type="submit" className="button primary cl-submit" disabled={submitting} aria-busy={submitting} data-incomplete={missing.length > 0 || undefined}>
            {submitting ? <><Loader2 className="cl-spin" size={18} aria-hidden="true" /> Submitting…</> : <><Send size={17} aria-hidden="true" /> Submit claim</>}
          </button>
          <p className="cl-lock"><Lock size={14} aria-hidden="true" /> Private and secure. Your documents are used only to verify this claim.</p>
        </div>
      </Section>
    </form>
    {aside}
  </div>;
}
