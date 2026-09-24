/** Smart exam SEO templates for all published exams. */

export type ExamSeoSource = {
  exam: {
    name: string;
    slug: string;
    fullName?: string | null;
    displayName?: string | null;
    htmlContent?: string | null;
    description?: string | null;
    longDescription?: string | null;
    eligibility?: string | null;
    pattern?: string | null;
    applicationFees?: string | null;
    conductedBy?: string | null;
    course?: { name: string | null; slug: string | null; publishedSlug?: string | null } | null;
  };
  programmeCount?: number;
  instituteCount?: number;
  programmes: Array<{ programme_name: string }>;
  colleges: Array<{ name: string }>;
  fees?: {
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
  } | null;
};

export type ExamSeoPack = {
  year: number;
  label: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  intent: 'counselling' | 'cutoff' | 'general';
};

const KEEP_2026 = new Set(['cat', 'snap', 'nmat', 'ibsat', 'mat', 'atma', 'micat', 'gmat']);
const COUNSELLING = new Set([
  'tnea', 'upsee', 'kcet', 'keam', 'mht-cet', 'mh-cet', 'wbjee', 'ojee', 'gujcet',
  'ts-eamcet', 'ap-eamcet', 'comedk-uget', 'jac', 'jac-delhi', 'pgcet'
]);
const CUTOFF = new Set(['jee-main', 'jee-advanced', 'neet', 'gate', 'cat', 'bitsat', 'nata', 'clat']);

function strip(value: unknown) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : null;
}

export function examLabel(exam: ExamSeoSource['exam']) {
  const name = strip(exam.name);
  const display = strip(exam.displayName);
  if (name && name.length <= 32) return name;
  if (display && display.length <= 32) return display;
  return name || display || strip(exam.fullName) || 'Exam';
}

function yearFromText(text: string): number | null {
  const matches = text.match(/20(?:2[6-9]|3[0-5])/g) || [];
  if (!matches.length) return null;
  const counts = new Map<string, number>();
  for (const y of matches) counts.set(y, (counts.get(y) || 0) + 1);
  let best = matches[0];
  let bestN = 0;
  for (const [y, n] of counts) {
    if (n > bestN || (n === bestN && Number(y) > Number(best))) {
      best = y;
      bestN = n;
    }
  }
  return Number(best);
}

export function detectExamYear(profile: ExamSeoSource): number {
  const guide = [profile.exam.htmlContent || '', profile.exam.longDescription || '', profile.exam.description || ''].join(' ');
  const fromGuide = yearFromText(guide);
  if (fromGuide) return fromGuide;
  if (KEEP_2026.has(profile.exam.slug)) return 2026;
  return 2027;
}

function intentOf(slug: string, name: string): ExamSeoPack['intent'] {
  const blob = `${slug} ${name}`.toLowerCase();
  if (COUNSELLING.has(slug) || blob.includes('counselling') || blob.includes('counseling') || blob.includes('tnea')) return 'counselling';
  if (CUTOFF.has(slug) || blob.includes('cutoff') || blob.includes('cut-off')) return 'cutoff';
  return 'general';
}

function h1For(label: string, year: number, intent: ExamSeoPack['intent']) {
  if (intent === 'counselling') return `${label} ${year}: Counselling, Cutoff, Colleges & Fees`;
  if (intent === 'cutoff') return `${label} ${year}: Eligibility, Cutoff, Colleges & Fees`;
  return `${label} ${year}: Eligibility, Counselling, Colleges & Fees`;
}

type Override = Partial<Pick<ExamSeoPack, 'h1' | 'title' | 'description' | 'keywords' | 'intro' | 'intent'>>;

