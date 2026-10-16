import { api } from './api';
import type { CollegeCutoffResponse, ExamCutoffResponse } from '../components/Cutoffs';

export const CUTOFF_REVALIDATE = 600;
const opts = (tag: string) => ({ next: { revalidate: CUTOFF_REVALIDATE, tags: ['cutoffs', tag] } });

export type CollegeCutoffSummary = {
  institute: { id: number; name: string; slug: string; city: string | null; state: string | null } | null;
  exams: Array<{
    exam_id: number; slug: string; name: string; metric: 'rank' | 'score' | 'percentile'; published: boolean;
    years: Array<{ year: number; exam_year?: number; rows: number; rounds: number; programmes: number; aggregator: boolean }>;
    headline: { program_name: string; round: number; quota: string | null; category: string; value: number | string; cutoff_type: string | null; source_url: string | null; quality_flag: string | null; year: number } | null;
  }>;
};
export type ExamCutoffSummary = {
  exam: { id: number; slug: string; name: string };
  years: Array<{ year: number; exam_year?: number; rows: number; institutes: number; programmes: number; metric: 'rank' | 'score' | 'percentile'; aggregator: boolean; categories?: number }>;
};

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}
export const getCollegeCutoffSummary = (slug: string) =>
  safe(() => api<CollegeCutoffSummary>(`/colleges/${encodeURIComponent(slug)}/cutoffs/summary`, opts(`college:${slug}`)));
export const getCollegeExamCutoffs = (slug: string, exam: string, perPage = 50) =>
  safe(() => api<CollegeCutoffResponse>(`/colleges/${encodeURIComponent(slug)}/cutoffs?exam=${encodeURIComponent(exam)}&perPage=${perPage}`, opts(`college:${slug}`)));
export const getCollegeYearRows = (slug: string, exam: string, year: number) =>
  safe(() => api<{ exam: { slug: string; name: string }; year: number; round: number | null; rows: import('../components/CollegeCutoffYearTables').YearRow[] }>(`/colleges/${encodeURIComponent(slug)}/cutoffs/year?exam=${encodeURIComponent(exam)}&year=${year}`, opts(`college:${slug}`)));
/** "Based on CAT 2025 exam scores" when the admission year differs from the exam year. */
export function examYearNote(examName: string, year: number, examYear?: number) {
  return examYear && examYear !== year ? `These cutoffs are based on ${examName} ${examYear} exam scores and apply to ${batchLabel(year)} admissions (batch starting ${year}).` : null;
}

type YearLike = { year: number; exam_year?: number };
/** Years are keyed by admission year when the exam is held the year before (e.g. CAT 2025 -> 2026-28 batch). */
export const isAdmissionKeyed = (y: YearLike) => Boolean(y.exam_year && y.exam_year !== y.year);
/** The exam year shown to users (CAT 2025), regardless of how the data is keyed. */
export const examYearOf = (y: YearLike) => (isAdmissionKeyed(y) ? Number(y.exam_year) : y.year);
/** "2026–28" for a 2-year programme starting in the admission year. */
export const batchLabel = (admissionYear: number, length = 2) => `${admissionYear}–${String(admissionYear + length).slice(-2)}`;
/** Programme admitted through the exam, used in headings ("2026–28 MBA Admissions"). */
export function examProgrammeWord(slug: string) {
  return /^(cat|xat|snap|nmat|cmat|mat|micat|mah-mba-cet|tancet|iift|atma|gmat)/.test(slug) ? 'MBA' : null;
}
/** Section heading per data year: "CAT 2025 Cutoffs (2026–28 batch)" or "JEE Main 2024 Cutoffs". */
export function cutoffYearHeading(examName: string, y: YearLike) {
  return isAdmissionKeyed(y) ? `${examName} ${examYearOf(y)} Cutoffs (${batchLabel(y.year)} batch)` : `${examName} ${y.year} Cutoffs`;
}
/**
 * The next exam cycle with no data yet, for admission-keyed exams only: when the latest exam with data was held last
 * calendar year, this year's exam has not produced cutoffs yet (e.g. CAT 2026 in late November).
 */
export function pendingExamYear(latest: YearLike, now = new Date()) {
  if (!isAdmissionKeyed(latest)) return null;
  const currentYear = Number(new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(now));
  const next = examYearOf(latest) + 1;
  return next === currentYear ? { examYear: next, admissionYear: latest.year + 1 } : null;
}
/** Pick the first candidate whose final <title> (with the site suffix) is 55–60 chars; else the longest that fits 60. */
export function fitTitle(candidates: string[], suffix = ' | College Decision') {
  const forms = candidates.flatMap((c) => [c + suffix, c]);
  const ok = forms.find((t) => t.length >= 55 && t.length <= 60);
  if (ok) return ok;
  const fits = forms.filter((t) => t.length <= 60).sort((a, b) => b.length - a.length);
  return fits[0] || candidates[candidates.length - 1].slice(0, 60);
}
/** Trim a meta description to <= 155 chars on a word boundary. */
export function fitDescription(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`;
}
export const getExamCutoffSummary = (slug: string) =>
  safe(() => api<ExamCutoffSummary>(`/exams/${encodeURIComponent(slug)}/cutoffs/summary`, opts(`exam:${slug}`)));
export const getExamYearCutoffs = (slug: string, year?: number, perPage = 100) =>
  safe(() => api<ExamCutoffResponse>(`/exams/${encodeURIComponent(slug)}/cutoffs?perPage=${perPage}${year ? `&year=${year}` : ''}`, opts(`exam:${slug}`)));

export function examTargetPhrase(slug: string) {
  if (slug === 'jee-main') return 'NITs, IIITs & GFTIs';
  if (slug === 'jee-advanced') return 'IITs';
  if (slug === 'gate') return 'NITs & IITs (M.Tech)';
  if (slug === 'cat') return 'IIMs';
  return 'Colleges';
}
export function metricWord(metric?: string | null) {
  return metric === 'percentile' ? 'Percentile' : metric === 'score' ? 'Score' : 'Closing Rank';
}
export function formatMetric(value: unknown, metric?: string | null) {
  const n = Number(value);
  if (value === null || value === undefined || !Number.isFinite(n) || n <= 0) return 'Not available';
  return metric === 'rank' || !metric ? Math.round(n).toLocaleString('en-IN') : metric === 'percentile' ? `${n} percentile` : `${n}`;
}
export function breadcrumbJsonLd(siteUrl: string, items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${siteUrl}${item.path}` }))
  };
}
export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return faqs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) } : null;
}
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
