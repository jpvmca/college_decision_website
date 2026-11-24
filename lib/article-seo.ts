/**
 * Headings, focus keywords and fallback copy for generated list articles
 * (/articles/top-{course}-colleges-in-india-with-fees-2026, budget, admission, exam, package articles).
 * Slugs, canonicals, H1s and titles are NOT built here and must not change.
 * All fallback copy is built from the backend guideSummary (real data only).
 */

export const ARTICLE_SEO_YEAR = 2026;
/**
 * Fallback only. The real, course-wise floor comes from the backend (config/fee-floors.ts) as
 * `feeFloor` in each article API response (and guideSummary.feeFloor): ₹1,000 for general
 * arts/science/commerce/diploma courses, ₹10,000 for professional courses.
 */
export const DEFAULT_FEE_FLOOR = 10000;

/** A recorded fee is quotable only at or above the course floor. */
export function isQuotableFee(value: unknown, feeFloor: number = DEFAULT_FEE_FLOOR) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= feeFloor;
}

export type ArticleKind = 'fees' | 'budget' | 'admission' | 'exam' | 'highest' | 'gov' | 'value' | 'other';

export type ArticleGuideCollege = {
  instituteId: number;
  name: string;
  slug: string | null;
  city: string | null;
  state: string | null;
  instituteType: string | null;
  mainProgramme: { name: string; duration: string | null; minFee: number; maxFee: number } | null;
  placement: { programme: string; year: number; average: number | null; highest: number | null } | null;
  nirfRank: number | null;
  nirfLabel?: string | null;
};

export type ArticleGuideSummary = {
  version: 1 | 2;
  feeFloor?: number;
  articleType: string;
  course: { id: number; name: string; slug: string } | null;
  listRows: number;
  colleges: number;
  publishedColleges: number;
  privateCount: number;
  publicCount: number;
  unclassifiedCount: number;
  topStates: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
  fees: null | {
    n: number; min: number; p25: number; median: number; p75: number; max: number;
    bands: { under1L: number; from1to3L: number; from3to5L: number; from5to10L: number; over10L: number };
  };
  packages: null | {
    n: number; averageMedian: number | null; averageMin: number | null; averageMax: number | null;
    highestMax: number | null; yearMin: number | null; yearMax: number | null;
  };
  nirfRanked: number;
  exams: Array<{ name: string; slug: string; count: number }>;
  firstColleges: ArticleGuideCollege[];
  rankedMissing: Array<{ instituteId: number; name: string; slug: string | null; city: string | null }>;
  lowFeeFlags: { minimumQuotable: number; count: number; examples: Array<{ institute: string; programme: string; fee: number }> };
};

export type ArticleSeoInput = {
  type: string;
  course: { name: string; slug: string };
  exam?: { name: string; slug: string } | null;
  state?: { name: string; slug: string } | null;
  location?: { name: string; slug: string } | null;
  budgetLakh: number | null;
  packageThresholdLakh?: number | null;
  thresholdFallback?: boolean;
  thresholdQualifyingCount?: number;
  candidateCount: number;
};

export type ArticleHeadings = {
  list: string;
  snapshot: string;
  firstColleges: string;
  compare: string;
  faqs: string;
};

export function articleKind(type: string): ArticleKind {
  if (type.includes('average-package-exceeds-fees')) return 'value';
  if (type.includes('highest-package-threshold')) return 'highest';
  if (type.includes('government-state-avg-package') || type.includes('gov-avg-package')) return 'gov';
  if (type.includes('exam-admission')) return 'exam';
  if (type.includes('budget')) return 'budget';
  if (type.includes('admission')) return 'admission';
  if (type.includes('fees')) return 'fees';
  return 'other';
}

export function articleCourseName(article: ArticleSeoInput) {
  return article.course.name.trim();
}

export function articlePlace(article: ArticleSeoInput) {
  return article.location?.name || article.state?.name || 'India';
}

export function inr(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value >= 100000) {
    const lakh = Math.round((value / 100000) * 100) / 100;
    return `₹${lakh.toLocaleString('en-IN')} lakh`;
  }
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function lpa(value: number | null | undefined) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `₹${(Math.round(n * 100) / 100).toLocaleString('en-IN')} LPA`;
}

export function joinNames(items: Array<{ name: string; count?: number }>, withCounts = true, limit = 5) {
  return items.slice(0, limit)
    .map((item) => (withCounts && typeof item.count === 'number' ? `${item.name} (${item.count.toLocaleString('en-IN')})` : item.name))
    .join(', ');
}

