import { api } from './api';
import type { CourseFacet } from './listings';

export type ClosingKind = 'rank' | 'percentile';
export type ClosingCombo = {
  course_id: number; course_slug: string; course_name: string; exam_slug: string; exam_name: string; kind: ClosingKind;
  year: number; exam_year: number; colleges: number; defaultQuotas: string[]; quotas: string[]; hasHomeState: boolean; levels: number[];
};
export type ClosingProgramme = { program_name: string; quota: string | null; gender_pool: string | null; closing: number; opening: number | null; gap: number | null };
export type ClosingCollege = { institute_id: number; name: string; slug: string; city: string | null; state: string | null; source_url: string | null; programmes: ClosingProgramme[] };
export type ClosingFacets = { categories: Array<{ code: string; label: string }>; quotas: Array<{ code: string; label: string }>; genders: string[]; states: string[]; branches: string[] };
export type ClosingResult = {
  combo: ClosingCombo; kind: ClosingKind; year: number; examYear: number;
  applied: { value: number | null; category: string; quota: string | null; homeState: string | null; gender: string; branch: string | null };
  defaults: { quotas: string[] }; facets: ClosingFacets; nearWindow: string; matched: ClosingCollege[]; nearMiss: ClosingCollege[]; totalColleges: number;
};

export const RANK_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)-colleges-accepting-(\d{1,7})-rank-in-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
export const CLOSING_PARAMS = ['rank', 'percentile', 'category', 'quota', 'homeState', 'gender', 'branch'] as const;
export const rankHref = (courseKey: string, rank: number, exam: string) => `/${courseKey}-colleges-accepting-${rank}-rank-in-${exam}`;
export function parseRankSegment(segment: string) {
  const m = RANK_PATTERN.exec(segment || '');
  return m ? { courseKey: m[1], level: Number(m[2]), exam: m[3] } : null;
}
const opts = { next: { revalidate: 600, tags: ['cutoffs', 'closing'] } };
export async function getClosingCombos(): Promise<ClosingCombo[]> {
  try { return (await api<{ data: ClosingCombo[] }>('/cutoffs/closing-combos', opts)).data; } catch { return []; }
}
export async function getClosingFinder(params: URLSearchParams): Promise<ClosingResult | null> {
  try { return await api<ClosingResult>(`/cutoffs/closing-finder?${params}`, opts); } catch { return null; }
}
export function facetForClosing(combo: ClosingCombo, facets: CourseFacet[]) {
  return facets.find((f) => f.courseIds.includes(combo.course_id) || f.courseSlug === combo.course_slug) || null;
}
/** Smallest rank bucket at or above the entered rank (largest bucket when the rank is beyond all). */
export const rankBucketFor = (rank: number, levels: number[]) => [...levels].sort((a, b) => a - b).find((l) => l >= rank) ?? Math.max(...levels);
/** Largest percentile level at or below the entered percentile (smallest level when below all). */
export const pctLevelFor = (p: number, levels: number[]) => [...levels].sort((a, b) => b - a).find((l) => p >= l) ?? Math.min(...levels);
export const fmtRank = (n: number) => Math.round(n).toLocaleString('en-IN');
