import { api } from './api';
import type { CourseFacet } from './listings';

export const PERCENTILE_LEVELS = [95, 90, 80] as const;
export const PERCENTILE_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)-colleges-accepting-(\d{1,3})-percentile-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
export const FINDER_PARAMS = ['percentile', 'category', 'varc', 'dilr', 'qa', 'state', 'city', 'programme', 'budget', 'year'] as const;
export const CATEGORY_OPTIONS = [['OPEN', 'General'], ['EWS', 'EWS'], ['OBC_NCL', 'NC-OBC'], ['SC', 'SC'], ['ST', 'ST'], ['PWD', 'PwD']] as const;

export type PercentileCombo = { course_id: number; course_slug: string; course_name: string; exam_slug: string; exam_name: string; years: Array<{ year: number; exam_year: number; colleges: number }> };
export type Requirement = { overall: number | null; varc: number | null; dilr: number | null; qa: number | null };
export type FinderCollege = {
  institute_id: number; name: string; slug: string; city: string | null; state: string | null; programmes: string[];
  requirements: Record<string, Requirement>; requirement: Requirement; gaps: Record<string, number | null>; fails: string[];
  source_url: string | null; aggregator: boolean; fee: number | null; exam_year: number;
};
export type FinderResult = {
  combo: PercentileCombo; year: number; examYear: number;
  applied: { percentile: number | null; category: string; varc: number | null; dilr: number | null; qa: number | null; state: string | null; city: string | null; programme: string | null; budget: number | null };
  facets: { states: string[]; cities: Array<{ city: string; state: string | null }>; programmes: string[]; hasFees: boolean; categories: string[] };
  totalWithData: number; inScope: number; noRequirement: number; nearMissWindow: number; matched: FinderCollege[]; nearMiss: FinderCollege[];
};

const opts = { next: { revalidate: 600, tags: ['cutoffs', 'percentile'] } };
export async function getPercentileCombos(): Promise<PercentileCombo[]> {
  try { return (await api<{ data: PercentileCombo[] }>('/cutoffs/percentile-combos', opts)).data; } catch { return []; }
}
export async function getFinder(params: URLSearchParams): Promise<FinderResult | null> {
  try { return await api<FinderResult>(`/cutoffs/percentile-finder?${params}`, opts); } catch { return null; }
}
export function parsePercentileSegment(segment: string) {
  const m = PERCENTILE_PATTERN.exec(segment || '');
  return m ? { courseKey: m[1], level: Number(m[2]), exam: m[3] } : null;
}
export const percentileHref = (courseKey: string, level: number, exam: string) => `/${courseKey}-colleges-accepting-${level}-percentile-${exam}`;
/** Nearest clean level at or below the entered percentile (80 when below 80). */
export const levelFor = (p: number) => PERCENTILE_LEVELS.find((l) => p >= l) ?? 80;
/** Course listing key for a combo (listing facets own the /{key}-colleges URLs). */
export function facetForCombo(combo: PercentileCombo, facets: CourseFacet[]) {
  return facets.find((f) => f.courseIds.includes(combo.course_id) || f.courseSlug === combo.course_slug) || null;
}
export type PercentileGroup = { exam: string; examName: string; links: Array<{ level: number; href: string; label?: string }> };
export function percentileGroupsFor(facet: CourseFacet | null, combos: PercentileCombo[]): PercentileGroup[] {
  if (!facet) return [];
  return combos.filter((c) => facet.courseIds.includes(c.course_id) || facet.courseSlug === c.course_slug)
    .map((c) => ({ exam: c.exam_slug, examName: c.exam_name, links: PERCENTILE_LEVELS.map((level) => ({ level, href: percentileHref(facet.key, level, c.exam_slug) })) }));
}

/**
 * Sidebar groups for a course listing: every exam with cutoff data for the course.
 * Qualifying-percentile exams (CAT) → 95/90/80 percentile pages; closing-rank exams → rank buckets;
 * closing-percentile exams (MHT CET merit percentiles) → percentile levels that have at least one college.
 */
export function cutoffGroupsFor(facet: CourseFacet | null, combos: PercentileCombo[], closing: import('./closing').ClosingCombo[]): PercentileGroup[] {
  if (!facet) return [];
  const mine = (id: number, slug: string) => facet.courseIds.includes(id) || facet.courseSlug === slug;
  const groups = new Map<string, PercentileGroup>();
  const add = (exam: string, examName: string, links: PercentileGroup['links']) => {
    const g = groups.get(exam) || { exam, examName, links: [] };
    g.links.push(...links); groups.set(exam, g);
  };
  combos.filter((c) => mine(c.course_id, c.course_slug)).forEach((c) => add(c.exam_slug, c.exam_name, PERCENTILE_LEVELS.map((level) => ({ level, href: percentileHref(facet.key, level, c.exam_slug), label: `Colleges Accepting ${level} Percentile` }))));
  closing.filter((c) => mine(c.course_id, c.course_slug)).forEach((c) => add(c.exam_slug, c.exam_name, c.kind === 'percentile'
    ? c.levels.map((level) => ({ level, href: percentileHref(facet.key, level, c.exam_slug), label: `Colleges Accepting ${level} Percentile` }))
    : [...c.levels].sort((a, b) => a - b).map((level) => ({ level, href: `/${facet.key}-colleges-accepting-${level}-rank-in-${c.exam_slug}`, label: `Colleges Accepting ${level.toLocaleString('en-IN')} Rank` }))));
  return Array.from(groups.values()).sort((a, b) => a.examName.localeCompare(b.examName));
}