/** "Top {course} Colleges in {place} 2026" style H2s, worded per article type. */
export function articleHeadings(article: ArticleSeoInput, year = ARTICLE_SEO_YEAR): ArticleHeadings {
  const course = articleCourseName(article);
  const place = articlePlace(article);
  const kind = articleKind(article.type);
  const budget = article.budgetLakh;
  const exam = article.exam?.name || 'the entrance exam';
  const threshold = article.packageThresholdLakh || 15;
  switch (kind) {
    case 'fees':
      return {
        list: `Top ${course} Colleges in India ${year}`,
        snapshot: `${course} fees in India: what our records show`,
        firstColleges: `Fees and placements at the best ${course} colleges in India`,
        compare: `How to compare the top ${course} colleges in India with fees`,
        faqs: `FAQs on ${course} fees in India`
      };
    case 'budget':
      return {
        list: `Top ${course} Colleges in India ${year} under ₹${budget} lakh`,
        snapshot: `${course} colleges under ₹${budget} lakh: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to shortlist the best ${course} colleges under ₹${budget} lakh`,
        faqs: `FAQs on ${course} colleges under ₹${budget} lakh`
      };
    case 'admission':
      return {
        list: `Top ${course} Colleges in India ${year}: eligibility and admission`,
        snapshot: `${course} admission in India: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to check ${course} eligibility before you apply`,
        faqs: `FAQs on ${course} admission and eligibility`
      };
    case 'exam':
      return {
        list: `Top ${course} Colleges Accepting ${exam} ${year}`,
        snapshot: `${course} colleges accepting ${exam}: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to shortlist the best ${course} colleges accepting ${exam}`,
        faqs: `FAQs on ${course} colleges accepting ${exam}`
      };
    case 'highest':
      return {
        list: article.thresholdFallback
          ? `Top ${course} Colleges in ${place} ${year} by highest package`
          : `Top ${course} Colleges in ${place} ${year} with ₹${threshold} lakh+ highest package`,
        snapshot: `${course} placements in ${place}: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to read highest-package figures for ${course} colleges in ${place}`,
        faqs: `FAQs on ${course} placements in ${place}`
      };
    case 'gov':
      return {
        list: `Top Government ${course} Colleges in ${place} ${year}`,
        snapshot: `Government ${course} colleges in ${place}: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to compare the best government ${course} colleges in ${place}`,
        faqs: `FAQs on government ${course} colleges in ${place}`
      };
    case 'value':
      return {
        list: `Top ${course} Colleges in ${place} ${year} where average package exceeds fees`,
        snapshot: `${course} fees and packages in ${place}: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to judge fee value at the best ${course} colleges in ${place}`,
        faqs: `FAQs on ${course} fees and packages in ${place}`
      };
    default:
      return {
        list: `Top ${course} Colleges in ${place} ${year}`,
        snapshot: `${course} colleges in ${place}: what our records show`,
        firstColleges: `Fees and placements at the colleges listed first`,
        compare: `How to compare ${course} colleges in ${place}`,
        faqs: `FAQs on ${course} colleges in ${place}`
      };
  }
}

/**
 * Tokens a hand-written article-content JSON may use so DB counts stay current:
 * {{count}} list size · {{colleges}} unique colleges · {{published}} · {{private}} · {{public}}
 * {{feeMedian}} {{feeP25}} {{feeP75}} {{feeMin}} {{feeMax}} {{feeN}} · {{pkgMedian}} {{pkgMin}} {{pkgMax}} {{highestMax}}
 * {{pkgYearMin}} {{pkgYearMax}} · {{course}} {{place}} {{year}} {{exam}} {{budget}} {{threshold}}
 */
export function articleTokens(article: ArticleSeoInput, summary: ArticleGuideSummary | null, year = ARTICLE_SEO_YEAR): Record<string, string> {
  const fees = summary?.fees;
  const pk = summary?.packages;
  const count = (n: number | undefined | null) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '');
  return {
    count: count(article.candidateCount),
    colleges: count(summary?.colleges),
    published: count(summary?.publishedColleges),
    private: count(summary?.privateCount),
    public: count(summary?.publicCount),
    feeMedian: fees ? inr(fees.median) : '',
    feeP25: fees ? inr(fees.p25) : '',
    feeP75: fees ? inr(fees.p75) : '',
    feeMin: fees ? inr(fees.min) : '',
    feeMax: fees ? inr(fees.max) : '',
    feeN: count(fees?.n),
    pkgMedian: lpa(pk?.averageMedian),
    pkgMin: lpa(pk?.averageMin),
    pkgMax: lpa(pk?.averageMax),
    highestMax: lpa(pk?.highestMax),
    pkgYearMin: pk?.yearMin ? String(pk.yearMin) : '',
    pkgYearMax: pk?.yearMax ? String(pk.yearMax) : '',
    course: articleCourseName(article),
    place: articlePlace(article),
    year: String(year),
    exam: article.exam?.name || '',
    budget: article.budgetLakh ? String(article.budgetLakh) : '',
    threshold: article.packageThresholdLakh ? String(article.packageThresholdLakh) : ''
  };
}

