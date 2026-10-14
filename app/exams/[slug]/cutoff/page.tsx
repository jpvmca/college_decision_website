import type { Metadata } from 'next';
import { examFinderProps } from '../../../../components/PercentileCollegesPage';
import { notFound } from 'next/navigation';
import ExamCutoffPage, { examCutoffDescription, examCutoffOverviewTitle } from '../../../../components/ExamCutoffPage';
import { getExamCutoffSummary, getExamYearCutoffs, siteUrl } from '../../../../lib/cutoffs';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getExamCutoffSummary(slug);
  if (!s?.years.length) return { title: 'Cutoff not found', robots: { index: false, follow: false } };
  const title = examCutoffOverviewTitle(s);
  const description = examCutoffDescription(s);
  return { title, description, alternates: { canonical: `/exams/${slug}/cutoff` }, robots: { index: true, follow: true }, openGraph: { type: 'website', title, description, url: `${siteUrl()}/exams/${slug}/cutoff`, siteName: 'College Decision' }, twitter: { card: 'summary', title, description } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getExamCutoffSummary(slug);
  if (!s?.years.length) notFound();
  const blocks = await Promise.all(s.years.map(async (y, i) => ({ year: y.year, data: await getExamYearCutoffs(slug, y.year, i === 0 ? 50 : 10) })));
  if (!blocks.some((b) => b.data?.data.length)) notFound();
  return <ExamCutoffPage summary={s} blocks={blocks} finder={await examFinderProps(slug)} />;
}
