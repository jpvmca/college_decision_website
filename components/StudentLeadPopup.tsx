'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LEAD_TRACKED_KEY, LEAD_UTM_KEY, courseFromContext, geoIsFresh, loadCities, loadFormOptions, locationFromSlug, pageContext, readPrefs, slugify, writePrefs,
  type FormCity, type FormOptions, type GeoInfo
} from '../lib/student-lead';
import { APPLY_OPEN_EVENT, markApplied, type ApplyRequest } from '../lib/college-apply';
import { suggestEmail, validateEmail, validateMobile, validateName } from '../lib/lead-validation';

// Delay (seconds) before the popup opens; set NEXT_PUBLIC_STUDENT_POPUP_DELAY_SECONDS in .env (default 5, 0 allowed).
const SHOW_AFTER_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_STUDENT_POPUP_DELAY_SECONDS;
  const n = raw == null || raw.trim() === "" ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n * 1000 : 5000;
})();
/** Pages where a popup would get in the way of a task the visitor is already doing. */
const NO_POPUP = /^\/(contact|privacy-policy|terms-and-conditions|disclaimer)(\/|$)/;

type Field = 'name' | 'mobile' | 'email' | 'courseId' | 'stateId' | 'cityId';
type Errors = Partial<Record<Field | 'form', string>>;
const FIELD_ORDER: Field[] = ['name', 'mobile', 'email', 'courseId', 'stateId', 'cityId'];

