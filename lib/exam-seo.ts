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
const CUTOFF = new Set(['jee-main', 'jee-advanced', 'neet', 'gate', 'cat', 'bitsat', 'nata', 'clat', 'ailet', 'cuet-ug', 'ap-eapcet', 'tnea', 'keam']);

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
      // JEE Main 2027 content package (backups/exam_jeemain_20261029 on the dev Mac).
      // Facts from NTA only: JEE (Main) 2027 Information Bulletin (released 24 Oct 2026), syllabus-2027 page,
      // and NTA's 2026 result notice (20 Apr 2026). JoSAA closing ranks from josaa.admissions.nic.in. Checked 29 Oct 2026.
      intent: 'general',
      h1: 'JEE Main 2027: Exam Dates, Registration, Fees, Eligibility & Cutoff',
      title: 'JEE Main 2027: Exam Dates, Registration, Fees, Cutoff',
      description: 'JEE Main 2027 Session 1 is on 20–28 Jan 2027; apply by 22 Nov 2026. Official fees, eligibility, pattern, percentile and NIT/IIIT cutoffs.',
      keywords: ['JEE Main 2027', 'JEE Main 2027 exam date', 'JEE Main 2027 registration', 'JEE Main 2027 application form', 'JEE Main application fee', 'JEE Main eligibility', 'JEE Main exam pattern', 'JEE Main 2027 syllabus', 'JEE Main percentile', 'JEE Main cutoff', 'JEE Main cutoff for NIT', 'JoSAA closing rank'],
      intro: 'NTA released the JEE Main 2027 Information Bulletin on 24 October 2026. Session 1 registration runs until 22 November 2026 and the exam is on 20, 21, 22, 23, 24 and 28 January 2027; Session 2 is from 2 to 7 April 2027. This guide covers the official dates, fees, eligibility, pattern, percentile, the 2026 result and JoSAA cutoffs.',
      ogImage: '/uploads/exams/jee-main/jee-main-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'NITs, IIITs and other JoSAA institutes are listed first. IITs admit through JEE Advanced. For institute-wise JoSAA opening and closing ranks,',
        linkText: 'see the JEE Main cutoff page',
        href: '/exams/jee-main/cutoff'
      },
      faqs: [
        {
          question: 'When is the JEE Main 2027 exam?',
          answer: 'According to the 2027 Information Bulletin, Session 1 is on 20, 21, 22, 23, 24 and 28 January 2027 and Session 2 is from 2 to 7 April 2027. Paper 1 (B.E./B.Tech) runs in two shifts, 9 am to 12 noon and 3 pm to 6 pm IST.'
        },
        {
          question: 'What is the last date to apply for JEE Main 2027 Session 1?',
          answer: 'The Session 1 form opened on 24 October 2026 and closes on 22 November 2026 at jeemain.nta.nic.in. A late-fee window runs from 23 to 26 November, and corrections are allowed from 27 to 29 November 2026. Session 2 registration runs from 5 January to 3 February 2027.'
        },
        {
          question: 'When will the JEE Main 2027 admit card come out?',
          answer: 'For Session 1, NTA plans to release the exam city slip on 30 December 2026 and the admit card on 13 January 2027. For Session 2, the city slip is due on 12 March 2027 and the admit card on 25 March 2027.'
        },
        {
          question: 'What is the JEE Main 2027 application fee?',
          answer: 'The per-session fee for one paper at a centre in India is ₹1,000 for General male candidates, ₹900 for EWS and OBC-NCL males, ₹800 for female candidates and ₹500 for SC, ST, PwD and third-gender candidates. These are the same as 2026. Fees are higher for two papers and for centres abroad.'
        },
        {
          question: 'Who is eligible for JEE Main 2027?',
          answer: 'Candidates who passed Class 12 or an equivalent exam in 2025 or 2026, or who are appearing in 2027, can apply. There is no age limit. JoSAA institutes set their own Class 12 requirement for admission, so check the JoSAA business rules before counselling.'
        },
        {
          question: 'Has the JEE Main 2027 syllabus changed?',
          answer: 'No. NTA\'s JEE Main 2027 syllabus is the same as 2026. Paper 1 covers Mathematics, Physics and Chemistry from the Class 11 and 12 curriculum, with 75 questions for 300 marks, marked +4 for a correct answer and −1 for a wrong one.'
        },
        {
          question: 'What is new in the JEE Main 2027 application form?',
          answer: 'The 2027 bulletin adds sign-in through MeriPehchaan, a live photograph captured during the application, and an upload of the Class 10 marksheet. Candidates should keep Aadhaar and Class 10 details ready before starting the form.'
        },
        {
          question: 'What was the JEE Main 2026 cut-off for JEE Advanced?',
          answer: 'NTA\'s 2026 result notice set the qualifying NTA score at 93.4123549 for General, 82.4164528 for EWS, 80.9232583 for OBC-NCL, 63.9172792 for SC and 52.0174712 for ST candidates. 15,38,468 candidates appeared and 26 scored 100 percentile.'
        },
        {
          question: 'What JEE Main rank is needed for CSE at a top NIT?',
          answer: 'In JoSAA 2026 final round, the Other State, OPEN, gender-neutral closing rank for CSE was 1,373 at NIT Trichy, 1,954 at NIT Surathkal and 2,581 at NIT Warangal. Home State quota and category ranks are different, so check the full table on our JEE Main cutoff page.'
        },
        {
          question: 'Which colleges accept JEE Main?',
          answer: 'JEE Main ranks are used for B.Tech, B.Arch and B.Plan seats at NITs, IIITs and other government-funded technical institutes through JoSAA and CSAB counselling. IITs admit through JEE Advanced instead. Many state and private universities also accept JEE Main scores.'
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
      // NEET UG 2027 content package (docs/exam-content/neet-2027.md in the backend repo).
      // Facts from the NEET (UG) 2026 bulletin, NTA result notices 2023–2026 and the MCC Round 1 2026 allotment list, checked on 29 Oct 2026.
      intent: 'general',
      h1: 'NEET UG 2027: Exam Date, Eligibility, Pattern, Syllabus & Cutoff',
      title: 'NEET UG 2027: Exam Date, Syllabus, Pattern, Eligibility',
      description: 'NEET UG 2027 dates, eligibility, 720-mark pattern, syllabus, fees, 2023–2026 qualifying cutoff and MCC AIQ MBBS closing ranks for top colleges.',
      keywords: ['NEET UG 2027', 'NEET 2027 exam date', 'NEET 2027', 'NEET eligibility', 'NEET exam pattern', 'NEET syllabus 2027', 'NEET cutoff', 'NEET 2026 cutoff', 'NEET qualifying marks', 'NEET MBBS cutoff', 'NEET counselling', 'MCC counselling'],
      intro: 'NTA has not announced the NEET UG 2027 dates yet. Going by the 2026 cycle, applications are expected in February–March 2027 and the exam in May 2027. This guide covers eligibility, the 180-question pattern, syllabus, fees, qualifying cutoffs for 2023–2026, MCC counselling and AIQ MBBS closing ranks, using NTA and MCC documents.',
      ogImage: '/uploads/exams/neet/neet-ug-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'Every MBBS, BDS and AYUSH college in India admits through NEET UG. Government seats are split between the 15% All India Quota (MCC) and the 85% state quota, so the rank you need depends on the quota you apply under.',
        linkText: 'see college-wise NEET cutoffs',
        href: '/exams/neet/cutoff'
      },
      faqs: [
        {
          question: 'When is NEET UG 2027?',
          answer: 'NTA has not announced the NEET UG 2027 exam date as of 29 October 2026. Based on past cycles, it is expected in May 2027. The 2026 exam was first held on 3 May 2026, cancelled, and held again on 21 June 2026.'
        },
        {
          question: 'Will NEET UG 2027 be computer-based?',
          answer: 'The Union Education Minister has said NEET UG will move to a computer-based test from 2027, but NTA has not notified it yet. NEET 2026 was a pen-and-paper (OMR) test. The 2027 information bulletin will confirm the mode.'
        },
        {
          question: 'Who is eligible for NEET UG 2027?',
          answer: 'You must be at least 17 on or before 31 December 2027, and there is no upper age limit. You need Class 12 with Physics, Chemistry, Biology/Biotechnology and English, with at least 50% in PCB (40% for SC, ST and OBC-NCL, and 45% for General PwBD). Class 12 students can apply.'
        },
        {
          question: 'What is the NEET UG exam pattern?',
          answer: 'NEET UG has 180 compulsory questions for 720 marks in 3 hours: Physics 45, Chemistry 45 and Biology (Botany and Zoology) 90. A correct answer gets 4 marks and a wrong answer loses 1 mark.'
        },
        {
          question: 'What is the NEET UG application fee?',
          answer: 'In 2026 the fee was ₹1,700 for General, ₹1,600 for General-EWS and OBC-NCL, ₹1,000 for SC, ST, PwBD and Third Gender candidates, and ₹9,500 for centres outside India. The 2027 fee will be in the new bulletin.'
        },
        {
          question: 'What was the NEET 2026 qualifying cutoff?',
          answer: 'In 2026, General and EWS candidates needed 213 out of 720 (50th percentile), and SC, ST and OBC candidates needed 177 (40th percentile). General PwBD needed 194. About 11.21 lakh candidates qualified.'
        },
        {
          question: 'What NEET rank is needed for AIIMS Delhi?',
          answer: 'In MCC Round 1 of 2026, the last General (Open) MBBS seat at AIIMS New Delhi went to AIR 52. It closed at 192 for OBC, 292 for EWS, 793 for SC and 987 for ST.'
        },
        {
          question: 'How does NEET UG counselling work?',
          answer: 'MCC (mcc.nic.in) fills the 15% All India Quota in government colleges and all seats at AIIMS, JIPMER, central and deemed universities. Each state fills the remaining 85% of government seats and state quota seats in private colleges. In 2026 MCC ran three rounds and a stray vacancy round.'
        },
        {
          question: 'Has the NEET UG syllabus changed for 2027?',
          answer: 'NMC sets the syllabus. For 2026 it was the same as the previous year, based on NCERT Class 11 and 12. NMC has not announced any change for 2027 yet, so check nmc.org.in when the bulletin comes out.'
        }
      ]
    },
    'jee-advanced': {
      // JEE Advanced 2027 content package (docs/exam-content/jee-advanced-2027.html in the backend repo).
      // Facts from the JEE (Advanced) 2026 brochure, papers and result press releases, JIC reports 2023–2025 and JoSAA ORCR 2022–2026, checked on 29 Oct 2026.
      intent: 'general',
      h1: 'JEE Advanced 2027: Exam Date, Eligibility, Pattern, Syllabus & IIT Cutoffs',
      title: 'JEE Advanced 2027: Exam Date, Syllabus, Pattern, Cutoff',
      description: 'JEE Advanced 2027 dates, eligibility, 360-mark pattern, syllabus, fees, 2023–2026 qualifying marks and IIT JoSAA closing ranks for CSE and more.',
      keywords: ['JEE Advanced 2027', 'JEE Advanced 2027 exam date', 'JEE Advanced eligibility', 'JEE Advanced exam pattern', 'JEE Advanced syllabus', 'JEE Advanced cutoff', 'JEE Advanced qualifying marks', 'IIT cutoff', 'JoSAA closing rank', 'IIT CSE cutoff'],
      intro: 'JEE Advanced 2027 dates have not been announced yet. The 2026 exam was held on 17 May 2026 by IIT Roorkee, so the 2027 exam is expected in May 2027. This guide covers eligibility, the two-paper 360-mark pattern, syllabus, fees, qualifying marks for 2023–2026, the AAT, JoSAA counselling and IIT closing ranks, using jeeadv.ac.in and JoSAA data.',
      ogImage: '/uploads/exams/jee-advanced/jee-advanced-2027-hero.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'All 23 IITs fill their BTech, BS, Dual Degree and BArch seats through JEE Advanced ranks in JoSAA counselling, and IISc Bengaluru uses the same ranks for its BTech. Closing ranks differ a lot by IIT, branch, category and gender pool.',
        linkText: 'see IIT-wise JEE Advanced cutoffs',
        href: '/exams/jee-advanced/cutoff'
      },
      faqs: [
        {
          question: 'When is JEE Advanced 2027?',
          answer: 'JEE Advanced 2027 has not been announced on jeeadv.ac.in as of 29 October 2026. The 2026 exam was held on Sunday 17 May 2026, so the 2027 exam is expected in May 2027. Treat any exact date or organising IIT you see elsewhere as unofficial until the 2027 brochure is out.'
        },
        {
          question: 'Who is eligible for JEE Advanced 2027?',
          answer: 'You must be in the top 2,50,000 of the JEE Main BE/BTech paper, have first appeared in Class 12 with Physics, Chemistry and Mathematics in 2026 or 2027, and not have been admitted to an IIT before. You get at most two attempts in consecutive years. For 2026 the age rule was born on or after 1 October 2001, with five years of relaxation for SC, ST and PwD.'
        },
        {
          question: 'What is the JEE Advanced exam pattern?',
          answer: 'There are two compulsory three-hour computer-based papers worth 180 marks each, 360 in total, with 120 marks each for Physics, Chemistry and Mathematics. In 2026 there were 102 questions: single-correct and multi-correct MCQs, numerical-value questions, matching sets and stem-based numericals. The pattern can change every year.'
        },
        {
          question: 'Is there negative marking in JEE Advanced?',
          answer: 'Yes, in most MCQ sections. In 2026, a wrong single-correct answer cost 1 mark, and a wrong pick in the multi-correct section turned the whole answer into −1, though partially correct answers earned +1 to +3. Numerical-value questions had no negative marking.'
        },
        {
          question: 'What is the JEE Advanced registration fee?',
          answer: 'For 2026 the fee was ₹3,200 for general candidates and ₹1,600 for female, SC, ST and PwD candidates, with USD 100 to 300 for foreign nationals and centres outside India. The 2027 fee will be in the 2027 brochure.'
        },
        {
          question: 'What were the JEE Advanced 2026 qualifying marks?',
          answer: 'To get a rank in 2026, Common Rank List candidates needed 8 marks in each subject and 92 out of 360 in total. GEN-EWS and OBC-NCL candidates needed 7 and 82, and SC, ST and PwD candidates needed 4 and 46. Of 1,79,694 candidates who sat both papers, 56,880 qualified.'
        },
        {
          question: 'What JEE Advanced rank is needed for IIT Bombay CSE?',
          answer: 'In the final JoSAA round of 2026, BTech Computer Science at IIT Bombay closed at rank 67 for OPEN gender-neutral seats, and it has closed between 61 and 68 every year since 2022. IIT Delhi CSE closed at 128 and IIT Madras at 151 in 2026.'
        },
        {
          question: 'Do I need 75% in Class 12 for an IIT?',
          answer: 'Yes. To take an IIT seat you need at least 75% aggregate in Class 12 (65% for SC, ST and PwD) or a place in the top 20 percentile of your board, along with a JEE Advanced rank. The marks condition does not stop you from writing the exam.'
        },
        {
          question: 'What is the AAT in JEE Advanced?',
          answer: 'The Architecture Aptitude Test is a separate three-hour test for JEE Advanced qualifiers who want BArch at IIT (BHU) Varanasi, IIT Kharagpur or IIT Roorkee. It is pass or fail; seats are then given by JEE Advanced rank. In 2026 it was held on 4 June.'
        },
        {
          question: 'How are IIT seats allotted after JEE Advanced?',
          answer: 'Through JoSAA counselling on josaa.nic.in. You register, fill IIT and branch choices in order, and seats are allotted by your JEE Advanced category rank over several rounds. In 2026 there were five rounds between 13 June and 16 July.'
        }
      ]
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
    clat: {
      // CLAT 2027 content package (docs/exam-content/clat-2027.md in the backend repo).
      // Facts from consortiumofnlus.ac.in (CLAT 2027 UG/PG instructions, eligibility, question format, syllabus, 22 Jul 2026 press release), checked on 29 Oct 2026.
      intent: 'general',
      h1: 'CLAT 2027: Exam Date, Eligibility, Pattern, Syllabus & NLU Cutoffs',
      title: 'CLAT 2027: Exam Date, Eligibility, Pattern, Syllabus, Cutoff',
      description: 'CLAT 2027 is on 6 December 2026. Check eligibility, the 120-question pattern, syllabus, ₹4,000 fee, counselling and NLU-wise closing ranks for 2024–2026.',
      keywords: ['CLAT 2027', 'CLAT 2027 exam date', 'CLAT 2027 registration', 'CLAT eligibility', 'CLAT exam pattern', 'CLAT syllabus', 'CLAT cutoff', 'NLU cutoff', 'CLAT counselling', 'CLAT PG 2027'],
      intro: 'CLAT 2027 will be held on Sunday, 6 December 2026, from 2 PM to 4 PM in offline mode, and applications close on 31 October 2026. This guide covers eligibility, the exam pattern, syllabus, fees, counselling and NLU-wise closing ranks, using official Consortium of NLUs sources.',
      ogImage: '/uploads/exams/clat/clat-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'The 26 member National Law Universities admit only through CLAT and are listed first. NLU Delhi is not part of CLAT; it admits through AILET. Private universities that accept CLAT scores run their own admissions, so check with each college.',
        linkText: 'see NLU-wise CLAT cutoffs',
        href: '/exams/clat/cutoff'
      },
      faqs: [
        {
          question: 'When is CLAT 2027?',
          answer: 'CLAT 2027 is on Sunday, 6 December 2026, from 2:00 PM to 4:00 PM. PwD candidates get time until 4:40 PM. The test is offline (pen and paper).'
        },
        {
          question: 'What is the last date to apply for CLAT 2027?',
          answer: 'Applications opened on 3 August 2026 and close on 31 October 2026 at 11:59 PM. You apply only online at consortiumofnlus.ac.in.'
        },
        {
          question: 'What is the CLAT 2027 application fee?',
          answer: 'The fee is ₹4,000 for General and OBC candidates (and NRI candidates for PG), and ₹3,500 for SC, ST, BPL and PwD candidates. Past question papers cost ₹500 extra. The fee is not refunded.'
        },
        {
          question: 'Who is eligible for CLAT 2027 UG?',
          answer: 'You need Class 12 or equivalent with at least 45% marks, or 40% for SC, ST and PwD candidates. Students writing Class 12 exams in March/April 2027 can apply. There is no upper age limit. Foreign nationals cannot take CLAT.'
        },
        {
          question: 'What is the CLAT 2027 exam pattern?',
          answer: 'The UG paper has 120 one-mark questions in 2 hours across English Language, Current Affairs including GK, Legal Reasoning, Logical Reasoning and Quantitative Techniques. A correct answer gets 1 mark and a wrong answer loses 0.25 marks.'
        },
        {
          question: 'Has the CLAT 2027 syllabus changed?',
          answer: 'No. The Consortium\'s Governing Body decided on 18 July 2026 that the syllabus and the pattern of the UG and PG papers will stay the same for CLAT 2027.'
        },
        {
          question: 'Is there an essay in CLAT PG 2027?',
          answer: 'No. CLAT PG 2027 has 120 objective questions in 2 hours, based on extracts from judgments, statutes and regulations, with 0.25 marks deducted for each wrong answer. There is no descriptive section.'
        },
        {
          question: 'What CLAT rank is needed for NLSIU Bengaluru?',
          answer: 'In the final 2026 allotment list, the last General category All India seat at NLSIU Bengaluru went to AIR 108. It was AIR 112 in 2025 and AIR 102 in 2024. Reserved categories close at higher ranks.'
        },
        {
          question: 'How does CLAT counselling work?',
          answer: 'The Consortium runs a single counselling for all member NLUs. In the 2026 cycle, you registered, paid ₹30,000 (₹20,000 for reserved categories), and listed at least 15 NLU preferences for UG. Seats were allotted in rounds, with Freeze and Float options after each round.'
        },
        {
          question: 'Does NLU Delhi accept CLAT scores?',
          answer: 'No. National Law University Delhi is not part of the CLAT Consortium. It admits students through its own entrance test, AILET.'
        }
      ]
    },
    ailet: {
      // AILET 2027 content package (backups/exam_ailet_20261029). Facts from nationallawuniversitydelhi.in (notification 23 Jul 2026, admission notice 7 Aug 2026,
      // exam details, seat matrix, fees, FAQ) and NLU Delhi's 2026 provisional merit lists, checked on 29 Oct 2026.
      intent: 'general',
      h1: 'AILET 2027: Exam Date, Syllabus, Pattern, Eligibility & NLU Delhi Cutoff',
      title: 'AILET 2027: Exam Date, Syllabus, Pattern, Eligibility',
      description: 'AILET 2027 is on 13 December 2026. Check eligibility, the 150-question pattern, syllabus, ₹3,000 fee, seat matrix and NLU Delhi closing ranks for 2026.',
      keywords: ['AILET 2027', 'AILET 2027 exam date', 'AILET 2027 registration', 'AILET syllabus', 'AILET exam pattern', 'AILET eligibility', 'AILET cutoff', 'NLU Delhi cutoff', 'AILET vs CLAT', 'AILET LLM 2027'],
      intro: 'AILET 2027 will be held on Sunday, 13 December 2026, from 2 PM to 4 PM in offline mode, and applications close on 10 November 2026. This guide covers eligibility, the exam pattern, syllabus, fees, seats, counselling and NLU Delhi closing ranks, using official NLU Delhi sources.',
      ogImage: '/uploads/exams/ailet/ailet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'AILET scores are used for admission only at National Law University Delhi (BA LLB and LL.M.). The CLAT member NLUs do not accept AILET; see the CLAT page for them.',
        linkText: 'see NLU Delhi closing ranks',
        href: '/exams/ailet/cutoff'
      },
      faqs: [
        {
          question: 'When is AILET 2027?',
          answer: 'AILET 2027 is on Sunday, 13 December 2026, from 2:00 PM to 4:00 PM. It is an offline, pen-and-paper test with an OMR answer sheet, held in 32 cities.'
        },
        {
          question: 'What is the last date to apply for AILET 2027?',
          answer: 'Applications opened on 7 August 2026 and close on 10 November 2026. A correction window stays open for 3 days after the last date. You apply only online at nationallawuniversitydelhi.in.'
        },
        {
          question: 'What is the AILET 2027 application fee?',
          answer: 'The fee is ₹3,000 for General, OBC and EWS candidates and ₹1,000 for SC, ST and PwD candidates. SC/ST and women candidates below the poverty line do not pay any fee.'
        },
        {
          question: 'What is the AILET 2027 exam pattern?',
          answer: 'The BA LLB paper has 150 one-mark MCQs in 120 minutes: English Language 50, Current Affairs and GK 30, and Logical Reasoning 70. Each wrong answer costs 0.25 marks. The LL.M. paper has 100 law MCQs in 120 minutes.'
        },
        {
          question: 'Who is eligible for AILET 2027 BA LLB?',
          answer: 'You need Class 12 or equivalent with at least 45% marks, 42% for OBC and 40% for SC, ST and PwD candidates. Students writing Class 12 in 2027 can apply, and there is no age limit.'
        },
        {
          question: 'How many seats does NLU Delhi have through AILET?',
          answer: 'For 2027–28, NLU Delhi fills 110 BA LLB seats and 70 LL.M. seats on AILET merit. Another 10 seats in each programme go to foreign nationals and OCI/PIO candidates without the test.'
        },
        {
          question: 'Is there a Delhi domicile quota in AILET 2027?',
          answer: 'No. The 2027 seat matrix splits seats only by category (General, OBC, SC, ST, EWS) with 5% for PwD candidates. There is no Delhi resident quota and no NRI quota.'
        },
        {
          question: 'What AILET rank is needed for NLU Delhi?',
          answer: 'In the third provisional merit list of 2026, the last General BA LLB seat went to AIR 71. OBC closed at 373, EWS at 346, SC at 1,731 and ST at 2,888. A fourth list was due in May 2026.'
        },
        {
          question: 'Is AILET harder than CLAT?',
          answer: 'Not harder, but faster. AILET has 150 questions in 120 minutes against CLAT\'s 120, and almost half its marks are logical reasoning. It has no separate legal reasoning or maths section.'
        },
        {
          question: 'Does NLU Delhi accept CLAT scores?',
          answer: 'No. NLU Delhi admits only through AILET, and an AILET rank is not accepted by the CLAT member NLUs. Students who want both usually write both exams.'
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
    'cuet-ug': {
      // CUET UG 2027 content package (backups/exam_cuetug_20261029). Facts from the CUET (UG) 2026 Information Bulletin, NTA's June 2026 conduct press note
      // and 23 Jun 2026 scorecard notice, and DU CSAS (UG) round 1 minimum allocation scores 2025 and 2026, checked on 29 Oct 2026. 2027 dates are expected, not official.
      intent: 'general',
      h1: 'CUET UG 2027: Exam Date, Subjects, Syllabus, Pattern & DU Cutoff',
      title: 'CUET UG 2027: Exam Date, Syllabus, Pattern, Eligibility',
      description: 'CUET UG 2027 exam date (expected May 2027), 37 subjects, pattern, syllabus, fee, eligibility, DU CSAS and Delhi University cutoffs for 2025 and 2026.',
      keywords: ['CUET UG 2027', 'CUET UG 2027 exam date', 'CUET UG registration 2027', 'CUET UG syllabus', 'CUET UG exam pattern', 'CUET UG subjects list', 'CUET UG eligibility', 'CUET UG application fee', 'CUET UG cutoff', 'DU CSAS'],
      intro: 'CUET UG 2027 has not been notified yet. Going by the 2026 cycle, applications should open in January 2027 and the exam should run in May 2027. This guide covers eligibility, the 37 subjects, exam pattern, syllabus, fee, DU CSAS admission and official Delhi University cutoffs, based on NTA and DU documents.',
      ogImage: '/uploads/exams/cuet-ug/cuet-ug-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These colleges and universities have published profiles on CollegeDecision.in and admit to at least some UG programmes on CUET UG scores: Delhi University colleges listed in DU\'s official CSAS cutoff lists, and central universities. Each runs its own admission. For master\'s admission see CUET PG.',
        linkText: 'See CUET PG',
        href: '/exams/cuet-pg'
      },
      faqs: [
        {
          question: 'When is the CUET UG 2027 exam?',
          answer: 'NTA has not announced CUET UG 2027 dates yet. Going by the 2026 cycle, when the exam ran from 11 to 31 May with extra dates on 6 and 7 June, expect it in May 2027. Watch cuet.nta.nic.in for the official schedule.'
        },
        {
          question: 'When will CUET UG 2027 registration start?',
          answer: 'Expected in January 2027. In 2026 the form was open from 3 to 30 January, with the fee due by 31 January and corrections on 2 to 4 February. NTA will confirm 2027 dates in the new information bulletin.'
        },
        {
          question: 'How many subjects can I choose in CUET UG?',
          answer: 'Up to five papers from a list of 37: 13 languages, 23 domain subjects and the General Aptitude Test. Pick the papers your target universities and programmes ask for, not just your favourite subjects.'
        },
        {
          question: 'What is the CUET UG exam pattern?',
          answer: 'Every paper has 50 compulsory multiple-choice questions in 60 minutes. A correct answer earns 5 marks, a wrong one loses 1, and a blank gets 0, so each paper is out of 250. The test is computer-based.'
        },
        {
          question: 'What is the CUET UG application fee?',
          answer: 'In 2026 it was ₹1,000 for up to three subjects for General candidates, ₹900 for OBC-NCL and EWS, and ₹800 for SC, ST, PwBD and third gender candidates. Each extra subject cost ₹400, ₹375 or ₹350.'
        },
        {
          question: 'Is there an age limit for CUET UG?',
          answer: 'No. NTA sets no age limit. You need to have passed Class 12 or be appearing in it, but each university can apply its own age and marks rules for a programme.'
        },
        {
          question: 'Is CUET UG based on the NCERT syllabus?',
          answer: 'Yes for domain subjects, which follow the Class 12 NCERT syllabus. Language papers test reading comprehension and vocabulary, and the General Aptitude Test covers GK, current affairs, numerical ability and reasoning.'
        },
        {
          question: 'What CUET score is needed for Hindu College or SRCC?',
          answer: 'In DU\'s 2026 round 1, the last General seat for B.A. (Hons.) Political Science at Hindu College went at 958.71 out of 1,000, and B.Com. (Hons.) at SRCC at 924.30. Scores for other categories and later rounds are lower.'
        },
        {
          question: 'How does Delhi University admission through CUET UG work?',
          answer: 'DU admits through CSAS (UG). You register in Phase I, then choose programmes and colleges in Phase II after the CUET result. DU allocates seats in rounds based on a programme-specific score from your CUET papers.'
        },
        {
          question: 'What is the difference between CUET UG and CUET PG?',
          answer: 'CUET UG is for undergraduate admission after Class 12 and is usually held in May. CUET PG is a separate NTA test for master\'s programmes, held in March, with its own papers and fee.'
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
    tancet: {
      // TANCET 2027 content package (docs/exam-content/tancet-2027.md in the backend repo).
      // Official sources only: Anna University TANCET/CEETA-PG 2026 Information to Candidates and results press note
      // (tancet.annauniv.edu), and TN MBA/MCA Admissions 2026-27 documents (DTE via GCT Coimbatore, tn-mbamca.com), checked on 9 Oct 2026.
      // No 2027 notification yet, so all 2027 dates are labelled Expected.
      intent: 'general',
      h1: 'TANCET 2027: MBA/MCA Exam Date, Pattern, Fees & Counselling',
      title: 'TANCET 2027: MBA/MCA Exam Date, Pattern, Fees & Counselling',
      description: 'TANCET 2027 notice is awaited (2026 exam: 9 May). See the ₹1,000 fee, MBA/MCA pattern with −¼ marking, CEETA-PG split and TN MBA/MCA counselling.',
      keywords: ['TANCET 2027', 'TANCET exam date 2027', 'TANCET registration 2027', 'TANCET fees', 'TANCET exam pattern', 'TANCET syllabus', 'TANCET MBA', 'TANCET MCA', 'TANCET result', 'TANCET score card', 'TN MBA MCA counselling', 'CEETA-PG vs TANCET', 'TANCET colleges', 'TANCET cut off'],
      intro: 'TANCET 2027, conducted by Anna University, Chennai for MBA and MCA admission in Tamil Nadu, has not been notified yet; the notification is Expected around February–March 2027 and the exam in May 2027. In 2026 the exam was held on 9 May for a ₹1,000 fee (₹500 for TN SC/SCA/ST). This guide covers expected dates, the pattern, CEETA-PG and TN MBA/MCA counselling, from official sources.',
      ogImage: '/uploads/exams/tancet/tancet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'TANCET scores are used for MBA and MCA admission in Tamil Nadu: Anna University departments, Annamalai University, government and aided colleges and government-quota seats at self-financing colleges through TN MBA/MCA counselling, plus self-financing colleges that opt to use TANCET. Colleges listed here offer MBA or MCA programmes in Tamil Nadu.',
        linkText: 'See TN MBA/MCA admissions',
        href: 'https://tn-mbamca.com/'
      },
      faqs: [
        {
          question: 'When is the TANCET 2027 exam?',
          answer: 'Anna University has not announced TANCET 2027 dates yet. In 2026 registration ran from 16 March to 10 April and both papers were held on 9 May 2026 (MCA 10 am – 12 noon, MBA 2:30 – 4:30 pm), so TANCET 2027 is Expected in May 2027.'
        },
        {
          question: 'Does TANCET still cover M.E. and M.Tech. admissions?',
          answer: 'No. Under G.O.(MS) No. 14 of the Higher Education (J2) Department dated 24 January 2023, Anna University conducts TANCET only for MBA and MCA. M.E., M.Tech., M.Arch. and M.Plan. admissions use a separate test, CEETA-PG, which was held on 10 May 2026.'
        },
        {
          question: 'What is the TANCET application fee?',
          answer: 'For 2026 the fee was ₹1,000 per paper (MBA or MCA), or ₹500 for SC, SCA and ST candidates belonging to Tamil Nadu, paid online. Candidates who wrote both papers paid for each.'
        },
        {
          question: 'What is the TANCET exam pattern?',
          answer: 'As notified for 2026, the MBA and MCA papers each have 100 four-option multiple-choice questions for 100 marks in 2 hours. Answers are shaded on an OMR sheet with a black ballpoint pen; pencil-shaded sheets are not evaluated.'
        },
        {
          question: 'Is there negative marking in TANCET?',
          answer: 'Yes. The 2026 brochure deducts 1/4 mark for each wrong answer, and shading more than one box counts as a wrong answer. Unanswered questions carry no deduction.'
        },
        {
          question: 'What is the eligibility for TANCET MBA and MCA?',
          answer: 'A recognised bachelor\'s degree of at least 3 years with 50% marks, or 45% for BC, BCM, MBC, SC, SCA and ST candidates of Tamil Nadu. For MCA the degree must be BCA or B.Sc. Computer Science/IT, or include Mathematics at 10+2 or degree level. Final-year students may apply.'
        },
        {
          question: 'When was the TANCET 2026 result declared?',
          answer: 'Anna University declared TANCET/CEETA-PG 2026 results on 22 May 2026. Score cards could be downloaded from 27 May to 26 June 2026. The score card shows a percentile: the share of candidates who scored less than you.'
        },
        {
          question: 'How does TN MBA/MCA counselling work?',
          answer: 'In 2026 the Directorate of Technical Education ran single-window counselling through Government College of Technology, Coimbatore. Registration ran from 4 to 30 June, the rank list came out on 16 July, MCA and MBA online counselling followed in late July and early August, and counselling ended on 14 August 2026. Rank is by TANCET marks.'
        },
        {
          question: 'Can candidates from other states write TANCET?',
          answer: 'Yes, other-state candidates can write the test, but the brochure says the admitting authority sets their eligibility. In TN MBA/MCA counselling, only Indian nationals may apply, nativity rules apply, and only Tamil Nadu natives get communal reservation.'
        },
        {
          question: 'Which colleges accept TANCET scores?',
          answer: 'University departments of Anna University and its regional campuses, Annamalai University, government and government-aided engineering and arts and science colleges, and government-quota or surrendered seats at self-financing colleges through counselling. Other state-Act universities and self-financing colleges in Tamil Nadu may also opt to use TANCET.'
        }
      ],
      autoLinkExcludeHrefs: ['/courses/master-of-surgery', '/courses/special'],
    },
    'amrita-entrance-examination-aeee': {
      // AEEE 2027 content package (docs/exam-content/amrita-entrance-examination-aeee-2027.md in the backend repo).
      // Official sources only: amrita.edu/btech (mirrored at aeee.amrita.edu) and the Amrita B.Tech CSAP Handbook 2026
      // (webfiles.amrita.edu), checked on 12 Oct 2026. AEEE 2027 window (15 Apr - 7 May 2027) is official; other 2027 items are Expected.
      intent: 'general',
      h1: 'AEEE 2027: Exam Date (Apr–May), Pattern, Fees, CSAP & Slabs',
      title: 'AEEE 2027: Exam Date (Apr–May), Pattern, Fees, CSAP & Slabs',
      description: 'AEEE 2027 will be held 15 April – 7 May 2027; applications open November 2026. See the ₹1,300 fee, 100-question pattern, CSAP counselling and fee slabs.',
      keywords: ['AEEE 2027', 'AEEE exam date 2027', 'Amrita Entrance Exam 2027', 'AEEE registration 2027', 'AEEE application fee', 'AEEE exam pattern', 'AEEE syllabus', 'AEEE eligibility', 'AEEE result', 'Amrita CSAP 2027', 'Amrita B.Tech fees', 'Amrita fee slab', 'AEEE vs JEE Main', 'Amrita B.Tech campuses'],
      intro: 'AEEE 2027, Amrita Vishwa Vidyapeetham\'s entrance test for B.Tech at its eight engineering campuses, will be held between 15 April and 7 May 2027, with applications opening in November 2026. In 2026 the fee was ₹1,300 and seats were allotted through CSAP on AEEE rank or JEE Main percentile. This guide covers dates, pattern, eligibility, CSAP and fee slabs from official Amrita sources.',
      ogImage: '/uploads/exams/amrita-entrance-examination-aeee/aeee-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'AEEE is used only for B.Tech admission at Amrita Vishwa Vidyapeetham\'s engineering campuses: Amaravati, Amritapuri, Bengaluru, Chennai, Coimbatore, Faridabad, Haridwar and Nagercoil. Seats are allotted through Amrita\'s CSAP counselling on AEEE rank or JEE Main percentile.',
        linkText: 'See Amrita B.Tech admissions',
        href: 'https://www.amrita.edu/btech/'
      },
      faqs: [
        {
          question: 'When is AEEE 2027?',
          answer: 'Amrita\'s B.Tech admissions page says AEEE 2027 will be conducted between 15 April and 7 May 2027, and that applications for B.Tech 2027 start in November 2026. Slot-booking, admit card and result dates are not out yet.'
        },
        {
          question: 'What is the AEEE application fee?',
          answer: 'For 2026 the fee was ₹1,300 for the AEEE route, which also allowed applying with a JEE Main percentile at no extra cost, and ₹500 for the JEE Main-only route. Taking Phase 2 after Phase 1 cost ₹600 more. The 2027 fee is Expected with applications in November 2026.'
        },
        {
          question: 'What is the AEEE exam pattern?',
          answer: 'As published for 2026, AEEE is a 150-minute computer-based test in English with 100 multiple-choice questions: Mathematics 40, Physics 25, Chemistry 20, Quantitative Aptitude 10 and English 5. Each correct answer earns 3 marks and each wrong answer costs 1 mark.'
        },
        {
          question: 'What is the eligibility for Amrita B.Tech through AEEE?',
          answer: 'Class 12 or equivalent with Physics, Chemistry and Mathematics and at least 50% in each. Amrita\'s B.Tech page lists a 55% PCM aggregate, while the CSAP Handbook 2026 lists 60%, so aim for 60%. For 2026, candidates had to be born on or after 1 July 2005.'
        },
        {
          question: 'Can I get Amrita B.Tech admission with JEE Main instead of AEEE?',
          answer: 'Yes. AEEE is not mandatory. In 2026, 70% of CSAP seats were filled through AEEE ranks and 30% through JEE Main percentiles. Candidates who applied through both routes were allotted on their better rank.'
        },
        {
          question: 'How was AEEE conducted in 2026?',
          answer: 'In two phases: Phase 1 from 29 January to 1 February 2026 and Phase 2 from 25 to 30 April 2026. Candidates could take either or both, and the best score counted for the rank. Amrita has not yet said whether AEEE 2027 will have phases.'
        },
        {
          question: 'What is Amrita CSAP?',
          answer: 'The Centralised Seat Allotment Process is Amrita\'s online B.Tech counselling. In 2026 it cost ₹5,000 to register. Candidates listed up to 60 campus–branch preferences, each with the highest fee slab they would pay, and seats were allotted in two rounds and a mop-up round from 1 to 24 June 2026.'
        },
        {
          question: 'What are Amrita B.Tech fees after AEEE?',
          answer: 'Fees depend on campus, branch group and the rank-based fee slab. For 2026-27, annual tuition for CSE-group branches at Coimbatore ran from ₹1.5 lakh in Slab 1 to ₹6 lakh in Slab 5. Slabs 1–3 are scholarship slabs, renewed each year on minimum CGPA.'
        },
        {
          question: 'Does Amrita publish AEEE cut-offs?',
          answer: 'No. Amrita says it has no cut-off system for AEEE or JEE. Allotment depends on rank, the number of applicants and their preferences, which vary every year. Every candidate with an AEEE rank or JEE Main percentile can register for CSAP.'
        },
        {
          question: 'Which Amrita campuses offer B.Tech?',
          answer: 'Eight: Amaravati, Amritapuri, Bengaluru, Chennai, Coimbatore, Faridabad, Haridwar and Nagercoil. AI & Data Science is offered at all eight and CSE at seven. Coimbatore has the widest choice, including Aerospace, Civil and Chemical Engineering.'
        }
      ],
    },
    bitsat: {
      // BITSAT 2027 content package (docs/exam-content/bitsat-2027.md in the backend repo).
      // Official sources only: bitsadmission.com (redirects to admissions.bits-pilani.ac.in): BITSAT-2026 brochure, eligibility,
      // fee 2026-27, scholarship, cut-off and FAQ pages and admission notices, checked on 12 Oct 2026. 2027 dates are Expected.
      intent: 'general',
      h1: 'BITSAT 2027: Exam Dates, Eligibility, Pattern, Fees, Cutoffs',
      title: 'BITSAT 2027: Exam Dates, Eligibility, Pattern, Fees, Cutoffs',
      description: 'BITSAT 2027 applications open December 2026 (tentative). See the 75% PCM rule, 130-question pattern, ₹3,600 fee, iterations and 2026 cut-offs by campus.',
      keywords: ['BITSAT 2027', 'BITSAT exam date 2027', 'BITSAT registration 2027', 'BITSAT eligibility', 'BITSAT exam pattern', 'BITSAT syllabus', 'BITSAT application fee', 'BITSAT cut off', 'BITSAT 2026 cut off', 'BITS Pilani admission 2027', 'BITS Goa', 'BITS Hyderabad', 'BITSAT iteration', 'BITS Pilani fees'],
      intro: 'BITSAT 2027 is BITS Pilani\'s online test for B.E., M.Sc. and B.Pharm. admission at its Pilani, K K Birla Goa and Hyderabad campuses. BITS says the 2027-28 admission cycle opens in December 2026 (tentatively), and the test is Expected in April and May 2027. In 2026 the sessions were held on 15–16 April and 25–27 May. This guide covers eligibility, pattern, fees and cut-offs from official BITS sources.',
      ogImage: '/uploads/exams/bitsat/bitsat-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'BITSAT is used only for integrated first-degree admission (B.E., M.Sc. and B.Pharm.) at BITS Pilani\'s Pilani, K K Birla Goa and Hyderabad campuses. BITS Pilani, Dubai Campus does not require BITSAT.',
        linkText: 'See BITS first-degree admissions',
        href: 'https://admissions.bits-pilani.ac.in/FD/FD.html'
      },
      faqs: [
        {
          question: 'When is BITSAT 2027?',
          answer: 'BITS has not announced BITSAT 2027 dates. Its admissions site says the 2027-28 first-degree admission cycle will open in December 2026 (tentatively). In 2026 Session 1 was held on 15–16 April and Session 2 on 25–27 May, so the 2027 sessions are Expected in April and May 2027.'
        },
        {
          question: 'What is the eligibility for BITSAT?',
          answer: 'Class 12 with at least 75% aggregate in Physics, Chemistry and Mathematics and at least 60% in each subject, with five subjects in total. PCB is accepted for B.Pharm., B.E. Environmental & Sustainability Engineering and M.Sc. Biological Sciences. The FAQ says 74.90% is not rounded up.'
        },
        {
          question: 'What is the BITSAT application fee?',
          answer: 'For 2026 at Indian and Nepal centres, one session cost ₹3,600 for male and ₹3,100 for female or transgender candidates, and both sessions cost ₹5,600 or ₹4,600. The Dubai centre cost ₹7,250, or ₹9,250 for both sessions. The fee is non-refundable.'
        },
        {
          question: 'What is the BITSAT exam pattern?',
          answer: 'A 3-hour computer-based test with 130 MCQs worth 390 marks: Physics 30, Chemistry 30, English Proficiency 10, Logical Reasoning 20, and Mathematics or Biology 40. Each correct answer earns 3 marks and each wrong answer costs 1. Candidates who answer all 130 can attempt 12 extra questions.'
        },
        {
          question: 'Can I take BITSAT twice?',
          answer: 'Yes. In 2026 candidates could appear in Session 1 and Session 2, and the higher of the two scores was used for admission. Choosing both sessions when first applying was cheaper than adding Session 2 later.'
        },
        {
          question: 'Does BITS Pilani accept JEE Main scores?',
          answer: 'No. The BITSAT FAQ says BITS Pilani does not consider JEE Main scores. Admission is based on BITSAT score, apart from direct admission for state and central board toppers and SAT-based admission for international students.'
        },
        {
          question: 'Is there reservation or a management quota at BITS Pilani?',
          answer: 'No. According to the official FAQ, BITS Pilani has no reservation of any kind and no management quota. It also does not offer lateral-entry admission.'
        },
        {
          question: 'What were the BITSAT 2026 cut-offs?',
          answer: 'Final cut-offs for the 2026-27 session, out of 390, for B.E. Computer Science were 308 at Pilani, 274 at Goa and 272 at Hyderabad. B.E. Mathematics and Computing closed at 299, 270 and 268, and B.Pharm. at 200 at Pilani and Hyderabad.'
        },
        {
          question: 'What are BITS Pilani first-degree fees?',
          answer: 'For students admitted in 2026-27, semester tuition was ₹2,91,500 at all three campuses, plus a one-time ₹64,100 admission fee and ₹36,000 hostel fee per semester. Tuition rises each year. The top 500 BITSAT rankers with family income up to ₹20 lakh get full tuition.'
        },
        {
          question: 'Which programmes can I join through BITSAT?',
          answer: 'B.E. branches, B.Pharm. and four-year integrated M.Sc. programmes at Pilani, K K Birla Goa and Hyderabad. For 2026 Pilani offered 11 B.E. branches, Goa 9 and Hyderabad 10. M.Sc. students can compete for a B.E. dual degree after the first year.'
        }
      ],
      autoLinkExcludeHrefs: ['/courses/mba'],
    },
    'cusat-cat': {
      // CUSAT CAT 2027 content package (docs/exam-content/cusat-cat-2027.md in the backend repo).
      // Official sources only: admissions.cusat.ac.in (CAT 2026 Prospectus, Fee Structure 2026-27, notices) and cusat.ac.in,
      // checked on 12 Oct 2026. CAT 2027 not announced; 2027 dates are Expected.
      intent: 'general',
      h1: 'CUSAT CAT 2027: Dates, Eligibility, Pattern, Fees, Seats',
      title: 'CUSAT CAT 2027: Dates, Eligibility, Pattern, Fees, Seats',
      description: 'CUSAT CAT 2027 registration is Expected from late January 2027. See the Test 101 pattern, 50% PCM rule, ₹1,500 fee, seat types and B.Tech seats by campus.',
      keywords: ['CUSAT CAT 2027', 'CUSAT CAT exam date 2027', 'CUSAT CAT registration 2027', 'CUSAT CAT eligibility', 'CUSAT CAT exam pattern', 'CUSAT CAT syllabus', 'CUSAT CAT application fee', 'CUSAT B.Tech admission 2027', 'CUSAT School of Engineering', 'CUCEK Kuttanad', 'CUSAT CAT rank list', 'CUSAT fee structure'],
      intro: 'CUSAT CAT 2027 is Cochin University of Science and Technology\'s computer-based test for its own B.Tech, integrated M.Sc., five-year law and most PG programmes. CUSAT has not announced the 2027 dates; registration is Expected from late January 2027 and the test in May 2027. In 2026 registration ran from 27 January to 5 March and the test was held on 9–11 May. This guide uses only official CUSAT sources.',
      ogImage: '/uploads/exams/cusat-cat/cusat-cat-2027-og.webp',
      absoluteTitle: true,
      autoLinkExcludeHrefs: ['/exams/cat', '/courses/mba', '/courses/anm'],
      collegesNote: {
        text: 'CUSAT CAT is used only for Cochin University of Science and Technology\'s own programmes: the School of Engineering (Thrikkakara), CUCEK (Kuttanad) and the university departments in Kochi. Other Kerala engineering colleges admit through KEAM.',
        linkText: 'See CUSAT admissions',
        href: 'https://admissions.cusat.ac.in/'
      },
      faqs: [
        {
          question: 'When is CUSAT CAT 2027?',
          answer: 'CUSAT has not announced CAT 2027. In 2026 registration ran from 27 January to 5 March and the computer-based test was held on 9–11 May, with the B.Tech paper (Test 101) on 10–11 May. Registration for 2027 is Expected from late January 2027 and the test in May 2027.'
        },
        {
          question: 'What is the eligibility for CUSAT B.Tech through CAT?',
          answer: 'A Class 12 pass with at least 50% in Mathematics and 50% in Physics, Chemistry and Mathematics combined. Kerala SC/ST candidates need only a pass, and Kerala SEBC non-creamy layer candidates get 5% relaxation. You also need a minimum normalised score of 10 in PCM in Test 101, from which SC/ST candidates are exempt.'
        },
        {
          question: 'What is the CUSAT CAT application fee?',
          answer: 'For 2026 it was ₹1,500 for up to two test codes, or ₹700 for Kerala SC/ST candidates, plus ₹500 (₹250) for each extra test code. NRI seat applicants paid ₹6,500, Children of Gulf Workers ₹6,500 and international candidates US$110. The fee is non-refundable.'
        },
        {
          question: 'What is the CUSAT CAT exam pattern for B.Tech?',
          answer: 'Test Code 101 has 225 multiple-choice questions in 3 hours: 90 in Mathematics, 75 in Physics and 60 in Chemistry. Each correct answer earns 4 marks and each wrong answer costs 1. Ties are broken by Mathematics marks, then Physics, then Chemistry.'
        },
        {
          question: 'Is CUSAT CAT a state-level or national-level exam?',
          answer: 'It is a state-level test run by CUSAT, a Kerala state university, for its own seats. Candidates from all over India can apply. CUSAT holds the test in other cities as well as Kerala, and 45% of seats are All India Merit seats.'
        },
        {
          question: 'Does CUSAT CAT admit to KEAM colleges?',
          answer: 'No. CUSAT CAT fills only CUSAT\'s own seats at the School of Engineering in Thrikkakara, CUCEK in Kuttanad and the university departments. Other government, aided and self-financing engineering colleges in Kerala admit through KEAM.'
        },
        {
          question: 'How many B.Tech seats does CUSAT have?',
          answer: 'In 2026 the School of Engineering, Thrikkakara offered Civil 90, CSE 143, EEE 60, ECE 90, IT 90, Mechanical 90, Safety & Fire 90 and AI & Data Science 60 seats. CUCEK Kuttanad offered Civil 60, CSE 120, EEE 60, ECE 60 and IT 60. Naval Architecture, Polymer Science and Instrumentation are also offered.'
        },
        {
          question: 'How are CUSAT seats divided?',
          answer: 'CUSAT splits seats into State Merit (50%, for Keralites only, at the lowest fee), All India Merit (45%, open to all Indian candidates) and NRI (5%). Supernumerary seats for groups such as EWS, differently abled and Lakshadweep candidates are added on top.'
        },
        {
          question: 'What is the CUSAT B.Tech fee?',
          answer: 'Under the Fee Structure 2026-27, the first-semester amount payable at admission was ₹48,842 for State Merit, ₹75,042 for All India Merit and ₹93,842 for NRI seats. Each figure includes ₹20,042 of common fees. Hostel charges are extra.'
        },
        {
          question: 'Is CUSAT CAT needed for MBA, M.Tech or B.Tech Marine Engineering?',
          answer: 'No, though you still apply through the CUSAT admissions portal. MBA admission uses a KMAT, CMAT or CAT (IIM) score. M.Tech gives preference to GATE scores and otherwise uses a Departmental Admission Test. B.Tech Marine Engineering admits on the Indian Maritime University CET rank.'
        }
      ],
    },
    'ggsipu-cet': {
      // GGSIPU CET 2027 content package (docs/exam-content/ggsipu-cet-2027.md in the backend repo).
      // Official sources only: ipu.ac.in (UG/PG Admission Brochures 2026-27, CET 2026 notices and results) and ipu.admissions.nic.in,
      // checked on 12 Oct 2026. CET 2027 not announced; 2027 dates are Expected.
      intent: 'general',
      h1: 'GGSIPU CET 2027: Dates, Eligibility, Pattern, Fees, Seats',
      title: 'GGSIPU CET 2027: Dates, Eligibility, Pattern, Fees, Seats',
      description: 'GGSIPU CET 2027 registration Expected Feb–Mar 2027. See which IPU courses use CET, the 100-question pattern, ₹2,500 fee, 85% Delhi quota and counselling.',
      keywords: ['GGSIPU CET 2027', 'IPU CET 2027', 'IPU CET exam date 2027', 'IPU CET registration 2027', 'GGSIPU CET eligibility', 'IPU CET exam pattern', 'IPU CET application fee', 'IPU CET BBA', 'IPU CET BCA', 'IPU counselling 2027', 'GGSIPU admission 2027', 'IPU CET result'],
      intro: 'GGSIPU CET 2027 (IPU CET) is Guru Gobind Singh Indraprastha University\'s entrance test for programmes such as BBA, BCA, B.Com (Hons), BA (JMC), B.Ed. and lateral entry B.Tech at its University Schools and affiliated Delhi-NCR colleges. CET 2027 is not yet announced; registration is Expected in February–March 2027 and the test in late April–May 2027. In 2026 the CET ran from 25 April to 17 May. Regular B.Tech admits through JEE Main, not the CET.',
      ogImage: '/uploads/exams/ggsipu-cet/ggsipu-cet-2027-og.webp',
      absoluteTitle: true,
      autoLinkExcludeHrefs: ['/courses/special', '/courses/architecture-diploma', '/courses/media-ug'],
      collegesNote: {
        text: 'GGSIPU CET is used only for GGSIPU\'s University Schools and its affiliated colleges, and only for programmes whose admission route includes the CET. Regular B.Tech (JEE Main), B.Arch (NATA), MBBS (NEET) and BA/BBA LL.B (CLAT) do not use the CET.',
        linkText: 'See GGSIPU admissions 2026-27',
        href: 'https://ipu.ac.in/adm2026/adm2026main.php'
      },
      faqs: [
        {
          question: 'When is GGSIPU CET 2027?',
          answer: 'GGSIPU has not announced CET 2027. In 2026 registration ran from 2 February to 31 March and the CET was held between 25 April and 17 May, with the first results on 4 May. Registration for 2027 is Expected in February–March 2027 and the test in late April–May 2027.'
        },
        {
          question: 'What is the GGSIPU CET application fee?',
          answer: 'For 2026 the fee was ₹2,500 per application plus taxes and service charges, and it is non-refundable. Challenging an answer key costs ₹200 per question within three days. There is no fee to take part in counselling.'
        },
        {
          question: 'What is the GGSIPU CET exam pattern?',
          answer: 'Every CET code has 100 objective multiple-choice questions in 150 minutes, for 400 marks. Each correct answer earns 4 marks and each wrong answer costs 1. The 2026 test was offline on OMR sheets, in English, with B.Ed. also in Hindi. The sections differ by programme.'
        },
        {
          question: 'Is B.Tech at IPU through the CET?',
          answer: 'No. For regular B.Tech (code 131), the 2026-27 brochure lists JEE Main Paper I first and CUET second. The CET is used for lateral entry to B.Tech (codes 128 and 129) and for B.Tech Biotechnology at the University School of Biotechnology (code 130).'
        },
        {
          question: 'Which programmes admit through GGSIPU CET?',
          answer: 'The CET is the first route for BBA, BCA, B.Com (Hons), BA JMC, BHMCT, BMS, B.Ed., B.Pharm, B.Sc. Yoga, paramedical courses, three-year LL.B. and several PG courses. MBA uses CAT and CMAT before the CET, MCA uses NIMCET first and M.Tech uses GATE first.'
        },
        {
          question: 'What is the eligibility for IPU CET BBA and BCA?',
          answer: 'Both need Class 12 with at least 50% aggregate and a pass in English. BCA also requires Mathematics, Computer Science or another listed subject. GGSIPU does not round off percentages, so 49.9% does not count as 50%. You must not be older than 21 on 1 August of the admission year.'
        },
        {
          question: 'Is GGSIPU CET a state-level exam?',
          answer: 'Yes. GGSIPU is a state university established by the Government of NCT of Delhi. 85% of sanctioned seats are reserved for Delhi Region candidates and 15% for candidates who passed their qualifying exam outside Delhi.'
        },
        {
          question: 'How does IPU counselling work?',
          answer: 'Most codes have centralised online counselling on ipu.admissions.nic.in. In 2026 Round 1 choice filling ran from 2 to 9 June, Round 2 allotment was on 29 June and the Round 3 sliding allotment on 9 July. Candidates reported to their institutes from 14 to 17 July, and spot rounds followed.'
        },
        {
          question: 'Does GGSIPU use CUET scores?',
          answer: 'Yes, but mostly as a second step. For many CET programmes the university first fills seats from its CET merit list and then admits through CUET merit if seats are still vacant. CUET-qualified candidates register separately when GGSIPU announces it.'
        },
        {
          question: 'Is there a management quota in IPU colleges?',
          answer: 'Self-financing affiliated colleges, except minority institutions, include 10% management quota seats in their intake. You must still have qualified in the GGSIPU CET or the relevant national test. University Schools, government institutes and minority institutions have no management quota.'
        }
      ],
    },
    'ip-university-cet': {
      // IPU CET BBA 2027 content package (docs/exam-content/ip-university-cet-2027.md in the backend repo).
      // BBA-focused (CET code 125) to avoid duplicating the general ggsipu-cet page. Official sources only: ipu.ac.in
      // (Bachelor's Admission Brochure 2026-27 ch. 0-5, 11, 13, 14; admission notices), checked on 13 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'IPU CET BBA 2027: Pattern, Eligibility, Dates & Colleges',
      title: 'IPU CET BBA 2027: Pattern, Eligibility, Dates & Colleges',
      description: 'IPU CET BBA 2027 guide: code 125 pattern (4 sections, +4/−1), 50% eligibility, Expected dates, ₹2,500 fee, top BBA intakes and counselling steps.',
      keywords: ['IPU CET BBA 2027', 'IPU BBA admission 2027', 'GGSIPU BBA CET', 'IPU CET code 125', 'IPU BBA eligibility', 'IPU CET BBA exam pattern', 'IPU BBA colleges', 'IPU BBA counselling', 'IPU BBA through CUET', 'IPU BBA fees'],
      intro: 'IPU CET BBA 2027 is the GGSIPU entrance test (CET code 125) for BBA and the 5-year BBA-MBA at University Schools and affiliated Delhi-NCR colleges. For 2026-27 seats were filled from CET merit first and CUET UG only for vacant seats. CET 2027 is not yet announced; registration is Expected in February–March 2027.',
      ogImage: '/uploads/exams/ip-university-cet/ipu-cet-bba-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'IPU CET BBA (code 125) admits only to GGSIPU University Schools and GGSIPU-affiliated colleges. Seat intakes change every year; check chapter 13 of the current GGSIPU admission brochure.',
        linkText: 'See GGSIPU admissions 2026-27',
        href: 'https://ipu.ac.in/adm2026/adm2026main.php'
      },
      faqs: [
        { question: 'Is IPU CET BBA 2027 announced?', answer: 'No. As of 13 October 2026 GGSIPU has not released the 2027-28 brochure or dates. In 2026 registration ran from 2 February to 31 March and the CET window was 25 April to 17 May. 2027 registration is Expected in February–March 2027.' },
        { question: 'Is IPU BBA admission through CET or CUET?', answer: 'For 2026-27 the brochure lists CET first and CUET second for code 125. Seats are filled from CET merit, and CUET UG merit is used only for seats left vacant after the CET list is exhausted.' },
        { question: 'What is the IPU CET BBA exam pattern?', answer: '100 objective questions in 150 minutes for 400 marks, with +4 for a correct answer and −1 for a wrong one. English, General Awareness, Logical & Analytical Ability and Management Aptitude & Communication carry 25% each. The 2026 test was offline on OMR sheets.' },
        { question: 'What is the eligibility for IPU BBA?', answer: 'A pass in Class 12 (CBSE or equivalent) with at least 50% aggregate and a pass in English. Percentages are not rounded off, and you must not be older than 21 on 1 August of the admission year. Maths is not required.' },
        { question: 'What is the IPU CET application fee?', answer: 'In 2026 it was ₹2,500 per CET code plus taxes and service charges, non-refundable. There is no fee to take part in counselling.' },
        { question: 'How many BBA seats are there in IPU colleges?', answer: 'GGSIPU does not publish one total. Chapter 13 of the 2026-27 brochure lists BBA intake college by college for the 2025-26 session; large colleges such as Maharaja Agrasen Institute of Management Studies list 240 seats plus 180 in the second shift.' },
        { question: 'What is the BBA fee at an IPU University School?', answer: 'Chapter 14 of the 2026-27 brochure lists a first-year total of ₹1,56,500 for four-year UG programmes such as BBA at University Schools, including tuition of ₹1,21,000. Affiliated college fees are set by the State Fee Regulatory Committee.' }
      ],
    },
    'ap-eapcet': {
      // AP EAPCET 2027 content package (backups/exam_apeapcet_20261029 on the dev Mac). Facts from official sources only: AP EAPCET 2026
      // instruction booklets, syllabus and normalisation procedure (cets.apsche.ap.gov.in), APSCHE local/non-local G.O. and APSCHE
      // last-rank statements 2023-2024 (apsche.ap.gov.in). Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'AP EAPCET 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'AP EAPCET 2027: Exam Date, Pattern, Eligibility & Cutoff',
      description: 'AP EAPCET 2027 exam date (Expected May), 160-question pattern with no negative marking, eligibility, fees, 75:25 rank rule and official 2023–2024 cutoffs.',
      keywords: ['AP EAPCET 2027', 'AP EAPCET exam date', 'AP EAPCET syllabus', 'AP EAPCET exam pattern', 'AP EAPCET eligibility', 'AP EAPCET application fee', 'AP EAPCET cutoff', 'AP EAPCET counselling', 'AP EAPCET rank', 'AP EAMCET 2027'],
      intro: 'AP EAPCET 2027 is not announced yet. JNTU Kakinada is expected to open applications in February 2027 and hold the exam in May 2027. This guide covers eligibility and local status, the 160-question pattern, how your rank is worked out, fees, counselling and official APSCHE closing ranks for 2023 and 2024.',
      ogImage: '/uploads/exams/ap-eapcet/ap-eapcet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Andhra Pradesh colleges have published profiles on CollegeDecision.in and fill convener-quota B.Tech seats through AP EAPCET counselling. For branch-wise and category-wise closing ranks from the official APSCHE last-rank statements,',
        linkText: 'see the AP EAPCET cutoff page',
        href: '/exams/ap-eapcet/cutoff'
      },
      faqs: [
        { question: 'When is AP EAPCET 2027?', answer: 'JNTU Kakinada has not announced AP EAPCET 2027 yet. It is Expected in May 2027. In 2026 the engineering exam ran on 12–15 and 18 May, and the agriculture and pharmacy exam on 19–20 May.' },
        { question: 'When will the AP EAPCET 2027 application form come out?', answer: 'Expected in February 2027. For 2026 the notification and online application opened on 4 February and the last date without a late fee was 24 March 2026.' },
        { question: 'What is the AP EAPCET exam pattern for engineering?', answer: 'One online paper of 160 multiple-choice questions: Mathematics 80, Physics 40 and Chemistry 40. Each question carries one mark and the test lasts three hours.' },
        { question: 'Is there negative marking in AP EAPCET?', answer: 'No. Wrong answers do not cost you marks, so it makes sense to attempt every question.' },
        { question: 'What is the eligibility for AP EAPCET engineering?', answer: 'Intermediate (10+2) with Mathematics, Physics and Chemistry, or an engineering diploma from the AP State Board of Technical Education, with at least 45% in the group subjects (40% for reserved categories). You must also meet the local or non-local status rules of Andhra Pradesh.' },
        { question: 'How is the AP EAPCET rank calculated?', answer: '75% weight goes to your normalised EAPCET marks and 25% to your Intermediate group-subject marks. Ties are broken by total EAPCET marks, then Mathematics, then Physics, and finally age (the older candidate ranks higher).' },
        { question: 'What is the qualifying mark in AP EAPCET?', answer: '25% of the maximum marks considered for ranking. SC and ST candidates have no minimum qualifying mark.' },
        { question: 'What is the AP EAPCET application fee?', answer: 'In 2026 the fee was ₹800 for OC, ₹750 for BC and ₹700 for SC/ST candidates, with late fees from ₹1,000 to ₹10,000 for later windows.' },
        { question: 'What AP EAPCET rank is needed for JNTUK Kakinada CSE?', answer: 'In the official 2024 last-rank statement, the OC seat in Computer Science and Engineering at JNTUK College of Engineering Kakinada closed at rank 2,039, against 2,567 in 2023. Other categories close at different ranks; see our AP EAPCET cutoff page.' },
        { question: 'Who handles AP EAPCET counselling?', answer: 'The Commissioner of Technical Education, Andhra Pradesh, is the Convener for engineering admissions. Web counselling runs on eapcet-sche.aptonline.in after the results.' }
      ],
    },
    'kcet': {
      // KCET 2027 content package (backups/exam_kcet_20261029 on the dev Mac). Facts from KEA only: UGCET-2026 Information Bulletin,
      // CET-2026 exam schedule, UGCET-2026 Diksuchi, 2026-27 provisional fee notice (1 Jul 2026) and engineering cut-off lists
      // 2023-2026 (cetonline.karnataka.gov.in). Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'KCET 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'KCET 2027: Exam Date, Pattern, Eligibility & Cutoff',
      description: 'KCET 2027 exam date (Expected April), 60-mark PCM papers with no negative marking, 45% eligibility, 50:50 rank rule, fees and 2023–2026 KEA cutoffs.',
      keywords: ['KCET 2027', 'KCET 2027 exam date', 'KCET syllabus', 'KCET exam pattern', 'KCET eligibility', 'KCET cutoff', 'KCET rank calculation', 'KCET fees', 'KEA counselling', 'UGCET 2027', 'Karnataka CET 2027'],
      intro: 'KCET 2027 (UGCET) is not announced yet. KEA is expected to open the application in mid-January 2027 and hold the exam in April 2027. This guide covers eligibility, the four-paper pattern, how your engineering rank is worked out, reservation codes, 2026-27 fees and official KEA cut-offs for 2023 to 2026.',
      ogImage: '/uploads/exams/kcet/kcet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Karnataka engineering colleges have published profiles on CollegeDecision.in and fill government-quota B.E./B.Tech seats through KCET and KEA counselling. For branch-wise and category-wise closing ranks from the official KEA lists,',
        linkText: 'see the KCET cutoff page',
        href: '/exams/kcet/cutoff'
      },
      faqs: [
        { question: 'When is the KCET 2027 exam?', answer: 'KEA has not announced KCET 2027 yet. It is expected in April 2027. In 2026 Physics and Chemistry were held on 23 April and Mathematics and Biology on 24 April, with the Kannada language test on 22 April.' },
        { question: 'When will the KCET 2027 application form be released?', answer: 'Expected in mid-January 2027. In 2026 the bulletin and online application opened on 17 January, the last date to apply was 16 February and the fee had to be paid by 18 February.' },
        { question: 'What is the KCET exam pattern?', answer: 'Four separate papers, Physics, Chemistry, Mathematics and Biology, each with 60 multiple-choice questions for 60 marks in 80 minutes. Engineering candidates need Physics, Chemistry and Mathematics.' },
        { question: 'Is there negative marking in KCET?', answer: 'No. Each correct answer earns one mark and wrong answers lose nothing. If you shade more than one option for a question, that question scores zero.' },
        { question: 'What is the KCET syllabus?', answer: 'KCET follows the 1st and 2nd PUC syllabus of Karnataka\'s Department of Pre-University Education. KEA publishes subject-wise syllabus PDFs for Physics, Chemistry, Mathematics and Biology on its website.' },
        { question: 'What is the eligibility for B.E./B.Tech through KCET?', answer: 'A pass in 2nd PUC/Class 12 with English, and at least 45% in Physics and Mathematics plus one of Chemistry, Bio-Technology, Biology, Electronics or Computer (40% for SC, ST, Category-1, 2A, 2B, 3A and 3B). No minimum CET score is set. For government seats you also need an eligibility clause, usually seven years of study in Karnataka.' },
        { question: 'How is the KCET engineering rank calculated?', answer: 'KEA uses your CET marks and your qualifying exam marks in Physics, Chemistry and Mathematics in equal proportion. Ties are broken by the higher CET Mathematics score, then Physics.' },
        { question: 'What do GM, 2AG, 2AR and 2AK mean in KCET cutoffs?', answer: 'GM is General Merit. The rest pair a category (1, 2A, 2B, 3A, 3B, SC, ST) with a seat pool: G for general, R for the 15% rural quota and K for the 5% Kannada medium quota.' },
        { question: 'What KCET rank is needed for RV College of Engineering CSE?', answer: 'In the last round of 2026, the GM seat in Computer Science and Engineering at RV College of Engineering closed at rank 425, against 499 in 2025. Other categories close at different ranks; see our KCET cutoff page.' },
        { question: 'What is the fee for a KCET government-quota engineering seat?', answer: 'KEA\'s provisional 2026-27 fee for GM-category students was ₹47,100 a year in government colleges, ₹56,500 at UVCE, ₹1,20,320 in Type-1 unaided colleges and ₹1,30,320 in Type-2 unaided colleges. SC/ST students with family income up to ₹10 lakh pay nothing.' }
      ],
    },
    'wbjee': {
      // WBJEE 2027 content package (backups/exam_wbjee_20261029 on the dev Mac). Facts from WBJEEB only: WBJEE-2026 Information Bulletin,
      // tentative schedule (13 Mar 2026), result notice, counselling notifications, DCAP notices and official OR-CR reports 2023-2026
      // (admissions.nic.in/wbjeeb). Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'WBJEE 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'WBJEE 2027: Exam Date, Pattern, Eligibility & Cutoff',
      description: 'WBJEE 2027 exam date (Expected April–May), 200-mark OMR pattern with negative marking, eligibility, fees, counselling and 2023–2026 closing ranks.',
      keywords: ['WBJEE 2027', 'WBJEE 2027 exam date', 'WBJEE syllabus', 'WBJEE exam pattern', 'WBJEE eligibility', 'WBJEE application fee', 'WBJEE cutoff', 'WBJEE counselling', 'WBJEE closing rank', 'WBJEEB', 'West Bengal JEE 2027'],
      intro: 'WBJEE 2027 is not announced yet. WBJEEB usually holds the exam between April and May, preferably on a Sunday; in 2026 it was on 24 May. This guide covers eligibility and domicile rules, the two-paper pattern and marking, fees, counselling and official WBJEEB closing ranks for 2023 to 2026.',
      ogImage: '/uploads/exams/wbjee/wbjee-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These West Bengal colleges have published profiles on CollegeDecision.in and fill B.E./B.Tech seats through WBJEE and WBJEEB counselling. For branch-wise and category-wise closing ranks from the official WBJEEB OR-CR reports,',
        linkText: 'see the WBJEE cutoff page',
        href: '/exams/wbjee/cutoff'
      },
      faqs: [
        { question: 'When is the WBJEE 2027 exam?', answer: 'WBJEEB has not announced WBJEE 2027 yet. The bulletin says the exam is usually held between April and May, preferably on a Sunday, so it is Expected in April–May 2027. In 2026 it was held on Sunday 24 May.' },
        { question: 'When will the WBJEE 2027 application form be released?', answer: 'Expected in March–April 2027. In 2026 online registration ran from 10 March to 8 April on the WBJEEB website.' },
        { question: 'What is the WBJEE exam pattern?', answer: 'Two offline OMR papers on the same day. Paper I is Mathematics (75 questions, 100 marks) and Paper II is Physics and Chemistry (40 questions each, 100 marks). Each paper lasts two hours.' },
        { question: 'Is there negative marking in WBJEE?', answer: 'Yes, in two of the three question types. Category-1 questions lose a quarter mark and Category-2 questions lose half a mark for a wrong answer. Category-3 questions, which can have more than one correct option, have no negative marking and give partial credit.' },
        { question: 'What is the eligibility for B.Tech through WBJEE?', answer: 'Class 12 with Physics, Mathematics and one AICTE-listed subject, at least 45% in those three (40% for SC, ST, OBC-A, OBC-B and PwD), at least 30% in English, and a minimum age of 17 on 31 December of the exam year.' },
        { question: 'Can students from outside West Bengal take WBJEE?', answer: 'Yes, but only for All India seats, mostly in private colleges and universities. Government and government-aided college seats, reserved seats and Tuition Fee Waiver seats are only for West Bengal domicile candidates.' },
        { question: 'What is the WBJEE application fee?', answer: 'For WBJEE 2026 it was ₹500 for General male, ₹400 for General female and ₹300 for third gender candidates. SC, ST, OBC-A, OBC-B, EWS, PwD and TFW candidates paid ₹400, ₹300 or ₹200. The fee is not refundable.' },
        { question: 'When was the WBJEE 2026 result declared?', answer: 'WBJEEB published the WBJEE 2026 result and rank cards on 18 June 2026. Counselling Round 1 registration then ran from 30 June to 5 July, with allotments on 7, 21 and 28 July.' },
        { question: 'What WBJEE rank is needed for Jadavpur University CSE?', answer: 'In the final 2026 round, the Home State Open seat in Computer Science and Engineering at Jadavpur University closed at rank 161, against 238 in 2025 and 309 in 2024. Other categories close at different ranks; see our WBJEE cutoff page.' },
        { question: 'What is a TFW seat in WBJEE counselling?', answer: 'A Tuition Fee Waiver seat waives tuition fees for West Bengal domicile students whose family income is below ₹2.5 lakh a year. Other fees still apply, and TFW seats appear as separate choices during choice filling.' }
      ],
    },
    'comedk-uget': {
      // COMEDK UGET 2027 content package (backups/exam_comedk_20261029 on the dev Mac). Facts from comedk.org only: UGET 2026
      // Information Brochure, counselling notification (29.05.2026), Counselling Process Document 2026, 2026 seat/fee matrix and
      // official cut-off rank PDFs 2023-2026. Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'COMEDK UGET 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'COMEDK UGET 2027: Exam Date, Pattern, Eligibility & Cutoff',
      description: 'COMEDK UGET 2027 exam date (Expected May), 180-question CBT with no negative marking, eligibility, fees, counselling and 2023–2026 closing ranks.',
      keywords: ['COMEDK UGET 2027', 'COMEDK 2027 exam date', 'COMEDK syllabus', 'COMEDK exam pattern', 'COMEDK eligibility', 'COMEDK application fee', 'COMEDK cutoff', 'COMEDK counselling', 'COMEDK closing rank', 'COMEDK vs KCET', 'KKR quota'],
      intro: 'COMEDK UGET 2027 is not announced yet. COMEDK usually holds the test in May; in 2026 it was on Saturday, 9 May. This guide covers eligibility, the 180-question pattern, syllabus, fees, counselling rounds, the KKR quota and official COMEDK closing ranks for 2023 to 2026.',
      ogImage: '/uploads/exams/comedk-uget/comedk-uget-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Karnataka colleges have published profiles on CollegeDecision.in and fill B.E./B.Tech seats through COMEDK counselling. For branch-wise GM and KKR closing ranks from the official COMEDK cut-off PDFs,',
        linkText: 'see the COMEDK cutoff page',
        href: '/exams/comedk-uget/cutoff'
      },
      faqs: [
        { question: 'When is COMEDK UGET 2027?', answer: 'COMEDK has not announced it yet. The exam is Expected in May 2027. It was held on Saturday, 9 May in 2026 and on Saturday, 10 May in 2025.' },
        { question: 'Is there negative marking in COMEDK UGET?', answer: 'No. Each correct answer gets one mark and wrong answers lose nothing, so you should attempt all 180 questions.' },
        { question: 'How many questions are there in COMEDK UGET?', answer: 'There are 180 multiple-choice questions: 60 each in Physics, Chemistry and Mathematics, for a total of 180 marks.' },
        { question: 'What is the COMEDK application fee?', answer: 'In 2026 it was ₹1,950 for COMEDK UGET alone, ₹1,600 for Uni-GAUGE alone and ₹3,200 for both, plus transaction charges.' },
        { question: 'Can students from outside Karnataka take COMEDK UGET?', answer: 'Yes. General Merit seats are open to candidates from all states on equal terms. Only KKR seats need a Kalyana Karnataka certificate and Karnataka domicile.' },
        { question: 'What marks do I need in Class 12 to be eligible?', answer: 'You need at least 45% in Physics, Mathematics and your optional subject, or 40% if you are a Karnataka SC, ST or OBC candidate, and you must pass each subject.' },
        { question: 'What is the KKR quota in COMEDK?', answer: 'It is the reservation for the Kalyana Karnataka Region under Article 371(J). In 2026 there were 3,739 KKR seats, and 70% of seats in colleges in that region go to local candidates.' },
        { question: 'How many counselling rounds does COMEDK hold?', answer: 'In 2026 there was a mock round and four rounds: Round 1 for GM and KKR, Round 2 for KKR only, and Rounds 3 and 4 for GM only.' },
        { question: 'What is the COMEDK counselling fee?', answer: 'The counselling registration fee was ₹2,000 in 2026 and it is non-refundable.' },
        { question: 'What rank is needed for RV College of Engineering CSE through COMEDK?', answer: 'The CSE GM seat at RVCE closed at rank 510 after Round 4 in 2026 and at 692 after all rounds in 2025. Treat these as a guide; cutoffs shift each year.' }
      ],
    },
    'keam': {
      // KEAM 2027 content package (backups/exam_keam_20261029 on the dev Mac). Facts from CEE Kerala only: KEAM 2026 Prospectus,
      // KEAM 2026 notifications (dates, scores, rank list, allotment phases) and engineering last-rank lists, phase 2,
      // 2025 and 2026 (cee.kerala.gov.in). Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: 'KEAM 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'KEAM 2027: Exam Date, Pattern, Syllabus & Cutoff',
      description: 'KEAM 2027 exam date (Expected April), 150-question CBT with +4/−1 marking, 600-point index mark, eligibility, fees, reservation and 2025–2026 CEE last ranks.',
      keywords: ['KEAM 2027', 'KEAM 2027 exam date', 'KEAM syllabus', 'KEAM exam pattern', 'KEAM eligibility', 'KEAM cutoff', 'KEAM last rank', 'KEAM index mark', 'KEAM application fee', 'KEAM allotment', 'CEE Kerala'],
      intro: 'KEAM 2027 is not announced yet. CEE Kerala is expected to open the application in January 2027 and hold the engineering CBT in April 2027. This guide covers eligibility, the 150-question pattern, the 600-point index mark, syllabus, reservation codes, allotment and official CEE last ranks for 2025 and 2026.',
      ogImage: '/uploads/exams/keam/keam-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Kerala engineering colleges have published profiles on CollegeDecision.in and fill B.Tech seats through KEAM and the CEE Kerala allotment. For branch-wise and category-wise last ranks from the official CEE lists,',
        linkText: 'see the KEAM cutoff page',
        href: '/exams/keam/cutoff'
      },
      faqs: [
        { question: "When is KEAM 2027?", answer: "CEE Kerala has not announced KEAM 2027. It is Expected in April 2027, with applications in January 2027. In 2026 applications ran from 5 January to 6 February and the engineering CBT was held from 17 to 22 April." },
        { question: "What is the KEAM exam pattern?", answer: "The engineering test is a computer-based test with 150 multiple-choice questions in 180 minutes: 75 Maths, 45 Physics and 30 Chemistry. Each correct answer earns 4 marks and each wrong one loses 1." },
        { question: "How is the KEAM rank calculated?", answer: "The engineering index mark is out of 600. Half comes from your normalised entrance score and half from normalised Class 12 marks in Maths, Physics and Chemistry in the ratio 5:3:2." },
        { question: "What is the minimum score to qualify KEAM?", answer: "You need a normalised score of at least 10 in the engineering test to enter the rank list. SC and ST candidates are exempt, but anyone who answers no question is disqualified." },
        { question: "What is the KEAM eligibility for B.Tech?", answer: "A pass in Class 12 with Physics and Maths and Chemistry (or Computer Science, Biotechnology or Biology), with at least 45% in those three subjects together, and a minimum age of 17 on 31 December of the admission year." },
        { question: "What is the KEAM application fee?", answer: "In 2026 it was ₹925 for engineering or B.Pharm (₹400 for SC, nil for ST) and ₹650 for architecture or medical streams only (₹260 for SC). A UAE centre added ₹16,000." },
        { question: "What KEAM rank is needed for CET Trivandrum CSE?", answer: "In phase 2 of 2026 the last State Merit rank allotted for Computer Science at College of Engineering Trivandrum was 584, against 482 in 2025. Reserved categories close at higher ranks." },
        { question: "What do SM, EZ, MU and EW mean in KEAM cutoffs?", answer: "They are allotment categories: SM is State Merit, EZ is Ezhava, MU is Muslim and EW is Economically Weaker Sections. BH, LA, DV, VK, KN, BX and KU are the other SEBC groups, and SC and ST are Scheduled Castes and Tribes." },
        { question: "Is KEAM needed for MBBS or B.Arch in Kerala?", answer: "You apply through KEAM, but MBBS, BDS and AYUSH seats use NEET-UG scores and B.Arch uses NATA scores. There is no separate KEAM paper for those courses." },
        { question: "Can students from other states apply for KEAM?", answer: "Yes, but with limits. NK I candidates (mainly children of central or Kerala government staff who studied in Kerala) compete for State Merit seats. NK II candidates, which covers most students from other states, cannot get government college seats; they can take private self-financing engineering seats, and government cost-sharing colleges only after phase 2 if seats remain. Communal reservation is only for Keralites." }
      ],
    },
    'mah-ar-cat': {
      // Content package: docs/exam-content/mah-ar-cat-2027.md (backend). Official sources only, checked 13 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: "Maharashtra B.Arch Admission 2027: Eligibility, CAP & Seats",
      title: "Maharashtra B.Arch Admission 2027: Eligibility, CAP & Seats",
      description: "Maharashtra B.Arch admission 2027: no MAH AR CAT, NATA or JEE B.Arch route, 45% eligibility, tie-break rules, seat shares and CAP steps explained.",
      keywords: ["Maharashtra B.Arch admission 2027", "MAH AR CAT", "MAH B.Arch CAP 2027", "Maharashtra B.Arch eligibility", "B.Arch CAP Maharashtra", "NATA Maharashtra admission", "JEE Main B.Arch Maharashtra", "B.Arch seat matrix Maharashtra"],
      intro: "Maharashtra B.Arch admission 2027 runs through the State CET Cell CAP, not a separate state architecture test. For 2026-27 you needed a NATA or JEE Main B.Arch score plus 10+2 with Physics and Mathematics and 45% aggregate. The 2027-28 CAP is Expected in mid-2027, after NATA and JEE Main results.",
      ogImage: '/uploads/exams/mah-ar-cat/mah-barch-2027-og.webp',
      absoluteTitle: true,
      faqs: [
        { question: "Is there a MAH AR CAT exam in 2027?", answer: "No separate Maharashtra architecture CET was held for 2026-27, and none had been announced for 2027 as of October 2026. B.Arch admission uses NATA or the JEE Main B.Arch paper through State CET Cell CAP." },
        { question: "What is the eligibility for B.Arch in Maharashtra?", answer: "10+2 with Physics and Mathematics plus one listed subject and at least 45% aggregate (40% for Maharashtra reserved, EWS and PwD candidates), or a 10+3 diploma with Mathematics, and a qualifying score in NATA or the JEE B.Arch paper." },
        { question: "Is Chemistry compulsory for B.Arch in Maharashtra?", answer: "No. Physics and Mathematics are compulsory, and the third subject can be Chemistry, Biology, a Technical Vocational subject, Computer Science, IT, Informatics Practices, Engineering Graphics or Business Studies." },
        { question: "How are ties broken in the Maharashtra B.Arch merit list?", answer: "By higher NATA marks first, then higher percentage in SSC Mathematics, then higher SSC aggregate percentage." },
        { question: "What is the B.Arch CAP fee in Maharashtra?", answer: "For 2026-27 it was ₹1,300 for general and outside-Maharashtra candidates, ₹1,000 for Maharashtra reserved and PwD candidates, and USD 50 for NRI, OCI, PIO and foreign national candidates." },
        { question: "What was the last date for B.Arch admission in 2026?", answer: "After a Council of Architecture revision, the CET Cell fixed 30 September 2026 as the final cut-off date for B.Arch and M.Arch admissions in 2026-27, up from 15 September." }
      ],
    },
    'mah-mca-cet': {
      // Content package: docs/exam-content/mah-mca-cet-2027.md (backend). Official sources only, checked 13 Oct 2026. 2027 items are Expected.
      intent: 'general',
      h1: "MAH MCA CET 2027: Exam Date, Pattern, Syllabus & Eligibility",
      title: "MAH MCA CET 2027: Exam Date, Pattern, Syllabus & Eligibility",
      description: "MAH MCA CET 2027 guide: Expected dates, 100-question 200-mark pattern, full syllabus, 50% eligibility, ₹1,500 fee and how MCA CAP seats are shared.",
      keywords: ["MAH MCA CET 2027", "MAH MCA CET exam date", "MAH MCA CET pattern", "MAH MCA CET syllabus", "MAH MCA CET eligibility", "MCA CET Maharashtra", "MCA CAP Maharashtra", "MAH MCA CET fee"],
      intro: "MAH MCA CET 2027 is the State CET Cell, Maharashtra online entrance test for MCA admission through CAP: 100 questions, 200 marks, 90 minutes, no negative marking. MAH MCA CET 2027 is not yet announced; registration is Expected in January–February 2027 and the test in late March 2027. In 2026 the test was on 30 March.",
      ogImage: '/uploads/exams/mah-mca-cet/mah-mca-cet-2027-og.webp',
      absoluteTitle: true,
      faqs: [
        { question: "When is MAH MCA CET 2027?", answer: "The State CET Cell has not announced MAH MCA CET 2027. In 2026 registration ran from 7 January (extended to 23 February) and the test was held on 30 March 2026." },
        { question: "What is the MAH MCA CET exam pattern?", answer: "An online test of 100 multiple-choice questions for 200 marks in 90 minutes: Mathematics & Statistics 30, Logical/Abstract Reasoning 30, English 20 and Computer Concepts 20, at two marks each." },
        { question: "Is there negative marking in MAH MCA CET?", answer: "No. Unanswered questions score zero and wrong answers are not penalised." },
        { question: "Who is eligible for MAH MCA CET?", answer: "Indian nationals with any bachelor's degree, preferably with Mathematics at 10+2 or graduation, and at least 50% aggregate (45% for Maharashtra reserved, EWS and PwD candidates). Final-year students can apply." },
        { question: "What is the MAH MCA CET application fee?", answer: "In 2026 it was ₹1,500 for open category, outside-Maharashtra and J&K migrant candidates, and ₹1,300 for Maharashtra reserved categories, PwD, orphan and transgender candidates." },
        { question: "Can I take MAH MCA CET without Maths in graduation?", answer: "Yes. The brochure says Mathematics is preferred at 10+2 or graduation level, not mandatory. The Mathematics & Statistics section carries 60 of the 200 marks." }
      ],
    },
    'mh-cet': {
      // MHT CET 2027 content package (backups/exam_mhtcet_20261029 on the dev Mac). Facts from the State CET Cell only: MHT-CET 2026
      // Information Brochure, 2026 date/result notices, CET Cell circular of 19 Oct 2026 (2027 dates not announced), CAP Information
      // Brochure 2026-27 and official engineering CAP cut-off lists 2023-2026 (fe2026.mahacet.org). 2027 plan per Indian Express, 10 Oct 2026. Checked 29 Oct 2026.
      intent: 'general',
      h1: 'MHT CET 2027: Exam Date, Syllabus, Pattern, Eligibility & Cutoff',
      title: 'MHT CET 2027: Exam Date, Syllabus, Pattern & Cutoff',
      description: 'MHT CET 2027 exam date (expected March–May), two attempts, PCM/PCB pattern, syllabus, fees, eligibility, CAP seat types and 2023–2026 college cutoffs.',
      keywords: ['MHT CET 2027', 'MHT CET 2027 exam date', 'MHT CET syllabus', 'MHT CET exam pattern', 'MHT CET eligibility', 'MHT CET application fee', 'MHT CET cutoff', 'MHT CET CAP', 'MHT CET percentile', 'MHT CET two attempts', 'MH CET 2027'],
      intro: 'MHT CET 2027 dates are not announced yet. The State CET Cell is expected to open registration in January–February 2027 and hold both attempts after the Class 12 boards, between March and May 2027. This guide covers eligibility, pattern, syllabus, fees, CAP counselling, HU/OHU seat types and official CAP cut-offs for 2023 to 2026.',
      ogImage: '/uploads/exams/mh-cet/mht-cet-2027-og.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Maharashtra engineering colleges have published profiles on CollegeDecision.in and fill first-year B.E./B.Tech seats through MHT CET and CAP. For branch-wise closing percentiles and merit numbers from the official CAP lists,',
        linkText: 'see the MHT CET cutoff page',
        href: '/exams/mh-cet/cutoff'
      },
      faqs: [
        { question: 'When is the MHT CET 2027 exam?', answer: 'The State CET Cell has not announced MHT CET 2027 dates, and on 19 October 2026 it warned against dates on social media. Both attempts are expected after the Class 12 boards, likely between March and May 2027. In 2026 the first attempt ran from 11 to 26 April.' },
        { question: 'When will MHT CET 2027 registration start?', answer: 'Expected in January–February 2027. In 2026 the form was open from 10 January to 12 February on cetcell.mahacet.org. The CET Cell will confirm 2027 dates in its official notice and brochure.' },
        { question: 'Will MHT CET 2027 have two attempts?', answer: 'Two attempts were allowed in 2026, and the October 2026 reports say they continue. The December 2026 slot was dropped, and both attempts are now planned after the Class 12 boards, at least four weeks apart. If you take both, the better total percentile counts.' },
        { question: 'What is the MHT CET exam pattern?', answer: 'Each group is a 180-minute computer-based test. Paper II, Physics and Chemistry (50 questions each, 1 mark), comes first for 90 minutes. Then comes Paper I, Mathematics (50 questions, 2 marks each), for PCM or Paper III, Biology (100 questions, 1 mark each), for PCB. There is no negative marking.' },
        { question: 'What is the MHT CET syllabus?', answer: 'It is based on the SCERT Maharashtra syllabus. About 20% of the weightage is from Class 11 and 80% from Class 12. The whole Class 12 syllabus is covered, but only listed Class 11 chapters, such as Vectors, Laws of Motion, Structure of atom, Straight Line and Biomolecules.' },
        { question: 'What is the eligibility for B.E./B.Tech admission through MHT CET?', answer: 'You need Class 12 with Physics and Mathematics plus one listed subject, and at least 45% in those subjects (40% for Maharashtra reserved, EWS and PwD candidates). You must also appear in all subjects of PCM MHT CET and get a non-zero score. There is no age limit.' },
        { question: 'What is the MHT CET application fee?', answer: 'In 2026 it was ₹1,300 per group per attempt for general and outside-Maharashtra candidates, and ₹1,000 for Maharashtra reserved categories. Both attempts cost ₹2,600 or ₹2,000.' },
        { question: 'What do HU, OHU and State level mean in MHT CET CAP?', answer: 'In non-autonomous government and aided colleges (excluding minority institutes), 70% of seats are Home University (HU) seats for candidates from that university area, and 30% are OHU seats for other Maharashtra candidates. Autonomous institutes fill seats at state level. In cut-off codes such as GOPENH, LOBCO or GOPENS, the last letter shows the seat type.' },
        { question: 'What MHT CET percentile is needed for COEP or VJTI?', answer: 'In 2026 the open, state-level Computer Engineering seat closed at 99.99 percentile at VJTI and 99.97 at COEP Technological University. Other branches and reserved categories close lower. See our MHT CET cutoff page for every branch.' },
        { question: 'Is JEE Main needed for engineering admission in Maharashtra?', answer: 'Maharashtra State candidates can get most CAP seats on MHT CET alone. For All India candidates, who can be from any state, the JEE Main score is preferred over MHT CET.' }
      ],
    },
    tnea: {
      // TNEA 2027 content package (backups/exam_tnea_20261029 on the dev Mac). Facts from DoTE/tneaonline.org only: TNEA 2026
      // Information Brochure, 2026 tentative schedule, counselling procedure, Information about Colleges 2026 and general academic
      // provisional allotment lists 2023-2026 (static.tneaonline.org). Checked 29 Oct 2026. 2027 items are Expected.
      intent: 'counselling',
      h1: 'TNEA 2027: Cutoff Calculation, Rank List, Counselling & College Cutoffs',
      title: 'TNEA 2027: Cutoff, Rank List, Counselling & Dates',
      description: 'TNEA 2027 guide: cutoff out of 200 from Class 12 PCM, eligibility, Expected dates, 7.5% govt school quota, counselling rounds and 2023–2026 college cutoffs.',
      keywords: ['TNEA 2027', 'TNEA cutoff', 'TNEA cutoff calculation', 'TNEA rank list', 'TNEA counselling 2027', 'TNEA 2027 registration', 'TNEA 7.5 reservation', 'TNEA choice filling', 'tneaonline', 'Tamil Nadu engineering admission 2027'],
      intro: 'TNEA 2027 has not been notified yet. DoTE is expected to open registration on tneaonline.org in May 2027 (it opened on 3 May in 2026). There is no entrance exam: your rank comes from Class 12 Maths, Physics and Chemistry, reduced to 200. This guide covers eligibility, the cutoff formula, dates, the 7.5% quota, counselling and official college-wise cutoffs for 2023 to 2026.',
      ogImage: '/uploads/exams/tnea/tnea-2027-overview.webp',
      absoluteTitle: true,
      collegesNote: {
        text: 'These Tamil Nadu engineering colleges fill B.E./B.Tech seats through TNEA counselling run by DoTE. For branch-wise and community-wise cutoff marks taken from the official allotment lists,',
        linkText: 'see the TNEA cutoff page',
        href: '/exams/tnea/cutoff'
      },
      faqs: [
        { question: 'Is there an entrance exam for TNEA?', answer: 'No. TNEA ranks you on your Class 12 marks in Mathematics, Physics and Chemistry, reduced to 200 (Maths 100, Physics 50, Chemistry 50). You register online at tneaonline.org and take part in counselling.' },
        { question: 'How do I calculate my TNEA cutoff?', answer: 'Cutoff = Maths % + Physics % / 2 + Chemistry % / 2. For example, 96 in Maths, 90 in Physics and 88 in Chemistry gives 96 + 45 + 44 = 185 out of 200. Marks from other boards are first scaled to the Tamil Nadu State Board pattern.' },
        { question: 'When will TNEA 2027 registration start?', answer: 'DoTE has not announced it yet. It is expected in May 2027. In 2026 registration opened on 3 May and closed on 5 June, the rank list came out on 1 July and general counselling ran from 20 July to 30 August.' },
        { question: 'What is the minimum mark needed to apply for TNEA?', answer: 'An average of 45% in Maths, Physics and Chemistry for General (OC) candidates and 40% for BC, BCM, MBC&DNC, SC, SCA and ST candidates, as per the 2026 brochure. Improvement exam marks are not considered.' },
        { question: 'What is the TNEA registration fee?', answer: 'In 2026 it was ₹500 for OC, BC, BCM and MBC&DNC candidates and ₹250 for SC, SCA and ST candidates from Tamil Nadu, paid online.' },
        { question: 'What is the 7.5% reservation in TNEA?', answer: '7.5% of seats are set aside preferentially for students who studied Classes 6 to 12 in Tamil Nadu government schools. The government pays their tuition, hostel and development fees.' },
        { question: 'How are TNEA ties broken?', answer: 'By higher Maths marks, then Physics, then the fourth optional subject, then total Class 12 percentage, then date of birth (older first) and finally the random number assigned by DoTE (higher first).' },
        { question: 'What does Accept and Upward mean in TNEA?', answer: 'You keep the seat you were allotted but stay in line for a higher choice in the upward movement. If nothing better opens, you keep the current seat. You pay the tuition fee and lodge certificates at a TNEA Facilitation Centre.' },
        { question: 'What was the TNEA 2026 cutoff for CSE at CEG Guindy?', answer: 'In the 2026 general academic allotment lists, the lowest OC aggregate allotted CSE at the CEG campus was 200 out of 200, the same as in 2023, 2024 and 2025. See our TNEA cutoff page for every college, branch and community.' },
        { question: 'How many rounds are there in TNEA counselling?', answer: 'In 2026 general academic counselling ran in three rounds by mark band: 200 to 171.333, 171 to 135.75 and 135.5 to 77.5. Special reservation counselling came first, and supplementary rounds followed after the +2 supplementary results.' }
      ],
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