function overrides(year: number, institutes: number, feeRange: string | null): Record<string, Override> {
  const colleges = institutes ? `${institutes.toLocaleString('en-IN')} mapped colleges` : 'mapped colleges';
  const fees = feeRange ? ` Fees typically range ${feeRange}.` : '';
  return {
    'jee-main': {
      intent: 'cutoff',
      h1: `JEE Main ${year}: Eligibility, Cutoff, Colleges & Fees`,
      title: `JEE Main ${year}: Eligibility, Cutoff, Colleges & Fees`,
      description: `Planning JEE Main ${year} for B.Tech admission? Check eligibility, exam pattern, counselling context, ${colleges}, and fee ranges before you apply.${fees}`,
      keywords: [`JEE Main ${year}`, 'JEE Main eligibility', 'JEE Main cutoff', 'colleges accepting JEE Main', 'JEE Main counselling'],
      intro: `Use this JEE Main ${year} profile to compare eligibility, cutoff context, counselling routes, ${colleges}, and programme fees before shortlisting B.Tech colleges.`
    },
    neet: {
      intent: 'cutoff',
      h1: `NEET ${year}: Eligibility, Cutoff, Colleges & Fees`,
      title: `NEET ${year}: Eligibility, Cutoff, Medical Colleges & Fees`,
      description: `Preparing for NEET ${year}? Review eligibility, cutoff context, counselling routes, ${colleges}, and medical/dental fee ranges before you apply.${fees}`,
      keywords: [`NEET ${year}`, 'NEET eligibility', 'NEET cutoff', 'colleges accepting NEET', 'NEET counselling'],
      intro: `This NEET ${year} guide summarises eligibility, cutoff and counselling context, plus ${colleges} with recorded fee ranges for medical pathways.`
    },
    cat: {
      intent: 'cutoff',
      h1: `CAT ${year}: Eligibility, Cutoff, MBA Colleges & Fees`,
      title: `CAT ${year}: Eligibility, Cutoff, MBA Colleges & Fees`,
      description: `Planning CAT ${year} for MBA/PGDM? Compare eligibility, percentile/cutoff context, ${colleges}, and programme fees before applications open.${fees}`,
      keywords: [`CAT ${year}`, 'CAT eligibility', 'CAT cutoff', 'MBA colleges accepting CAT', 'CAT admission'],
      intro: `Use CAT ${year} eligibility, cutoff context, and ${colleges} to shortlist MBA/PGDM options, then confirm official IIM and institute notices.`
    },
    gate: {
      intent: 'cutoff',
      h1: `GATE ${year}: Eligibility, Cutoff, M.Tech Colleges & Fees`,
      title: `GATE ${year}: Eligibility, Cutoff, Colleges & Fees`,
      description: `GATE ${year} for M.Tech/ME and PSU routes: eligibility, cutoff context, ${colleges}, and fee ranges to compare before you apply.${fees}`,
      keywords: [`GATE ${year}`, 'GATE eligibility', 'GATE cutoff', 'colleges accepting GATE', 'M.Tech admission'],
      intro: `This GATE ${year} profile links eligibility and cutoff context with ${colleges} and recorded fees for postgraduate engineering pathways.`
    },
    tnea: {
      intent: 'counselling',
      h1: `TNEA ${year}: Counselling, Cutoff, Colleges & Fees`,
      title: `TNEA ${year}: Counselling, Cutoff, Engineering Colleges & Fees`,
      description: `TNEA ${year} engineering counselling in Tamil Nadu: rank/cutoff context, seat allotment steps, ${colleges}, and fee ranges.${fees}`,
      keywords: [`TNEA ${year}`, 'TNEA counselling', 'TNEA cutoff', 'TNEA colleges', 'Tamil Nadu engineering admission'],
      intro: `Plan TNEA ${year} counselling with cutoff context, ${colleges}, and fee evidence for Tamil Nadu B.Tech/B.E. seats.`
    },
    'nchmct-jee': {
      intent: 'general',
      h1: `NCHMCT JEE ${year}: Eligibility, Colleges, Counselling & Fees`,
      title: `NCHMCT JEE ${year}: Eligibility, Hotel Management Colleges & Fees`,
      description: `NCHMCT JEE ${year} for hotel management: eligibility, counselling context, ${colleges}, and fee ranges before you apply.${fees}`,
      keywords: [`NCHMCT JEE ${year}`, 'NCHMCT JEE eligibility', 'hotel management colleges', 'NCHMCT counselling', 'NCHMCT JEE fees'],
      intro: `Explore NCHMCT JEE ${year} eligibility, counselling context, ${colleges}, and BHM fee ranges for hospitality programmes.`
    },
    pgcet: {
      intent: 'counselling',
      h1: `PGCET ${year}: Counselling, Cutoff, Colleges & Fees`,
      title: `PGCET ${year}: Counselling, MBA/M.Tech Colleges & Fees`,
      description: `PGCET ${year} counselling and cutoff context for postgraduate seats: ${colleges}, eligibility notes, and fee ranges.${fees}`,
      keywords: [`PGCET ${year}`, 'PGCET counselling', 'PGCET cutoff', 'colleges accepting PGCET', 'PGCET MBA'],
      intro: `Use PGCET ${year} for counselling and cutoff research across ${colleges}, then verify state counselling notices and institute fees.`
    }
  };
}

