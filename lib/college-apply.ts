'use client';

/** Shared state for Apply buttons on a college profile (hero + per-course buttons + the lead popup). */
export type ApplyCourse = { id: number; name: string };
export type ApplyRequest = { collegeSlug: string; collegeName: string; courses: ApplyCourse[]; courseId?: number | null };

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
