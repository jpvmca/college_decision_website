import type { Metadata } from 'next';
import { examFinderProps } from '../../../../../components/PercentileCollegesPage';
import { notFound, permanentRedirect } from 'next/navigation';
import ExamCutoffPage, { examCutoffDescription, examCutoffMetaTitle, isMultiYear } from '../../../../../components/ExamCutoffPage';
import { examYearOf, getExamCutoffSummary, getExamYearCutoffs, siteUrl } from '../../../../../lib/cutoffs';

export const revalidate = 600;

/**
 * The URL year is the exam year (/exams/cat/cutoff/2025 = CAT 2025 data, used for 2026–28 admissions).
 * `year` in the result is the key the backend uses (admission year for CAT/NMAT, exam year for everything else).
 */
async function load(slug: string, yearParam: string) {
  if (!/^\d{4}$/.test(yearParam)) return null;
  const urlYear = Number(yearParam);
  const s = await getExamCutoffSummary(slug);
  const y = s?.years.find((v) => examYearOf(v) === urlYear);
  return s && y ? { s, year: y.year, urlYear } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; year: string }> }): Promise<Metadata> {
  const { slug, year } = await params;
  const r = await load(slug, year);
  if (!r) return { title: 'Cutoff not found', robots: { index: false, follow: false } };
  const { absolute: title } = examCutoffMetaTitle(r.s, r.year);
  const description = examCutoffDescription(r.s, r.year);
  return { title: { absolute: title }, description, alternates: { canonical: `/exams/${slug}/cutoff/${r.urlYear}` }, robots: { index: true, follow: true }, openGraph: { type: 'website', title, description, url: `${siteUrl()}/exams/${slug}/cutoff/${r.urlYear}`, siteName: 'College Decision' }, twitter: { card: 'summary', title, description } };
}

export default async function Page({ params }: { params: Promise<{ slug: string; year: string }> }) {
  const { slug, year } = await params;
  const r = await load(slug, year);
  // Single-year exams live only at /exams/{slug}/cutoff (canonical); any matching year URL redirects there.
  if (r && !isMultiYear(r.s)) permanentRedirect(`/exams/${slug}/cutoff`);
  if (!r) {
    // Old admission-year URLs (e.g. /exams/cat/cutoff/2026 for CAT 2025 data) 301 to the exam-year URL. Only reached when no exam
    // year matches, so the target is always a different URL that resolves directly (no self-redirects or loops).
    const s = /^\d{4}$/.test(year) ? await getExamCutoffSummary(slug) : null;
    const target = s?.years.find((y) => y.year === Number(year) && examYearOf(y) !== Number(year));
    if (target) permanentRedirect(s && !isMultiYear(s) ? `/exams/${slug}/cutoff` : `/exams/${slug}/cutoff/${examYearOf(target)}`);
    notFound();
  }
  const data = await getExamYearCutoffs(slug, r.year, 100);
  if (!data?.data.length) notFound();
  return <ExamCutoffPage summary={r.s} blocks={[{ year: r.year, data }]} activeYear={r.year} finder={await examFinderProps(slug)} />;
}