export function fillTokens(text: string, tokens: Record<string, string>) {
  return text.replace(/\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g, (match, key: string) => (tokens[key] ? tokens[key] : match));
}

/** Fallback hero intro when no hand-written content file exists. Short paragraphs, real data only. */
export function defaultArticleIntro(article: ArticleSeoInput, summary: ArticleGuideSummary | null, year = ARTICLE_SEO_YEAR): string[] {
  const course = articleCourseName(article);
  const place = articlePlace(article);
  const kind = articleKind(article.type);
  const n = article.candidateCount.toLocaleString('en-IN');
  const fees = summary?.fees;
  const pk = summary?.packages;
  const paras: string[] = [];
  if (kind === 'fees' || kind === 'budget') {
    const scope = kind === 'budget' ? ` with a main-programme fee up to ₹${article.budgetLakh} lakh` : '';
    paras.push(`We hold a recorded total fee for ${n} published ${course} ${article.candidateCount === 1 ? 'college' : 'colleges'} in India${scope}.`);
    if (fees && fees.n >= 5) paras.push(`The middle half of these colleges sits between ${inr(fees.p25)} and ${inr(fees.p75)}, with a median of ${inr(fees.median)}.`);
    paras.push(`Ranked colleges come first in the list for the top ${course} colleges in ${place} ${year}. The rest follow by fee, lowest first.`);
    return paras;
  }
  if (kind === 'exam') {
    paras.push(`Our records link ${n} ${course} programme options to ${article.exam?.name || 'this exam'}.`);
    paras.push(`Ranked colleges come first, then the other published colleges in alphabetical order. Confirm the current exam notice and each college's own process before you apply.`);
    return paras;
  }
  if (kind === 'admission') {
    paras.push(`This guide lists ${n} ${course} programme options with recorded eligibility and duration.`);
    paras.push(`Ranked colleges come first. Eligibility wording can change by year, so treat it as a starting point for the official notice.`);
    return paras;
  }
  if (kind === 'highest' || kind === 'gov' || kind === 'value') {
    if (kind === 'highest' && article.thresholdFallback) {
      paras.push(`No ${course} college in ${place} in our records has a 2020-or-later non-executive highest package of ₹${article.packageThresholdLakh} lakh or more.`);
      paras.push(`The list below shows the highest recorded packages in the state instead, with flagship programmes preferred.`);
    } else {
      paras.push(`${n} ${kind === 'gov' ? 'government ' : ''}${course} ${article.candidateCount === 1 ? 'college' : 'colleges'} in ${place} ${article.candidateCount === 1 ? 'meets' : 'meet'} this guide's placement test in our records.`);
    }
    if (pk && pk.averageMedian) paras.push(`Their median recorded average package is ${lpa(pk.averageMedian)}${pk.yearMin && pk.yearMax ? `, from placement years ${pk.yearMin === pk.yearMax ? pk.yearMin : `${pk.yearMin} to ${pk.yearMax}`}` : ''}.`);
    paras.push(`Packages are historical records, not offers. Check the latest official placement report before you decide.`);
    return paras;
  }
  paras.push(`This guide lists ${n} ${course} options in ${place}.`);
  return paras;
}

export function defaultListLead(article: ArticleSeoInput, summary: ArticleGuideSummary | null) {
  const kind = articleKind(article.type);
  if (kind === 'fees' || kind === 'budget') {
    return 'Ranked colleges appear first. Each card shows the college\'s main full-time programme where we hold its fee, otherwise the programme we do hold, so read the programme name.';
  }
  if (kind === 'highest' && article.thresholdFallback) {
    return `No college met the ₹${article.packageThresholdLakh} lakh threshold in our 2020-or-later non-executive records. The list is sorted by the highest recorded package in the state.`;
  }
  if (kind === 'highest' || kind === 'gov' || kind === 'value') return 'Ranked colleges appear first, then the rest by recorded package.';
  return summary && summary.publishedColleges ? 'Ranked colleges appear first, then colleges with a published profile.' : 'Ranked colleges appear first.';
}
