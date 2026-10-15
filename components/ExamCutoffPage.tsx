import Link from 'next/link';
import JsonLd from './JsonLd';
import ExamCutoffsClient from './ExamCutoffsClient';
import CollegeFinder, { type AnyFinderCombo } from './CollegeFinder';
import { ExamCutoffs, type ExamCutoffResponse } from './Cutoffs';
import { batchLabel, breadcrumbJsonLd, cutoffYearHeading, examProgrammeWord, examYearNote, examYearOf, examTargetPhrase, faqJsonLd, fitDescription, fitTitle, formatMetric, isAdmissionKeyed, metricWord, pendingExamYear, siteUrl, type ExamCutoffSummary } from '../lib/cutoffs';

export const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim();

export const isMultiYear = (summary: ExamCutoffSummary) => summary.years.length > 1;

const metricPlural = (m: string) => `${metricWord(m)}s`;

/** H1 for a data year: "CAT 2025 Cutoffs for 2026–28 MBA Admissions: College-wise Percentiles". */
export function examCutoffTitle(summary: ExamCutoffSummary, year: number) {
  const name = cleanName(summary.exam.name);
  const info = summary.years.find((y) => y.year === year) || { year };
  const metric = summary.years.find((y) => y.year === year)?.metric || 'rank';
  if (isAdmissionKeyed(info)) {
    const prog = examProgrammeWord(summary.exam.slug);
    return `${name} ${examYearOf(info)} Cutoffs for ${batchLabel(year)}${prog ? ` ${prog}` : ''} Admissions: College-wise ${metricPlural(metric)}`;
  }
  const target = examTargetPhrase(summary.exam.slug);
  return target === 'Colleges' ? `${name} ${year} Cutoffs: College-wise ${metricPlural(metric)} by Category` : `${name} ${year} Cutoffs for ${target}: College-wise ${metricPlural(metric)}`;
}

/** Overview H1 is driven by the latest year that actually has data (never a year without rows). */
export function examCutoffOverviewTitle(summary: ExamCutoffSummary) {
  return examCutoffTitle(summary, summary.years[0].year);
}

/** <title>: 55–60 chars including the site suffix, year from the data. */
export function examCutoffMetaTitle(summary: ExamCutoffSummary, year?: number) {
  const name = cleanName(summary.exam.name);
  const info = summary.years.find((y) => y.year === (year ?? summary.years[0].year)) || summary.years[0];
  const m = metricPlural(info.metric || 'rank');
  const ey = examYearOf(info);
  const target = examTargetPhrase(summary.exam.slug);
  const prog = examProgrammeWord(summary.exam.slug);
  const candidates = isAdmissionKeyed(info)
    ? [`${name} ${ey} Cutoffs for ${batchLabel(info.year)}${prog ? ` ${prog}` : ''} Admissions`, `${name} ${ey} Cutoff (${batchLabel(info.year)}): College-wise ${m}`, `${name} ${ey} Cutoff: College-wise ${m}`, `${name} ${ey} Cutoffs: ${m} by College`]
    : [`${name} ${ey} Cutoff: ${m} for ${target}`, `${name} ${ey} Cutoff: College-wise ${m}`, `${name} ${ey} Cutoffs: College-wise ${m} by Category`, `${name} ${ey} Cutoff: ${m} by College & Category`, `${name} ${ey} Cutoff: ${target} ${m} by College`, `${name} ${ey} Cutoffs: ${m} by College`];
  return { absolute: fitTitle(candidates) };
}

export function examCutoffDescription(summary: ExamCutoffSummary, year?: number) {
  const name = cleanName(summary.exam.name);
  const info = summary.years.find((y) => y.year === (year ?? summary.years[0].year)) || summary.years[0];
  const metric = info.metric || 'rank';
  const what = metric === 'rank' ? 'closing ranks' : metric === 'percentile' ? 'minimum percentiles' : 'cutoff scores';
  const head = isAdmissionKeyed(info) ? `${name} ${examYearOf(info)} cutoffs for ${batchLabel(info.year)} admissions` : `${name} ${info.year} cutoffs`;
  const others = !year && isMultiYear(summary) ? ` Also ${summary.years.slice(1).map((y) => examYearOf(y)).join(', ')}.` : '';
  return fitDescription(`${head}: ${what} for ${info.institutes} colleges by category${metric === 'rank' ? ', quota and seat pool' : ''}, with source links.${others}`);
}

type Block = { year: number; data: ExamCutoffResponse | null };

