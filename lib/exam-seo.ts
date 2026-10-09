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
    min_year_fee?: number | string | null;
    max_year_fee?: number | string | null;
    programmes_with_fees?: number | null;
    /** Backend-chosen range (exam.service.ts examFeeDisplay): null means no reliable range, so no fee clause. */
    display?: ExamFeeDisplay | null;
  } | null;
};

export type ExamFeeDisplay = {
  basis: 'total' | 'year';
  min: number | string;
  max: number | string;
  programmes: number;
  /** True when the range is the 5th-95th percentile rather than the raw min-max. */
  trimmed: boolean;
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
  /** Hand-written, source-checked FAQs that replace the generated ones. */
  faqs?: Array<{ question: string; answer: string }>;
  /** Page-specific social image path (for example /uploads/exams/nmat/nmat-2026-og.webp). */
  ogImage?: string;
  /** Use the title as-is, without the site-wide " | College Decision" suffix (keeps the <title> within ~60 characters). */
  absoluteTitle?: boolean;
  /** Short note under the colleges heading, with an optional link (for example JEE Main: IITs go through JEE Advanced). */
  collegesNote?: { text: string; linkText?: string; href?: string };
  /**
   * Hrefs the auto-linker must not link to on this exam page, on top of the page itself. Use when a short alias means
   * something else here (NIFT: "CAT" is the Creative Ability Test, not /exams/cat; "PG" is postgraduate, not NEET PG).
   */
  autoLinkExcludeHrefs?: string[];
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

function rangeOf(min: number | string | null | undefined, max: number | string | null | undefined) {
  const lo = money(min);
  const hi = money(max);
  if (lo && hi) return lo === hi ? lo : `${lo}–${hi}`;
  return lo || hi;
}

/**
 * The fee range an exam page should quote. Prefers the backend's `display` pick (totals only when they cover at least
 * 30% of fee-bearing programmes, otherwise annual fees; 5th-95th percentile when there are 20+ values; null when
 * neither basis has 3+ programmes). Falls back to the raw ranges only for an older API without `display`.
 */
export function examFeeSummary(fees: ExamSeoSource['fees']): { basis: 'total' | 'year'; range: string; programmes: number | null; trimmed: boolean } | null {
  if (fees && 'display' in fees) {
    const d = fees.display;
    if (!d) return null;
    const range = rangeOf(d.min, d.max);
    return range ? { basis: d.basis, range, programmes: Number(d.programmes) || null, trimmed: Boolean(d.trimmed) } : null;
  }
  const total = rangeOf(fees?.min_total_fee, fees?.max_total_fee);
  if (total) return { basis: 'total', range: total, programmes: null, trimmed: false };
  const year = rangeOf(fees?.min_year_fee, fees?.max_year_fee);
  return year ? { basis: 'year', range: year, programmes: null, trimmed: false } : null;
}

/** Fee range text labelled as total programme fees or per year. */
export function examFeeRangeText(fees: ExamSeoSource['fees']): string | null {
  const summary = examFeeSummary(fees);
  if (!summary) return null;
  return summary.basis === 'total' ? `${summary.range} (total programme fees)` : `${summary.range} per year`;
}

/** One-sentence FAQ / section answer for the chosen fee range. */
export function examFeeSentence(fees: ExamSeoSource['fees']): string | null {
  const summary = examFeeSummary(fees);
  if (!summary) return null;
  const scope = summary.programmes
    ? `${summary.trimmed ? 'the middle 90% of ' : ''}${summary.programmes.toLocaleString('en-IN')} mapped programmes at published colleges`
    : 'mapped programmes at published colleges';
  return summary.basis === 'total'
    ? `Across ${scope}, recorded total programme fees range from ${summary.range.replace('–', ' to ')}.`
    : `Across ${scope}, recorded annual fees range from ${summary.range.replace('–', ' to ')} per year.`;
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

type Override = Partial<Pick<ExamSeoPack, 'h1' | 'title' | 'description' | 'keywords' | 'intro' | 'intent' | 'faqs' | 'ogImage' | 'absoluteTitle' | 'collegesNote' | 'autoLinkExcludeHrefs'>>;

function overrides(year: number, institutes: number, feeRange: string | null): Record<string, Override> {
  const colleges = institutes ? `${institutes.toLocaleString('en-IN')} mapped colleges` : 'mapped colleges';
  const fees = feeRange ? ` Fees typically range ${feeRange}.` : '';
  return {
    'jee-main': {
      // JEE Main 2027 content package (docs/exam-content/jee-main-2027.md in the backend repo).
      // Facts from NTA only (jeemain.nta.nic.in, nta.ac.in Examination Calendar, JEE (Main) 2026 Information Bulletin),
      // checked on 9 Oct 2026. The 2027 bulletin is not out, so 2027 items beyond the calendar are expected, on 2026 rules.
      intent: 'general',
      h1: 'JEE Main 2027: Exam Dates, Registration, Eligibility, Pattern & Fees',
      title: 'JEE Main 2027: Exam Dates, Registration, Fees & Eligibility',
      description: 'JEE Main 2027 Session 1 is tentatively on 22–30 Jan 2027. See what NTA has confirmed, 2026 fees, the 75% rule, exam pattern, percentile and NIT admission.',
      keywords: ['JEE Main 2027', 'JEE Main 2027 exam date', 'JEE Main 2027 registration', 'JEE Main application fee', 'JEE Main eligibility', 'JEE Main 75% criteria', 'JEE Main exam pattern', 'JEE Main percentile', 'colleges accepting JEE Main', 'NIT admission through JEE Main'],
      intro: 'JEE Main 2027 Session 1 is tentatively scheduled for 22–24 and 28–30 January 2027 on NTA\'s exam calendar, and Session 2 is expected in April. NTA has not released the 2027 bulletin, registration dates or fees yet, so this guide marks what is confirmed and what is expected from the 2026 rules.',
      ogImage: '/uploads/exams/jee-main/jee-main-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'NITs, IIITs and other JoSAA institutes are listed first. IITs are not listed here because they admit through JEE Advanced:',
        linkText: 'see the JEE Advanced guide',
        href: '/exams/jee-advanced'
      },
      faqs: [
        {
          question: 'What is JEE Main 2027?',
          answer: 'JEE Main (Joint Entrance Examination Main) 2027 is the computer-based entrance test conducted by the National Testing Agency (NTA) for B.E./B.Tech, B.Arch and B.Plan admission at NITs, IIITs and other centrally funded technical institutes. Paper 1 is also the qualifying test for JEE Advanced, the route to the IITs.'
        },
        {
          question: 'When is the JEE Main 2027 exam?',
          answer: 'NTA\'s Examination Calendar lists JEE Main 2027 Session 1 on 22, 23, 24, 28, 29 and 30 January 2027, with 31 January as a buffer day. NTA marks these dates as tentative. Session 2 is not on the calendar yet; in 2026 it ran on 2, 4, 5, 6 and 8 April, so expect April 2027.'
        },
        {
          question: 'When will JEE Main 2027 registration start?',
          answer: 'NTA has not announced it. For 2026, the Information Bulletin and Session 1 registration opened on 31 October 2025, and Session 2 registration ran from 1 to 25 February 2026, so expect the 2027 Session 1 form in late October or November 2026. Register only on jeemain.nta.nic.in.'
        },
        {
          question: 'What is the JEE Main application fee?',
          answer: 'NTA has not published 2027 fees yet. In the 2026 bulletin, the fee per session for one paper at a centre in India was ₹1,000 for General male candidates, ₹900 for EWS and OBC-NCL males, ₹800 for all female candidates and ₹500 for SC, ST, PwD and third-gender candidates. Processing charges and GST were extra.'
        },
        {
          question: 'Who is eligible for JEE Main 2027 and how many attempts are allowed?',
          answer: 'There is no age limit. On the 2026 rules (candidates who passed Class 12 in 2024 or 2025, or were appearing in 2026), JEE Main 2027 is expected to be open to those who passed Class 12 in 2025 or 2026 or are appearing in 2027. That is three consecutive years with two sessions each. NTA will confirm this in the 2027 bulletin.'
        },
        {
          question: 'What is the 75% criterion for JEE Main?',
          answer: 'It is an admission rule, not an exam rule. For NITs, IIITs and other CFTIs, the 2026 bulletin required at least 75% in Class 12 (65% for SC, ST and PwD candidates) or a place in the top 20 percentile of your board that year. You can sit JEE Main without it, but you cannot take a JoSAA or CSAB seat.'
        },
        {
          question: 'What is the JEE Main exam pattern?',
          answer: 'In 2026, Paper 1 (B.E./B.Tech) had 75 compulsory questions for 300 marks in 3 hours: 20 multiple-choice and 5 numerical questions each in Mathematics, Physics and Chemistry, marked +4 for a correct answer and −1 for a wrong one. Paper 2A (B.Arch) and 2B (B.Plan) carry 400 marks each. NTA has not announced any change for 2027.'
        },
        {
          question: 'How is the JEE Main percentile calculated?',
          answer: 'Your NTA score is a percentile within your own shift: 100 × the number of candidates in your shift who scored the same as you or less, divided by the total candidates in that shift, calculated to seven decimal places. If you take both sessions, the better of your two total NTA scores is used for the All India Rank.'
        },
        {
          question: 'How many candidates qualify for JEE Advanced through JEE Main?',
          answer: 'The top 2,50,000 Paper 1 candidates across all categories become eligible for JEE Advanced. In 2026, NTA\'s result press release put the cut-off NTA score at 93.4123549 for General, 82.4164528 for EWS, 80.9232583 for OBC-NCL, 63.9172792 for SC and 52.0174712 for ST candidates.'
        },
        {
          question: 'Which colleges accept JEE Main?',
          answer: 'JEE Main ranks are used for B.Tech, B.Arch and B.Plan seats at NITs, IIITs, IIEST Shibpur and other government-funded technical institutes through JoSAA and CSAB counselling. IITs admit through JEE Advanced instead. Many state and private universities also accept JEE Main scores; the college list on this page shows those in our database.'
        }
      ]
    },
    nift: {
      // NIFT 2027 content package (docs/exam-content/nift-2027.md in the backend repo).
      // Facts from NTA (exams.nta.nic.in/niftee, nta.ac.in Examination Calendar) and NIFT (nift.ac.in: NIFTEE 2026 bulletin,
      // Admission Prospectus and Guidelines 2026), checked on 9 Oct 2026. Only the 10 Jan 2027 date is official for 2027 (tentative).
      intent: 'general',
      h1: 'NIFT 2027: Exam Date, Registration, Eligibility, Pattern, Syllabus & Seats',
      title: 'NIFT 2027: Exam Date, Registration, Eligibility & Pattern',
      description: 'NIFT 2027 is tentatively on 10 Jan 2027 (NTA calendar). See 2026 fees, eligibility, age limit, GAT, CAT and situation test pattern, weightage and seats.',
      keywords: ['NIFT 2027', 'NIFT 2027 exam date', 'NIFT 2027 registration', 'NIFT application fee', 'NIFT eligibility', 'NIFT age limit', 'NIFT exam pattern', 'NIFT syllabus', 'NIFT situation test', 'NIFT seats', 'NIFT fees for 4 years', 'NIFT counselling'],
      intro: 'NIFT 2027, the NIFTEE entrance exam that NTA conducts for the National Institute of Fashion Technology, is listed on NTA\'s calendar for 10 January 2027 (tentative). The 2027 bulletin, registration dates and fees are not out yet, so this guide separates what is official from what is expected on the 2026 rules.',
      ogImage: '/uploads/exams/nift/nift-2027-og.webp',
      absoluteTitle: true,
      autoLinkExcludeHrefs: ['/exams/cat', '/exams/neet-pg'],
      collegesNote: {
        text: 'NIFTEE admits only to NIFT\'s 20 campuses. The profiles below are the NIFT campuses published on CollegeDecision.in.'
      },
      faqs: [
        {
          question: 'Is the NIFT 2027 exam date confirmed?',
          answer: 'Only provisionally. NTA\'s Examination Calendar lists the NIFT Entrance Examination on Sunday, 10 January 2027, and notes that calendar dates are tentative and may change. No other 2027 date (registration, result, situation test or counselling) has been announced. The 2026 exam was held on 8 February 2026.'
        },
        {
          question: 'When will NIFT 2027 registration start?',
          answer: 'NTA has not announced it. For 2026, registration opened on 8 December 2025, 62 days before the exam, and the final last date was 16 January 2026 after two extensions. A similar gap before 10 January 2027 would put the 2027 form in November 2026. Apply only on exams.nta.nic.in/niftee.'
        },
        {
          question: 'What is the NIFT application fee?',
          answer: 'The 2027 fee is not announced yet. In 2026 it was ₹2,000 for one programme for General, General-EWS and OBC-NCL candidates and ₹500 for SC, ST and PwD candidates. Applying for two programmes (B.Des and B.FTech, or M.Des and MFM) cost ₹3,000 or ₹750. The late fee was ₹5,000 extra.'
        },
        {
          question: 'Is Maths compulsory for NIFT?',
          answer: 'Only for B.FTech. Under the 2026 rules, B.FTech needs Class 12 (or an equivalent route) with Mathematics, while B.Des accepts Class 12 in any stream. Physics and Chemistry are not required for B.FTech, and the bulletin states no minimum percentage for either programme.'
        },
        {
          question: 'What is the NIFT age limit?',
          answer: 'For B.Des and B.FTech, the 2026 rule was that you must be under 24 on 1 August of the year of admission, with five years\' relaxation for SC, ST and PwD candidates. On the same rule, NIFT 2027 would mean being born after 1 August 2003 (our arithmetic). There is no age limit for M.Des, MFM or M.FTech.'
        },
        {
          question: 'Is there negative marking in NIFT?',
          answer: 'Yes, in the General Ability Test. In 2026 GAT was marked +1 for a correct answer, -0.25 for a wrong one and 0 for an unanswered question. The Creative Ability Test is a drawing paper evaluated by examiners, so it has no negative marking.'
        },
        {
          question: 'What is the weightage of the NIFT situation test?',
          answer: 'The situation test counts for 20% of the final B.Des merit, with GAT at 30% and CAT (Creative Ability Test) at 50% (2026 rules). It is a hands-on model-making test using only the materials provided, judged on the spot, with a short write-up in English. B.FTech has no situation test.'
        },
        {
          question: 'Is there a group discussion for NIFT PG admission?',
          answer: 'No. In 2026, M.Des, MFM and M.FTech shortlisted candidates had a personal interview only, held in New Delhi from 6 to 11 April 2026. The interview carried 30% of the final merit, scored on five parameters of 20 marks each.'
        },
        {
          question: 'How many seats does NIFT have?',
          answer: 'NIFT offered 5,076 seats for 2026 across 20 campuses: 3,423 B.Des, 591 B.FTech, 275 M.Des, 719 MFM and 68 M.FTech. That includes 480 state domicile seats. NRI seats are supernumerary. The 2027 seat matrix will come with the 2027 prospectus.'
        },
        {
          question: 'How much is the NIFT fee for 4 years?',
          answer: 'For the 2026-27 batch, NIFT\'s prospectus lists tuition of ₹1,50,000 per semester in year 1, rising to ₹1,74,000 in year 4. With library, mediclaim, exam and one-time charges, the eight semesters add up to ₹14,09,400 for B.Des or B.FTech (our sum), excluding hostel. NIFT may revise fees each year.'
        }
      ]
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
    snap: {
      // SNAP 2026 content package (docs/exam-content/snap-2026.md in the backend repo).
      // Facts checked on snaptest.org and the SNAP 2026 Bulletin (Symbiosis International (Deemed University)) on 8 Oct 2026.
      intent: 'general',
      h1: 'SNAP 2026: Exam Dates, Registration, Fees, New Pattern & Colleges',
      title: 'SNAP 2026: Exam Dates, Registration, New Pattern & Fees',
      description: 'SNAP 2026 for Symbiosis MBA: tests on 13, 19 & 26 Dec, register by 25 Nov. See fees, the new Ethics section, eligibility and all 32 programmes.',
      keywords: ['SNAP 2026', 'SNAP 2026 exam date', 'SNAP 2026 registration', 'SNAP exam pattern 2026', 'SNAP 2026 fees', 'Symbiosis National Aptitude Test', 'SNAP eligibility', 'Symbiosis MBA colleges'],
      intro: 'SNAP 2026, the Symbiosis National Aptitude Test for MBA admission at 17 Symbiosis institutes, is held on 13, 19 and 26 December 2026, and registration closes on 25 November. This guide covers dates, fees, the new pattern, eligibility, programmes and selection, checked against snaptest.org and the SNAP 2026 Bulletin.',
      ogImage: '/uploads/exams/snap/snap-2026-og.webp',
      absoluteTitle: true,
      faqs: [
        {
          question: 'What is SNAP 2026?',
          answer: 'SNAP (Symbiosis National Aptitude Test) 2026 is the computer-based entrance test run by Symbiosis International (Deemed University) for 32 MBA programmes at 17 Symbiosis institutes in Pune, Nashik, Nagpur, Hyderabad, NOIDA and Bengaluru. The score is valid only for SIU admissions to the 2027-28 academic year.'
        },
        {
          question: 'When is the SNAP 2026 exam?',
          answer: 'SNAP 2026 has three test dates: Sunday 13 December, Saturday 19 December and Saturday 26 December 2026. Test timings are printed on the admit card, which goes live on 7, 11 and 18 December respectively.'
        },
        {
          question: 'What is the last date to register for SNAP 2026?',
          answer: 'Registration and payment close on Wednesday, 25 November 2026. Registration opened on 21 August 2026. Programme registration deadlines can differ by programme, so check each institute before you pay.'
        },
        {
          question: 'What is the SNAP 2026 registration fee?',
          answer: 'The test fee is ₹2,550 per test, and each MBA programme you apply to costs another ₹1,000. Government taxes are extra. Two tests cost ₹5,100 and three cost ₹7,650 before programme fees. The fee is the same for every category and is non-refundable.'
        },
        {
          question: 'What is the SNAP 2026 exam pattern?',
          answer: 'SNAP 2026 has 60 questions in 60 minutes: General English (10), Analytical and Logical Reasoning (20), Quantitative, Data Interpretation and Data Sufficiency (20), and a new section, Ethics, Morality and Values (10). Each question carries one mark and you can attempt the sections in any order.'
        },
        {
          question: 'Does SNAP have negative marking?',
          answer: 'Yes. Each wrong answer costs 25% of the marks for that question, so a wrong answer deducts 0.25 marks. Four wrong answers cancel out one correct answer.'
        },
        {
          question: 'How many times can I take SNAP 2026, and which score counts?',
          answer: 'You can take up to three tests. If you take more than one, Symbiosis uses your higher score for the final percentile and does not normalise scores between tests. You pay ₹2,550 plus taxes for each test.'
        },
        {
          question: 'Who is eligible for SNAP 2026?',
          answer: 'You need a bachelor\'s degree from a recognised university with at least 50% marks, or 45% for SC/ST candidates. Some programmes add conditions. For example, SCMHRD\'s MBA in Business Analytics needs two years of full-time work experience, and the SSBF dual degrees need 65%.'
        },
        {
          question: 'When will the SNAP 2026 result be declared?',
          answer: 'The SNAP 2026 result is due on Tuesday, 12 January 2027 on snaptest.org and stays available until 12 February 2027. Scores are final, with no revaluation.'
        },
        {
          question: 'What happens after the SNAP 2026 result?',
          answer: 'Each institute shortlists candidates programme by programme on their overall SNAP percentile and calls them for a Group Exercise and Personal Interaction (GE-PI). The merit list is out of 100: your SNAP score scaled to 50, GE 10 and PI 40. Cut-offs are set separately for each programme and published by the institutes, not in the SNAP bulletin.'
        }
      ]
    },
    nmat: {
      // NMAT 2026 content package (docs/exam-content/nmat-2026.md in the backend repo).
      // Facts checked on mba.com (GMAC) and the NMIMS Admission Handout, NMAT 2026, on 8 Oct 2026.
      intent: 'general',
      h1: 'NMAT 2026: Exam Dates, Registration, Pattern, Syllabus & Colleges',
      title: 'NMAT 2026: Exam Dates, Registration, Pattern & Syllabus',
      description: 'NMAT 2026 by GMAC: register by 10 Oct, tests run 2 Nov–20 Dec. Check fees, pattern, syllabus, retake rules and colleges, then book your slot early.',
      keywords: ['NMAT 2026', 'NMAT 2026 exam date', 'NMAT registration 2026', 'NMAT by GMAC', 'NMAT exam pattern', 'NMAT syllabus', 'NMAT retake rules', 'colleges accepting NMAT'],
      intro: 'NMAT 2026 by GMAC runs from 2 November to 20 December 2026, and registration closes on 10 October. This guide covers dates, fees, the exam pattern, retake rules and the colleges that accept NMAT, using official GMAC and NMIMS sources.',
      ogImage: '/uploads/exams/nmat/nmat-2026-og.webp',
      absoluteTitle: true,
      faqs: [
        {
          question: 'What is NMAT 2026?',
          answer: 'NMAT by GMAC is a computer-based, adaptive MBA entrance test used by NMIMS and the other business schools on GMAC\'s list. It is run by Graduate Management Global Connection (GMGC), a subsidiary of the Graduate Management Admission Council (GMAC). It is not the Philippine NMAT.'
        },
        {
          question: 'When is the NMAT 2026 exam?',
          answer: 'NMAT 2026 tests run from 2 November to 20 December 2026, and you choose your own date and slot. Registration is open from 20 August to 10 October 2026, and slot booking closes on 22 October 2026.'
        },
        {
          question: 'What is the NMAT 2026 registration fee?',
          answer: 'Registration costs ₹3,000 plus taxes and includes sending scores to five schools. Each retake costs ₹3,000 plus taxes, a reschedule ₹1,200 plus taxes and each extra school ₹400 plus taxes. NMIMS charges a separate, non-refundable ₹3,000 for its own application.'
        },
        {
          question: 'Who is eligible for NMAT 2026?',
          answer: 'GMAC does not set eligibility for taking the test. Each school sets its own rules. NMIMS, for example, asks for a bachelor\'s degree with at least 50% aggregate, and final-year students can apply provisionally.'
        },
        {
          question: 'What is the NMAT 2026 exam pattern?',
          answer: 'NMAT has 108 questions in 120 minutes: Language Skills (36 questions, 28 minutes), Quantitative Skills (36 questions, 52 minutes) and Logical Reasoning (36 questions, 40 minutes). Each section is scored 12 to 120, the total 36 to 360, and there is no negative marking.'
        },
        {
          question: 'How many times can I take NMAT 2026?',
          answer: 'Up to three times in the testing cycle (1 July to 30 June), and a no-show counts as an attempt. Retakes can be booked from 3 November to 17 December 2026. GMAC\'s pages give the minimum gap between attempts as 7 days on one page and 15 days on others, so check the dates your dashboard allows.'
        },
        {
          question: 'Does NMIMS accept my best NMAT score?',
          answer: 'No. The NMIMS Admission Handout for NMAT 2026 says NMIMS accepts only the score of your first NMAT attempt. You must also complete the separate NMIMS application on nmat.nmims.edu by 10 October 2026 and before the day of your test.'
        },
        {
          question: 'When will the NMAT 2026 result be declared?',
          answer: 'There is no single result date. GMAC sends the official scorecard within 48 hours of your test, or up to 10 working days if the test is audited. Scores are valid for one year.'
        },
        {
          question: 'Which colleges accept NMAT 2026?',
          answer: 'GMAC\'s list showed 62 schools on 8 October 2026, led by NMIMS. Some accept NMAT for one programme only, such as ISB for AMPBA, SPJIMR for its Global Management Programme and Great Lakes for PGPM. Check each school\'s admission page before applying.'
        }
      ]
    },
    xat: {
      // XAT 2027 content package (docs/exam-content/xat-2027.md in the backend repo).
      // Facts from xatonline.in (/, /registration, /faq, /associate) and the XLRI Admission Prospectus 2027, checked on 9 Oct 2026.
      // Section counts and marking are from the XAT 2026 Overview/Instructions and are expected for 2027. GK weight is not published.
      intent: 'general',
      h1: 'XAT 2027: Exam Date, Registration, Fee, Pattern, Marking Scheme & Colleges',
      title: 'XAT 2027: Exam Date, Registration, Fee, Pattern & Colleges',
      description: 'XAT 2027 is on 3 Jan 2027, 2 to 5 pm. Register by 6 Dec 2026 for ₹2,300. See eligibility, pattern, the unattempted-question penalty, GK rules and XLRI fees.',
      keywords: ['XAT 2027', 'XAT 2027 exam date', 'XAT 2027 registration last date', 'XAT application fee', 'XAT exam pattern 2027', 'XAT negative marking unattempted questions', 'XAT GK section', 'XAT admit card 2027', 'XAT result date', 'colleges accepting XAT'],
      intro: 'XAT 2027, the Xavier Aptitude Test that XLRI Jamshedpur conducts for XAMI, is on Sunday, 3 January 2027 from 2:00 to 5:00 pm, and registration closes on 6 December 2026. This guide covers dates, the ₹2,300 fee, eligibility, the pattern and marking rules, and XLRI\'s 2027 fees, checked against xatonline.in.',
      ogImage: '/uploads/exams/xat/xat-2027-og.webp',
      absoluteTitle: true,
      // "DM" here is Decision Making and "fellowship" is the FPM stipend, not the Digital Marketing or Fellowship course pages.
      autoLinkExcludeHrefs: ['/courses/digital-marketing', '/courses/fellowship'],
      collegesNote: {
        text: 'XAT\'s official list has 139 Associate Members and 13 XAMI members. The colleges below are members with published profiles on CollegeDecision.in. Each one runs its own application and selection.',
        linkText: 'See the official XAT associate list',
        href: 'https://xatonline.in/associate'
      },
      faqs: [
        {
          question: 'When is the XAT 2027 exam?',
          answer: 'XAT 2027 is on Sunday, 3 January 2027, from 2:00 pm to 5:00 pm. It is a single computer-based slot, so everyone takes the same paper and there is no normalisation. The admit card is due on 20 December 2026, which XAT marks tentative.'
        },
        {
          question: 'What is the last date to register for XAT 2027?',
          answer: 'Registration for XAT and XLRI programmes closes on 6 December 2026. It opened on 15 July 2026 on xatonline.in. Your email ID and mobile number cannot be changed after registration, so check them before you start.'
        },
        {
          question: 'What is the XAT 2027 application fee?',
          answer: 'The XAT registration fee is ₹2,300 for Indian candidates, the same for every category. Each XLRI programme you add costs ₹200 more. Indian candidates applying to XLRI PGDM (GM) through GMAT or GRE pay ₹2,600, and NRI, foreign, PIO and OCI candidates applying through GMAT pay ₹5,000. The XAT 2026 fee was ₹2,200.'
        },
        {
          question: 'Who is eligible for XAT 2027?',
          answer: 'You need a recognised bachelor\'s degree of at least three years in any discipline. Final-year students can apply if they complete their final exams by 11 June 2027. XAT\'s FAQ does not mention an age limit or minimum percentage; each institute applies its own rules.'
        },
        {
          question: 'What is the XAT 2027 exam pattern?',
          answer: 'XAT 2026 had 95 multiple-choice questions in 3 hours. Part 1 (170 minutes) had Verbal Ability and Logical Reasoning (about 26), Decision Making (about 21) and Quantitative Aptitude and Data Interpretation (about 28). Part 2 was General Knowledge (about 20) in 10 minutes. XAT\'s 2027 FAQ confirms 3 hours, no sectional time limits and an on-screen scientific calculator; the section counts are expected to stay the same.'
        },
        {
          question: 'Is there negative marking for unattempted questions in XAT?',
          answer: 'Yes, in Part 1. Under the 2026 rules, expected to continue, the first 8 questions you leave blank cost nothing and each one after that costs 0.10 marks. A wrong answer costs 0.25 and a correct one earns 1. For example, leaving 12 questions blank costs (12 − 8) × 0.10 = 0.40 marks.'
        },
        {
          question: 'Does the XAT GK section count?',
          answer: 'The GK section has no negative marking. XAT\'s 2026 overview says GK scores are used exclusively by XLRI for its final selection. XLRI has not published how much weight GK carries, and other institutes decide for themselves how they use each part of XAT.'
        },
        {
          question: 'When will the XAT 2027 result be declared?',
          answer: 'XAT\'s FAQ says results are announced about three weeks after the exam, which points to late January 2027. The scorecard is downloaded from xatonline.in and no hard copy is sent. In 2026 it could be downloaded until 31 March.'
        },
        {
          question: 'Is there an official XAT mock test?',
          answer: 'Yes. XAT\'s mock test covers Verbal Ability and Logical Reasoning, Decision Making, Quantitative Aptitude and Data Interpretation, and GK. The link appears in your application dashboard after you submit the XAT 2027 form. XLRI also posts past XAT papers from 2018 to 2024 on xatonline.in.'
        },
        {
          question: 'How many colleges accept XAT?',
          answer: 'The XAT homepage says 250+ B-schools accept the score. The official associate page lists 139 XAT Associate Members and 13 XAMI members, including XLRI, XIM University, XISS Ranchi and XIME Bengaluru. Registering for XAT does not apply you to these schools; you apply to each one separately.'
        },
        {
          question: 'What are XLRI\'s fees for 2027?',
          answer: 'XLRI\'s Admission Prospectus 2027 puts PGDM (BM) and PGDM (HRM) at about ₹15.3 lakh a year and the 18-month PGDM (GM) at about ₹25.8 lakh. The FPM charges no fees and pays a fellowship of ₹45,000 a month in years 1 and 2 and ₹50,000 in years 3 and 4. All figures are approximate and subject to revision.'
        }
      ]
    },
    gate: {
      // GATE 2027 content package (docs/exam-content/gate-2027.md in the backend repo).
      // Facts from gate2027.iitm.ac.in and the GATE 2027 Information Brochure (IIT Madras, revised 27 Sep 2026), checked on 9 Oct 2026.
      // Admit card date and the free scorecard window are TBA officially. COAP/CCMT are separate portals (no dates given).
      intent: 'general',
      h1: 'GATE 2027: Exam Date, Registration, Fee, Papers, Pattern & Eligibility',
      title: 'GATE 2027: Exam Dates, Fee, Papers, Pattern & Eligibility',
      description: 'GATE 2027 (IIT Madras) is on 6, 7, 13, 14, 20, 21 Feb 2027. Late-fee registration ends 12 Oct 2026. See fees by category, papers, pattern and eligibility.',
      keywords: ['GATE 2027', 'GATE 2027 exam date', 'GATE 2027 registration last date', 'GATE 2027 application fee', 'GATE 2027 late fee', 'GATE 2027 eligibility', 'GATE 2027 papers', 'GATE two paper combination', 'GATE 2027 exam pattern', 'GATE normalisation', 'GATE score validity', 'colleges accepting GATE'],
      intro: 'GATE 2027, organised by IIT Madras, is on 6, 7, 13, 14, 20 and 21 February 2027, and late-fee registration on GOAPS closes on 12 October 2026. This guide covers dates, fees by category, eligibility, all 30 papers, two-paper combinations, the pattern and marking, normalisation and score use, checked against gate2027.iitm.ac.in.',
      ogImage: '/uploads/exams/gate/gate-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'GATE scores are used for M.Tech, M.E., MS and PhD admission at IISc, the IITs, NITs, IIITs and many other institutes. The colleges below start with IISc and the IITs, then NITs and IIITs. Each institute runs its own admission (or COAP/CCMT) and sets its own cut-offs.',
        linkText: 'See GATE 2027 opportunities on the official site',
        href: 'https://gate2027.iitm.ac.in/opportunities'
      },
      faqs: [
        {
          question: 'When is the GATE 2027 exam?',
          answer: 'GATE 2027 is on 6, 7, 13, 14, 20 and 21 February 2027, in a forenoon session (9:30 am to 12:30 pm) and an afternoon session (2:30 pm to 5:30 pm). IIT Madras will publish the paper-wise schedule later. Exam cities are notified on 4 January 2027.'
        },
        {
          question: 'What is the last date to register for GATE 2027?',
          answer: 'Regular registration closed on 5 October 2026. You can still apply on GOAPS with a late fee until 12 October 2026. Changes to category, paper or exam city, adding a second paper and corrections to personal details are allowed until 21 October 2026, with a fee per change.'
        },
        {
          question: 'What is the GATE 2027 application fee?',
          answer: 'The fee is per paper: ₹1,000 for female, SC, ST and PwD candidates and ₹2,000 for everyone else, including foreign nationals. In the extended period (6 to 12 October 2026) it is ₹1,500 and ₹2,500. Two papers cost double, bank charges are extra and the fee is not refundable.'
        },
        {
          question: 'Who is eligible for GATE 2027?',
          answer: 'Students in the third or a higher year of any undergraduate degree, and anyone who has completed a government-approved degree in engineering, technology, architecture, science, commerce, arts or humanities. The brochure sets no age limit. Admitting institutes and PSUs apply their own degree and marks rules.'
        },
        {
          question: 'How many papers are there in GATE 2027?',
          answer: 'There are 30 papers. Robotics and Automation (RA) is new for 2027, Textile Engineering and Fibre Science is now section XE9 of Engineering Sciences, and the section codes of XE, XH and XL have changed. You can take one paper or two from the approved combinations.'
        },
        {
          question: 'Can I appear for two papers in GATE 2027?',
          answer: 'Yes, if the second paper is on the approved list for your primary paper. For example, CS can be paired with DA, EC, GE, MA, ME, PH, RA or ST, and ME with AE, CS, DA, IN, NM, PI, RA or XE. MN has no second-paper option. You pay the fee for each paper.'
        },
        {
          question: 'What is the GATE 2027 exam pattern?',
          answer: 'Each paper has 65 questions for 100 marks in 3 hours: General Aptitude (15 marks) plus the subject. In most engineering papers, Engineering Mathematics carries 13 marks and the core subject 72. Questions are MCQ, MSQ or NAT and carry 1 or 2 marks. The test is computer-based and in English.'
        },
        {
          question: 'Is there negative marking in GATE?',
          answer: 'Only for MCQs. A wrong answer to a 1-mark MCQ costs 1/3 mark and a wrong 2-mark MCQ costs 2/3 mark. MSQs and numerical answer type (NAT) questions have no negative marking, and there is no partial marking for any question.'
        },
        {
          question: 'How is the GATE score calculated?',
          answer: 'Marks in multi-session papers are first normalised. The score then runs from 350 at the general qualifying mark to 900 at the average of the top 0.1% (or top 10) candidates. The general qualifying mark is max(25, min(40, mean + SD)); OBC-NCL/EWS get 90% of it and SC/ST/PwD two-thirds.'
        },
        {
          question: 'How long is a GATE 2027 score valid?',
          answer: 'Three years from the date the result is announced. Results are due on 19 March 2027. The scorecard is free to download for a window that is yet to be announced, then costs ₹500 per paper until 31 December 2027. No scorecards are issued after that.'
        },
        {
          question: 'What can I do with a GATE 2027 score?',
          answer: 'Apply for M.Tech, M.E., MS and PhD programmes (M.Tech students at MoE-supported institutes can get ₹12,400 a month), and for jobs at PSUs that recruit through GATE, such as BHEL, GAIL, IOCL, NTPC, ONGC and POWERGRID. IIT and NIT M.Tech offers run through COAP and CCMT, which are separate from GATE.'
        }
      ]
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
  const feeRange = examFeeRangeText(profile.fees);
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
  return { year, label, h1, title, description, keywords, intro, intent, faqs: pack?.faqs, ogImage: pack?.ogImage, absoluteTitle: pack?.absoluteTitle, collegesNote: pack?.collegesNote, autoLinkExcludeHrefs: pack?.autoLinkExcludeHrefs };
}

export function buildExamFaqs(
  profile: ExamSeoSource,
  seo: ExamSeoPack,
  textFn: (value: unknown, fallback?: string) => string,
  moneyFn: (value: number | string | null | undefined) => string
) {
  if (seo.faqs?.length) return seo.faqs.slice(0, 12);
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
    const rawFee = String(profile.exam.applicationFees).trim();
    // A bare number in the exams table (for example 1000) is a rupee amount; show it as ₹1,000, not "1000".
    const feeText = /^\d+(\.\d+)?$/.test(rawFee) ? moneyFn(Number(rawFee)) : textFn(profile.exam.applicationFees);
    add(`What is the ${label} application fee?`, `Recorded application fee information: ${feeText}. Confirm the current category-wise fee on the official portal.`);
  }
  if (profile.instituteCount) {
    add(`Which colleges accept ${label}?`, `The database currently maps ${Number(profile.instituteCount).toLocaleString('en-IN')} colleges and ${Number(profile.programmeCount || 0).toLocaleString('en-IN')} programmes to ${label}.`);
  }
  const feeSentence = examFeeSentence(profile.fees);
  if (feeSentence) {
    add(`What fees should I expect after ${label}?`, `${feeSentence} ${examFeeSummary(profile.fees)?.basis === 'year' ? 'Multiply by the programme length for a rough total, and confirm' : 'Confirm'} hostel, mess and other charges separately.`);
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
