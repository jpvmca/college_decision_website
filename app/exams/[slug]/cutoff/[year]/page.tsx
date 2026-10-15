import type { Metadata } from 'next';
import { examFinderProps } from '../../../../../components/PercentileCollegesPage';
import { notFound, permanentRedirect } from 'next/navigation';
import ExamCutoffPage, { examCutoffDescription, examCutoffMetaTitle, isMultiYear } from '../../../../../components/ExamCutoffPage';
import { getExamCutoffSummary, getExamYearCutoffs, siteUrl } from '../../../../../lib/cutoffs';

export const revalidate = 600;

async function load(slug: string, yearParam: string) {
  if (!/^\d{4}$/.test(yearParam)) return null;
  const year = Number(yearParam);
  const s = await getExamCutoffSummary(slug);
  if (!s?.years.some((y) => y.year === year)) return null;
  return { s, year };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; year: string }> }): Promise<Metadata> {
  const { slug, year } = await params;
  const r = await load(slug, year);
  if (!r) return { title: 'Cutoff not found', robots: { index: false, follow: false } };
  const { absolute: title } = examCutoffMetaTitle(r.s, r.year);
  const description = examCutoffDescription(r.s, r.year);
  return { title: { absolute: title }, description, alternates: { canonical: `/exams/${slug}/cutoff/${r.year}` }, robots: { index: true, follow: true }, openGraph: { type: 'website', title, description, url: `${siteUrl()}/exams/${slug}/cutoff/${r.year}`, siteName: 'College Decision' }, twitter: { card: 'summary', title, description } };
}

export default async function Page({ params }: { params: Promise<{ slug: string; year: string }> }) {
  const { slug, year } = await params;
  const r = await load(slug, year);
  // Single-year exams live only at /exams/{slug}/cutoff (canonical); any matching year URL redirects there.
  if (r && !isMultiYear(r.s)) permanentRedirect(`/exams/${slug}/cutoff`);
  if (!r) {
    // Exams shown by admission year (e.g. CAT 2025 exam -> 2026 admissions): send the exam-year URL to the admission-year page.
    const s = /^\d{4}$/.test(year) ? await getExamCutoffSummary(slug) : null;
    const target = s?.years.find((y) => y.exam_year === Number(year) && y.year !== Number(year));
    if (target) permanentRedirect(s && !isMultiYear(s) ? `/exams/${slug}/cutoff` : `/exams/${slug}/cutoff/${target.year}`);
    notFound();
  }
  const data = await getExamYearCutoffs(slug, r.year, 100);
  if (!data?.data.length) notFound();
  return <ExamCutoffPage summary={r.s} blocks={[{ year: r.year, data }]} activeYear={r.year} finder={await examFinderProps(slug)} />;
}
