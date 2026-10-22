'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readPrefs, writePrefs } from '../lib/student-lead';
import { APPLIED_EVENT, appliedFor, markApplied, openApplyPopup, type ApplyCourse } from '../lib/college-apply';

type Props = { collegeSlug: string; collegeName: string; courses: ApplyCourse[]; courseIds?: number[]; label?: string; compact?: boolean };

const loading = new Map<string, Promise<void>>();

/** Fetch once per page per college: which courses this registered student has applied for here. */
function loadApplied(slug: string) {
  const { token } = readPrefs();
  if (!token) return Promise.resolve();
  if (!loading.has(slug)) {
    loading.set(slug, fetch('/api/students/applied', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, collegeSlug: slug }) })
      .then(async (r) => {
        if (r.status === 401) { writePrefs({ token: null }); return; }
        const j = await r.json().catch(() => null);
        if (r.ok && j?.data) markApplied(slug, j.data.courseIds || [], true);
      })
      .catch(() => undefined));
  }
  return loading.get(slug) as Promise<void>;
}

/**
 * Apply button. `courseIds` scopes it to a programme group (per-course apply); without it the button is the
 * college-level Apply and shows "Applied" once any course here has been applied for.
 */
export default function CollegeApply({ collegeSlug, collegeName, courses, courseIds, label = 'Apply now', compact = false }: Props) {
  const scope = courseIds?.length ? courseIds : null;
  const scoped = scope ? courses.filter((c) => scope.includes(c.id)) : courses;
  const [applied, setApplied] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const sync = (e?: Event) => {
      if (e && (e as CustomEvent).detail?.slug !== collegeSlug) return;
      setApplied([...appliedFor(collegeSlug)]);
    };
    sync();
    window.addEventListener(APPLIED_EVENT, sync);
    void loadApplied(collegeSlug);
    return () => window.removeEventListener(APPLIED_EVENT, sync);
  }, [collegeSlug]);

  const isApplied = scope ? scope.some((id) => applied.includes(id)) : applied.length > 0;
  const remaining = scoped.filter((c) => !applied.includes(c.id));
  const appliedNames = courses.filter((c) => applied.includes(c.id) && (!scope || scope.includes(c.id))).map((c) => c.name);

  const defaultCourse = useCallback((list: ApplyCourse[]) => {
    const interest = readPrefs().courseId;
    return String((list.find((c) => c.id === Number(interest)) || list[0])?.id || '');
  }, []);

  function start() {
    setError('');
    const { token, submittedAt } = readPrefs();
    const list = remaining.length ? remaining : scoped;
    if (!token || !submittedAt) {
      openApplyPopup({ collegeSlug, collegeName, courses: list.length ? list : courses, courseId: Number(defaultCourse(list)) || null });
      return;
    }
    setCourseId(defaultCourse(list));
    setConfirming(true);
    window.setTimeout(() => selectRef.current?.focus(), 30);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) { setError('Please select a course'); return; }
    const { token } = readPrefs();
    if (!token) { setConfirming(false); start(); return; }
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/students/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, collegeSlug, courseId: Number(courseId) }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) {
        // Token no longer valid: fall back to the full form.
        writePrefs({ token: null, submittedAt: undefined });
        setConfirming(false);
        openApplyPopup({ collegeSlug, collegeName, courses: scoped, courseId: Number(courseId) });
        return;
      }
      if (!r.ok) { setError(j.error || 'Could not submit. Please try again.'); return; }
      markApplied(collegeSlug, j.data?.courseIds || [Number(courseId)]);
      setConfirming(false);
    } catch {
      setError('We couldn’t reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const canApplyMore = !scope && isApplied && remaining.length > 0;
  return (
    <span className={`college-apply${compact ? ' is-compact' : ''}`}>
      {isApplied ? (
        <button type="button" className="button apply-done" disabled aria-disabled="true" title={appliedNames.length ? `Applied for ${appliedNames.join(', ')}` : 'Applied'}>Applied ✓</button>
      ) : (
        <button type="button" className="button apply-btn" onClick={start} aria-haspopup="dialog">{label}</button>
      )}
      {canApplyMore && !confirming && <button type="button" className="apply-more" onClick={start}>+ Apply for another course</button>}
      {confirming && (
        <form className="apply-confirm" onSubmit={submit} role="dialog" aria-label={`Apply to ${collegeName}`}>
          <strong>Apply to {collegeName}</strong>
          <label>
            <span>Course</span>
            <select ref={selectRef} value={courseId} onChange={(e) => { setCourseId(e.target.value); setError(''); }} aria-invalid={Boolean(error)}>
              {(remaining.length ? remaining : scoped).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <small>We&apos;ll share your registered details with our counsellor for this application.</small>
          {error && <em role="alert">{error}</em>}
          <div className="apply-confirm-actions">
            <button type="submit" className="button apply-btn" disabled={busy} aria-busy={busy}>{busy ? 'Submitting…' : 'Confirm apply'}</button>
            <button type="button" className="button" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </form>
      )}
    </span>
  );
}
