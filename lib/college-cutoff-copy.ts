import type { YearRow } from '../components/CollegeCutoffYearTables';
import { examYearOf, formatMetric, type CollegeCutoffSummary } from './cutoffs';

const CAT_LABEL: Record<string, string> = { OPEN: 'General', EWS: 'EWS', OBC_NCL: 'OBC-NCL', SC: 'SC', ST: 'ST', PWD: 'PwD' };
const QUOTA_LABEL: Record<string, string> = {
  AI: 'All India', HS: 'Home State', OS: 'Other State', JK: 'Jammu & Kashmir', LA: 'Ladakh', GO: 'Goa', STATE: 'State',
  DEEMED: 'Deemed', HU: 'Home University', OHU: 'Other than Home University', MGMT: 'Management'
};

export const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

export function hasRealMetric(r: Pick<YearRow, 'opening_rank' | 'closing_rank' | 'cutoff_score' | 'cutoff_percentile'>) {
  const pos = (v: unknown) => { const n = Number(v); return v != null && v !== '' && Number.isFinite(n) && n > 0; };
  return pos(r.closing_rank) || pos(r.opening_rank) || pos(r.cutoff_score) || pos(r.cutoff_percentile);
}

export function categoryLabel(code: string | null | undefined) {
  return (code && CAT_LABEL[code]) || code || 'the listed';
}

export function quotaLabel(code: string | null | undefined) {
  return (code && QUOTA_LABEL[code]) || code || null;
}

/** Short, factual note about how this exam's counselling typically publishes cutoffs. */
export function examCounselNote(slug: string, examName: string) {
  const name = clean(examName);
  switch (slug) {
    case 'jee-main':
      return `${name} ranks for NITs, IIITs and GFTIs are allotted through JoSAA (and CSAB special rounds, when held). Opening rank is the first (best) rank allotted in that round; closing rank is the last. Home State, Other State and All India quotas are listed separately when the data includes them.`;
    case 'jee-advanced':
      return `IIT seats are allotted through JoSAA on ${name} rank. A lower rank is more competitive. Compare the same category, quota and round; later rounds can move the closing rank.`;
    case 'neet':
      return `${name} cutoffs here are All India ranks from MCC or the counselling quota named in the table (for example All India or Deemed). A lower rank is more competitive. State-quota ranks, when present, apply only to eligible candidates.`;
    case 'gate':
      return `${name} cutoffs may be scores or ranks, depending on the institute process (including CCMT for many M.Tech seats). Read the metric column and the official source linked on this page.`;
    case 'cat':
      return `${name} figures are usually minimum overall (and sometimes sectional) percentiles used for shortlisting, not a final admission offer. Meeting a published minimum does not guarantee an interview call or a seat.`;
    case 'nmat':
      return `${name} figures are typically minimum overall and sectional scores used for PI shortlisting at a campus. Confirm the live admission notice before you apply.`;
    case 'clat':
      return `${name} cutoffs for NLUs are counselling closing ranks (or scores) by round and category. A lower rank is more competitive.`;
    case 'tnea':
      return `Tamil Nadu Engineering Admissions (${name}) publishes community-wise cutoffs from official counselling. Compare the same community/category and the same year; do not mix one year’s closing figure with another year’s applicant list.`;
    case 'mh-cet':
      return `Maharashtra CAP counselling uses ${name} ranks. Home University / Other than Home University and All India quotas, when listed, are not interchangeable. A lower rank is more competitive.`;
    case 'kcet':
      return `Karnataka ${name} counselling closing ranks are listed by category and year. A lower rank is more competitive; later rounds can differ from the first round.`;
    case 'keam':
      return `Kerala ${name} counselling closing ranks are listed by branch, category and year. A lower rank is more competitive.`;
    case 'comedk-uget':
      return `COMEDk UGET counselling closing ranks apply to participating private colleges in Karnataka. Compare the same category and round.`;
    case 'ap-eapcet':
      return `Andhra Pradesh EAPCET counselling closing ranks are listed by branch, category and year. A lower rank is more competitive.`;
    case 'ts-eapcet':
      return `Telangana EAPCET counselling closing ranks are listed by branch, category and year. A lower rank is more competitive.`;
    case 'wbjee':
      return `WBJEE counselling closing ranks are listed by course, category and year. A lower rank is more competitive.`;
    case 'cuet-ug':
      return `CUET-UG cutoffs may be scores or ranks depending on the university’s admission list. Read the table caption and the official source.`;
    case 'bitsat':
      return `BITSAT cutoffs are typically closing scores for a campus and programme. A higher score is more competitive.`;
    default:
      return `${name} cutoffs on this page are shown as published for each year, category and (where available) quota and gender seat pool. For rank lists, a lower rank is more competitive; for scores and percentiles, a higher figure is usually more competitive.`;
  }
}

