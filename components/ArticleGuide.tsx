import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import JsonLd from './JsonLd';
import CollapsibleContent from './CollapsibleContent';
import { faqJsonLd } from '../lib/cutoffs';
import type { ArticleContent } from '../lib/article-content';
import {
  articleCourseName,
  articleHeadings,
  articleKind,
  articlePlace,
  articleTokens,
  fillTokens,
  inr,
  joinNames,
  lpa,
  type ArticleGuideSummary,
  type ArticleSeoInput
} from '../lib/article-seo';
import { displayNirfLabel } from '../lib/nirf-rank';

function feeRange(min: number, max: number) {
  if (!(min > 0)) return '';
  return max > min ? `${inr(min)} – ${inr(max)}` : inr(min);
}

function durationLabel(value: string | null) {
  if (!value) return '';
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    if (n < 6) return `${n} ${n === 1 ? 'year' : 'years'}`;
    if (n % 12 === 0) return `${n / 12} ${n / 12 === 1 ? 'year' : 'years'}`;
    return `${n} months`;
  }
  return value;
}

function autoSnapshot(article: ArticleSeoInput, summary: ArticleGuideSummary): string[] {
  const course = articleCourseName(article);
  const kind = articleKind(article.type);
  const paras: string[] = [];
  const f = summary.fees;
  if (f && f.n >= 5 && (kind === 'fees' || kind === 'budget' || kind === 'value')) {
    paras.push(`Across ${f.n.toLocaleString('en-IN')} published colleges here, the median recorded total fee is ${inr(f.median)}. The middle half of colleges sits between ${inr(f.p25)} and ${inr(f.p75)}.`);
    const high = f.bands.from5to10L + f.bands.over10L;
    if (high) paras.push(`${high.toLocaleString('en-IN')} colleges record ₹5 lakh or more, and ${f.bands.under1L.toLocaleString('en-IN')} record under ₹1 lakh. A low figure can belong to a shorter or part-time programme, so read the programme name.`);
  }
  const p = summary.packages;
  if (p && p.averageMedian && (kind === 'highest' || kind === 'gov' || kind === 'value')) {
    paras.push(`${p.n.toLocaleString('en-IN')} colleges here have a recorded average package, with a median of ${lpa(p.averageMedian)}${p.averageMin && p.averageMax && p.averageMax > p.averageMin ? ` and a range of ${lpa(p.averageMin)} to ${lpa(p.averageMax)}` : ''}.`);
    if (p.yearMin && p.yearMax) paras.push(`The placement years behind these figures run from ${p.yearMin === p.yearMax ? p.yearMin : `${p.yearMin} to ${p.yearMax}`}. Older years can understate or overstate today's outcomes.`);
  }
  if (summary.privateCount || summary.publicCount) {
    paras.push(`Of the published colleges, ${summary.privateCount.toLocaleString('en-IN')} are private and ${summary.publicCount.toLocaleString('en-IN')} are public${summary.unclassifiedCount ? `, with ${summary.unclassifiedCount.toLocaleString('en-IN')} not yet classified` : ''}.`);
  }
  if (summary.topStates.length > 1 && articlePlace(article) === 'India') {
    paras.push(`${joinNames(summary.topStates, true, 5)} have the most ${course} colleges on this list.`);
  } else if (summary.topCities.length > 1) {
    paras.push(`The cities with the most colleges here are ${joinNames(summary.topCities, true, 5)}.`);
  }
  return paras;
}