function defaultDescription(
  label: string,
  year: number,
  intent: ExamSeoPack['intent'],
  courseName: string,
  institutes: number,
  feeRange: string | null
) {
  const job =
    intent === 'counselling'
      ? 'counselling steps, cutoff context, and college options'
      : intent === 'cutoff'
        ? 'eligibility, cutoff context, and college options'
        : 'eligibility, counselling context, and college options';
  const colleges = institutes ? ` It currently maps ${institutes.toLocaleString('en-IN')} colleges` : '';
  const courseBit = courseName ? ` for ${courseName}` : '';
  const fees = feeRange ? ` Recorded programme fees range ${feeRange}.` : '';
  return `Planning ${label} ${year}${courseBit}? Compare ${job}.${colleges}.${fees}`.replace(/\.\./g, '.').replace(/\s+/g, ' ').trim();
}

export function buildExamSeo(profile: ExamSeoSource): ExamSeoPack {
  const label = examLabel(profile.exam);
  const year = detectExamYear(profile);
  const courseName = strip(profile.exam.course?.name);
  const institutes = Number(profile.instituteCount || 0);
  const minFee = money(profile.fees?.min_total_fee);
  const maxFee = money(profile.fees?.max_total_fee);
  const feeRange = minFee && maxFee ? `${minFee}–${maxFee}` : minFee || maxFee;
  let intent = intentOf(profile.exam.slug, label);
  const pack = overrides(year, institutes, feeRange)[profile.exam.slug];
  if (pack?.intent) intent = pack.intent;
  const h1 = pack?.h1 || h1For(label, year, intent);
  const title = pack?.title || h1;
  const description = pack?.description || defaultDescription(label, year, intent, courseName, institutes, feeRange);
  const keywords = pack?.keywords || [
    `${label} ${year}`,
    `${label} eligibility`,
    `${label} counselling`,
    `${label} cutoff`,
    `colleges accepting ${label}`,
    `${label} fees`
  ];
  const intro =
    pack?.intro ||
    `Review ${label} ${year} eligibility, ${
      intent === 'counselling' ? 'counselling and cutoff context' : intent === 'cutoff' ? 'cutoff and counselling context' : 'counselling context'
    }, mapped colleges${institutes ? ` (${institutes.toLocaleString('en-IN')})` : ''}, and fee evidence before you apply.`;
  return { year, label, h1, title, description, keywords, intro, intent };
}