type Loaded = CollegeCutoffSummary & { institute: NonNullable<CollegeCutoffSummary['institute']> };
export type LoadedSection = { exam: Loaded['exams'][number]; y: Loaded['exams'][number]['years'][number]; data: { round: number | null; rows: YearRow[] } };

export function locationOf(s: Loaded) {
  return [s.institute.city, s.institute.state].filter(Boolean).join(', ');
}

export function coverageRows(s: Loaded) {
  return s.exams.map((e) => ({
    exam: clean(e.name),
    slug: e.slug,
    years: e.years.map((y) => y.year).sort((a, b) => b - a),
    programmes: Math.max(...e.years.map((y) => y.programmes), 0),
    metric: e.metric,
    aggregator: e.years.some((y) => y.aggregator)
  }));
}

export function uniqueSources(sections: LoadedSection[]) {
  const seen = new Set<string>();
  const out: Array<{ url: string; aggregator: boolean; exam: string; year: number }> = [];
  for (const sec of sections) {
    for (const r of sec.data.rows) {
      if (!r.source_url || seen.has(r.source_url)) continue;
      seen.add(r.source_url);
      out.push({ url: r.source_url, aggregator: r.quality_flag === 'source_aggregator', exam: clean(sec.exam.name), year: sec.y.year });
    }
  }
  return out;
}

/** Year-over-year closing values for General / OPEN, gender-neutral (or unspecified), one programme per row. */
export function trendTable(sections: LoadedSection[], examSlug: string) {
  const secs = sections.filter((x) => x.exam.slug === examSlug && x.exam.metric === 'rank').sort((a, b) => a.y.year - b.y.year);
  if (secs.length < 2) return null;
  const years = secs.map((s) => s.y.year);
  const pick = (rows: YearRow[], program: string) => {
    const pool = rows.filter((r) => r.program_name === program && r.category_code === 'OPEN' && (r.gender_pool === 'GENDER_NEUTRAL' || !r.gender_pool) && hasRealMetric(r));
    if (!pool.length) return null;
    const prefer = pool.find((r) => r.quota === 'AI' || r.quota === 'OS') || pool[0];
    return prefer;
  };
  const programs = new Set<string>();
  secs.forEach((s) => s.data.rows.forEach((r) => programs.add(r.program_name)));
  const rows: Array<{ program: string; quota: string | null; values: Array<{ year: number; closing: number | null; opening: number | null }> }> = [];
  for (const program of Array.from(programs)) {
    const values = secs.map((s) => {
      const r = pick(s.data.rows, program);
      return { year: s.y.year, closing: r?.closing_rank ?? null, opening: r?.opening_rank ?? null };
    });
    if (values.every((v) => v.closing == null || v.closing <= 0)) continue;
    const sample = secs.map((s) => pick(s.data.rows, program)).find(Boolean);
    rows.push({ program, quota: sample?.quota ?? null, values });
    if (rows.length >= 8) break;
  }
  if (!rows.length) return null;
  return { years, rows, examName: clean(secs[0].exam.name) };
}

export function buildLead(s: Loaded) {
  const name = clean(s.institute.name);
  const loc = locationOf(s);
  const exams = s.exams.map((e) => clean(e.name));
  const examList = exams.length === 1 ? exams[0] : exams.length === 2 ? `${exams[0]} and ${exams[1]}` : `${exams.slice(0, -1).join(', ')} and ${exams[exams.length - 1]}`;
  const yearBits = s.exams.map((e) => `${clean(e.name)} ${e.years.map((y) => examYearOf(y)).join(', ')}`);
  const rankish = s.exams.some((e) => e.metric === 'rank');
  const metricHint = rankish
    ? 'Rank cutoffs show opening and closing ranks where both were published; a lower rank is more competitive.'
    : s.exams.every((e) => e.metric === 'percentile')
      ? 'Percentile cutoffs are the minimum figures used for shortlisting, not a guarantee of admission.'
      : 'Score or percentile cutoffs are the minimum figures published for shortlisting or allotment.';
  const place = loc ? ` in ${loc}` : '';
  return `${name}${place} admits students through ${examList}. The tables below list ${yearBits.join('; ')}, grouped by exam with the latest year first. ${metricHint}`;
}