export default function StudentLeadPopup() {
  const pathname = usePathname() || '/';
  const ctx = useMemo(() => pageContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [cities, setCities] = useState<FormCity[]>([]);
  const [country, setCountry] = useState<{ id: number | null; code: string; name: string | null; phoneCode: string | null }>({ id: null, code: 'IN', name: 'India', phoneCode: '+91' });
  const [form, setForm] = useState({ name: '', mobile: '', email: '', courseId: '', stateId: '', cityId: '', website: '' });
  const [editingLocation, setEditingLocation] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const openedAt = useRef(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const inFlight = useRef(new Set<string>());
  /** Set when opened from an Apply button: limits courses to the college's and records an apply request. */
  const [apply, setApply] = useState<ApplyRequest | null>(null);

  // First-touch UTM parameters for this browser session.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm = { utmSource: params.get('utm_source'), utmMedium: params.get('utm_medium'), utmCampaign: params.get('utm_campaign') };
      if ((utm.utmSource || utm.utmMedium || utm.utmCampaign) && !window.sessionStorage.getItem(LEAD_UTM_KEY)) {
        window.sessionStorage.setItem(LEAD_UTM_KEY, JSON.stringify(utm));
      }
    } catch { /* storage blocked */ }
  }, []);

  // Browsing a course-specific page updates the remembered interest (used by college profiles too).
  useEffect(() => {
    if (!ctx.courseKey && !ctx.courseSlug) return;
    let cancelled = false;
    loadFormOptions().then((opts) => {
      const course = opts && courseFromContext(ctx, opts.courses);
      if (!cancelled && course) writePrefs({ courseId: course.id });
    });
    return () => { cancelled = true; };
  }, [ctx]);

  // Until the student registers: show after NEXT_PUBLIC_STUDENT_POPUP_DELAY_SECONDS on every page view (initial load and each client-side navigation).
  useEffect(() => {
    if (readPrefs().submittedAt || NO_POPUP.test(pathname)) return;
    const timer = window.setTimeout(() => {
      if (!readPrefs().submittedAt) setOpen(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const manual = () => { if (!readPrefs().submittedAt) setOpen(true); };
    const onApply = (e: Event) => {
      const req = (e as CustomEvent<ApplyRequest>).detail;
      if (!req?.collegeSlug) return;
      setApply(req);
      setDone(false);
      setErrors({});
      setForm((f) => ({ ...f, courseId: req.courseId ? String(req.courseId) : (req.courses[0] ? String(req.courses[0].id) : '') }));
      setOpen(true);
    };
    window.addEventListener('cd-open-lead-form', manual);
    window.addEventListener(APPLY_OPEN_EVENT, onApply);
    return () => { window.removeEventListener('cd-open-lead-form', manual); window.removeEventListener(APPLY_OPEN_EVENT, onApply); };
  }, []);

  // Registered students: record interest in each college profile they open (once per college per session).
  useEffect(() => {
    if (ctx.pageType !== 'college_profile' || !ctx.collegeSlug) return;
    const { token } = readPrefs();
    if (!token) return;
    let seen: string[] = [];
    try { seen = JSON.parse(window.sessionStorage.getItem(LEAD_TRACKED_KEY) || '[]'); } catch { /* ignore */ }
    if (seen.includes(ctx.collegeSlug)) return;
    const slug = ctx.collegeSlug;
    if (inFlight.current.has(slug)) return;
    inFlight.current.add(slug);
    fetch('/api/students/track-college', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, collegeSlug: slug }), keepalive: true })
      .then((r) => {
        if (r.status === 401) writePrefs({ token: null });
        if (r.ok) {
          try { window.sessionStorage.setItem(LEAD_TRACKED_KEY, JSON.stringify([...seen, slug].slice(-200))); } catch { /* ignore */ }
        }
      })
      .catch(() => undefined)
      .finally(() => inFlight.current.delete(slug));
  }, [ctx]);

  const selectState = useCallback(async (stateId: string, cityId = '') => {
    setForm((f) => ({ ...f, stateId, cityId }));
    setCities([]);
    if (stateId) setCities(await loadCities(Number(stateId)));
  }, []);

  // On open: load cached options, then prefill course + location (page first, then saved/IP location).
  useEffect(() => {
    if (!open) return;
    openedAt.current = Date.now();
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 50);
    let cancelled = false;
    (async () => {
      const prefs = readPrefs();
      const [opts, geo] = await Promise.all([
        loadFormOptions(),
        geoIsFresh(prefs) ? Promise.resolve(null) : fetch('/api/students/geo').then((r) => (r.ok ? r.json() : null)).then((j) => (j?.data as GeoInfo) || null).catch(() => null)
      ]);
      if (!opts || cancelled) return;
      setOptions(opts);
      const draft = prefs.draft || {};
      let saved = prefs;
      if (geo?.countryId) {
        saved = writePrefs({
          countryId: geo.countryId, countryCode: geo.countryCode, phoneCode: geo.phoneCode, geoAt: Date.now(),
          ...(prefs.stateId ? {} : { stateId: geo.stateId, stateName: geo.stateName, cityId: geo.cityId, cityName: geo.cityName })
        });
      }
      const code = saved.countryCode || 'IN';
      setCountry({ id: saved.countryId || opts.indiaCountryId, code, name: code === 'IN' ? 'India' : geo?.countryName || code, phoneCode: saved.phoneCode || (code === 'IN' ? '+91' : null) });

      const pageCourse = courseFromContext(ctx, opts.courses);
      const known = (id: unknown) => opts.courses.some((c) => String(c.id) === String(id));
      const applyCourse = apply ? (apply.courseId || apply.courses[0]?.id || null) : null;
      const courseId = applyCourse || pageCourse?.id || (known(draft.courseId) ? draft.courseId : null) || (known(saved.courseId) ? saved.courseId : null);
      setForm((f) => ({ ...f, name: f.name || draft.name || '', mobile: f.mobile || draft.mobile || '', email: f.email || draft.email || '', courseId: courseId ? String(courseId) : f.courseId }));

      if (code !== 'IN') return;
      // A location listing page (e.g. /mba-colleges-in-pune-maharashtra) wins over the IP location.
      const fromPage = ctx.locationSlug ? locationFromSlug(ctx.locationSlug, opts.states) : null;
      if (fromPage) {
        const list = await loadCities(fromPage.state.id);
        setCities(list);
        const city = fromPage.citySlug ? list.find((c) => c.slug === fromPage.citySlug || slugify(c.name) === fromPage.citySlug) : null;
        setForm((f) => ({ ...f, stateId: String(fromPage.state.id), cityId: city ? String(city.id) : '' }));
        return;
      }
      if (draft.stateId && opts.states.some((s) => String(s.id) === draft.stateId)) {
        await selectState(draft.stateId, draft.cityId || '');
      } else if (saved.stateId && opts.states.some((s) => s.id === saved.stateId)) {
        await selectState(String(saved.stateId), saved.cityId ? String(saved.cityId) : '');
      } else {
        setEditingLocation(true);
      }
    })();
    return () => { cancelled = true; };
  }, [open, ctx, selectState, apply]);

  // Keep partially entered details so the form stays filled on the next page.
  useEffect(() => {
    if (!open || done) return;
    const { website: _hp, ...draft } = form;
    void _hp;
    const timer = window.setTimeout(() => writePrefs({ draft }), 300);
    return () => window.clearTimeout(timer);
  }, [form, open, done]);

  const close = useCallback(() => { setOpen(false); setApply(null); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const isIndia = country.code === 'IN';
  const stateName = options?.states.find((s) => String(s.id) === form.stateId)?.name || '';
  const cityName = cities.find((c) => String(c.id) === form.cityId)?.name || '';
  // Auto-detected location shows as a chip; selects appear when editing or when state/city is missing.
  const cityRequired = isIndia && Boolean(form.stateId) && cities.length > 0;
  const showLocationText = isIndia && !editingLocation && Boolean(form.stateId) && (Boolean(form.cityId) || !cityRequired);
  const emailHint = !errors.email ? suggestEmail(form.email) : null;

  function fieldError(field: Field, f = form): string | undefined {
    switch (field) {
      case 'name': return validateName(f.name).error;
      case 'mobile': return validateMobile(f.mobile, isIndia, country.phoneCode).error;
      case 'email': return validateEmail(f.email).error;
      case 'courseId': return f.courseId ? undefined : 'Please select the course you are interested in';
      case 'stateId': return isIndia && !f.stateId ? 'Please select your state' : undefined;
      case 'cityId': return isIndia && f.stateId && cities.length && !f.cityId ? 'Please select your city' : undefined;
    }
  }

  function validateAll(): Errors {
    const e: Errors = {};
    for (const field of FIELD_ORDER) { const msg = fieldError(field); if (msg) e[field] = msg; }
    return e;
  }

  function focusField(field: string) {
    if ((field === 'stateId' || field === 'cityId') && !editingLocation) setEditingLocation(true);
    window.setTimeout(() => formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus(), 30);
  }

  const blur = (field: Field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((er) => ({ ...er, [field]: fieldError(field) }));
    if (field === 'name') setForm((f) => ({ ...f, name: f.name.trim().replace(/\s+/g, ' ') }));
    if (field === 'email') setForm((f) => ({ ...f, email: f.email.trim().toLowerCase() }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    const found = validateAll();
    setErrors(found);
    setTouched({ name: true, mobile: true, email: true, courseId: true, stateId: true, cityId: true });
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) { focusField(first); return; }
    setSubmitting(true);
    let utm: Record<string, string | null> = {};
    try { utm = JSON.parse(window.sessionStorage.getItem(LEAD_UTM_KEY) || '{}'); } catch { /* ignore */ }
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: validateName(form.name).value, email: validateEmail(form.email).value,
          mobile: validateMobile(form.mobile, isIndia, country.phoneCode).value,
          courseId: Number(form.courseId), countryCode: country.code,
          stateId: isIndia ? Number(form.stateId) || null : null, cityId: isIndia ? Number(form.cityId) || null : null,
          collegeSlug: apply ? apply.collegeSlug : ctx.pageType === 'college_profile' || ctx.pageType === 'college_cutoff' ? ctx.collegeSlug : null,
          apply: Boolean(apply),
          pageUrl: `${window.location.pathname}`.slice(0, 255), pageType: ctx.pageType, cta: apply ? 'apply_button' : 'popup_auto_5s',
          website: form.website, elapsedMs: Date.now() - openedAt.current, ...utm
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Map server field errors onto the fields; anything else shows above the button.
        const serverErrors: Errors = {};
        if (json.errors && typeof json.errors === 'object') {
          for (const [k, v] of Object.entries(json.errors as Record<string, string>)) if (FIELD_ORDER.includes(k as Field)) serverErrors[k as Field] = v;
        } else if (json.field && FIELD_ORDER.includes(json.field)) serverErrors[json.field as Field] = json.error;
        if (!Object.keys(serverErrors).length) serverErrors.form = res.status === 429 ? (json.error || 'Too many attempts. Please try again later.') : (json.error || 'Something went wrong. Please try again.');
        setErrors(serverErrors);
        const firstServer = FIELD_ORDER.find((f) => serverErrors[f]);
        if (firstServer) focusField(firstServer);
        return;
      }
      const d = json.data || {};
      writePrefs({
        submittedAt: Date.now(), courseId: Number(form.courseId), token: d.token || null, draft: {},
        ...(isIndia ? { stateId: Number(form.stateId) || null, stateName, cityId: Number(form.cityId) || null, cityName: cityName || null } : {}),
        ...(d.countryId ? { countryId: d.countryId } : {})
      });
      if (apply) markApplied(apply.collegeSlug, [Number(form.courseId)]);
      setDone(true);
    } catch {
      setErrors({ form: 'We couldn’t reach the server. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    if (key === 'mobile') {
      if (isIndia) {
        // Digits only; a pasted "+91 98765 43210" or "098765..." keeps just the 10-digit number.
        let digits = value.replace(/\D/g, '');
        if (digits.length > 10) digits = digits.replace(/^(91|0)/, '');
        value = digits.slice(0, 10);
      } else value = value.replace(/[^\d+]/g, '').slice(0, 16);
    }
    const next = { ...form, [key]: value };
    setForm(next);
    // Once a field has been touched, re-validate it live so the message clears as soon as it's fixed.
    setErrors((er) => ({ ...er, form: undefined, ...(key in touched || er[key as Field] ? { [key]: fieldError(key as Field, next) } : {}) }));
  };
  const a11y = (field: Field) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `lead-err-${field}` : undefined, onBlur: blur(field) });
  const err = (field: Field) => (errors[field] ? <em id={`lead-err-${field}`} role="alert">{errors[field]}</em> : null);

  return (
    <div className="lead-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="lead-sheet" role="dialog" aria-modal="true" aria-labelledby="lead-title">
        <button type="button" className="lead-close" aria-label="Close" onClick={close}>×</button>
        {done ? (
          <div className="lead-done">
            <div className="lead-done-icon" aria-hidden="true">✓</div>
            <h2 id="lead-title">{apply ? 'Application submitted!' : 'You\u2019re registered!'}</h2>
            <p>{apply
              ? `Thanks, ${form.name.trim().split(' ')[0]}. Your application to ${apply.collegeName} for ${apply.courses.find((c) => String(c.id) === form.courseId)?.name || 'the selected course'} is recorded. A College Decision counsellor will contact you shortly.`
              : `Thanks, ${form.name.trim().split(' ')[0]}. A College Decision counsellor will reach out to help you shortlist colleges.`}</p>
            <button type="button" className="lead-submit" onClick={close}>Continue browsing</button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate>
            <div className="lead-head">
              <span className="lead-badge">{apply ? 'Apply' : 'Free counselling'}</span>
              <h2 id="lead-title">{apply ? `Apply to ${apply.collegeName}` : 'Find the right college for you'}</h2>
              <p>{apply ? 'Share your details once. Our counsellor will help you with this application.' : 'Get fees, cutoffs and admission updates for colleges that match your interest.'}</p>
            </div>
            <div className="lead-grid">
              <label className="lead-field lead-full">
                <span>Full name</span>
                <input ref={nameRef} name="name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" maxLength={60} {...a11y('name')} />
                {err('name')}
              </label>
              <label className="lead-field">
                <span>Mobile</span>
                <div className="lead-phone" data-invalid={Boolean(errors.mobile) || undefined}>
                  {country.phoneCode && <b>{country.phoneCode}</b>}
                  <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" value={form.mobile} onChange={set('mobile')} placeholder={isIndia ? '10-digit number' : 'Number with country code'} maxLength={16} {...a11y('mobile')} />
                </div>
                {err('mobile')}
              </label>
              <label className="lead-field">
                <span>Email</span>
                <input name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" maxLength={254} {...a11y('email')} />
                {err('email')}
                {emailHint && <small className="lead-hint">Did you mean <button type="button" onClick={() => { setForm((f) => ({ ...f, email: emailHint })); setErrors((er) => ({ ...er, email: undefined })); }}>{emailHint}</button>?</small>}
              </label>
              <label className="lead-field lead-full">
                <span>{apply ? 'Course to apply for' : 'Interested in'}</span>
                <select name="courseId" value={form.courseId} onChange={set('courseId')} disabled={!options && !apply} {...a11y('courseId')}>
                  <option value="">{options || apply ? 'Select course' : 'Loading courses…'}</option>
                  {apply
                    ? apply.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                    : options?.courses.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {err('courseId')}
              </label>
              {isIndia && (showLocationText ? (
                <div className="lead-location lead-full">
                  <span className="lead-pin" aria-hidden="true">📍</span>
                  <span>{[cityName, stateName].filter(Boolean).join(', ')}</span>
                  <button type="button" onClick={() => setEditingLocation(true)}>Edit</button>
                </div>
              ) : (
                <>
                  <label className="lead-field">
                    <span>State</span>
                    <select name="stateId" value={form.stateId} onChange={(e) => { setErrors((er) => ({ ...er, stateId: undefined, cityId: undefined, form: undefined })); void selectState(e.target.value); }} disabled={!options} {...a11y('stateId')}>
                      <option value="">Select state</option>
                      {options?.states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {err('stateId')}
                  </label>
                  <label className="lead-field">
                    <span>City</span>
                    <select name="cityId" value={form.cityId} onChange={set('cityId')} disabled={!form.stateId || !cities.length} {...a11y('cityId')}>
                      <option value="">{form.stateId ? 'Select city' : 'Select state first'}</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {err('cityId')}
                  </label>
                </>
              ))}
              <input className="lead-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set('website')} />
            </div>
            {errors.form && <p className="lead-error" role="alert">{errors.form}</p>}
            <button type="submit" className="lead-submit" disabled={submitting} aria-busy={submitting}>{submitting ? 'Submitting…' : apply ? 'Submit application' : 'Get free counselling'}</button>
            <p className="lead-note">By submitting, you agree to be contacted about admissions. See our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</p>
          </form>
        )}
      </div>
    </div>
  );
}
