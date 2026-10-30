import Link from 'next/link';
import JsonLd from './JsonLd';
import ExamCutoffsClient from './ExamCutoffsClient';
import CutoffExpand from './CutoffExpand';
import CutoffTakeaways from './CutoffTakeaways';
import CollegeFinder, { type AnyFinderCombo } from './CollegeFinder';
import { Fragment } from 'react';
import { ExamCutoffs, type ExamCutoffResponse } from './Cutoffs';
import AdSlot from './ads/AdSlot';
import { batchLabel, breadcrumbJsonLd, cutoffYearHeading, examProgrammeWord, examYearNote, examYearOf, examTargetPhrase, faqJsonLd, fitDescription, fitTitle, formatMetric, isAdmissionKeyed, metricWord, pendingExamYear, siteUrl, type ExamCutoffSummary } from '../lib/cutoffs';

export const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim();

export const isMultiYear = (summary: ExamCutoffSummary) => summary.years.length > 1;

/** Rows shown per year section on the /exams/{slug}/cutoff overview; the full table lives on the year page. */
const OVERVIEW_ROWS = 4;

const metricPlural = (m: string) => `${metricWord(m)}s`;

/** H1 for a data year: "CAT 2025 Cutoff: College-wise Percentiles for 2026–28 MBA Admissions". */
export function examCutoffTitle(summary: ExamCutoffSummary, year: number) {
  const name = cleanName(summary.exam.name);
  const info = summary.years.find((y) => y.year === year) || { year };
  const metric = summary.years.find((y) => y.year === year)?.metric || 'rank';
  if (isAdmissionKeyed(info)) {
    const prog = examProgrammeWord(summary.exam.slug);
    return `${name} ${examYearOf(info)} Cutoff: College-wise ${metricPlural(metric)} for ${batchLabel(year)}${prog ? ` ${prog}` : ''} Admissions`;
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
  const what = metric === 'rank' ? 'closing ranks' : metric === 'percentile' ? 'published minimum percentiles (overall and sectional)' : 'published cutoff scores';
  const head = isAdmissionKeyed(info) ? `${name} ${examYearOf(info)} cutoffs for ${batchLabel(info.year)} admissions` : `${name} ${info.year} cutoffs`;
  const others = !year && isMultiYear(summary) ? ` Also ${summary.years.slice(1).map((y) => examYearOf(y)).join(', ')}.` : '';
  return fitDescription(`${head}: ${what} for ${info.institutes} colleges ${info.categories === 1 ? '(General category only)' : 'by category'}${metric === 'rank' ? ', quota and seat pool' : ''}, with source links.${others}`);
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
  // URLs carry the exam year students know (/exams/cat/cutoff/2025 = CAT 2025), even when data is keyed by admission year.
  const yearHref = (dataYear: number) => `/exams/${slug}/cutoff/${examYearOf(summary.years.find((v) => v.year === dataYear) || { year: dataYear })}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Exams', path: '/exams' }, { name, path: `/exams/${slug}` }, { name: 'Cutoff', path: `/exams/${slug}/cutoff` }];
  if (activeYear) crumbs.push({ name: String(shownExamYear), path: yearHref(activeYear) });
  // Counts come from the rows actually displayed (same filters as the table), never from a separate total.
  const shownColleges = primary?.pagination.total ?? yearInfo.institutes;
  const isMinimum = metric !== 'rank' && (primary?.data || []).some((r) => /^(qualifying|shortlist|reported)/.test(r.best?.cutoff_type || ''));

  const faqs: Array<{ question: string; answer: string }> = [];
  faqs.push({ question: `For which years is the ${name} cutoff available?`, answer: `College-wise ${name} cutoffs are available for ${summary.years.map((y) => `${name} ${examYearOf(y)}${isAdmissionKeyed(y) ? ` (${batchLabel(y.year)} batch)` : ''}: ${y.institutes} ${y.institutes === 1 ? 'college' : 'colleges'} with records`).join('; ')}.` });
  const values = (primary?.data || []).map((r) => Number(r.best_value)).filter((v) => Number.isFinite(v) && v > 0);
  if (values.length > 1) {
    const lo = Math.min(...values), hi = Math.max(...values);
    faqs.push(metric === 'rank'
      ? { question: `What is the range of ${name} ${shownExamYear} closing ranks?`, answer: `Across the ${primary!.pagination.total} colleges listed, the lowest final-round closing rank shown for General, gender-neutral seats is ${formatMetric(lo, 'rank')} and the table on this page lists each college's best closing rank${primary!.pagination.total > values.length ? ' (first page shown)' : ''}.` }
      : { question: `What is the minimum ${name} ${shownExamYear} ${metric} needed for these colleges?`, answer: `For the General category, the overall ${name} ${shownExamYear} ${metric}s published by ${values.length} of the ${shownColleges} colleges listed ${lo === hi ? `are all ${formatMetric(lo, metric)}` : `range from ${formatMetric(lo, metric)} to ${formatMetric(hi, metric)}`}${shownColleges > values.length ? `; ${shownColleges - values.length === 1 ? 'one college publishes' : `${shownColleges - values.length} colleges publish`} sectional minimums only` : ''}. These are published minimum eligibility or shortlisting criteria, depending on the institute. Meeting a published minimum does not guarantee an interview call or admission. Criteria and selection processes vary by institute.` });
  }
  const note = examYearNote(name, shownYear, yearInfo.exam_year);
  if (note) faqs.push({ question: `Which ${name} exam do the ${batchLabel(shownYear)} cutoffs use?`, answer: note });
  const pending = activeYear ? null : pendingExamYear(summary.years[0]);
  if (isMinimum) faqs.push({ question: `What is the difference between eligibility and shortlist cutoffs?`, answer: `An eligibility cutoff is the minimum ${metric} an institute needs before it considers an application at all; most institutes then rank eligible candidates on a composite score (academics, work experience, diversity) and call far fewer for interview. A shortlist cutoff is the figure an institute says it actually used for its interview shortlist. The Type column on this page shows which one each college published.` });
  if (metric === 'rank') faqs.push({ question: `What do opening and closing ranks mean in the ${name} cutoff?`, answer: `The opening rank is the best rank and the closing rank is the last rank admitted to a programme in a given round, category and seat pool. Your rank must be at or below the closing rank to have had a seat in that round.` });
  const faqLd = faqJsonLd(faqs.filter((f) => f.answer.trim()));

  return <main className="section college-profile-page"><div className="wrap prose">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && <JsonLd data={faqLd} />}
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/exams">Exams</Link><span aria-hidden="true">›</span><Link href={`/exams/${slug}`}>{name}</Link><span aria-hidden="true">›</span>
      {activeYear ? <><Link href={`/exams/${slug}/cutoff`}>Cutoff</Link><span aria-hidden="true">›</span><span aria-current="page">{shownExamYear}</span></> : <span aria-current="page">Cutoff</span>}</nav>
    <header className="college-profile-header"><div>
      <p className="eyebrow">CUTOFF</p>
      <h1>{activeYear ? examCutoffTitle(summary, activeYear) : examCutoffOverviewTitle(summary)}</h1>
      <p>{isMinimum
        ? `College-wise ${name} ${shownExamYear} ${metric === 'score' ? 'scores' : 'percentiles'} published for ${isAdmissionKeyed(yearInfo) ? `${batchLabel(yearInfo.year)} ` : ''}admissions, taken from each institute's admission policy wherever it is available: the overall figure and, where given, sectional figures${yearInfo.categories === 1 ? ' (only General-category figures are published)' : ' for every category'}. These are published minimum eligibility or shortlisting criteria, depending on the institute.`
        : activeYear
          ? `${name} ${shownExamYear} cutoffs for ${shownColleges} colleges.`
          : `${name} cutoffs for ${summary.years.map((y) => examYearOf(y)).join(', ')}, latest year first.`} {metric === 'rank' ? 'Each college shows its lowest final-round closing rank; open a college to see every programme, round, category and quota.' : isMinimum ? '' : 'Figures are the published cutoff scores.'}</p>
      <p className="muted">{yearInfo.institutes} {yearInfo.institutes === 1 ? 'college currently has' : 'colleges currently have'} {name} {shownExamYear} cutoff records{shownColleges !== yearInfo.institutes ? ` (${shownColleges} in the table below with its default filters${slug === 'jee-main' ? ', B.E./B.Tech' : ''})` : ''}{yearInfo.aggregator ? '; some figures are from secondary publications and are marked' : ''}.</p>
      {isMultiYear(summary) && <div className="cutoff-year-links" role="navigation" aria-label={`${name} cutoff years`}>
        {summary.years.map((y) => <Link key={y.year} className={`button${y.year === activeYear ? ' primary' : ''}`} href={yearHref(y.year)} aria-current={y.year === activeYear ? 'page' : undefined}>{name} {examYearOf(y)} Cutoff{isAdmissionKeyed(y) ? ` (${batchLabel(y.year)})` : ''}</Link>)}
        <Link className="button" href={`/exams/${slug}`}>{name} exam details</Link>
      </div>}
      {!isMultiYear(summary) && <p><Link className="button" href={`/exams/${slug}`}>{name} exam details</Link></p>}
    </div></header>
    {note && <p className="muted"><strong>Note:</strong> {note}</p>}
    {yearInfo.aggregator && <p className="muted">* Some figures for {name} {shownExamYear} come from a secondary publication because the official document could not be retrieved. They are marked “Secondary source - not independently verified” in the table.</p>}
    {activeYear && metric === 'percentile' && primary && <CutoffTakeaways name={name} examYear={shownExamYear} rows={primary.data} />}
    {finder && <CollegeFinder combos={finder.combos} initialId={finder.initialId} resetHref={activeYear ? yearHref(activeYear) : `/exams/${slug}/cutoff`} />}
    {pending && <section id={`cutoff-${pending.admissionYear}`} className="cutoff-section">
      <h2>{cutoffYearHeading(name, { year: pending.admissionYear, exam_year: pending.examYear })}</h2>
      <p>To be updated after {name} {pending.examYear} results. Institutes publish {name} {pending.examYear} cutoffs for {batchLabel(pending.admissionYear)} admissions only after the results, so there are no figures yet. Until then, use the {name} {examYearOf(summary.years[0])} cutoffs below as a guide.</p>
    </section>}
    {blocks.map((b, i) => { const y = summary.years.find((v) => v.year === b.year) || { year: b.year }; return b.data && b.data.data.length ? <Fragment key={b.year}><section id={`cutoff-${b.year}`} className="cutoff-section">
      <h2>{cutoffYearHeading(name, y)}</h2>
      <CutoffExpand label={`View all ${name} ${examYearOf(y)} cutoffs`} total={b.data.data.length} visible={activeYear ? Number.MAX_SAFE_INTEGER : OVERVIEW_ROWS} href={!activeYear && isMultiYear(summary) ? yearHref(b.year) : undefined}>
      {i === 0
        ? <ExamCutoffsClient slug={slug} examLabel={name} initial={b.data} heading={null} />
        : <><ExamCutoffs examLabel={name} cutoffs={b.data} heading={null} collegeHref={(s) => `/colleges/${s}/cutoff`} />
            </>}
      </CutoffExpand>
    </section>{i === 0 && <AdSlot slotKey="cutoff_mid" />}</Fragment> : null; })}
    {faqs.some((f) => f.answer.trim()) && <section className="cutoff-section cutoff-faq"><h2>{name} Cutoff FAQs</h2>
      {faqs.filter((f) => f.answer.trim()).map((f) => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}</section>}
    <AdSlot slotKey="cutoff_end" />
  </div></main>;
}
