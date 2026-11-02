/**
 * Programme duration is stored as a bare number in institute_programs.duration with no unit column.
 * Data shows two conventions: small values (1-5) are years, larger values (12, 24, 36, 48, 60 ...)
 * are months. 6 is ambiguous: 6-year degrees (Pharm.D, MBBS with internship, integrated/dual) vs
 * 6-month certificates, so the programme/course name decides it.
 */
const SIX_YEAR_NAMES = /pharm\.?\s*d\b|doctor of pharmacy|mbbs|bachelor of medicine|b\.?\s?a\.?\s?m\.?\s?s|ayurved|b\.?\s?h\.?\s?m\.?\s?s|homoeo|homeo|b\.?\s?u\.?\s?m\.?\s?s|unani|integrated|dual degree|ph\.?\s?d|doctor of philosophy/i;

function yearsText(years: number) {
  const value = Number.isInteger(years) ? String(years) : String(Math.round(years * 10) / 10);
  return `${value} ${years === 1 ? 'year' : 'years'}`;
}

/** Returns months for a stored duration value, or null when it is missing/invalid. */
export function durationMonths(value: unknown, ...names: Array<string | null | undefined>): number | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const unit = raw.match(/^(\d+(?:\.\d+)?)\s*(years?|yrs?|months?|mons?)$/i);
  if (unit) {
    const n = Number(unit[1]);
    if (!(n > 0)) return null;
    return /^m/i.test(unit[2]) ? n : n * 12;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 6) return n * 12;
  if (n === 6) return names.some((name) => name && SIX_YEAR_NAMES.test(name)) ? 72 : 6;
  return n;
}

/** Human label: whole/half years as years ("3 years", "4.5 years"), anything else in months ("6 months", "18 months"). */
export function formatProgrammeDuration(value: unknown, ...names: Array<string | null | undefined>): string | null {
  const months = durationMonths(value, ...names);
  if (months === null) {
    const raw = value === null || value === undefined ? '' : String(value).trim();
    return raw && !/^\d+(\.\d+)?$/.test(raw) && raw !== '0' ? raw : null;
  }
  if (months >= 12 && months % 6 === 0) return yearsText(months / 12);
  return `${Math.round(months * 10) / 10} ${months === 1 ? 'month' : 'months'}`;
}

/** ISO 8601 duration for schema.org timeRequired. */
export function isoProgrammeDuration(value: unknown, ...names: Array<string | null | undefined>): string | undefined {
  const months = durationMonths(value, ...names);
  if (months === null) return undefined;
  if (months % 12 === 0) return `P${months / 12}Y`;
  return Number.isInteger(months) ? `P${months}M` : undefined;
}
