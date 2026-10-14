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
  years: Array<{ year: number; exam_year?: number; rows: number; institutes: number; programmes: number; metric: 'rank' | 'score' | 'percentile'; aggregator: boolean }>;
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
  return examYear && examYear !== year ? `${examName} ${year} cutoffs are for ${year}–${String(year + 2).slice(-2)} admissions and are based on ${examName} ${examYear} exam scores.` : null;
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
