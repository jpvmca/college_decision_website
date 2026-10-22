'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LEAD_TRACKED_KEY, LEAD_UTM_KEY, courseFromContext, geoIsFresh, loadCities, loadFormOptions, locationFromSlug, pageContext, readPrefs, slugify, writePrefs,
  type FormCity, type FormOptions, type GeoInfo
} from '../lib/student-lead';

const SHOW_AFTER_MS = 5000;
/** Pages where a popup would get in the way of a task the visitor is already doing. */
const NO_POPUP = /^\/(contact|privacy-policy|terms-and-conditions|disclaimer)(\/|$)/;

type Errors = Partial<Record<'name' | 'mobile' | 'email' | 'courseId' | 'stateId' | 'form', string>>;

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
  const inFlight = useRef(new Set<string>());

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

  // Until the student registers: show 5s after every page view (initial load and each client-side navigation).
  useEffect(() => {
    if (readPrefs().submittedAt || NO_POPUP.test(pathname)) return;
    const timer = window.setTimeout(() => {
      if (!readPrefs().submittedAt) setOpen(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const manual = () => { if (!readPrefs().submittedAt) setOpen(true); };
    window.addEventListener('cd-open-lead-form', manual);
    return () => window.removeEventListener('cd-open-lead-form', manual);
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
      const courseId = pageCourse?.id || (known(draft.courseId) ? draft.courseId : null) || (known(saved.courseId) ? saved.courseId : null);
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
  }, [open, ctx, selectState]);

  // Keep partially entered details so the form stays filled on the next page.
  useEffect(() => {
    if (!open || done) return;
    const { website: _hp, ...draft } = form;
    void _hp;
    const timer = window.setTimeout(() => writePrefs({ draft }), 300);
    return () => window.clearTimeout(timer);
  }, [form, open, done]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const isIndia = country.code === 'IN';
  const stateName = options?.states.find((s) => String(s.id) === form.stateId)?.name || '';
  const cityName = cities.find((c) => String(c.id) === form.cityId)?.name || '';
  const showLocationText = isIndia && !editingLocation && Boolean(form.stateId);

  function validate(): Errors {
    const e: Errors = {};
    if (form.name.trim().length < 2 || !/^[\p{L}][\p{L} .'-]*$/u.test(form.name.trim())) e.name = 'Enter your full name';
    const mobile = form.mobile.replace(/[\s()-]/g, '');
    if (isIndia ? !/^(\+?91|0)?[6-9]\d{9}$/.test(mobile) : !/^\+?\d{6,14}$/.test(mobile)) e.mobile = isIndia ? 'Enter a valid 10-digit mobile number' : 'Enter a valid mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.courseId) e.courseId = 'Select a course';
    if (isIndia && !form.stateId) { e.stateId = 'Select your state'; setEditingLocation(true); }
    return e;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    let utm: Record<string, string | null> = {};
    try { utm = JSON.parse(window.sessionStorage.getItem(LEAD_UTM_KEY) || '{}'); } catch { /* ignore */ }
    const mobile = form.mobile.replace(/[\s()-]/g, '');
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim(),
          mobile: !isIndia && country.phoneCode && !mobile.startsWith('+') ? `${country.phoneCode}${mobile.replace(/^0+/, '')}` : mobile,
          courseId: Number(form.courseId), countryCode: country.code,
          stateId: isIndia ? Number(form.stateId) || null : null, cityId: isIndia ? Number(form.cityId) || null : null,
          collegeSlug: ctx.pageType === 'college_profile' || ctx.pageType === 'college_cutoff' ? ctx.collegeSlug : null,
          pageUrl: `${window.location.pathname}`.slice(0, 255), pageType: ctx.pageType, cta: 'popup_auto_5s',
          website: form.website, elapsedMs: Date.now() - openedAt.current, ...utm
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const field = (json.field as keyof Errors) || 'form';
        setErrors({ [field]: json.error || 'Something went wrong. Please try again.' });
        return;
      }
      const d = json.data || {};
      writePrefs({
        submittedAt: Date.now(), courseId: Number(form.courseId), token: d.token || null, draft: {},
        ...(isIndia ? { stateId: Number(form.stateId) || null, stateName, cityId: Number(form.cityId) || null, cityName: cityName || null } : {}),
        ...(d.countryId ? { countryId: d.countryId } : {})
      });
      setDone(true);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));
  };

  return (
    <div className="lead-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="lead-sheet" role="dialog" aria-modal="true" aria-labelledby="lead-title">
        <button type="button" className="lead-close" aria-label="Close" onClick={close}>×</button>
        {done ? (
          <div className="lead-done">
            <div className="lead-done-icon" aria-hidden="true">✓</div>
            <h2 id="lead-title">You&apos;re registered!</h2>
            <p>Thanks, {form.name.trim().split(' ')[0]}. A College Decision counsellor will reach out to help you shortlist colleges.</p>
            <button type="button" className="lead-submit" onClick={() => setOpen(false)}>Continue browsing</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="lead-head">
              <span className="lead-badge">Free counselling</span>
              <h2 id="lead-title">Find the right college for you</h2>
              <p>Get fees, cutoffs and admission updates for colleges that match your interest.</p>
            </div>
            <div className="lead-grid">
              <label className="lead-field lead-full">
                <span>Full name</span>
                <input ref={nameRef} name="name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" aria-invalid={Boolean(errors.name)} maxLength={120} />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label className="lead-field">
                <span>Mobile</span>
                <div className="lead-phone">
                  {country.phoneCode && <b>{country.phoneCode}</b>}
                  <input name="mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={form.mobile} onChange={set('mobile')} placeholder={isIndia ? '10-digit number' : 'Mobile number'} aria-invalid={Boolean(errors.mobile)} maxLength={16} />
                </div>
                {errors.mobile && <em>{errors.mobile}</em>}
              </label>
              <label className="lead-field">
                <span>Email</span>
                <input name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} maxLength={190} />
                {errors.email && <em>{errors.email}</em>}
              </label>
              <label className="lead-field lead-full">
                <span>Interested in</span>
                <select name="courseId" value={form.courseId} onChange={set('courseId')} aria-invalid={Boolean(errors.courseId)} disabled={!options}>
                  <option value="">{options ? 'Select course' : 'Loading courses…'}</option>
                  {options?.courses.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                {errors.courseId && <em>{errors.courseId}</em>}
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
                    <select name="stateId" value={form.stateId} onChange={(e) => { setErrors((er) => ({ ...er, stateId: undefined })); void selectState(e.target.value); }} aria-invalid={Boolean(errors.stateId)} disabled={!options}>
                      <option value="">Select state</option>
                      {options?.states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.stateId && <em>{errors.stateId}</em>}
                  </label>
                  <label className="lead-field">
                    <span>City</span>
                    <select name="cityId" value={form.cityId} onChange={set('cityId')} disabled={!form.stateId || !cities.length}>
                      <option value="">{form.stateId ? 'Select city' : 'Select state first'}</option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                </>
              ))}
              <input className="lead-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set('website')} />
            </div>
            {errors.form && <p className="lead-error" role="alert">{errors.form}</p>}
            <button type="submit" className="lead-submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Get free counselling'}</button>
            <p className="lead-note">By submitting, you agree to be contacted about admissions. See our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</p>
          </form>
        )}
      </div>
    </div>
  );
}
