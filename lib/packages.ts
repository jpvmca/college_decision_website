/** Placement packages are stored in LPA as DECIMAL(10,2) and arrive as numbers or strings like "12.50". */
export function lpaNumber(value: number | string | null | undefined): number | null {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/** "12.5" -> "₹12.5 LPA", "12.00" -> "₹12 LPA" (at most two decimals, never trailing zeros). */
export function formatLpa(value: number | string | null | undefined, fallback = 'Not listed', unit = 'LPA'): string {
  const amount = lpaNumber(value);
  if (amount === null) return fallback;
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${unit}`;
}
