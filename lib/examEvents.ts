export type ExamEvent = {
  id: number;
  cycleYear: number;
  eventName: string;
  eventType: string;
  startDate: string | null;
  endDate: string | null;
  dateText: string | null;
  status: 'official' | 'extended' | 'tentative' | 'expected' | 'not_announced' | string;
  note: string | null;
  sourceUrl: string | null;
  sourceVerifiedAt?: string | null;
};

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS_LONG.map((m) => m.slice(0, 3));

/** Parse a YYYY-MM-DD (or ISO datetime) string without timezone shifts. */
function parts(value: string | null | undefined) {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return m ? { y: Number(m[1]), mo: Number(m[2]) - 1, d: Number(m[3]) } : null;
}
/** "2 Nov 2026" (exam schedule card). Falls back to the raw value when it is not a date. */
export function formatShortDate(value: string | null | undefined) {
  const p = parts(value);
  return p ? `${p.d} ${MONTHS_SHORT[p.mo]} ${p.y}` : value || '';
}
/** "August 20, 2026" (important-dates table). */
export function formatLongDate(value: string | null | undefined) {
  const p = parts(value);
  return p ? `${MONTHS_LONG[p.mo]} ${p.d}, ${p.y}` : value || '';
}
/** "August 20, 2026 – October 25, 2026"; "Until September 24, 2026" when only an end date; date_text when no dates. */
export function eventDateLabel(e: Pick<ExamEvent, 'startDate' | 'endDate' | 'dateText'>) {
  if (e.startDate && e.endDate && e.endDate !== e.startDate) return `${formatLongDate(e.startDate)} – ${formatLongDate(e.endDate)}`;
  if (e.startDate) return formatLongDate(e.startDate);
  if (e.endDate) return `Until ${formatLongDate(e.endDate)}`;
  return e.dateText || 'Not announced';
}
export const EVENT_STATUS_BADGE: Record<string, string | undefined> = {
  extended: 'Extended',
  tentative: 'Tentative',
  expected: 'Expected',
  not_announced: 'Not announced'
};
