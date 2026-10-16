/** Formatting helpers for exam cards (shared by the /exams server page and the client directory). */
import type { Schedule, ScheduleState } from '../components/ExamDirectory';

export const STATE_LABEL: Record<ScheduleState, string> = {
  registration_open: 'Registration open',
  registration_closed: 'Registration closed',
  upcoming: 'Upcoming',
  completed: 'Exam held',
  date_not_announced: 'Dates not announced'
};

export function formatDate(value: string | null | undefined, withYear = true) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
}

export function daysUntil(value: string) {
  const today = new Date();
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${value.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((target - start) / 86400000);
}

export function compactMoney(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(value >= 1000000 ? 1 : 2).replace(/\.?0+$/, '')}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(value)}`;
}

// Application fee text varies from a bare number to a full sentence; show the lowest rupee amount it mentions.
export function applicationFee(value: string | null) {
  if (!value) return null;
  const rupees = value.match(/₹\s*\d[\d,]*/g);
  const amounts = (rupees || (/^\s*\d[\d,]*\s*$/.test(value) ? [value] : []))
    .map((item) => Number(item.replace(/[^\d]/g, '')))
    .filter((amount) => amount >= 100 && amount <= 100000);
  if (!amounts.length) return null;
  const min = Math.min(...amounts);
  const formatted = `₹${min.toLocaleString('en-IN')}`;
  return amounts.length > 1 && Math.max(...amounts) !== min ? `From ${formatted}` : formatted;
}

export function modeLabel(value: string | null) {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (clean === 'online') return 'Online (CBT)';
  if (clean === 'offline') return 'Offline';
  if (clean === 'hybrid') return 'Online & offline';
  return value;
}

export function examDateFact(schedule: Schedule | null) {
  if (!schedule) return null;
  const start = formatDate(schedule.exam_start_date);
  if (start) {
    const end = schedule.exam_end_date && schedule.exam_end_date !== schedule.exam_start_date ? formatDate(schedule.exam_end_date) : null;
    return end ? `${formatDate(schedule.exam_start_date, false)} – ${end}` : start;
  }
  return schedule.expected_month ? `Expected: ${schedule.expected_month}` : null;
}

export function registrationFact(schedule: Schedule | null) {
  if (!schedule?.application_end_date) return null;
  const end = formatDate(schedule.application_end_date);
  if (schedule.state === 'registration_open') return `Open till ${end}`;
  if (schedule.application_start_date && daysUntil(schedule.application_start_date) > 0) return `Opens ${formatDate(schedule.application_start_date)}`;
  return daysUntil(schedule.application_end_date) < 0 ? `Closed on ${end}` : `Closes ${end}`;
}


