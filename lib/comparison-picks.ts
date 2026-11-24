/**
 * Display pickers for college comparison pages.
 * Aligned with article.service.ts: programme total (not MIN of raw rows), flagship
 * preference, 2020+ non-executive placements, and NIRF best rank of the latest year.
 * Fee floors follow backend src/config/fee-floors.ts (copied so a stale API payload still works).
 */

import { formatNirfLabel, nirfCategoryForCourseId, nirfCategoryForCourseSlug } from './nirf-rank';

export const PROFESSIONAL_FEE_FLOOR = 10000;
export const GENERAL_FEE_FLOOR = 1000;
export const MIN_PLACEMENT_YEAR = 2020;

export const GENERAL_FEE_FLOOR_COURSES: readonly string[] = [
  'arts', 'bsc', 'commerce', 'ma', 'msc', 'mcom', 'master-of-science', 'bachelors', 'masters', 'blit',
  'bba', 'bca', 'bms',
  'ug-diploma', 'pg-diploma', 'advance-diploma', 'diploma', 'diploma-science', 'pgdca', 'dcs',
  'certificate-program', 'advance-certificate', 'vocational-diploma', 'dvoc', 'foundation-course',
  'bvoc', 'mvoc', 'bsw', 'msw', 'b-lib', 'm-lib', 'diploma-library-science', 'bfa', 'mfa', 'diploma-fine-arts',
  'phd', 'm-phil',
  'online-ba', 'online-bcom', 'online-bsc', 'online-ma', 'online-msc', 'online-mcom', 'online-bba', 'online-bca', 'online-certificate'
];

const GENERAL_SET = new Set(GENERAL_FEE_FLOOR_COURSES);

export function feeFloorForCourse(courseSlug?: string | null): number {
  const slug = String(courseSlug || '').trim().toLowerCase().replace(/^btech-engineering$/, 'engineering');
  return GENERAL_SET.has(slug) ? GENERAL_FEE_FLOOR : PROFESSIONAL_FEE_FLOOR;
}

const SECONDARY_RE = /faculty development|management development|advanced management|general management programme|family business|senior|for women|certificate|executive|part[ -]?time|weekend|distance|online|fellow|doctoral|ph[.]? ?d|working professional|modular|short[ -]?term|five[ -]?year integrated|integrated programme in management|dual country|^diploma in |^advanced diploma|health safety environment|^pg diploma in |(^|[^a-z])(mdp|fdp|pgpx|epgp|pgcp|ipm|epgdib|pgpmax|ipmx)([^a-z]|$)/i;

const FLAGSHIP_RE = /^(master of business administration( \(mba\))?|mba|m[.]?b[.]?a[.]?|post graduate programme \(pgp\)|post graduate programme in management( \(pgpm\))?|pgp|pgpm|post graduate diploma in management( - pgdm)?( general management)?|pgdm|b[.]? ?tech(\s*\/\s*b[.]?e[.]?)?|b[.]?e[.]?|bachelor of (technology|engineering)|bachelor of arts( \(b\.?a\.?\))?|b\.?a\.?|bachelor of commerce( \(b\.?com\.?\))?|b\.?com\.?|bachelor of science( \(b\.?sc\.?\))?|b\.?sc\.?|ll[.]?b|bachelor of laws)\s*$/i;

export function isSecondaryProgramme(name?: string | null): boolean {
  return SECONDARY_RE.test(String(name || '').trim());
}

export function isFlagshipProgramme(name?: string | null): boolean {
  return FLAGSHIP_RE.test(String(name || '').trim());
}

export type ComparisonFeeRow = {
  programme_id: number;
  programme_name: string;
  fees: number | string;
  fee_type?: string | null;
  fee_duration?: string | null;
};

export type ComparisonPlacementRow = {
  programme_id: number;
  programme_name?: string | null;
  year?: number | string | null;
  average_package?: number | string | null;
  highest_package?: number | string | null;
};

export type ComparisonRankingRow = {
  ranking_body?: string | null;
  rank?: number | string | null;
  out_of?: number | string | null;
  year?: number | string | null;
  course_id?: number | string | null;
  course_name?: string | null;
};

export type ComparisonProgramme = { id: number; name: string };

function positiveNumber(value: number | string | null | undefined): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

/**
 * Programme total from Total Fees rows: a duration=total row if present, otherwise the
 * sum of unique (amount, duration) Total Fees rows so duplicate year copies are not doubled.
 * Does not invent a total by multiplying a year fee by duration.
 */
