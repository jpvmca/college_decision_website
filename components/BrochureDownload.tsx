'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { readPrefs, writePrefs } from '../lib/student-lead';
import { fetchBrochure, openBrochurePopup, startDownload, type ApplyCourse } from '../lib/college-apply';
import { track } from '../lib/journey/track';

/**
 * "Download brochure": visitors who have not filled the enquiry form get it first (popup in brochure mode,
 * with reCAPTCHA); registered visitors download straight away (the backend still records a brochure lead).
 */
export default function BrochureDownload({ collegeSlug, collegeName, courses, sizeBytes }: { collegeSlug: string; collegeName: string; courses: ApplyCourse[]; sizeBytes?: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const size = sizeBytes ? ` · ${sizeBytes >= 1024 * 1024 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`}` : '';

  function popup() {
    const interest = Number(readPrefs().courseId) || null;
    openBrochurePopup({ collegeSlug, collegeName, courses, courseId: courses.some((c) => c.id === interest) ? interest : courses[0]?.id || null });
  }

  async function onClick() {
    setError('');
    track('click_download_brochure', { college_slug: collegeSlug });
    const { token, submittedAt } = readPrefs();
    if (!token || !submittedAt) { popup(); return; }
    setBusy(true);
    const file = await fetchBrochure(collegeSlug, token);
    setBusy(false);
    if (file.ok) { startDownload(file.url); return; }
    if (file.status === 401) { writePrefs({ token: null, submittedAt: undefined }); popup(); return; }
    setError(file.error);
  }

  return <span className="brochure-download">
    <button type="button" className="button cp-btn-ghost brochure-btn" onClick={onClick} disabled={busy} aria-busy={busy} aria-haspopup="dialog">
      <FileDown size={15} aria-hidden="true" /> {busy ? 'Preparing…' : 'Download brochure'}<small className="brochure-size">PDF{size}</small>
    </button>
    {error ? <em className="brochure-error" role="alert">{error}</em> : null}
  </span>;
}
