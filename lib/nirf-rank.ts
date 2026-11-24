/**
 * Display helpers for course-wise NIRF ranks on college cards.
 * Kept in sync with college_decision_backend/src/utils/nirf-rank.ts.
 * Only official NIRF categories we can label correctly are mapped.
 */

export type NirfCategoryName =
  | 'Overall'
  | 'University'
  | 'College'
  | 'Engineering'
  | 'Management'
  | 'Medical'
  | 'Law'
  | 'Pharmacy'
  | 'Architecture'
  | 'Dental';

export const NIRF_CATEGORY_COURSE_IDS: Record<NirfCategoryName, readonly number[]> = {
  Overall: [],
  University: [],
  College: [],
  Engineering: [1, 10, 131],
  Management: [2],
  Medical: [4, 17, 103, 141],
  Law: [6, 9, 18],
  Pharmacy: [11, 14, 118],
  Architecture: [15, 16],
  Dental: [52, 53, 144]
};

const COURSE_TO_CATEGORY = new Map<number, NirfCategoryName>();
for (const [category, ids] of Object.entries(NIRF_CATEGORY_COURSE_IDS) as Array<[NirfCategoryName, readonly number[]]>) {
  for (const id of ids) COURSE_TO_CATEGORY.set(id, category);
}

const BAND_STARTS = new Set([51, 76, 101, 151, 201, 251, 301, 351, 401, 501]);

function asPositiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : (Number.isFinite(n) && n > 0 ? Math.trunc(n) : null);
}

const SLUG_TO_CATEGORY: Record<string, NirfCategoryName> = {
  engineering: 'Engineering',
  mtech: 'Engineering',
  'b-chem-eng': 'Engineering',
  mba: 'Management',
  mbbs: 'Medical',
  medical: 'Medical',
  md: 'Medical',
  'medical-pg': 'Medical',
  'master-of-surgery': 'Medical',
  llb: 'Law',
  'ba-llb': 'Law',
  'integrated-law': 'Law',
  llm: 'Law',
  bpharm: 'Pharmacy',
  mpharm: 'Pharmacy',
  pharmacy: 'Pharmacy',
  barch: 'Architecture',
  march: 'Architecture',
  bds: 'Dental',
  mds: 'Dental',
  'diploma-in-dental': 'Dental'
};

export function nirfCategoryForCourseId(courseId: unknown): NirfCategoryName | null {
  const id = asPositiveInt(courseId);
  return id ? COURSE_TO_CATEGORY.get(id) || null : null;
}

export function nirfCategoryForCourseSlug(slug: unknown): NirfCategoryName | null {
  const key = String(slug || '').trim().toLowerCase();
  return key ? SLUG_TO_CATEGORY[key] || null : null;
}

export function isNirfBand(rank: unknown, outOf: unknown): boolean {
  const r = asPositiveInt(rank);
  const o = asPositiveInt(outOf);
  return Boolean(r && o && o > r && BAND_STARTS.has(r));
}

export function formatNirfRankValue(rank: unknown, outOf: unknown): string | null {
  const r = asPositiveInt(rank);
  if (!r) return null;
  const o = asPositiveInt(outOf);
  if (r && o && isNirfBand(r, o)) return `${r}-${o}`;
  return String(r);
}

export function formatNirfLabel(parts: {
  year?: number | string | null;
  category?: string | null;
  courseId?: number | string | null;
  rank: unknown;
  outOf?: unknown;
}): string | null {
  const value = formatNirfRankValue(parts.rank, parts.outOf);
  const category = String(parts.category || nirfCategoryForCourseId(parts.courseId) || '').trim();
  if (!value || !category) return null;
  const year = asPositiveInt(parts.year);
  return year ? `NIRF ${year} ${category} #${value}` : `NIRF ${category} #${value}`;
}

/** Prefer a backend-provided label; otherwise format from rank / category / year. */
export function displayNirfLabel(parts: {
  label?: string | null;
  year?: number | string | null;
  category?: string | null;
  courseId?: number | string | null;
  rank?: unknown;
  outOf?: unknown;
}): string | null {
  const ready = String(parts.label || '').trim();
  if (ready) return ready;
  if (parts.rank == null || parts.rank === '') return null;
  return formatNirfLabel({
    year: parts.year,
    category: parts.category,
    courseId: parts.courseId,
    rank: parts.rank,
    outOf: parts.outOf
  });
}