export function programmeTotalFee(rows: ComparisonFeeRow[], feeType = 'Total Fees'): number | null {
  const totals: number[] = [];
  for (const row of rows) {
    if ((row.fee_type || '') !== feeType || (row.fee_duration || '') !== 'total') continue;
    const amount = positiveNumber(row.fees);
    if (amount) totals.push(amount);
  }
  if (totals.length) return Math.min(...totals);
  const unique = new Map<string, number>();
  for (const row of rows) {
    if ((row.fee_type || '') !== feeType) continue;
    const amount = positiveNumber(row.fees);
    if (!amount) continue;
    unique.set(`${amount}:${row.fee_duration || ''}`, amount);
  }
  if (!unique.size) return null;
  let sum = 0;
  for (const amount of unique.values()) sum += amount;
  return sum;
}

export function pickProgrammeFee(
  fees: ComparisonFeeRow[] | undefined,
  feeFloor: number
): { programme_id: number; programme_name: string; total: number } | null {
  const byProgramme = new Map<number, { name: string; rows: ComparisonFeeRow[] }>();
  for (const row of fees || []) {
    const current = byProgramme.get(row.programme_id) || { name: row.programme_name || '', rows: [] };
    current.rows.push(row);
    if (row.programme_name) current.name = row.programme_name;
    byProgramme.set(row.programme_id, current);
  }
  const collect = (feeType: string) => {
    const candidates: Array<{ programme_id: number; programme_name: string; total: number; secondary: number; flagship: number }> = [];
    for (const [programmeId, info] of byProgramme) {
      if (isSecondaryProgramme(info.name)) continue;
      const total = programmeTotalFee(info.rows, feeType);
      if (total == null || total < feeFloor) continue;
      candidates.push({
        programme_id: programmeId,
        programme_name: info.name,
        total,
        secondary: 0,
        flagship: isFlagshipProgramme(info.name) ? 0 : 1
      });
    }
    candidates.sort((a, b) => a.flagship - b.flagship || a.total - b.total || a.programme_id - b.programme_id);
    return candidates[0] || null;
  };
  const picked = collect('Total Fees') || collect('Tuition Fees');
  return picked ? { programme_id: picked.programme_id, programme_name: picked.programme_name, total: picked.total } : null;
}

export function pickPlacement(
  placements: ComparisonPlacementRow[] | undefined,
  programmes?: ComparisonProgramme[]
): { year: number; average: number | null; highest: number | null; programme_name: string } | null {
  const names = new Map((programmes || []).map((programme) => [programme.id, programme.name]));
  let best: { year: number; average: number | null; highest: number | null; programme_name: string; secondary: boolean } | null = null;
  for (const row of placements || []) {
    const year = Number(row.year);
    if (!Number.isFinite(year) || year < MIN_PLACEMENT_YEAR) continue;
    const name = String(row.programme_name || names.get(row.programme_id) || '');
    const average = positiveNumber(row.average_package);
    const highest = positiveNumber(row.highest_package);
    if (average == null && highest == null) continue;
    const secondary = isSecondaryProgramme(name);
    const candidate = { year, average, highest, programme_name: name, secondary };
    if (!best) {
      best = candidate;
      continue;
    }
    if (best.secondary && !secondary) {
      best = candidate;
      continue;
    }
    if (!best.secondary && secondary) continue;
    if (year > best.year) {
      best = candidate;
      continue;
    }
    if (year === best.year && (highest || 0) > (best.highest || 0)) best = candidate;
  }
  return best ? { year: best.year, average: best.average, highest: best.highest, programme_name: best.programme_name } : null;
}

/** NIRF rank for a comparison: the article course's official category, latest year, then the best (lowest) rank. */
export function pickNirf(rankings: ComparisonRankingRow[] | undefined, courseSlug?: string | null): ComparisonRankingRow | null {
  const wanted = nirfCategoryForCourseSlug(courseSlug);
  const nirf = (rankings || []).filter((row) => {
    if (String(row.ranking_body || '').toLowerCase() !== 'nirf' || !positiveNumber(row.rank)) return false;
    const category = nirfCategoryForCourseId(row.course_id);
    if (!category) return false;
    return wanted ? category === wanted : true;
  });
  if (!nirf.length) return null;
  const yearOf = (row: ComparisonRankingRow) => Number(row.year) || 0;
  const latest = Math.max(...nirf.map(yearOf));
  const sameYear = nirf.filter((row) => yearOf(row) === latest);
  sameYear.sort((a, b) => (Number(a.rank) || 1e9) - (Number(b.rank) || 1e9));
  return sameYear[0] || null;
}

export function formatComparisonNirf(rankings: ComparisonRankingRow[] | undefined, courseSlug?: string | null): string | null {
  const row = pickNirf(rankings, courseSlug);
  if (!row) return null;
  return formatNirfLabel({
    year: row.year,
    category: nirfCategoryForCourseId(row.course_id) || nirfCategoryForCourseSlug(courseSlug),
    rank: row.rank,
    outOf: row.out_of
  });
}