export function buildExamFaqs(
  profile: ExamSeoSource,
  seo: ExamSeoPack,
  textFn: (value: unknown, fallback?: string) => string,
  moneyFn: (value: number | string | null | undefined) => string
) {
  const faqs: Array<{ question: string; answer: string }> = [];
  const seen = new Set<string>();
  const add = (q: string, a: string) => {
    if (!seen.has(q)) {
      seen.add(q);
      faqs.push({ question: q, answer: a });
    }
  };
  const { label, year, intent } = seo;
  const courseName = profile.exam.course?.name || 'linked programmes';
  add(`What is ${label}?`, `${label} is an entrance / counselling route linked with ${courseName}. Use this ${year} profile to compare eligibility, pattern and mapped colleges.`);
  if (profile.exam.eligibility) {
    add(`What is ${label} ${year} eligibility?`, textFn(profile.exam.eligibility, `Confirm the latest official eligibility notice for ${label} ${year}.`));
  } else {
    add(`What is ${label} ${year} eligibility?`, `Eligibility depends on the academic year, category and target institute. Confirm the latest official ${label} ${year} notice before applying.`);
  }
  add(
    `How does ${label} ${year} counselling work?`,
    intent === 'counselling'
      ? `${label} ${year} counselling typically follows registration, rank/list publication, choice filling and seat allotment. Confirm dates and rules on the official counselling portal.`
      : `After ${label} ${year}, most students complete counselling or institute-level applications for mapped colleges. Check whether your targets use central counselling or their own portal.`
  );
  add(`What is the cutoff for ${label} ${year}?`, `Cutoffs for ${label} ${year} vary by institute, branch, category and round. Use official counselling or institute data rather than a generic estimate.`);
  if (profile.exam.pattern) add(`What is the ${label} exam pattern?`, textFn(profile.exam.pattern));
  if (profile.exam.applicationFees) {
    add(`What is the ${label} application fee?`, `Recorded application fee information: ${textFn(profile.exam.applicationFees)}. Confirm the current category-wise fee on the official portal.`);
  }
  if (profile.instituteCount) {
    add(`Which colleges accept ${label}?`, `The database currently maps ${Number(profile.instituteCount).toLocaleString('en-IN')} colleges and ${Number(profile.programmeCount || 0).toLocaleString('en-IN')} programmes to ${label}.`);
  }
  if (profile.fees?.min_total_fee || profile.fees?.max_total_fee) {
    add(`What fees should I expect after ${label}?`, `Across mapped programmes, recorded total fees range from ${moneyFn(profile.fees?.min_total_fee)} to ${moneyFn(profile.fees?.max_total_fee)}. Confirm hostel, mess and other charges separately.`);
  }
  if (profile.programmes.length) {
    add(`Which programmes are linked with ${label}?`, `Mapped programme examples include ${profile.programmes.slice(0, 4).map((item) => textFn(item.programme_name)).join(', ')}.`);
  }
  if (profile.colleges.length) {
    add(`Which colleges are linked with ${label}?`, `Sample mapped colleges include ${profile.colleges.slice(0, 4).map((item) => item.name).join(', ')}.`);
  }
  if (profile.exam.conductedBy) add(`Who conducts ${label}?`, `${label} is recorded as conducted by ${textFn(profile.exam.conductedBy)}.`);
  add(`How should I use this ${label} ${year} profile?`, `Use the mapped colleges, fees range, eligibility and counselling/cutoff context as a research starting point. Confirm current dates and rules on the official exam and institute websites.`);
  return faqs.slice(0, 12);
}

export function rankExamArticles<T extends { slug: string; articleType?: string; title?: string }>(articles: T[], examSlug: string): T[] {
  const slug = examSlug.toLowerCase();
  const acceptingNeedle = `colleges-accepting-${slug}-`;
  const exactAccepting = `mba-colleges-accepting-${slug}-2026-admission-process`;
  const token = new RegExp(`(^|-)${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-|$)`);
  const score = (article: T) => {
    const s = (article.slug || '').toLowerCase();
    const type = (article.articleType || '').toLowerCase();
    let n = 0;
    if (s === exactAccepting) n += 100;
    else if (s.includes(acceptingNeedle)) n += 80;
    if (type === 'exam-admission' && (s === exactAccepting || s.includes(acceptingNeedle))) n += 50;
    else if (type === 'exam-admission') n += 10; // type alone is weak without slug token
    if (token.test(s) && (type.includes('fee') || type === 'budget' || type.includes('package'))) n += 45;
    return n;
  };
  return [...articles]
    .map((article) => ({ article, n: score(article) }))
    .filter((row) => row.n >= 40)
    .sort((a, b) => b.n - a.n)
    .map((row) => row.article);
}

export function articleAnchorTitle(article: { slug: string; title?: string; articleType?: string }, label: string) {
  const type = (article.articleType || '').toLowerCase();
  const s = article.slug || '';
  if (type === 'exam-admission' || s.includes('colleges-accepting-')) return `Colleges accepting ${label}`;
  if (type === 'budget' || type.includes('fee')) return article.title || `Fee guide related to ${label}`;
  if (type.includes('package')) return article.title || `Package guide related to ${label}`;
  const raw = strip(article.title || s.replace(/-/g, ' '));
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}
