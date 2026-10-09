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

const KEEP_2026 = new Set(['cat', 'snap', 'nmat', 'ibsat', 'mat', 'atma', 'gmat']);
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
      description: 'XAT 2027 is on 3 Jan 2027, 2 to 5 pm. Register by 6 Dec 2026 for ₹2,300. See eligibility, pattern, unattempted-question penalty, GK rules and XLRI fees.',
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
      // "MS" here is MS (Research), not Master of Surgery; "Civil/Chemical Engineering" are GATE paper names, not the B.Tech course pages.
      autoLinkExcludeHrefs: ['/courses/master-of-surgery', '/courses/civil-engineering', '/courses/b-chem-eng'],
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
    cmat: {
      // CMAT 2027 content package (docs/exam-content/cmat-2027.md in the backend repo).
      // Facts from cmat.nta.nic.in, NTA's Examination Calendar 2027 (7 Feb 2027, tentative) and NTA's CMAT 2026 documents
      // (Information Bulletin, city-slip notice, result press release), checked on 9 Oct 2026. Fee, pattern and eligibility are 2026 values, expected for 2027.
      // No fee range here: the recorded college-fee range is not CMAT data.
      intent: 'general',
      h1: 'CMAT 2027: Exam Date, Registration, Fee, Pattern & Colleges',
      title: 'CMAT 2027: Exam Date, Registration, Fee, Pattern & Colleges',
      description: 'CMAT 2027 is on 7 Feb 2027 (tentative, NTA calendar). See registration status, the ₹2,500/₹1,250 fee (2026), 100-question pattern, marking and colleges.',
      keywords: ['CMAT 2027', 'CMAT 2027 exam date', 'CMAT 2027 registration date', 'CMAT application fee', 'CMAT fees for female', 'CMAT exam pattern', 'CMAT negative marking', 'CMAT eligibility', 'CMAT result 2027', 'colleges accepting CMAT score'],
      intro: 'CMAT 2027, the Common Management Admission Test run by NTA, is listed for Sunday, 7 February 2027 in NTA\'s exam calendar (tentative). Registration hasn\'t opened yet. This guide covers the expected fee, eligibility, the 100-question pattern and marking, results and how colleges use the score, checked against NTA\'s own documents.',
      ogImage: '/uploads/exams/cmat/cmat-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'NTA says CMAT scores are accepted by all AICTE-approved institutions, university departments and their constituent and affiliated colleges, but publishes no list. The colleges below list CMAT for their MBA or PGDM on CollegeDecision.in. Each sets its own cut-off and GD/PI.',
        linkText: 'See the official CMAT portal',
        href: 'https://cmat.nta.nic.in/'
      },
      faqs: [
        {
          question: 'When is the CMAT 2027 exam?',
          answer: 'NTA\'s Examination Calendar 2027 lists CMAT on Sunday, 7 February 2027, as a one-day exam. NTA says calendar dates are tentative and may change. In 2026 CMAT was held on 25 January in a single shift from 9:00 am to 12:00 pm.'
        },
        {
          question: 'When will CMAT 2027 registration start?',
          answer: 'NTA hasn\'t announced it. As of 9 October 2026 the CMAT 2027 Information Bulletin isn\'t out. For the 2026 exam, registration ran from 17 October to 17 November 2025 on cmat.nta.nic.in, with a correction window from 20 to 22 November 2025.'
        },
        {
          question: 'What is the CMAT application fee for female, OBC and SC candidates?',
          answer: 'In 2026 the fee was ₹1,250 for general female candidates and for Gen-EWS, OBC-NCL, SC, ST, PwD/PwBD and third-gender candidates. Only general (unreserved) male candidates paid ₹2,500. Processing charges and GST were extra. The 2027 fee is expected to follow once NTA confirms it.'
        },
        {
          question: 'Who is eligible for CMAT 2027?',
          answer: 'Under the 2026 rules, you need a bachelor\'s degree in any discipline, or you must be in the final year with your result due before admissions begin. You must be an Indian citizen. NTA sets no age limit and no minimum percentage for the test.'
        },
        {
          question: 'What is the CMAT exam pattern?',
          answer: 'CMAT 2026 had 100 multiple-choice questions for 400 marks in 3 hours, in English only. There were five sections of 20 questions each: Quantitative Techniques and Data Interpretation, Logical Reasoning, Language Comprehension, General Awareness, and Innovation and Entrepreneurship. The same pattern is expected for 2027.'
        },
        {
          question: 'Is there negative marking in CMAT?',
          answer: 'Yes. A correct answer earns 4 marks and a wrong answer costs 1 mark. Unattempted questions get zero. If NTA drops a question, every candidate gets full marks for it. Candidates with the same score are ranked by age, older first.'
        },
        {
          question: 'When will the CMAT 2027 result be declared?',
          answer: 'NTA hasn\'t announced a date. In 2026 the result came on 17 February, 23 days after the exam, with the scorecard showing marks and percentile because the exam ran in one shift. Scorecards are downloaded from cmat.nta.nic.in; none are posted.'
        },
        {
          question: 'Which colleges accept the CMAT score?',
          answer: 'NTA says CMAT is accepted by all AICTE-approved institutions, university departments and their constituent and affiliated colleges. It publishes no college list and has no role in counselling. You apply to each college, which sets its own cut-off and runs its own group discussion and interview.'
        },
        {
          question: 'How many candidates took CMAT 2026?',
          answer: 'NTA\'s result press release says 53,453 candidates registered and 41,872 appeared, a turnout of 78.33%. The exam ran in 110 cities at 259 centres on 25 January 2026, in a single computer-based shift.'
        },
        {
          question: 'Is NTA CMAT the same as the CMAT in Nepal?',
          answer: 'No. This page is about the Common Management Admission Test conducted by India\'s National Testing Agency for MBA and PGDM admission in India. The CMAT taken in Nepal is a separate test with its own rules and dates.'
        }
      ]
    },
    'cuet-pg': {
      // CUET PG 2027 content package (docs/exam-content/cuet-pg-2027.md in the backend repo).
      // Facts from exams.nta.nic.in/cuet-pg, NTA's Examination Calendar 2027 (exam window, tentative), the CUET (PG) 2026 Information Bulletin,
      // NTA's 2026 participating-universities pages and the 14 Jun 2026 results notice, checked on 9 Oct 2026. Fee, pattern and codes are 2026 values, expected for 2027.
      intent: 'general',
      h1: 'CUET PG 2027: Exam Dates, Registration, Paper Codes, Fee & Universities',
      title: 'CUET PG 2027: Exam Dates, Paper Codes, Fee & Universities',
      description: 'CUET PG 2027 is on 17 days from 1 to 25 March 2027 (tentative). See the ₹1,400 fee for 2 papers (2026), 157 paper codes, marking and 198 universities.',
      keywords: ['CUET PG 2027', 'CUET PG 2027 exam date', 'CUET PG 2027 registration', 'CUET PG application fee', 'CUET PG paper codes', 'COQP11', 'COQP12', 'CUET PG exam pattern', 'CUET PG negative marking', 'CUET PG participating universities'],
      intro: 'CUET PG 2027, NTA\'s common entrance test for postgraduate admission, is listed for 17 days between 1 and 25 March 2027 in NTA\'s exam calendar (tentative). Registration hasn\'t opened yet. This guide covers the expected fee, eligibility, pattern and marking, paper codes, results and participating universities, checked against NTA\'s own documents.',
      ogImage: '/uploads/exams/cuet-pg/cuet-pg-2027-og.webp',
      // 'special rescheduled exam' in the normalisation section is not the Special course.
      autoLinkExcludeHrefs: ['/courses/special'],
      absoluteTitle: true,
      collegesNote: {
        text: 'NTA\'s 2026 list had 198 participating universities and institutions, 45 of them central universities, and NTA says the list is dynamic. The universities below are on that list and have published profiles on CollegeDecision.in, central universities first. Each runs its own admission.',
        linkText: 'See NTA\'s participating universities',
        href: 'https://exams.nta.nic.in/cuet-pg/participating-universities/'
      },
      faqs: [
        {
          question: 'When is the CUET PG 2027 exam?',
          answer: 'NTA\'s Examination Calendar 2027 lists CUET (PG) on 1 to 5, 8, 12 to 20, 24 and 25 March 2027, a 17-day window, with 30 and 31 March as buffer days. NTA says the dates are tentative. The subject-wise schedule comes later.'
        },
        {
          question: 'When will CUET PG 2027 registration start?',
          answer: 'NTA hasn\'t announced it, and the 2027 bulletin isn\'t out as of 9 October 2026. For CUET PG 2026, registration ran from 14 December 2025 to 14 January 2026, with corrections from 18 to 20 January 2026.'
        },
        {
          question: 'What is the CUET PG application fee?',
          answer: 'In 2026 the fee for up to two papers was ₹1,400 for general candidates, ₹1,200 for Gen-EWS and OBC-NCL, ₹1,100 for SC, ST and third gender, ₹1,000 for PwD/PwBD and ₹7,000 for centres outside India. Each extra paper cost ₹700, ₹600 or ₹3,500. The 2027 fee is expected to be similar.'
        },
        {
          question: 'How many papers can I take in CUET PG?',
          answer: 'Up to four question paper codes, chosen by the programmes and universities you want. The base fee covers two papers and each extra paper costs more. In 2026, a general candidate taking four papers paid ₹1,400 + 2 × ₹700 = ₹2,800.'
        },
        {
          question: 'What is the CUET PG exam pattern?',
          answer: 'Under the 2026 bulletin, each paper had 75 multiple-choice questions in 90 minutes, worth 300 marks, in computer-based mode. Papers were bilingual (English and Hindi) except language, M.Tech/higher-science and Acharya papers. The same pattern is expected for 2027.'
        },
        {
          question: 'Is there negative marking in CUET PG?',
          answer: 'Yes. Each correct answer earns 4 marks and each wrong answer costs 1 mark. Unanswered or marked-for-review questions get zero. If more than one option is correct, anyone who marked a correct option gets 4 marks; a wrong or dropped question gives 4 marks to everyone.'
        },
        {
          question: 'What are COQP11 and COQP12 in CUET PG?',
          answer: 'They are common paper codes. In the 2026 list, COQP11 is the General paper and COQP12 is General – Management. Universities decide which code each programme needs, so check the admission page of each university before choosing your four codes.'
        },
        {
          question: 'Who is eligible for CUET PG 2027?',
          answer: 'Under the 2026 rules, anyone who has passed a bachelor\'s degree or equivalent, or is in the final year, can take CUET PG. NTA sets no age limit. Each university sets its own programme eligibility, such as degree subjects, minimum marks and any age rules.'
        },
        {
          question: 'Is CUET PG normalised?',
          answer: 'NTA\'s bulletin describes percentile-based normalisation for papers held in several shifts. For 2026, NTA clarified on 14 June 2026 that results were prepared on actual marks, including the rescheduled exam held on 29 and 30 March 2026 for affected centres.'
        },
        {
          question: 'How many universities accept CUET PG?',
          answer: 'NTA\'s 2026 list had 198 participating universities and institutions: 45 central, 40 state, 24 government or government-funded and 89 deemed or private. NTA says the list is dynamic. Each university publishes its own admission notice and merit list.'
        },
        {
          question: 'How long is a CUET PG score valid?',
          answer: 'Under the 2026 bulletin, the NTA score was valid for admission in the 2026-27 academic year only. CUET PG 2027 scores are expected to count only for 2027-28 admissions. Scorecards are downloaded from the portal or DigiLocker, and there is no re-evaluation.'
        }
      ]
    },
    'nid-entrance-exam': {
      // NID DAT 2027 content package (docs/exam-content/nid-dat-2027.md in the backend repo).
      // Facts from NID only (admissions.nid.edu, the Integrated Pathway/B.Des and M.Des Admissions Handbooks 2027-28 published
      // 10 Sep 2026 with amendments to 29 Sep 2026, and NID's 2027-28 fee structures), checked on 9 Oct 2026.
      // "CAT" and "Fashion Design" must not auto-link here; the exam name has no "(DAT)" alias so bare "DAT" never links site-wide.
      intent: 'general',
      h1: 'NID DAT 2027: Exam Date, Registration, Fee & Eligibility',
      title: 'NID DAT 2027: Exam Date, Registration, Fee & Eligibility',
      description: 'NID DAT 2027 Prelims is on 20 Dec 2026; apply by 30 Nov at admissions.nid.edu. See the ₹3,000 fee, age limits, Prelims and Mains, seats and NID fees.',
      keywords: ['NID DAT 2027', 'NID entrance exam 2027', 'NID DAT 2027 exam date', 'NID DAT registration 2027 last date', 'NID application fee', 'NID eligibility', 'NID age limit', 'NID DAT Prelims', 'NID DAT Mains', 'NID integrated M.Des', 'NID fees structure', 'NID M.Des 2027'],
      intro: 'NID DAT 2027, the National Institute of Design\'s Design Aptitude Test for admissions in 2027-28, is open: apply at admissions.nid.edu by 11:59 pm on 30 November 2026 for the DAT Prelims on Sunday, 20 December 2026. This guide covers dates, fees, eligibility, the Prelims and Mains, seats and NID\'s programme fees, all from NID\'s 2027-28 handbooks.',
      ogImage: '/uploads/exams/nid-entrance-exam/nid-dat-2027-og.webp',
      absoluteTitle: true,
      autoLinkExcludeHrefs: ['/exams/cat', '/courses/fashion-design-ug', '/courses/fashion-design-pg'],
      collegesNote: {
        text: 'NID DAT is used only by the NIDs (Ahmedabad with Gandhinagar and Bengaluru, Andhra Pradesh, Assam, Haryana and Madhya Pradesh); NID says other institutions cannot use DAT scores without its permission. NID Ahmedabad is the NID campus published on CollegeDecision.in.',
        linkText: 'See the NID admissions portal',
        href: 'https://admissions.nid.edu/'
      },
      faqs: [
        {
          question: 'When is the NID DAT 2027 exam?',
          answer: 'The DAT Prelims for admissions 2027-28 is on Sunday, 20 December 2026, for both the undergraduate route and M.Des. The Prelims admit card comes out at 4 pm on 10 December 2026. NID has not yet announced the DAT Mains dates.'
        },
        {
          question: 'What is the last date to apply for NID DAT 2027?',
          answer: 'Apply online at admissions.nid.edu by 11:59 pm (IST) on Monday, 30 November 2026. Applications opened on 10 September 2026. An edit window runs from 4 pm on 1 December to 11:59 pm on 3 December 2026, but your programme, name, date of birth, mobile number and email can\'t be changed.'
        },
        {
          question: 'What is the NID DAT application fee?',
          answer: 'For 2027-28 it is ₹3,000 for General, Gen-EWS and OBC-NCL candidates, ₹2,000 for female candidates (except SC, ST and PwD), ₹1,500 for SC and ST candidates, ₹500 for PwD and third-gender candidates and US$125 for overseas candidates. Bank charges are extra. For the M.Des at NID Ahmedabad the fee is per discipline.'
        },
        {
          question: 'What is the age limit for NID B.Des and the integrated M.Des?',
          answer: 'You must be born on or after 1 July 2006 (General, Gen-EWS and overseas), 1 July 2003 (OBC-NCL, SC and ST) or 1 July 2001 (PwD). You also need Class 12 in any stream, passed or being taken in 2026-27, and you must pass in the first attempt.'
        },
        {
          question: 'Does NID Ahmedabad still offer a four-year B.Des?',
          answer: 'Not for 2027-28 entry. NID Ahmedabad, Gandhinagar and Bengaluru now admit Class 12 students to a 5.5-year Professional Education Master of Design (Integrated Pathway): 11 semesters and 15 disciplines with 9 seats each. NID Andhra Pradesh, Assam, Haryana and Madhya Pradesh list B.Des or the 5.5-year integrated M.Des.'
        },
        {
          question: 'Who can apply for NID M.Des 2027?',
          answer: 'Graduates in any discipline, and final-year students who submit their result by 31 July 2027. The age limit is birth on or after 1 July 1995 (General and Gen-EWS), 1 July 1992 (OBC-NCL, SC and ST) or 1 July 1990 (PwD). M.Des in Design Education needs a master\'s in design, or a bachelor\'s in design plus any master\'s.'
        },
        {
          question: 'What is the NID DAT exam pattern?',
          answer: 'There are two stages. The Prelims is a pen-and-paper test in English, common to all NIDs and used only for shortlisting; its marks are not carried forward. NID\'s sample paper mixes objective questions with drawing tasks. The Mains is a Studio Sensitivity Test plus an In-Person Sensitivity Test for the undergraduate route, and a studio test plus interview for M.Des.'
        },
        {
          question: 'How many candidates are shortlisted for the NID DAT Mains?',
          answer: 'For the integrated M.Des and B.Des, NID calls 2.5 times the available seats in each category to the Mains, in order of Prelims merit. NID will announce the tie-break policy and the Mains weightages later. Only candidates who sit both parts of the Mains make the merit list.'
        },
        {
          question: 'When will the NID DAT 2027 Prelims result come out?',
          answer: 'The M.Des Prelims result is due at 4 pm on 16 February 2027, and the undergraduate result at 4 pm on 16 March 2027. Scorecards can be downloaded from admissions.nid.edu for only 20 days. Re-totalling costs ₹2,000 and only checks that all answers were marked and added correctly.'
        },
        {
          question: 'What is the fee for NID Ahmedabad\'s programmes?',
          answer: 'For Indian students joining in 2027-28, tuition is ₹2,41,500 per semester for the 11-semester integrated M.Des and ₹2,80,500 per semester for the 5-semester M.Des. With other charges, that is ₹26,68,500 and ₹14,10,300 without hostel (our sum of NID\'s semester figures). Hostel is ₹15,000 a semester at Ahmedabad and ₹17,500 at Gandhinagar.'
        }
      ]
    },
    uceed: {
      // UCEED 2027 content package (docs/exam-content/uceed-2027.md in the backend repo).
      // Facts from IIT Bombay only (uceed.iitb.ac.in/2027 and the UCEED 2027 Information Brochure released 1 Oct 2026), checked on 9 Oct 2026.
      // Result-sharing institutes are mapped only where the institute's own admissions page confirms it accepts UCEED (see backup NOTES).
      intent: 'general',
      h1: 'UCEED 2027: Exam Date, Registration, Fee, Pattern & Result',
      title: 'UCEED 2027: Exam Date, Registration, Fee, Pattern & Result',
      description: 'UCEED 2027 is on 17 Jan; register by 31 Oct 2026 (late fee to 6 Nov). See the ₹2,000/₹4,000 fee, eligibility, Part A/B pattern, result and B.Des seats.',
      keywords: ['UCEED 2027', 'UCEED 2027 exam date', 'UCEED registration 2027', 'UCEED 2027 last date', 'UCEED application fee', 'UCEED eligibility', 'UCEED age limit', 'UCEED exam pattern', 'UCEED syllabus', 'UCEED result 2027', 'UCEED cutoff', 'UCEED result sharing institutes'],
      intro: 'UCEED 2027, IIT Bombay\'s Undergraduate Common Entrance Examination for Design, is open: register at uceed.iitb.ac.in by 31 October 2026 (late fee until 6 November) for the exam on Sunday, 17 January 2027. This guide covers dates, fees, eligibility, the Part-A/Part-B pattern, qualifying rules, results and B.Des seats, all from the official UCEED 2027 brochure.',
      ogImage: '/uploads/exams/uceed/uceed-2027-og.webp',
      absoluteTitle: true,
      autoLinkExcludeHrefs: ['/exams/cat', '/courses/fashion-design-ug', '/courses/fashion-design-pg'],
      collegesNote: {
        text: 'IIT Bombay fills B.Des seats at IIT Bombay, Delhi, Guwahati, Hyderabad, Indore and Roorkee and IIITDM Jabalpur through one joint process. Other colleges listed here use UCEED results under their own admission rules, as stated on their admissions pages; check each school before applying.',
        linkText: 'See the official UCEED institutes list',
        href: 'https://www.uceed.iitb.ac.in/2027/institutes.html'
      },
      faqs: [
        {
          question: 'When is the UCEED 2027 exam?',
          answer: 'UCEED 2027 is on Sunday, 17 January 2027, from 9:00 am to 12:00 noon, at test centres in 30 Indian cities. Admit cards can be downloaded from 1 pm on 1 January 2027, and the result is due on 6 March 2027.'
        },
        {
          question: 'What is the last date to register for UCEED 2027?',
          answer: 'The last date with the regular fee is 31 October 2026. After that you can register with a late fee of ₹500 (US$50 for foreign nationals) until 5 pm on 6 November 2026. Registration opened on 1 October 2026 at uceed.iitb.ac.in.'
        },
        {
          question: 'What is the UCEED 2027 application fee?',
          answer: 'Indian candidates pay ₹2,000 if they are female (any category) or SC, ST or PwD, and ₹4,000 otherwise. Foreign nationals pay US$200 (SAARC countries) or US$250 (other countries). Holders of OCI/PIO cards issued before 4 March 2021 pay the Indian fee. Bank charges are extra and the fee is not refundable.'
        },
        {
          question: 'What is the age limit for UCEED 2027?',
          answer: 'You must be born on or after 1 October 2002 if you are Open, EWS or OBC-NCL, or on or after 1 October 1997 if you are SC, ST or PwD. You can take UCEED at most twice, in consecutive years, and you must have first appeared for Class 12 in 2026 or 2027.'
        },
        {
          question: 'Can commerce or arts students take UCEED?',
          answer: 'Yes. Students from all streams may take UCEED 2027. For B.Des admission, IIT Bombay, IIT Delhi, IIT Hyderabad and IIT Indore accept any stream, but IIT Guwahati and IIT Roorkee need Physics, Chemistry and Mathematics in Class 12, and IIITDM Jabalpur needs Physics, Chemistry and Mathematics or Biology.'
        },
        {
          question: 'What is the UCEED 2027 exam pattern?',
          answer: 'It is one 3-hour paper of 300 marks in English. Part-A (computer-based, 2 hours, 200 marks) has 14 numerical questions worth 4 marks each with no negative marking, 15 multiple-select questions worth 4 marks with partial marks and −1 for a wrong answer, and 28 multiple-choice questions worth 3 marks with −0.71 for a wrong answer. Part-B (1 hour, 100 marks) has one sketching and one design aptitude question, answered on paper.'
        },
        {
          question: 'What is the UCEED cutoff?',
          answer: 'There is no fixed Part-A pass mark. IIT Bombay sets the Part-A cut-off at the average plus half the standard deviation of all scores (90% of that for OBC-NCL and EWS, 50% for SC, ST and PwD), and shortlists no more than the top 6,400. Shortlisted candidates need at least 15 (Open), 13.5 (OBC-NCL and EWS) or 7.5 (SC, ST and PwD) out of 100 in Part-B to get a rank.'
        },
        {
          question: 'How many B.Des seats are there through UCEED?',
          answer: 'The 2026-27 seat matrix in the UCEED 2027 brochure lists 245 seats: IIITDM Jabalpur 66, IIT Guwahati 56, IIT Bombay 37, IIT Hyderabad 30, IIT Delhi 20, IIT Roorkee 20 and IIT Indore 16. The 2027-28 matrix will be published when B.Des applications open.'
        },
        {
          question: 'How do I get a B.Des seat after the UCEED result?',
          answer: 'With a UCEED 2027 rank, fill the common B.Des application on the IIT Bombay admissions portal between 15 March and 12 April 2027, ranking the institutes in order of preference. Seats are allotted over five rounds from 21 April to 9 July 2027, which IIT Bombay calls tentative. To accept a seat you pay ₹65,000 (GEN, EWS and OBC-NCL) or ₹20,000 (SC, ST and PwD), including a ₹5,000 processing fee that is not refunded.'
        },
        {
          question: 'Which other colleges accept UCEED scores?',
          answer: 'IIT Bombay lists 47 result-sharing institutes for UCEED 2026; the 2027 list is still to come. They admit through their own processes, not the joint seat allotment. Institutes whose admissions pages say they accept UCEED include DTU, FLAME University, Nirma University, MAHE Manipal, Jain University, FDDI, LPU, MIT-WPU, Avantika, Alliance, RV University, Navrachana, JK Lakshmipat and O.P. Jindal Global University.'
        }
      ]
    },
    'iit-jam': {
      // IIT JAM 2027 content package (docs/exam-content/iit-jam-2027.md in the backend repo).
      // Facts from IIT Kharagpur only (jam.iitkgp.ac.in and the JAM 2027 Information Brochure, correct as on 22 Aug 2026), checked on 9 Oct 2026.
      // The website's extended deadline (19 Oct 2026) overrides the brochure's 12 Oct.
      intent: 'general',
      h1: 'IIT JAM 2027: Exam Date, Registration, Fee, Pattern & Result',
      title: 'IIT JAM 2027: Exam Date, Registration, Fee, Pattern & Result',
      description: 'IIT JAM 2027 by IIT Kharagpur is on 14 Feb 2027; apply by 19 Oct 2026. See the ₹2,000/₹1,000 fee, 7 papers, pattern, result on 18 Mar and IIT seats.',
      keywords: ['IIT JAM 2027', 'JAM 2027', 'IIT JAM 2027 exam date', 'JAM 2027 last date', 'JAM application fee', 'JAM eligibility', 'IIT JAM exam pattern', 'IIT JAM syllabus', 'JAM 2027 result date', 'IIT JAM colleges', 'JAM 2027 IIT Kharagpur', 'CCMN'],
      intro: 'IIT JAM 2027, the Joint Admission Test for Masters organised by IIT Kharagpur, is open until 19 October 2026 (extended) for the exam on Sunday, 14 February 2027. This guide covers dates, fees, eligibility, the seven papers, the marking scheme, results and admission to the IITs and through CCMN, all from the official JAM 2027 brochure and website.',
      ogImage: '/uploads/exams/iit-jam/iit-jam-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'The 23 IITs admit through JAM scores alone, using one JAM application. IISc, NITs, IIEST Shibpur and other centrally funded institutes fill their JAM seats through CCMN. Colleges listed here have programmes that admit through JAM; check each programme\'s minimum qualifications in the JAM brochure.',
        linkText: 'See the JAM 2027 Information Brochure',
        href: 'https://jam.iitkgp.ac.in/docs/Info_Brochure.pdf'
      },
      faqs: [
        {
          question: 'When is the IIT JAM 2027 exam?',
          answer: 'JAM 2027 is on Sunday, 14 February 2027, in two sessions: 9:30 am to 12:30 pm for Chemistry, Geology and Mathematics, and 2:30 pm to 5:30 pm for Biotechnology, Economics, Mathematical Statistics and Physics. The result is due on 18 March 2027.'
        },
        {
          question: 'What is the last date to apply for JAM 2027?',
          answer: 'The JAM 2027 website gives the last date as 19 October 2026, an extension of the brochure\'s 12 October. Registration on JOAPS opened on 11 September 2026. A paid data-correction window is due to open on 10 November 2026 (tentative).'
        },
        {
          question: 'Which institute is conducting JAM 2027?',
          answer: 'IIT Kharagpur is the organising institute for JAM 2027. The official website is jam.iitkgp.ac.in.'
        },
        {
          question: 'What is the JAM 2027 application fee?',
          answer: 'One paper costs ₹1,000 for female, SC, ST and PwD candidates and ₹2,000 for everyone else. Two papers cost ₹1,350 and ₹2,700. The fee is not refundable. Correcting your category, gender, exam city or date of birth, or adding or changing a paper, costs ₹300.'
        },
        {
          question: 'Is there an age limit or minimum percentage for JAM?',
          answer: 'There is no age limit. You can apply if you have finished a bachelor\'s degree or are in its final year in 2027, and candidates of any nationality may apply. Any minimum marks or subject requirements are part of each programme\'s Minimum Educational Qualifications, listed in Annexure II of the brochure.'
        },
        {
          question: 'Can I take two JAM papers?',
          answer: 'Yes, but only if they fall in different sessions. You can pick one forenoon paper (Chemistry, Geology or Mathematics) and one afternoon paper (Biotechnology, Economics, Mathematical Statistics or Physics). Two papers cost ₹2,700, or ₹1,350 for female, SC, ST and PwD candidates.'
        },
        {
          question: 'Is there negative marking in IIT JAM?',
          answer: 'Only in Section A, which has 30 MCQs. A wrong answer loses one-third of a mark on a 1-mark question and two-thirds of a mark on a 2-mark question. Section B (10 MSQs) and Section C (20 numerical-answer questions) have no negative marking, and MSQs have no partial marks. Each paper has 60 questions worth 100 marks.'
        },
        {
          question: 'How many seats are available through JAM 2027?',
          answer: 'The brochure lists about 3,000 seats in postgraduate programmes at 23 IITs for 2027-28, and more than 2,000 seats at IISc, NITs, IIEST Shibpur, IISER Pune and Bhopal, DIAT, IIPE, JNCASR, SLIET and other institutes through CCMN.'
        },
        {
          question: 'How do I get admission to an IIT after JAM?',
          answer: 'After the result, submit one application through the JAM website, listing all eligible programmes in order of preference. The processing fee is ₹750. There are up to four rounds. If you accept a seat, you pay an advance seat booking fee of ₹15,000 (General, OBC-NCL and EWS) or ₹7,500 (SC, ST and PwD), which is adjusted against your institute fee. The JAM 2027 Admission Brochure is due in the second week of March 2027.'
        },
        {
          question: 'What is CCMN in JAM?',
          answer: 'CCMN (Centralized Counselling for M.Sc./M.Sc. (Tech)) fills the JAM seats at institutes other than the IITs, including NITs, IIEST Shibpur and other centrally funded institutes, without any extra test or interview. You register separately at ccmn.admissions.nic.in after the JAM result.'
        }
      ],
      // Paper codes MA (Mathematics) and MS (Mathematical Statistics) would otherwise link to the MA and Master of Surgery
      // course pages; M.Tech appears only inside 'M.Sc.-M.Tech dual degree'.
      autoLinkExcludeHrefs: ['/courses/ma', '/courses/master-of-surgery', '/courses/mtech'],
    },
    micat: {
      // MICAT 2027 content package (docs/exam-content/micat-2027.md in the backend repo).
      // Facts from MICA only (mica.ac.in/admissions, PGDM-C/PGDM pages, MICAT Sample Questions 2027 PDF), checked on 9 Oct 2026.
      // Page switched to the 2027 cycle (micat removed from KEEP_2026): MICA calls this cycle "Admissions '27 / Batch 2027-2028".
      intent: 'general',
      h1: 'MICAT 2027: MICAT-I & II Dates, Fee, Pattern & Selection',
      title: 'MICAT 2027: MICAT-I & II Dates, Fee, Pattern & Selection',
      description: 'MICAT-I is on 5 Dec 2026 and MICAT-II on 12 Feb 2027. Check the ₹2,500 fee, 3-section CBT pattern, 48 cities, eligibility and MICA PGDM-C/PGDM selection.',
      keywords: ['MICAT 2027', 'MICAT exam date', 'MICAT 1 exam date', 'MICAT 2 exam date', 'MICAT registration 2027', 'MICAT application fee', 'MICAT exam pattern', 'MICAT sample questions', 'MICAT cutoff', 'MICA admission 2027', 'MICA PGDM-C', 'MICA fees'],
      intro: 'MICAT 2027, the MICA Admission Test conducted by MICA Ahmedabad for the 2027-28 batch, is held twice: MICAT-I on 5 December 2026 (register by 21 November 2026) and MICAT-II on 12 February 2027 (register by 30 January 2027). This guide covers dates, the ₹2,500 fee, eligibility, the three-section pattern, sample questions, selection and MICA programmes, all from MICA\'s official admissions pages.',
      ogImage: '/uploads/exams/micat/micat-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'MICAT is MICA\'s own admission test and is used only by MICA, Ahmedabad. PGDM-C, PGDM and PGCM-SM also need a CAT 2026, XAT 2027 or GMAT score; the other programmes use MICAT alone.',
        linkText: 'See MICA Admissions \'27',
        href: 'https://www.mica.ac.in/admissions/'
      },
      faqs: [
        {
          question: 'When is MICAT 2027?',
          answer: 'For the 2027-28 batch, MICAT-I is on Saturday, 5 December 2026 and MICAT-II is on Friday, 12 February 2027. Scores are declared on 18 December 2026 and 28 February 2027 respectively.'
        },
        {
          question: 'What is the last date to register for MICAT?',
          answer: 'MICAT-I registration closes on 21 November 2026 at 11:50 pm. MICAT-II registration runs from 25 November 2026 to 30 January 2027.'
        },
        {
          question: 'Can I take both MICAT-I and MICAT-II?',
          answer: 'Yes. You register and pay the application fee separately for each test. If you take both, MICA may consider your better MICAT performance.'
        },
        {
          question: 'What is the MICAT application fee?',
          answer: 'The application fee is ₹2,500, plus ₹500 for each additional programme, which is payable only if you are shortlisted for interview. The FPM application fee is ₹2,500 with no add-on.'
        },
        {
          question: 'What is the MICAT exam pattern?',
          answer: 'MICAT has three sections: Section A, a Psychometric Test; Section B, a Descriptive Test; and Section C, an Aptitude Test covering divergent and convergent thinking, verbal ability, and quantitative ability and data interpretation. MICA does not publish question counts or section timings.'
        },
        {
          question: 'Is there negative marking in MICAT?',
          answer: 'MICA says the Psychometric Test has no right or wrong answers and no negative marking, and its sample paper says the short-answer quantitative questions carry no negative marking. MICA has not published the marking scheme for the other objective questions.'
        },
        {
          question: 'Can I take MICAT from home?',
          answer: 'No. MICAT is a computer-based test held at designated test centres in 48 cities. Your centre is pre-assigned and shown on your admit card, and you cannot choose the centre or the computer.'
        },
        {
          question: 'Do I need a CAT, XAT or GMAT score for MICA?',
          answer: 'Yes for PGDM-C, PGDM and PGCM-SM (Sports Management): you need a CAT 2026, XAT 2027 or GMAT (2025 onwards) score along with MICAT, updated by 30 January 2027. PGCM-AMC, PGCM-DMMC and the Certificate in Strategic Communication need MICAT only.'
        },
        {
          question: 'What is the MICAT cut-off?',
          answer: 'MICA applies section-wise qualifying criteria to MICAT, which may vary every cycle, and does not publish cut-off scores. It says the quantitative ability and data interpretation cut-off may be higher for PGDM than for PGDM-C.'
        },
        {
          question: 'Which colleges accept MICAT scores?',
          answer: 'Only MICA, Ahmedabad. MICAT is required for all seven MICA programmes for 2027, including the two-year PGDM-C (180 seats) and PGDM (60 seats), with an indicative fee of ₹29.50 lakh each.'
        }
      ],
      // 'Media' in 'Digital Media and Marketing Communications' would link to the UG media course page.
      autoLinkExcludeHrefs: ['/courses/media-ug'],
    },
    gujcet: {
      // GUJCET 2027 content package (docs/exam-content/gujcet-2027.md in the backend repo).
      // Official sources only: GSEB GUJCET 2026 press notes (gseb.org / gsebeservice.com) and ACPC Gujarat 2026-27 advertisements
      // and seat matrices, checked on 9 Oct 2026. No GUJCET 2027 notice yet, so all 2027 dates are labelled Expected.
      // Negative marking is deliberately not mentioned (not stated in the notices read).
      intent: 'general',
      h1: 'GUJCET 2027: Exam Date, Pattern, Fees, ACPC Merit & Colleges',
      title: 'GUJCET 2027: Exam Date, Pattern, Fees, ACPC Merit & Colleges',
      description: 'GUJCET 2027 notice is awaited (2026 exam: 29 Mar). See the ₹350 fee, MCQ pattern, ACPC 50:50 merit rule and Gujarat B.E./B.Pharm colleges.',
      keywords: ['GUJCET 2027', 'GUJCET 2027 exam date', 'GUJCET registration 2027', 'GUJCET fees', 'GUJCET exam pattern', 'GUJCET syllabus 2027', 'GUJCET result 2027', 'GUJCET admit card', 'ACPC merit', 'GUJCET colleges', 'GSEB GUJCET', 'GUJCET 2027 notification'],
      intro: 'GUJCET 2027, the Gujarat Common Entrance Test conducted by GSEB Gandhinagar for B.E./B.Tech and pharmacy admission through ACPC, has not been notified yet; the notice is Expected around November–December 2026. GUJCET 2026 was held on 29 March 2026 with a ₹350 fee. This guide covers expected dates, the paper pattern, syllabus, results and ACPC merit, from GSEB and ACPC documents.',
      ogImage: '/uploads/exams/gujcet/gujcet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'GUJCET seats are filled by ACPC Gujarat at government, grant-in-aid and self-financed engineering and pharmacy institutes in Gujarat. Colleges listed here offer B.E./B.Tech or B.Pharm programmes that appear in ACPC\'s 2026-27 GUJCET (Home State) seat matrices.',
        linkText: 'See ACPC Gujarat admissions',
        href: 'https://acpc.gujarat.gov.in/'
      },
      faqs: [
        {
          question: 'When is the GUJCET 2027 exam?',
          answer: 'GSEB has not announced the GUJCET 2027 date yet. GUJCET 2026 was held on Sunday, 29 March 2026, and its exam-date notice came on 8 November 2025, so the 2027 notice is Expected around November 2026 and the exam in late March or early April 2027.'
        },
        {
          question: 'Who conducts GUJCET?',
          answer: 'The Gujarat Secondary and Higher Secondary Education Board (GSEB), Gandhinagar conducts GUJCET under a Gujarat Education Department resolution of 19 November 2016. Admission to colleges is handled separately by ACPC Gujarat.'
        },
        {
          question: 'What is the GUJCET application fee?',
          answer: 'For GUJCET 2026 the fee was ₹350, paid online through SBI ePay or at any SBI branch. In the late window (until 16 January 2026) a ₹1,000 late fee applied, making ₹1,350. The 2027 fee will be confirmed in GSEB\'s 2027 notice.'
        },
        {
          question: 'When does GUJCET 2027 registration start?',
          answer: 'It has not been announced. For GUJCET 2026, online registration ran from 16 to 30 December 2025 at gseb.org and gujcet.gseb.org, was extended to 6 January 2026, and then remained open with a late fee until 16 January 2026.'
        },
        {
          question: 'What is the GUJCET exam pattern?',
          answer: 'As notified for 2026, GUJCET has multiple-choice papers on OMR sheets: a combined Physics and Chemistry paper (80 questions, 80 marks, 120 minutes), Biology (40 questions, 40 marks, 60 minutes) and Mathematics (40 questions, 40 marks, 60 minutes). Papers are in Gujarati, English and Hindi.'
        },
        {
          question: 'What is the GUJCET syllabus?',
          answer: 'GUJCET follows the GSEB Class 12 Science syllabus based on NCERT textbooks in Physics, Chemistry, Biology and Mathematics, according to GSEB\'s notice.'
        },
        {
          question: 'How is ACPC merit calculated for GUJCET seats?',
          answer: 'ACPC gives 50% weightage to your Class 12 board theory percentile in Physics, Chemistry and Mathematics (or Biology for eligible branches) and 50% to your GUJCET percentile in the same subjects. This merit fills 95% of government and grant-in-aid seats and 50% of unaided seats.'
        },
        {
          question: 'Can students from other states use GUJCET?',
          answer: 'GUJCET-based ACPC seats are for candidates who studied at schools affiliated with boards located in Gujarat. Candidates from schools anywhere in India can compete for the 5% government and grant-in-aid quota through JEE Main (or NEET/JEE Main for pharmacy).'
        },
        {
          question: 'When is the GUJCET result declared?',
          answer: 'GSEB declares GUJCET results with the Class 12 results. In 2026 they were published on gseb.org at 10:00 am on 4 May 2026, and students could also get them by sending their seat number on WhatsApp to 6357300971.'
        },
        {
          question: 'Which colleges accept GUJCET?',
          answer: 'Government, grant-in-aid and self-financed B.E./B.Tech and pharmacy institutes in Gujarat that take part in ACPC admissions, such as LD College of Engineering, BVM, Nirma University, CHARUSAT, PDEU and IITRAM. National institutes like IIT Gandhinagar and SVNIT admit through JEE, not GUJCET.'
        }
      ],
    },
    'mah-mba-cet': {
      // MAH MBA CET 2027 content package (docs/exam-content/mah-mba-cet-2027.md in the backend repo).
      // Official sources only: State CET Cell Maharashtra notices + MAH-MBA/MMS CET 2026 Information Brochure (cetcell.mahacet.org)
      // and the CAP 2026-27 MBA/MMS notices / revised provisional seat distribution (mba2026.mahacet.org.in), checked on 9 Oct 2026.
      // No 2027 schedule yet, so all 2027 dates are labelled Expected.
      intent: 'general',
      h1: 'MAH MBA CET 2027: Exam Date, Pattern, Fees, CAP & Colleges',
      title: 'MAH MBA CET 2027: Exam Date, Pattern, Fees, CAP & Colleges',
      description: 'MAH MBA CET 2027 schedule is awaited (2026: 6–8 Apr & 9 May). See the ₹1,500 fee, 200-question pattern, best-of-two percentile and CAP colleges.',
      keywords: ['MAH MBA CET 2027', 'MAH CET 2027', 'MAH MBA CET exam date', 'MAH MBA CET registration 2027', 'MAH MBA CET fees', 'MAH MBA CET exam pattern', 'MAH MBA CET syllabus', 'MAH MBA CET result', 'MAH MBA CET percentile', 'MBA CAP Maharashtra', 'MAH MBA CET colleges', 'MAH MBA CET cut off'],
      intro: 'MAH MBA CET 2027 (MAH-MBA/MMS CET), conducted by the State CET Cell, Maharashtra for MBA/MMS admission through CAP, has not been scheduled yet; the schedule is Expected around November 2026 – January 2027. In 2026 the test was held in two attempts, on 6–8 April and 9 May, for a ₹1,500/₹1,300 fee. This guide covers expected dates, the pattern, percentiles and CAP, from CET Cell documents.',
      ogImage: '/uploads/exams/mah-mba-cet/mah-mba-cet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'MAH MBA CET seats are filled by the State CET Cell through CAP at government, university and unaided MBA/MMS institutes in Maharashtra. Colleges listed here offer MBA or MMS programmes that appear in the CET Cell\'s 2026-27 CAP seat distribution.',
        linkText: 'See the CET Cell admission portals',
        href: 'https://cetcell.mahacet.org/cap-_2026-27/'
      },
      faqs: [
        {
          question: 'When is the MAH MBA CET 2027 exam?',
          answer: 'The State CET Cell has not announced MAH MBA CET 2027 dates yet. In 2026 the first attempt was held on 6–8 April and the second on 9 May 2026, after a tentative schedule issued on 21 November 2025, so the 2027 exam is Expected between March and May 2027.'
        },
        {
          question: 'Who conducts MAH MBA CET?',
          answer: 'The State Common Entrance Test Cell, Maharashtra State, Mumbai conducts the MAH-MBA/MMS CET as the Competent Authority under the Maharashtra Unaided Private Professional Educational Institutions (Regulation of Admissions and Fees) Act, 2015. The same CET Cell runs CAP admissions.'
        },
        {
          question: 'What is the MAH MBA CET application fee?',
          answer: 'For 2026 the fee was ₹1,500 per attempt for Open candidates from Maharashtra, OMS and J&K migrant candidates, and ₹1,300 for Maharashtra reserved-category, EWS and PwD candidates and orphan and transgender candidates. Taking both attempts cost ₹3,000 or ₹2,600.'
        },
        {
          question: 'What is the MAH MBA CET exam pattern?',
          answer: 'As notified for 2026, the online test has 200 five-option multiple-choice questions for 200 marks in 150 minutes: Logical Reasoning 75, Abstract Reasoning 25, Quantitative Aptitude 50 and Verbal Ability/Reading Comprehension 50. The medium is English.'
        },
        {
          question: 'Is there negative marking in MAH MBA CET?',
          answer: 'No. The MAH-MBA/MMS CET 2026 Information Brochure states that there is no negative marking. Each question carries one mark.'
        },
        {
          question: 'Can I take MAH MBA CET twice?',
          answer: 'In 2026, yes. Candidates could register for one or both attempts. Each attempt gave a normalised percentile, and for candidates who took both, the better of the two percentiles was used for CAP 2026-27.'
        },
        {
          question: 'What is the eligibility for MAH MBA CET?',
          answer: 'A minimum three-year bachelor\'s degree in any discipline with at least 50% aggregate marks, or 45% for backward-class, EWS and PwD candidates belonging to Maharashtra. Final-year students can also appear, according to the 2026 brochure.'
        },
        {
          question: 'When was the MAH MBA CET 2026 result declared?',
          answer: 'The CET Cell declared the first-attempt result on 30 May 2026 and the second-attempt result on 12 June 2026. Score cards were made available in the candidate login on the CET Cell portal.'
        },
        {
          question: 'Can All India candidates get MBA seats in Maharashtra through CAP?',
          answer: 'Yes. Under CAP 2026-27, All India candidates could apply with a non-zero score in MAH-MBA/MMS CET, CAT, CMAT, XAT, ATMA, MAT or GMAT. Candidates who had not registered for MAH CET paid a ₹1,500 or ₹1,300 CAP registration fee.'
        },
        {
          question: 'Which colleges accept MAH MBA CET?',
          answer: 'Government, university and unaided MBA/MMS institutes in Maharashtra that take part in CAP. The 2026-27 revised provisional seat distribution listed 381 institutes, including JBIMS, PUMBA (Pune University), SIMSREE, Welingkar and SIES. Private and deemed universities and PGDM-only institutes are outside CAP.'
        }
      ],
      autoLinkExcludeHrefs: ['/courses/master-of-surgery', '/courses/special'],
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
