import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../../components/JsonLd';
import CollegeCutoffYearTables from '../../../../components/CollegeCutoffYearTables';
import { breadcrumbJsonLd, cutoffYearHeading, examYearOf, faqJsonLd, formatMetric, examYearNote, getCollegeCutoffSummary, getCollegeYearRows, metricWord, siteUrl, type CollegeCutoffSummary } from '../../../../lib/cutoffs';

export const revalidate = 600;

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const CAT_LABEL: Record<string, string> = { OPEN: 'General', EWS: 'EWS', OBC_NCL: 'OBC-NCL', SC: 'SC', ST: 'ST', PWD: 'PwD' };

async function load(slug: string) {
  const summary = await getCollegeCutoffSummary(slug);
  if (!summary?.institute || !summary.exams.length) return null;
  return { ...summary, institute: summary.institute } as CollegeCutoffSummary & { institute: NonNullable<CollegeCutoffSummary['institute']> };
}

function titleFor(s: NonNullable<Awaited<ReturnType<typeof load>>>) {
  // Same logic as exam cutoff pages: label by the latest exam year with data (CAT 2025 data -> "2025", not the 2026 admission year).
  const latest = Math.max(...s.exams.flatMap((e) => e.years.map((y) => examYearOf(y))));
  const first = s.exams[0];
  const examNames = s.exams.slice(0, 2).map((e) => clean(e.name)).join(' & ');
  const metrics = new Set(s.exams.slice(0, 2).map((e) => e.metric));
  const tail = metrics.size > 1 ? 'Cutoffs by Branch & Category' : first.metric === 'rank' ? 'Closing Ranks by Branch & Category' : `${metricWord(first.metric)}s by Category`;
  return { latest, title: `${clean(s.institute.name)} Cutoff ${latest}: ${examNames} ${tail}` };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) return { title: 'Cutoff not found', robots: { index: false, follow: false } };
  const { title } = titleFor(s);
  const name = clean(s.institute.name);
  const description = `${name} cutoff for ${s.exams.map((e) => `${clean(e.name)} (${e.years.map((y) => (y.exam_year && y.exam_year !== y.year ? y.exam_year : y.year)).join(', ')})`).join('; ')}: ${s.exams.some((e) => e.metric === 'rank') ? 'opening and closing ranks by programme, round, category, quota and gender' : 'minimum percentiles by category'}, with official source links.`;
  const url = `${siteUrl()}/colleges/${slug}/cutoff`;
  return { title, description, alternates: { canonical: `/colleges/${slug}/cutoff` }, robots: { index: true, follow: true }, openGraph: { type: 'website', title, description, url, siteName: 'College Decision' }, twitter: { card: 'summary', title, description } };
}