function autoCompare(article: ArticleSeoInput): { paragraphs: string[]; bullets: string[] } {
  const kind = articleKind(article.type);
  const course = articleCourseName(article);
  if (kind === 'fees' || kind === 'budget') {
    return {
      paragraphs: ['Start with the programme, not the number. A two-year full-time course and a one-year executive course are not priced the same way.'],
      bullets: [
        'Whether the fee covers the full programme or one year, and whether hostel, mess and other charges are extra.',
        `The exact award: degree, diploma or certificate, and the approving body for ${course}.`,
        'The entrance test and cut-off used in the latest admission cycle.',
        'The most recent official placement report, read as a reference year rather than a promise.'
      ]
    };
  }
  if (kind === 'exam' || kind === 'admission') {
    return {
      paragraphs: ['Eligibility wording on a profile is a starting point. The current official notice decides.'],
      bullets: [
        'Minimum marks in graduation (or Class 12) and any category relaxation.',
        'Which tests the college accepts this year, and whether it adds its own GD, WAT or interview.',
        'Application deadlines and the counselling or selection process.',
        'The total fee and the latest placement report for the programme you apply to.'
      ]
    };
  }
  return {
    paragraphs: ['A high package is one data point. Look at how many students it represents and which year it comes from.'],
    bullets: [
      'Average or median package for the full batch, not only the highest offer.',
      'Placement year, batch size and the share of students placed.',
      'The total programme fee, so you can judge the return yourself.',
      'The college\'s latest official placement report or NIRF data.'
    ]
  };
}

function autoFaqs(article: ArticleSeoInput, summary: ArticleGuideSummary) {
  const course = articleCourseName(article);
  const place = articlePlace(article);
  const kind = articleKind(article.type);
  const n = article.candidateCount.toLocaleString('en-IN');
  const faqs: Array<{ question: string; answer: string }> = [];
  faqs.push({
    question: kind === 'exam' ? `How many ${course} colleges accept ${article.exam?.name || 'this exam'}?` : `How many ${course} colleges are in this list?`,
    answer: `This list has ${n} ${kind === 'exam' || kind === 'admission' ? 'programme options' : 'colleges'} in our records. It only counts colleges with the data this guide needs, so official lists may show a different total.`
  });
  const f = summary.fees;
  if (f && f.n >= 5) {
    faqs.push({
      question: `What is the typical ${course} fee ${place === 'India' ? 'in India' : `in ${place}`}?`,
      answer: `For the ${f.n.toLocaleString('en-IN')} published colleges with a recorded total fee here, the median is ${inr(f.median)} and the middle half falls between ${inr(f.p25)} and ${inr(f.p75)}. Confirm the current fee notice before you apply.`
    });
  }
  const p = summary.packages;
  if (p && p.averageMedian) {
    faqs.push({
      question: `What average package do these ${course} colleges record?`,
      answer: `The median recorded average package across ${p.n.toLocaleString('en-IN')} colleges here is ${lpa(p.averageMedian)}${p.yearMin && p.yearMax ? `, from placement years ${p.yearMin === p.yearMax ? p.yearMin : `${p.yearMin}–${p.yearMax}`}` : ''}. Treat it as a historical record, not a promise.`
    });
  }
  if (summary.topStates.length > 1 && place === 'India') {
    faqs.push({ question: `Which states have the most ${course} colleges on this list?`, answer: `${joinNames(summary.topStates, true, 5)}, based on published profiles.` });
  } else if (summary.topCities.length > 1) {
    faqs.push({ question: `Which cities have the most colleges on this list?`, answer: `${joinNames(summary.topCities, true, 5)}, based on published profiles.` });
  }
  if (summary.exams.length) {
    faqs.push({ question: `Which entrance exams are linked to these colleges?`, answer: `In our records the most common are ${joinNames(summary.exams, false, 6)}. Check the exam each college uses in its latest admission notice.` });
  }
  faqs.push({ question: 'Why does a college show a different fee on its own website?', answer: 'Fees change by year, quota and programme, and our record may be for a different batch or exclude hostel and other charges. The official fee notice is the final word.' });
  return faqs.slice(0, 6);
}