/** Shared server-rendered body for /exams/{slug}/cutoff and /exams/{slug}/cutoff/{year}. */
export default function ExamCutoffPage({ summary, blocks, activeYear, finder }: { summary: ExamCutoffSummary; blocks: Block[]; activeYear?: number; finder?: { combos: AnyFinderCombo[]; initialId: string } | null }) {
  const slug = summary.exam.slug;
  const name = cleanName(summary.exam.name);
  const shownYear = activeYear || summary.years[0].year;
  const yearInfo = summary.years.find((y) => y.year === shownYear)!;
  const metric = yearInfo.metric;
  const primary = blocks[0]?.data;
  const shownExamYear = examYearOf(yearInfo);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Exams', path: '/exams' }, { name, path: `/exams/${slug}` }, { name: 'Cutoff', path: `/exams/${slug}/cutoff` }];
  if (activeYear) crumbs.push({ name: String(activeYear), path: `/exams/${slug}/cutoff/${activeYear}` });

  const faqs: Array<{ question: string; answer: string }> = [];
  faqs.push({ question: `For which years is the ${name} cutoff available?`, answer: `College-wise ${name} cutoffs are available for ${summary.years.map((y) => `${name} ${examYearOf(y)}${isAdmissionKeyed(y) ? ` (${batchLabel(y.year)} batch)` : ''}: ${y.institutes} colleges`).join('; ')}.` });
  const values = (primary?.data || []).map((r) => Number(r.best_value)).filter((v) => Number.isFinite(v) && v > 0);
  if (values.length > 1) {
    const lo = Math.min(...values), hi = Math.max(...values);
    faqs.push(metric === 'rank'
      ? { question: `What is the range of ${name} ${shownExamYear} closing ranks?`, answer: `Across the ${primary!.pagination.total} colleges listed, the lowest final-round closing rank shown for General, gender-neutral seats is ${formatMetric(lo, 'rank')} and the table on this page lists each college's best closing rank${primary!.pagination.total > values.length ? ' (first page shown)' : ''}.` }
      : { question: `What is the minimum ${name} ${shownExamYear} ${metric} needed for these colleges?`, answer: `For the General category, the minimum ${name} ${metric}s published by the ${values.length} colleges listed range from ${formatMetric(lo, metric)} to ${formatMetric(hi, metric)}. Meeting a minimum makes a candidate eligible for shortlisting; it does not guarantee an interview call or admission.` });
  }
  const note = examYearNote(name, shownYear, yearInfo.exam_year);
  if (note) faqs.push({ question: `Which ${name} exam do the ${batchLabel(shownYear)} cutoffs use?`, answer: note });
  const pending = activeYear ? null : pendingExamYear(summary.years[0]);
  if (metric === 'rank') faqs.push({ question: `What do opening and closing ranks mean in the ${name} cutoff?`, answer: `The opening rank is the best rank and the closing rank is the last rank admitted to a programme in a given round, category and seat pool. Your rank must be at or below the closing rank to have had a seat in that round.` });
  const faqLd = faqJsonLd(faqs);

  return <main className="section college-profile-page"><div className="wrap prose">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && <JsonLd data={faqLd} />}
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/exams">Exams</Link><span aria-hidden="true">›</span><Link href={`/exams/${slug}`}>{name}</Link><span aria-hidden="true">›</span>
      {activeYear ? <><Link href={`/exams/${slug}/cutoff`}>Cutoff</Link><span aria-hidden="true">›</span><span aria-current="page">{activeYear}</span></> : <span aria-current="page">Cutoff</span>}</nav>
    <header className="college-profile-header"><div>
      <p className="eyebrow">CUTOFF</p>
      <h1>{activeYear ? examCutoffTitle(summary, activeYear) : examCutoffOverviewTitle(summary)}</h1>
      <p>{activeYear
        ? `${name} ${shownExamYear} cutoffs for ${yearInfo.institutes} colleges and ${yearInfo.programmes} programmes.`
        : `${name} cutoffs for ${summary.years.map((y) => examYearOf(y)).join(', ')}, latest year first.`} {metric === 'rank' ? 'Each college shows its lowest final-round closing rank; open a college to see every programme, round, category and quota.' : metric === 'percentile' ? 'Figures are minimum percentiles used for shortlisting by each institute.' : 'Figures are the published cutoff scores.'}</p>
      {isMultiYear(summary) && <div className="cutoff-year-links" role="navigation" aria-label={`${name} cutoff years`}>
        {summary.years.map((y) => <Link key={y.year} className={`button${y.year === activeYear ? ' primary' : ''}`} href={`/exams/${slug}/cutoff/${y.year}`} aria-current={y.year === activeYear ? 'page' : undefined}>{name} {examYearOf(y)} Cutoff{isAdmissionKeyed(y) ? ` (${batchLabel(y.year)})` : ''}</Link>)}
        <Link className="button" href={`/exams/${slug}`}>{name} exam details</Link>
      </div>}
      {!isMultiYear(summary) && <p><Link className="button" href={`/exams/${slug}`}>{name} exam details</Link></p>}
    </div></header>
    {note && <p className="muted"><strong>Note:</strong> {note}</p>}
    {yearInfo.aggregator && <p className="muted">* Some figures for {name} {shownExamYear} come from a secondary (aggregator) source because the official document was not available; these are marked in the table.</p>}
    {finder && <CollegeFinder combos={finder.combos} initialId={finder.initialId} resetHref={activeYear ? `/exams/${slug}/cutoff/${activeYear}` : `/exams/${slug}/cutoff`} />}
    {pending && <section id={`cutoff-${pending.admissionYear}`} className="cutoff-section">
      <h2>{cutoffYearHeading(name, { year: pending.admissionYear, exam_year: pending.examYear })}</h2>
      <p>To be updated after {name} {pending.examYear} results. Institutes publish {name} {pending.examYear} cutoffs for {batchLabel(pending.admissionYear)} admissions only after the results, so there are no figures yet. Until then, use the {name} {examYearOf(summary.years[0])} cutoffs below as a guide.</p>
    </section>}
    {blocks.map((b, i) => { const y = summary.years.find((v) => v.year === b.year) || { year: b.year }; return b.data && b.data.data.length ? <section key={b.year} id={`cutoff-${b.year}`} className="cutoff-section">
      <h2>{cutoffYearHeading(name, y)}</h2>
      {i === 0
        ? <ExamCutoffsClient slug={slug} examLabel={name} initial={b.data} heading={null} />
        : <><ExamCutoffs examLabel={name} cutoffs={b.data} heading={null} collegeHref={(s) => `/colleges/${s}/cutoff`} />
            <p><Link href={isMultiYear(summary) ? `/exams/${slug}/cutoff/${b.year}` : `/exams/${slug}/cutoff`}>See all {summary.years.find((v) => v.year === b.year)?.institutes} colleges in the {name} {examYearOf(y)} cutoff</Link></p></>}
    </section> : null; })}
    <section className="cutoff-section"><h2>{name} Cutoff FAQs</h2>
      {faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
  </div></main>;
}
