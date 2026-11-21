'use client';

/** Shared state for Apply buttons on a college profile (hero + per-course buttons + the lead popup). */
export type ApplyCourse = { id: number; name: string };
export type ApplyRequest = { collegeSlug: string; collegeName: string; courses: ApplyCourse[]; courseId?: number | null; /** 'brochure' = enquiry before a brochure download */ mode?: 'apply' | 'brochure' };

export const APPLY_OPEN_EVENT = 'cd-open-apply';
export const APPLIED_EVENT = 'cd-applied';

const applied = new Map<string, Set<number>>();

export function appliedFor(slug: string) { return applied.get(slug) || new Set<number>(); }

export function markApplied(slug: string, courseIds: number[], replace = false) {
  const set = replace ? new Set<number>() : new Set(appliedFor(slug));
  courseIds.forEach((id) => set.add(Number(id)));
  applied.set(slug, set);
  window.dispatchEvent(new CustomEvent(APPLIED_EVENT, { detail: { slug } }));
}

/** Opens the full registration popup in "apply" mode (unregistered visitors). */
export function openApplyPopup(req: ApplyRequest) {
  window.dispatchEvent(new CustomEvent<ApplyRequest>(APPLY_OPEN_EVENT, { detail: req }));
}

/** Opens the existing site enquiry / free-counselling popup (StudentLeadPopup). */
export function openEnquiryPopup() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('cd-open-lead-form'));
}

/** Opens the enquiry popup before a brochure download (unregistered visitors). */
export function openBrochurePopup(req: Omit<ApplyRequest, 'mode'>) {
  window.dispatchEvent(new CustomEvent<ApplyRequest>(APPLY_OPEN_EVENT, { detail: { ...req, mode: 'brochure' } }));
}

/** Asks the backend for a short-lived brochure link (records a 'brochure' lead) and starts the download. */
export async function fetchBrochure(collegeSlug: string, token: string): Promise<{ ok: true; url: string } | { ok: false; status: number; error: string }> {
  try {
    const r = await fetch(`/api/colleges/${encodeURIComponent(collegeSlug)}/brochure`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.data?.url) return { ok: false, status: r.status, error: j?.error || 'Could not download the brochure. Please try again.' };
    return { ok: true, url: String(j.data.url) };
  } catch {
    return { ok: false, status: 0, error: 'We couldn\u2019t reach the server. Please try again.' };
  }
}

export function startDownload(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