export default function ArticleGuide({
  article,
  summary,
  content
}: {
  article: ArticleSeoInput;
  summary: ArticleGuideSummary | null;
  content: ArticleContent | null;
}) {
  if (!summary && !content) return null;
  const headings = articleHeadings(article);
  const tokens = articleTokens(article, summary);
  const t = (text: string) => fillTokens(text, tokens);
  const kind = articleKind(article.type);
  const course = articleCourseName(article);

  const snapshotParas = (content?.snapshot?.length ? content.snapshot : summary ? autoSnapshot(article, summary) : []).map(t);
  const compare = content?.compare?.paragraphs?.length || content?.compare?.bullets?.length
    ? { paragraphs: content.compare.paragraphs || [], bullets: content.compare.bullets || [] }
    : autoCompare(article);
  const faqs = (content?.faqs?.length ? content.faqs : summary ? autoFaqs(article, summary) : [])
    .map((faq) => ({ question: t(faq.question), answer: t(faq.answer) }));
  const faqLd = faqJsonLd(faqs);
  const first = (summary?.firstColleges || []).filter((college) => college.mainProgramme || college.placement);
  const f = summary?.fees;
  const showFees = kind === 'fees' || kind === 'budget' || kind === 'value';

  return (
    <section className="cutoff-section listing-guide article-guide is-compact">
      {faqLd && <JsonLd data={faqLd} />}
      <CollapsibleContent collapsedHeight={150}>
      {(snapshotParas.length > 0 || summary) && <>
        <h2>{headings.snapshot}</h2>
        {snapshotParas.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {summary && <div className="detail-table-wrap">
          <table className="detail-table">
            <caption className="muted">{course} list snapshot on College Decision ({tokens.year})</caption>
            <tbody>
              <tr><th scope="row">{kind === 'exam' || kind === 'admission' ? 'Programme options listed' : 'Colleges listed'}</th><td>{article.candidateCount.toLocaleString('en-IN')}{summary.colleges !== article.candidateCount ? ` (${summary.colleges.toLocaleString('en-IN')} colleges)` : ''}</td></tr>
              {(summary.privateCount || summary.publicCount) ? <tr><th scope="row">Private / public</th><td>{summary.privateCount.toLocaleString('en-IN')} / {summary.publicCount.toLocaleString('en-IN')}{summary.unclassifiedCount ? ` (${summary.unclassifiedCount} not classified)` : ''}</td></tr> : null}
              {showFees && f && f.n >= 5 ? <tr><th scope="row">Recorded total fee</th><td>Median {inr(f.median)} · middle 50% {inr(f.p25)} – {inr(f.p75)} ({f.n.toLocaleString('en-IN')} colleges)</td></tr> : null}
              {showFees && f && f.n >= 5 ? <tr><th scope="row">Fee bands</th><td>Under ₹1 lakh: {f.bands.under1L} · ₹1–3 lakh: {f.bands.from1to3L} · ₹3–5 lakh: {f.bands.from3to5L} · ₹5–10 lakh: {f.bands.from5to10L} · ₹10 lakh+: {f.bands.over10L}</td></tr> : null}
              {summary.packages?.averageMedian ? <tr><th scope="row">Recorded average package</th><td>Median {lpa(summary.packages.averageMedian)}{summary.packages.yearMin && summary.packages.yearMax ? ` · placement years ${summary.packages.yearMin === summary.packages.yearMax ? summary.packages.yearMin : `${summary.packages.yearMin}–${summary.packages.yearMax}`}` : ''}</td></tr> : null}
              {summary.topStates.length > 1 && articlePlace(article) === 'India' ? <tr><th scope="row">States with most listings</th><td>{joinNames(summary.topStates, true, 6)}</td></tr> : null}
              {summary.topCities.length ? <tr><th scope="row">Cities with most listings</th><td>{joinNames(summary.topCities, true, 6)}</td></tr> : null}
              {summary.exams.length ? <tr><th scope="row">Exams linked in our records</th><td>{summary.exams.slice(0, 6).map((exam, i) => <span key={exam.slug}>{i ? ', ' : ''}<Link prefetch={false} href={`/exams/${exam.slug}`}>{exam.name}</Link> ({exam.count})</span>)}</td></tr> : null}
            </tbody>
          </table>
        </div>}
      </>}

      {first.length > 0 && <>
        <h2>{headings.firstColleges}</h2>
        {(content?.firstCollegesLead?.length ? content.firstCollegesLead : [
          'The table shows the main full-time programme fee we hold for each college, and the latest placement year in our records (2020 or later).',
          'A dash means we do not hold that figure yet. Check it on the official site.'
        ]).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
        <div className="detail-table-wrap">
          <table className="detail-table">
            <thead><tr><th scope="col">College</th><th scope="col">Programme in our records</th><th scope="col">Total fee</th><th scope="col">Latest placement</th></tr></thead>
            <tbody>
              {first.map((college) => {
                const place = [college.city, college.state].filter(Boolean).join(', ');
                const programme = college.mainProgramme ? `${college.mainProgramme.name}${durationLabel(college.mainProgramme.duration) ? ` (${durationLabel(college.mainProgramme.duration)})` : ''}` : '—';
                const placement = college.placement
                  ? `${college.placement.year}${college.placement.programme && college.placement.programme !== college.mainProgramme?.name ? ` (${college.placement.programme})` : ''}: ${[college.placement.average ? `average ${lpa(college.placement.average)}` : '', college.placement.highest ? `highest ${lpa(college.placement.highest)}` : ''].filter(Boolean).join(', ')}`
                  : '—';
                return <tr key={college.instituteId}>
                  <td>{college.slug ? <Link prefetch={false} href={`/colleges/${college.slug}`}>{college.name}</Link> : college.name}{place ? <span className="muted"> · {place}</span> : null}{displayNirfLabel({ label: college.nirfLabel, rank: college.nirfRank }) ? <span className="muted"> · {displayNirfLabel({ label: college.nirfLabel, rank: college.nirfRank })}</span> : null}</td>
                  <td>{programme}</td>
                  <td>{college.mainProgramme ? feeRange(college.mainProgramme.minFee, college.mainProgramme.maxFee) : '—'}</td>
                  <td>{placement}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {summary && summary.rankedMissing.length > 0 && <p>
          {summary.rankedMissing.length} other {summary.rankedMissing.length === 1 ? 'college' : 'colleges'} in our {tokens.year} {course} ranking {summary.rankedMissing.length === 1 ? 'is' : 'are'} not in this fee list because we do not hold a total fee for {summary.rankedMissing.length === 1 ? 'it' : 'them'} yet: {summary.rankedMissing.map((college, i) => <span key={college.instituteId}>{i ? ', ' : ''}{college.slug ? <Link prefetch={false} href={`/colleges/${college.slug}`}>{college.name}</Link> : college.name}</span>)}.
        </p>}
      </>}

      {(content?.sections || []).map((section) => <div key={section.heading}>
        <h2>{t(section.heading)}</h2>
        {(section.paragraphs || []).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
        {section.bullets?.length ? <ul>{section.bullets.map((item) => <li key={item}>{t(item)}</li>)}</ul> : null}
        {section.table ? <div className="detail-table-wrap"><table className="detail-table">
          {section.table.caption ? <caption className="muted">{t(section.table.caption)}</caption> : null}
          <thead><tr>{section.table.columns.map((column) => <th scope="col" key={column}>{t(column)}</th>)}</tr></thead>
          <tbody>{section.table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{t(cell)}</td>)}</tr>)}</tbody>
        </table></div> : null}
      </div>)}

      <h2>{t(content?.compare?.heading || headings.compare)}</h2>
      {compare.paragraphs.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
      {compare.bullets.length ? <ul>{compare.bullets.map((item) => <li key={item}>{t(item)}</li>)}</ul> : null}
      {content?.links?.length ? <p>Related: {content.links.map((link, i) => <span key={link.href}>{i ? ' · ' : ''}<Link prefetch={false} href={link.href}>{t(link.label)}</Link></span>)}</p> : null}

      {faqs.length > 0 && <>
        <h2>{headings.faqs}</h2>
        <div className="cp-faq">{faqs.map((faq) => <details className="cp-faq-item" key={faq.question}><summary><h3>{faq.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
      </>}

      {content?.sources?.length ? <p className="muted article-guide-sources">Sources checked{content.updatedOn ? ` (${content.updatedOn})` : ''}: {content.sources.map((source, i) => <span key={source.url}>{i ? ' · ' : ''}<a href={source.url} target="_blank" rel="noopener noreferrer nofollow">{source.label}</a></span>)}</p> : null}
      </CollapsibleContent>
    </section>
  );
}