export function buildIntroParagraphs(s: Loaded, sections: LoadedSection[]) {
  const name = clean(s.institute.name);
  const paras: string[] = [];
  for (const e of s.exams) {
    const examName = clean(e.name);
    const latest = e.years[0];
    const sec = sections.find((x) => x.exam.slug === e.slug && x.y.year === latest.year);
    const h = e.headline;
    const bits: string[] = [];
    if (h && Number(h.value) > 0) {
      const cat = categoryLabel(h.category);
      const quota = quotaLabel(h.quota);
      const prog = clean(h.program_name);
      if (e.metric === 'rank') {
        bits.push(`For ${examYearOf(latest)} admissions, the closing rank for ${prog} at ${name} was ${formatMetric(h.value, 'rank')} in the ${cat} category${quota ? ` (${quota} quota)` : ''}, gender-neutral pool, in round ${h.round}.`);
      } else if (e.metric === 'percentile') {
        bits.push(`${name} lists a minimum ${examName} overall percentile of ${Number(h.value)} for the ${cat} category${h.quality_flag === 'source_aggregator' ? ' (figure reported by a secondary source; confirm on the official policy)' : ''} for the latest year on this page.`);
      } else {
        bits.push(`${name} lists a minimum ${examName} score of ${Number(h.value)} for the ${cat} category in the latest year on this page${h.quality_flag === 'source_aggregator' ? ' (secondary source; confirm officially)' : ''}.`);
      }
    }
    const nProg = latest.programmes;
    const nRound = latest.rounds;
    if (nProg) bits.push(`The ${latest.year} ${examName} list covers ${nProg} programme${nProg === 1 ? '' : 's'}${nRound && e.metric === 'rank' ? ` and up to ${nRound} counselling round${nRound === 1 ? '' : 's'} in the source data; the tables show the final round available` : ''}.`);
    const realCount = sec ? sec.data.rows.filter(hasRealMetric).length : latest.rows;
    if (realCount) bits.push(`We show ${realCount} published ${e.metric === 'rank' ? 'rank' : e.metric} row${realCount === 1 ? '' : 's'} for that latest year.`);
    if (e.years.length > 1) bits.push(`Earlier years (${e.years.slice(1).map((y) => y.year).join(', ')}) are included so you can see how the same programme has moved, without treating any year as a prediction for the next round.`);
    if (bits.length) paras.push(bits.join(' '));
  }
  paras.push(`Use these figures only as a historical guide. Counselling authorities revise seat matrices and cutoffs every year, and a rank or percentile that would have been enough in one year may not be enough in the next.`);
  return paras;
}

export function buildHowToRead(s: Loaded) {
  const parts = s.exams.map((e) => examCounselNote(e.slug, e.name));
  parts.push('Always compare the same programme, category, quota and gender seat pool. Official PDFs and counselling portals remain the source of truth if a figure here differs from a later revision.');
  return parts;
}

export function extraFaqs(s: Loaded, sections: LoadedSection[]) {
  const name = clean(s.institute.name);
  const faqs: Array<{ question: string; answer: string }> = [];
  const sources = uniqueSources(sections);
  const official = sources.filter((x) => !x.aggregator);
  const agg = sources.filter((x) => x.aggregator);

  faqs.push({
    question: `How should I read the cutoff tables for ${name}?`,
    answer: s.exams.some((e) => e.metric === 'rank')
      ? `For rank-based exams, the opening rank is the first (best) rank allotted in that round and the closing rank is the last. A lower rank is more competitive. Read the category, quota and gender columns before you compare your rank with a cell in the table.`
      : `These tables list the published minimum ${s.exams[0]?.metric || 'score'} by category. Meeting a published minimum is usually a shortlisting condition, not an offer of admission.`
  });
  faqs.push({
    question: `Does meeting the cutoff guarantee admission to ${name}?`,
    answer: `No. A cutoff is the last rank, score or percentile at which a seat was allotted (or the minimum used for shortlisting) in that year, round and category. Seat matrices, applicant numbers and later-round movements change every year.`
  });
  if (official.length) {
    faqs.push({
      question: `Where do the ${name} cutoff figures come from?`,
      answer: `From official counselling or institute documents linked in the Sources section (${official.map((x) => `${x.exam} ${x.year}`).join('; ')}). If an official PDF is later revised, treat the revised document as authoritative.`
    });
  } else if (agg.length) {
    faqs.push({
      question: `Are the ${name} cutoff figures official?`,
      answer: `The figures on this page are tagged as coming from a secondary (aggregator) publication because an official document was not available when they were recorded. Confirm them on the institute’s or counselling authority’s latest notice before you rely on them.`
    });
  }
  const loc = locationOf(s);
  faqs.push({
    question: `Where can I read more about ${name}?`,
    answer: `See the ${name} college profile for courses, fees and admissions overview${loc ? ` (${loc})` : ''}, and the exam cutoff pages linked above for the same exam across colleges.`
  });
  return faqs;
}