export default async function CollegeCutoffPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) notFound();
  const name = clean(s.institute.name);
  const { title } = titleFor(s);
  const sections = (await Promise.all(s.exams.flatMap((e) => e.years.map(async (y) => ({ exam: e, y, data: await getCollegeYearRows(slug, e.slug, y.year) })))))
    .filter((x) => x.data && x.data.rows.length);
  if (!sections.length) notFound();
  const location = [s.institute.city, s.institute.state].filter(Boolean).join(', ');

  const faqs: Array<{ question: string; answer: string }> = [];
  for (const e of s.exams) {
    const examName = clean(e.name);
    const years = e.years.map((y) => y.year);
    faqs.push({ question: `Which years of ${examName} cutoff are available for ${name}?`, answer: `${examName} cutoffs for ${name} are listed for ${years.join(', ')}${e.years[0] && e.metric !== 'percentile' ? `; the ${e.years[0].year} list covers ${e.years[0].programmes} programme(s)${e.metric === 'rank' && e.years[0].rounds ? ` across ${e.years[0].rounds} counselling round(s)` : ''}` : ''}.` });
    const h = e.headline;
    if (h && Number(h.value) > 0) {
      const cat = CAT_LABEL[h.category] || h.category;
      if (e.metric === 'rank') {
        faqs.push({ question: `What was the ${examName} ${h.year} closing rank for ${clean(h.program_name)} at ${name}?`, answer: `In ${h.year} (round ${h.round}), the closing rank for ${clean(h.program_name)} at ${name} was ${formatMetric(h.value, 'rank')} for the ${cat} category, gender-neutral seat pool${h.quota ? `, ${h.quota} quota` : ''}.` });
      } else {
        faqs.push({ question: `What is the ${examName} ${e.years.find((y) => y.year === h.year)?.exam_year || h.year} cutoff for ${name}?`, answer: `${name} lists a minimum overall ${examName} ${e.metric === 'percentile' ? 'percentile' : 'score'} of ${Number(h.value)} for the ${cat} category${e.years[0]?.exam_year && e.years[0].exam_year !== h.year ? ` for ${h.year}–${String(h.year + 2).slice(-2)} admissions (based on ${examName} ${e.years[0].exam_year} scores)` : ''}${h.quality_flag === 'source_aggregator' ? '. This figure comes from a secondary (aggregator) source because the official document was not available' : ''}. Meeting it makes a candidate eligible for shortlisting but does not guarantee admission.` });
      }
    }
  }
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name, path: `/colleges/${slug}` }, { name: 'Cutoff', path: `/colleges/${slug}/cutoff` }];
  const faqLd = faqJsonLd(faqs);

  return <main className="section college-profile-page"><div className="wrap prose">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && <JsonLd data={faqLd} />}
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><Link href={`/colleges/${slug}`}>{name}</Link><span aria-hidden="true">›</span><span aria-current="page">Cutoff</span></nav>
    <header className="college-profile-header"><div>
      <p className="eyebrow">CUTOFF</p>
      <h1>{title}</h1>
      <p className="muted">{location || 'India'} · {s.exams.map((e) => clean(e.name)).join(', ')}</p>
      <p>{name} admits students through {s.exams.map((e) => clean(e.name)).join(', ')}. Below are the {s.exams.map((e) => `${clean(e.name)} cutoffs for ${e.years.map((y) => y.year).join(', ')}`).join(', and ')}, grouped by exam with the latest year first. {s.exams.some((e) => e.metric === 'rank') ? 'Rank cutoffs show opening and closing ranks; a lower rank is better.' : 'Percentile cutoffs are the minimum scores used for shortlisting.'}</p>
      <Link className="button primary" href={`/colleges/${slug}`}>View {name} overview</Link>
    </div></header>
    <section className="college-stats" aria-label="Cutoff coverage">
      {s.exams.map((e) => <div key={e.slug}><strong>{e.years.map((y) => y.year).join(', ')}</strong><span>{clean(e.name)} years</span></div>)}
    </section>
    {s.exams.map((exam) => <section key={exam.slug} id={`${exam.slug}-cutoff`} className="cutoff-section">
      <p className="muted">{clean(exam.name)} cutoff years: {exam.years.map((y) => <a key={y.year} href={`#${exam.slug}-${y.year}`} style={{ marginRight: '0.6rem' }}>{y.year}</a>)}
        {exam.published && <> · <Link href={`/exams/${exam.slug}/cutoff`}>{clean(exam.name)} cutoff for all colleges</Link></>}</p>
      {sections.filter((x) => x.exam.slug === exam.slug).map(({ y, data }) => <div key={y.year} id={`${exam.slug}-${y.year}`} className="cutoff-section">
        <h2>{name} {cutoffYearHeading(clean(exam.name), y)}</h2>
        <p className="muted">{exam.metric === 'rank' ? `Final round (round ${data!.round}) closing ranks for ${y.programmes} programme(s); a lower rank is more competitive.` : exam.metric === 'score' ? `Final round (round ${data!.round}) closing scores for ${y.programmes} programme(s).` : 'Minimum percentiles used to shortlist candidates.'}{' '}{examYearNote(clean(exam.name), y.year, y.exam_year) || ''}</p>
        <CollegeCutoffYearTables rows={data!.rows} metric={exam.metric} />
      </div>)}
    </section>)}
    {faqs.length > 0 && <section className="cutoff-section"><h2>{name} Cutoff FAQs</h2>
      {faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>}
  </div></main>;
}
