/** Course SEO packs — differentiate high-value / overlapping course pages. */

export type CourseSeoInput = {
  course: {
    id: number;
    name: string;
    slug: string;
    mode?: string | null;
  };
  programmeCount?: number;
  fees?: {
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
  } | null;
  exams: Array<{ id: number; name: string; slug: string; publishedSlug?: string | null }>;
};

export type CourseSeoPack = {
  displayName: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  crossLink?: { href: string; anchor: string; note: string } | null;
  faqs?: Array<{ question: string; answer: string }>;
};

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : null;
}

function feeClause(profile: CourseSeoInput) {
  const min = money(profile.fees?.min_total_fee);
  const max = money(profile.fees?.max_total_fee);
  if (min && max) return ` Recorded total fees range ${min}–${max}.`;
  if (min || max) return ` Recorded total fees from ${min || max}.`;
  return '';
}

/** Fix display casing without changing DB slug/name storage. */
export function courseDisplayName(slug: string, dbName: string) {
  if (slug === 'engineering') return 'Engineering (B.Tech / B.E.)';
  if (slug === 'mba') return dbName || 'MBA / PGDM';
  if (slug === 'bsc') return 'B.Sc';
  if (slug === 'arts') return 'BA (Bachelor of Arts)';
  if (slug === 'commerce') return 'B.Com (Bachelor of Commerce)';
  if (slug === 'online-mba') return 'Online MBA';
  if (slug === 'bpharm') return 'B.Pharm';
  if (slug === 'online-mcom') return 'Online M.Com';
  if (slug === 'online-msc') return 'Online M.Sc';
  if (slug === 'integrated-law') return 'Integrated LLB (BA LLB, BBA LLB)';
  if (slug === 'dental') return 'BDS';
  if (slug === 'chartered-accountancy') return 'CA (Chartered Accountancy)';
  if (slug === 'cma') return 'CMA (Cost and Management Accountancy)';
  if (slug === 'mcom') return 'M.Com';
  if (slug === 'pgdca') return 'PGDCA';
  if (slug === 'healthcare') return 'Healthcare & Allied Health Courses (UG)';
  if (slug === 'mph') return 'MPH (Master of Public Health)';
  if (slug === 'nursing') return 'B.Sc Nursing';
  if (slug === 'dgnm') return 'GNM (General Nursing and Midwifery)';
  if (slug === 'anm') return 'ANM (Auxiliary Nurse Midwife)';
  if (slug === 'medical-pg') return 'PG Medical Courses';
  if (slug === 'medical-ug') return 'Medical UG Courses';
  if (slug === 'online-bcom') return 'Online B.Com';
  if (slug === 'online-bsc') return 'Online B.Sc';
  if (slug === 'online-ba') return 'Online BA';
  if (slug === 'phd') return 'PhD';
  if (slug === 'mtech') return 'M.Tech / M.E.';
  if (slug === 'd-pharm') return 'D.Pharm';
  if (slug === 'polytechnic') return 'Polytechnic';
  if (slug === 'bams') return 'BAMS';
  if (slug === 'bums') return 'BUMS';
  if (slug === 'bhms') return 'BHMS';
  if (slug === 'physiotherapy') return 'Bachelor of Physiotherapy (BPT)';
  if (slug === 'bpt') return 'Physiotherapy as a Career (BPT)';
  if (slug === 'mpt') return 'Master of Physiotherapy (MPT)';
  if (slug === 'bmlt') return 'Bachelor of Medical Laboratory Technology (BMLT)';
  if (slug === 'design-ug') return 'B.Des (Bachelor of Design)';
  if (slug === 'fashion-design-ug') return 'Fashion Design (UG)';
  if (slug === 'fashion-design-pg') return 'Fashion Design (PG)';
  if (slug === 'animation-ug') return 'Animation (UG)';
  if (slug === 'mass-communication') return 'Mass Communication';
  if (slug === 'b-ed') return 'B.Ed';
  if (slug === 'm-ed') return 'M.Ed';
  if (slug === 'deled') return 'D.El.Ed';
  if (slug === 'ded') return 'D.Ed';
  if (slug === 'masscomm') return 'Bachelor of Mass Communication';
  if (slug === 'hotel-management-pg') return 'Hotel Management PG';
  if (slug === 'animation-pg') return 'Animation (PG)';
  if (slug === 'hotel-management-diploma') return 'Diploma in Hotel Management';
  if (slug === 'polytechnic-diploma') return 'Polytechnic Diploma (Lateral Entry)';
  if (slug === 'online-emba') return 'Online Executive MBA (EMBA)';
  if (slug === 'online-programmes') return 'Online Learning Programmes';
  if (slug === 'mass-communication-pg') return 'Mass Communication (PG)';
  if (slug === 'digital-marketing') return 'Digital Marketing (PG)';
  if (slug === 'bftech') return 'B.FTech (Bachelor of Fashion Technology)';
  if (slug === 'bfa') return 'BFA';
  if (slug === 'bvoc') return 'B.Voc';
  if (slug === 'bped') return 'B.P.Ed';
  if (slug === 'bms') return 'BMS';
  if (slug === 'mms') return 'MMS';
  if (slug === 'masters') return 'Master\'s Degree';
  if (slug === 'master-of-physiotherapy-mpt') return 'MPT (Master of Physiotherapy)';
  if (slug === 'msw') return 'MSW';
  if (slug === 'm-lib') return 'Master of Library Science (M.Lib)';
  if (slug === 'mlibsc') return 'M.Lib.Sc';
  if (slug === 'b-lib') return 'Bachelor of Library Science (B.Lib)';
  if (slug === 'blisc') return 'B.Li.Sc';
  if (slug === 'bplan') return 'B.Plan';
  if (slug === 'mechatronics') return 'Mechatronics';
  if (slug === 'b-chem-eng') return 'B.Chem.Engg';
  if (slug === 'm-chem-eng') return 'M.Chem.Engg';
  if (slug === 'master-of-civil-engineering') return 'Master of Civil Engineering';
  if (slug === 'master-of-mechanical-engineering') return 'Master of Mechanical Engineering';
  if (slug === 'master-in-hospital-management') return 'Master of Hospital Management';
  if (slug === 'master-of-surgery') return 'MS (Master of Surgery)';
  if (slug === 'dcs') return 'DCA (Diploma in Computer Applications)';
  if (slug === 'diploma-design') return 'Design Diploma';
  if (slug === 'diploma-media') return 'Media Diploma';
  if (slug === 'media-ug') return 'Media (UG)';
  if (slug === 'media-pg') return 'Media (PG)';
  if (slug === 'bachelor-of-tourism-studies') return 'BTS (Bachelor of Tourism Studies)';
  if (slug === 'diploma-fashion') return 'Fashion Diploma';
  if (slug === 'cfd') return 'Certificate in Fashion Design';
  if (slug === 'diploma-fine-arts') return 'Fine Arts Diploma';
  if (slug === 'diploma-culinary-arts-patisserie') return 'Culinary Arts & Patisserie Diploma';
  if (slug === 'bachelors') return 'Bachelor\'s Degree';
  if (slug === 'bca-1') return 'Bachelor of Computer Applications';
  if (slug === 'advance-certificate') return 'Advanced Certificate';
  if (slug === 'advance-course') return 'Advanced Course';
  if (slug === 'advance-diploma') return 'Advanced Diploma';
  if (slug === 'certificate-program') return 'Certificate Programmes';
  if (slug === 'certification') return 'Certification';
  if (slug === 'animation-diploma') return 'Animation Diploma';
  if (slug === 'architecture-diploma') return 'Architecture Diploma';
  if (slug === 'maslp') return 'MASLP';
  if (slug === 'aviation-pg') return 'Aviation (PG)';
  if (slug === 'blit') return 'B.Lit';
  if (slug === 'bmus') return 'B.Mus';
  if (slug === 'bpa') return 'BPA';
  if (slug === 'bpmt') return 'B.P.M.T';
  if (slug === 'bva') return 'BVA';
  if (slug === 'bsw') return 'BSW';
  if (slug === 'bachelor-hotel-hospitality-tourism') return 'Hotel, Hospitality and Tourism (UG)';
  if (slug === 'beauty') return 'Beauty and Wellness';
  if (slug === 'dped') return 'D.P.Ed';
  if (slug === 'diploma-hotel-hospitality') return 'International Diploma in Hotel & Hospitality Management';
  if (slug === 'pharmacy') return 'Pharmacy Courses';
  if (slug === 'aviation') return 'Aviation (UG)';
  if (slug === 'travel-tourism-ug') return 'Travel and Tourism (UG)';
  if (slug === 'master-of-science') return 'Master of Science (M.Sc)';
  if (slug === 'finance-and-accounting') return 'Master of Finance and Accounting (MFA)';
  return dbName;
}

export function courseSeo(profile: CourseSeoInput): CourseSeoPack {
  const slug = profile.course.slug;
  const dbName = profile.course.name;
  const displayName = courseDisplayName(slug, dbName);
  const fees = feeClause(profile);
  const examNames = profile.exams.slice(0, 5).map((e) => e.name).filter(Boolean);
  const examBit = examNames.length ? ` Common routes include ${examNames.join(', ')}.` : '';

  if (slug === 'llm') {
    return {
      displayName: 'LLM (Master of Laws)',
      h1: 'LLM Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'LLM Course: Eligibility, Admission, Fees & Syllabus 2026',
      description:
        'LLM course details for 2026: LLB eligibility, CLAT PG and AILET, 1-year vs 2-year LLM, syllabus, specialisations, fees at public and private colleges.',
      keywords: ['LLM course', 'LLM course details', 'LLM eligibility', 'LLM admission 2026', 'LLM fees', 'LLM syllabus', 'one year LLM', 'CLAT PG'],
      intro:
        'The LLM (Master of Laws) is a one- or two-year postgraduate law degree you can take after an LLB. Use this guide to check eligibility, the entrance exams, fees, the syllabus and where an LLM can realistically take you.',
      crossLink: {
        href: '/llm-colleges',
        anchor: 'Browse LLM colleges',
        note: 'Ready to shortlist? See LLM colleges with listed fees, specialisations and accepted exams.'
      },
      faqs: [
        { question: 'Is a one-year LLM valid in India?', answer: 'Yes. UGC amended its master\'s degree regulations in 2013 so that a master\'s can last one year when the entry qualification is a first degree plus LLB or a five-year integrated law degree. Universities must follow UGC\'s one-year LLM guidelines to offer it.' },
        { question: 'Can I do an LLM without an LLB?', answer: 'No. An LLB, either the three-year course after graduation or a five-year integrated course, is the basic entry requirement for an LLM in India.' },
        { question: 'What marks do I need in LLB for an LLM?', answer: 'It depends on the university. Many ask for 50% to 55% in LLB, with relaxation for reserved categories. NUJS Kolkata, for example, asks for 55%. Check the brochure of each university you apply to.' },
        { question: 'When is CLAT PG 2027?', answer: 'The Consortium of NLUs has scheduled CLAT 2027, including the PG paper, for 6 December 2026 from 2 pm to 4 pm. Dates can change, so confirm on consortiumofnlus.ac.in.' },
        { question: 'What is the fee for an LLM?', answer: 'Approximate annual tuition listed on CollegeDecision has a median of about Rs 55,000 at public colleges and Rs 90,000 at private ones. The middle half runs from about Rs 15,000 to Rs 85,000 (public) and Rs 60,000 to Rs 1,50,000 (private). Confirm the current fee with the college.' },
        { question: 'Which LLM specialisation should I choose?', answer: 'Choose the area you already enjoyed during your LLB or want to work in, such as corporate, criminal, constitutional or IP law. Also check that the college has full-time faculty in that area.' },
        { question: 'Is an LLM useful for a career in teaching?', answer: 'Yes. Assistant professor posts in law need a master\'s degree in law plus UGC NET or a PhD, so an LLM is the starting point for an academic career.' },
        { question: 'Can I do an LLM while working?', answer: 'Most regular LLM programmes are full-time and on campus, especially the one-year format. If you need to keep working, ask the university whether a part-time or evening option is approved.' }
      ]
    };
  }

  if (slug === 'ug-diploma') {
    return {
      displayName: 'UG Diploma',
      h1: 'UG Diploma Course: Eligibility, Admission, Fees and Careers 2026',
      title: 'UG Diploma Course: Eligibility, Admission, Fees 2026',
      description:
        'UG diploma course details for 2026: Class 10 and Class 12 entry, polytechnic and lateral entry rules, state entrance tests, syllabus, fees and careers.',
      keywords: ['UG diploma course', 'diploma after 10th', 'diploma after 12th', 'polytechnic diploma', 'lateral entry diploma', 'diploma course fees', 'diploma admission 2026'],
      intro:
        'A UG diploma is a practical course you can start after Class 10 or Class 12, from polytechnic engineering to D.El.Ed and paramedical diplomas. Check eligibility, admission tests, fees and where a diploma can take you.',
      crossLink: {
        href: '/courses/polytechnic-diploma',
        anchor: 'Read the polytechnic diploma guide',
        note: 'Planning an engineering diploma? See the polytechnic guide for branch-wise details.'
      },
      faqs: [
        { question: 'Can I do a diploma after Class 10?', answer: 'Yes. AICTE lists three-year diplomas in engineering and technology, applied arts and crafts, and design for students who have passed Class 10.' },
        { question: 'What is lateral entry in a diploma?', answer: 'Under AICTE norms, students who passed Class 12 with listed subjects, or Class 10 plus a two-year ITI, can join the second year of an engineering diploma. The affiliating body may run bridge courses.' },
        { question: 'Is there an entrance exam for a UG diploma?', answer: 'Many states use a polytechnic entrance test, such as TS POLYCET in Telangana, JEECUP in Uttar Pradesh or DCECE in Bihar. Others admit on Class 10 or 12 merit, and private colleges often admit directly.' },
        { question: 'What is the fee for a UG diploma?', answer: 'Approximate first-year tuition listed on CollegeDecision has a median of about Rs 26,000 a year, with the middle half from about Rs 15,000 to Rs 45,000. Government polytechnics are usually cheaper. Confirm with the college.' },
        { question: 'Is a diploma equal to a degree?', answer: 'No. A diploma is a level below a bachelor\'s degree. Some jobs accept it, but most postgraduate courses need a degree.' },
        { question: 'Can I do a B.Tech after a diploma?', answer: 'Yes, many states reserve lateral-entry seats in the second year of B.Tech or B.E. for engineering diploma holders. Rules and seat numbers differ by state.' },
        { question: 'What is the eligibility for D.El.Ed?', answer: 'Under NCTE regulations, D.El.Ed needs Class 12 with at least 50% marks. States can add relaxation for reserved categories and their own admission rules.' }
      ]
    };
  }

  if (slug === 'pg-diploma') {
    return {
      displayName: 'PG Diploma',
      h1: 'PG Diploma Course: Eligibility, Admission, Fees and Scope 2026',
      title: 'PG Diploma Course: Eligibility, Exams, Fees & Scope 2026',
      description:
        'PG diploma course details for 2026: eligibility after graduation, PGDM vs PG diploma vs MBA, CAT and NEET PG routes, syllabus, fees and careers.',
      keywords: ['PG diploma course', 'PG diploma after graduation', 'PGDM', 'PGDCA', 'PG diploma eligibility', 'PG diploma fees', 'one year PG diploma'],
      intro:
        'A PG diploma is a focused postgraduate course, usually one year, that you take after a bachelor\'s degree. Compare types, eligibility, entrance tests, fees and the careers it can realistically support.',
      crossLink: {
        href: '/courses/management-diploma',
        anchor: 'Read the management diploma guide',
        note: 'Considering a PGDM? See the management diploma guide and compare it with an MBA.'
      },
      faqs: [
        { question: 'What is the duration of a PG diploma?', answer: 'Most university PG diplomas run for one year. The PGDM in management and clinical medical diplomas usually take two years.' },
        { question: 'Who is eligible for a PG diploma?', answer: 'You need a bachelor\'s degree. For a PGDM, AICTE asks for a degree of at least three years with 50% marks (45% for reserved categories) and a valid test score. Clinical medical diplomas need MBBS and NEET PG.' },
        { question: 'Is a PG diploma equal to a master\'s degree?', answer: 'No. A PG diploma is not a master\'s degree. Some PGDM programmes have AIU equivalence to an MBA, so ask the institute for the letter if it matters to you.' },
        { question: 'Which exams are used for PG diploma admission?', answer: 'PGDM institutes use CAT, XAT, CMAT, MAT, ATMA or GMAT. Clinical medical diplomas use NEET PG. Many university diplomas admit on graduation marks.' },
        { question: 'When is CAT 2026?', answer: 'CAT 2026 is on 29 November 2026, conducted by IIM Indore. Confirm on iimcat.ac.in.' },
        { question: 'What is the fee for a PG diploma?', answer: 'Approximate non-PGDM first-year tuition listed on CollegeDecision has a median of about Rs 25,000 a year. PGDM fees are usually much higher. Confirm with each institute.' },
        { question: 'Are medical PG diplomas still offered?', answer: 'Some are, but after a February 2019 MCI Board of Governors notice many diploma seats were converted to MD/MS seats. Check NMC recognition for the seat in your admission year.' }
      ]
    };
  }

  if (slug === 'dhmct') {
    return {
      displayName: 'Diploma in Hotel Management, Catering & Tourism (DHMCT)',
      h1: 'DHMCT Course: Eligibility, Admission, Fees and Careers 2026',
      title: 'DHMCT Course: Eligibility, Admission, Fees & Scope 2026',
      description:
        'Diploma in Hotel Management, Catering & Tourism for 2026: Class 12 eligibility, NCHMCT IHM diplomas, merit admission, syllabus, fees and careers.',
      keywords: ['DHMCT course', 'diploma in hotel management', 'hotel management diploma after 12th', 'IHM diploma courses', 'DHMCT fees', 'DHMCT eligibility', 'hotel management diploma admission 2026'],
      intro:
        'DHMCT is a practical hotel management diploma, usually open after Class 12, that trains you for kitchens, restaurants, front office and housekeeping. Check eligibility, admission, fees and where it can lead.',
      crossLink: {
        href: '/courses/hotel-management-diploma',
        anchor: 'Read the hotel management diploma guide',
        note: 'Comparing diploma options? See the wider guide to hotel management diplomas.'
      },
      faqs: [
        { question: 'What is the eligibility for a hotel management diploma?', answer: 'Most need a pass in Class 12 (10+2) in any stream. NCHMCT\'s Front Office diploma also needs English as a subject. AICTE lists a 5-year hotel management diploma after Class 10, and IHMs run a craftsmanship certificate in food production after Class 10.' },
        { question: 'How long is a DHMCT course?', answer: 'It depends on the institute: from 1 to 3 years. NCHMCT trade diplomas at IHMs take 1.5 years, including 24 weeks of industrial training. AICTE lists a 3-year diploma after Class 12.' },
        { question: 'Is there an entrance exam for a hotel management diploma?', answer: 'Usually not. IHMs and most private colleges admit on Class 12 merit or directly. NCHM JEE is for the B.Sc. in Hospitality & Hotel Administration, not the diplomas.' },
        { question: 'When do IHM diploma admissions open?', answer: 'NCHMCT says individual IHMs advertise diploma admissions in local newspapers in June each year. IHM Panipat\'s 2026-27 forms, for example, closed on 12 June 2026. Check each IHM\'s notice.' },
        { question: 'What is the fee for DHMCT?', answer: 'Approximate first-year tuition listed on CollegeDecision has a median of about Rs 33,750 a year, ranging from about Rs 25,000 to Rs 75,000 across 9 records. Uniforms, kits and hostel cost extra. Confirm with the college.' },
        { question: 'Can I do a degree after a hotel management diploma?', answer: 'Yes. You can apply for the B.Sc. HHA through NCHM JEE or a BHMCT. Some private universities offer lateral entry for diploma holders, so check each one\'s rules.' },
        { question: 'What jobs can I get after DHMCT?', answer: 'Common starting roles are kitchen commis, restaurant steward, front office associate and room attendant in hotels, plus roles in flight kitchens, railway catering, cruise lines and restaurant chains.' }
      ]
    };
  }

  if (slug === 'm-phil') {
    return {
      displayName: 'M.Phil (Master of Philosophy)',
      h1: 'M.Phil Course 2026: Is It Still Valid? Rules, PhD Route and Alternatives',
      title: 'M.Phil Course 2026: Status, Eligibility, Fees & Alternatives',
      description:
        'M.Phil course status for 2026: UGC discontinued it under the 2022 PhD rules. Old eligibility, fees, PhD entry for M.Phil holders, NET and RCI clinical route.',
      keywords: ['M.Phil course', 'M.Phil discontinued', 'is M.Phil valid', 'M.Phil full form', 'M.Phil eligibility', 'M.Phil to PhD', 'M.Phil clinical psychology', 'UGC M.Phil notice'],
      intro:
        'M.Phil was a one- to two-year research degree after a master\'s, but the UGC has stopped it for new students. See what the rules say, how M.Phil holders can still enter a PhD, and the routes that replaced it.',
      crossLink: {
        href: '/courses/phd',
        anchor: 'Read the PhD course guide',
        note: 'Planning research? See PhD eligibility, entrance tests and fees.'
      },
      faqs: [
        { question: 'Is M.Phil discontinued in India?', answer: 'Yes. Regulation 14 of the UGC (Minimum Standards and Procedures for Award of Ph.D. Degree) Regulations 2022 says higher education institutions shall not offer the M.Phil. A UGC public notice of 26 December 2023 asked universities to stop M.Phil admissions.' },
        { question: 'Is an M.Phil I already hold still valid?', answer: 'Yes. The UGC notice is about fresh admissions. The 2022 PhD regulations still let candidates who completed an M.Phil with at least 55% marks apply for a PhD, with a 5% relaxation for listed categories.' },
        { question: 'What should I do instead of an M.Phil?', answer: 'Apply for a PhD directly after a master\'s with 55%, or after a four-year bachelor\'s degree with 75%. Admission is through UGC NET or a university entrance test, followed by an interview.' },
        { question: 'Can UGC NET be used for PhD admission?', answer: 'Yes. From the 2024-25 session, the UGC allows NET scores to be used for PhD admission, in addition to JRF and assistant professor eligibility. Check each university\'s PhD notice for how it uses the score.' },
        { question: 'What replaced the M.Phil in Clinical Psychology?', answer: 'RCI replaced it with a two-year M.A. Clinical Psychology from the 2025-26 session, open to students with a four-year B.A. Psychology. In May 2026 RCI renamed it Master in Clinical Psychology (M.Clin.Psy).' },
        { question: 'What was the fee for an M.Phil?', answer: 'Older listings on CollegeDecision for 11 institutes show a median tuition of about Rs 70,000 a year, from under Rs 5,000 at Delhi School of Economics to Rs 3,50,000 at one private university. These are approximate and historical.' },
        { question: 'Is an M.Phil enough to become an assistant professor?', answer: 'No. Under UGC rules, assistant professor posts need a master\'s degree with 55% plus NET, SET or SLET, or a PhD.' }
      ]
    };
  }

  if (slug === 'dbpo') {
    return {
      displayName: 'Diploma in BPO',
      h1: 'Diploma in BPO Course: Eligibility, Admission, Fees and Careers 2026',
      title: 'Diploma in BPO: Eligibility, Syllabus, Fees & Jobs 2026',
      description:
        'Diploma in Business Process Outsourcing (BPO) for 2026: Class 12 eligibility, admission without an entrance exam, syllabus, fees, colleges and careers.',
      keywords: ['diploma in BPO', 'BPO course', 'BPO diploma after 12th', 'business process outsourcing course', 'BPO course fees', 'CRM domestic voice course', 'BPO course syllabus'],
      intro:
        'A Diploma in Business Process Outsourcing (BPO) is a short, job-focused course for customer support and back-office work. Check eligibility, admission, the syllabus, fees and where it can realistically lead.',
      crossLink: {
        href: '/courses/ug-diploma',
        anchor: 'Read the UG diploma guide',
        note: 'Comparing diplomas after Class 12? See the UG diploma guide for other job-focused options.'
      },
      faqs: [
        { question: 'What is a Diploma in BPO?', answer: 'It is a short diploma, usually about one year at colleges, that trains you for business process outsourcing work such as customer calls, chat and email support, data processing and billing.' },
        { question: 'What is the eligibility for a Diploma in BPO?', answer: 'Colleges usually ask for Class 12 from a recognised board. The Skill India course CRM Domestic Voice (SSC/Q2210, version 1.0) lists Class 10 as the minimum, with a job entry age of 18. Check each prospectus.' },
        { question: 'Is there an entrance exam for a BPO diploma?', answer: 'No. There is no national or state entrance exam. Colleges admit on Class 12 merit or directly, and some hold a short interview.' },
        { question: 'What is the fee for a Diploma in BPO?', answer: 'Fee data is limited. One college diploma is listed at about Rs 9,000 for the course on a third-party site. Related B.Com Business Process Services degrees list about Rs 44,000 to Rs 1,38,000 a year on CollegeDecision. Confirm with the college.' },
        { question: 'What jobs can I get after a BPO diploma?', answer: 'Common entry roles include customer care executive, chat or email support, back-office or data processing executive, and billing or accounts associate. With experience, some people move into quality or team lead roles.' },
        { question: 'Is a BPO diploma equal to a degree?', answer: 'No. A diploma is below a bachelor\'s degree. If you want a degree, consider a B.Com, BBA or B.Voc after or instead of the diploma.' },
        { question: 'What is the difference between voice and non-voice BPO?', answer: 'Voice work means handling customer phone calls. Non-voice work covers chat, email, data entry, documents and finance processes, where written English and accuracy matter more.' }
      ]
    };
  }

  if (slug === 'mfa') {
    return {
      displayName: 'MFA (Master of Fine Arts)',
      h1: 'MFA Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'MFA Course: Eligibility, Admission, Fees & Syllabus 2026',
      description:
        'MFA course details for 2026: BFA eligibility, CUET PG and practical tests, syllabus, specialisations like painting and applied art, fees and careers.',
      keywords: ['MFA course', 'Master of Fine Arts', 'MFA course details', 'MFA eligibility', 'MFA admission 2026', 'MFA fees', 'MFA syllabus', 'MFA after BFA'],
      intro:
        'The MFA (Master of Fine Arts) is a two-year, studio-based postgraduate degree you take after a BFA. Check eligibility, CUET PG and practical tests, specialisations, fees and where an MFA can realistically take you.',
      crossLink: {
        href: '/courses/bfa',
        anchor: 'Read the BFA course guide',
        note: 'Still at the undergraduate stage? Your BFA subject decides which MFA you can apply for.'
      },
      faqs: [
        { question: 'What is the duration of an MFA?', answer: 'An MFA usually takes two years, split into four semesters. UGC\'s Specification of Degrees lists the MFA with a minimum duration of two years after a bachelor\'s degree.' },
        { question: 'Who is eligible for an MFA?', answer: 'Most colleges ask for a BFA or BVA in the same or a related discipline. The College of Art, Delhi, for example, asks for a BFA in the relevant discipline with 50% marks (45% for SC, ST and PwBD).' },
        { question: 'Is CUET PG required for an MFA?', answer: 'For central universities such as Delhi University and BHU, yes. They admit through CUET PG followed by a practical test. Many state and private universities use their own test, a portfolio review or an interview instead.' },
        { question: 'How is the MFA merit list made at Delhi University?', answer: 'For MFA programmes at the College of Art, 50% weight goes to the CUET PG score and 50% to the practical-based test, and candidates must score at least 50% in the practical test.' },
        { question: 'Can I do an MFA without a BFA?', answer: 'It is difficult. Central universities usually require a BFA in the relevant field. A few private universities accept related degrees, so check each prospectus carefully.' },
        { question: 'What is the fee for an MFA?', answer: 'Approximate first-year tuition listed on CollegeDecision has a median of about Rs 8,000 a year at public institutes and Rs 76,000 at private ones. Materials, hostel and exhibition costs are extra. Confirm with the college.' },
        { question: 'Can I teach in a college after an MFA?', answer: 'An MFA is the relevant master\'s degree, but UGC rules for assistant professor posts also require NET, SLET/SET or a PhD. UGC NET has subjects for Visual Art (code 79) and Performing Arts (code 65).' }
      ]
    };
  }

  if (slug === 'healthcare-pg') {
    return {
      displayName: 'PG Healthcare Courses',
      h1: 'PG Healthcare Courses: MPH, MHA, Allied Health, Eligibility, Fees and Scope 2026',
      title: 'PG Healthcare Courses 2026: MPH, MHA, M.OT, Eligibility & Fees',
      description:
        'PG healthcare courses for 2026: MPH, MHA, M.OT, MASLP, M.MLS and PG diplomas. Eligibility, CUET PG and other tests, syllabus, fees, colleges and careers.',
      keywords: ['PG healthcare courses', 'healthcare courses after graduation', 'MPH course', 'MHA course', 'master of occupational therapy', 'MASLP', 'allied health PG courses', 'PG diploma clinical research'],
      intro:
        'PG healthcare is an umbrella for postgraduate courses in public health, health administration, allied health sciences, clinical research, yoga and nutrition. Check which programme suits your degree, how admission works, fees and realistic careers.',
      crossLink: {
        href: '/courses/mph',
        anchor: 'Read the MPH course guide',
        note: 'Leaning towards public health? The MPH guide covers it in more depth.'
      },
      faqs: [
        { question: 'What are PG healthcare courses?', answer: 'They are master\'s degrees and PG diplomas for graduates who want to work in health without an MD or MS. Common options are MPH, MHA, M.OT, MASLP, M.MLS and PG diplomas in clinical research, yoga or nutrition.' },
        { question: 'Can a non-medical graduate do a PG healthcare course?', answer: 'Yes, for many programmes. TISS, for example, accepts a three-year bachelor\'s degree in any discipline for its MPH programmes. Clinical allied health master\'s degrees such as M.OT or MASLP need the matching bachelor\'s degree.' },
        { question: 'Is CUET PG required for PG healthcare courses?', answer: 'Only at institutions that use it. TISS admitted to its 2026 MPH programmes through CUET PG (paper COQP11 or COQP19). Many private universities use their own test, an interview or bachelor\'s marks.' },
        { question: 'Who regulates allied health master\'s degrees?', answer: 'Degrees are specified by UGC. Allied and healthcare professions such as occupational therapy and medical laboratory science come under the NCAHP Act, 2021, while audiology and speech-language pathology are regulated by the Rehabilitation Council of India.' },
        { question: 'What is the eligibility for MASLP?', answer: 'Usually a BASLP or an equivalent RCI-recognised degree. AYJNISHD Kolkata, for example, asks for 50% marks (45% for SC, ST and PwD), a completed internship and RCI registration.' },
        { question: 'What is the fee for PG healthcare courses?', answer: 'Approximate first-year tuition listed on CollegeDecision has a median of about Rs 1,00,000 a year for master\'s programmes and about Rs 39,000 for PG diplomas, mostly at private institutes. Confirm with the college.' },
        { question: 'Is a PG diploma in healthcare equal to a master\'s degree?', answer: 'No. A one-year PG diploma is shorter and narrower than a two-year master\'s degree. If you plan a PhD or college teaching later, a master\'s degree is usually the safer choice.' }
      ]
    };
  }

  if (slug === 'management-diploma') {
    return {
      displayName: 'Management Diploma (DBA)',
      h1: 'Management Diploma Course: Eligibility, Admission, Fees and Scope 2026',
      title: 'Management Diploma After 12th: Eligibility, Fees & Scope 2026',
      description:
        'Management diploma (DBA) after Class 12 in 2026: eligibility, admission on marks, syllabus, listed fees, colleges, careers and how it differs from a PGDM.',
      keywords: ['management diploma', 'diploma in business administration', 'DBA course', 'diploma in management after 12th', 'management diploma fees', 'management diploma eligibility', 'diploma vs PGDM'],
      intro:
        'A management diploma, usually a Diploma in Business Administration, is a one- to three-year business course you can join after Class 12. See eligibility, admission, syllabus, listed fees and where it can realistically lead.',
      crossLink: {
        href: '/courses/pg-diploma',
        anchor: 'Read the PG diploma and PGDM guide',
        note: 'Already a graduate? A PGDM or PG diploma is the postgraduate route, with different eligibility and exams.'
      },
      faqs: [
        { question: 'What is a management diploma?', answer: 'It is an undergraduate-level business course, most often called a Diploma in Business Administration (DBA), that you can join after Class 12. It covers accounts, marketing, HR and business communication, and sits below a bachelor\'s degree such as a BBA.' },
        { question: 'What is the duration of a management diploma?', answer: 'It varies by university. The programmes listed on CollegeDecision run for one, two or three years.' },
        { question: 'Who is eligible for a management diploma?', answer: 'Usually anyone who has passed Class 12 in any stream. Each university sets its own minimum marks, so check the current prospectus.' },
        { question: 'Is there an entrance exam for a management diploma?', answer: 'There is no national entrance exam. Most colleges admit on Class 12 marks; some private universities hold their own aptitude test or interview. CAT, XAT, CMAT and MAT are for MBA and PGDM after graduation.' },
        { question: 'Is a management diploma the same as a PGDM?', answer: 'No. A PGDM is a postgraduate diploma that needs a bachelor\'s degree and an entrance test score. A management diploma is taken after Class 12.' },
        { question: 'What is the fee for a management diploma?', answer: 'Approximate annual fees listed on CollegeDecision range from about Rs 12,000 for one-year programmes to about Rs 1,00,000 at a large private university. Only four records are available, so confirm with each college.' },
        { question: 'Can I do an MBA after a management diploma?', answer: 'Not directly. MBA and PGDM admission needs a bachelor\'s degree. Many diploma holders first complete a BBA, BMS or B.Com and then apply.' },
        { question: 'Can a management diploma count towards a degree?', answer: 'If it was an exit award from a four-year degree under the UGC Curriculum and Credit Framework, you may re-enter the third year within the time limit. A standalone diploma does not give that right automatically, so ask the university.' }
      ]
    };
  }

  if (slug === 'travel-tourism-pg') {
    return {
      displayName: 'PG in Travel and Tourism (MBA TTM, MTTM, PG Diploma)',
      h1: 'Travel and Tourism PG Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'Travel and Tourism PG Course: MBA TTM, MTTM, Fees 2026',
      description:
        'Travel and tourism PG courses for 2026: MBA (TTM), MTTM and PG diplomas, eligibility, IITTM and other entrance routes, syllabus, fees, colleges and careers.',
      keywords: ['travel and tourism PG course', 'MBA tourism and travel management', 'MTTM course', 'master of tourism management', 'PG diploma in travel and tourism', 'IITTM MBA admission 2026', 'tourism PG fees'],
      intro:
        'A PG in travel and tourism, such as an MBA (TTM), MTTM or PG diploma, trains graduates from any stream for management roles in travel, destinations and events. Check eligibility, entrance routes, syllabus, fees, colleges and realistic career paths.',
      crossLink: {
        href: '/courses/diploma-travel',
        anchor: 'Read the travel and tourism diploma guide',
        note: 'Not a graduate yet? A diploma in travel and tourism is the shorter entry route.'
      },
      faqs: [
        { question: 'What are the main PG courses in travel and tourism?', answer: 'The common ones are the MBA (Tourism and Travel Management), the Master of Tourism and Travel Management (MTTM), the Master of Tourism Management (MTM), the Master of Tourism Administration (MTA) and one-year PG diplomas in travel and tourism management.' },
        { question: 'Who is eligible for a PG in travel and tourism?', answer: 'Most programmes accept a bachelor\'s degree in any stream. IITTM\'s MBA (TTM) 2026-28 bulletin asks for 50% marks (45% for SC/ST), and IGNOU\'s MTTM accepts any graduate from a recognised university.' },
        { question: 'Which entrance exams are accepted for IITTM\'s MBA (TTM)?', answer: 'IITTM accepts a valid CAT, MAT, CMAT, XAT, GMAT, ATMA or CUET PG score, or you can sit its own IITTM Admission Test (IIAT). Shortlisted candidates then take a group discussion and personal interview.' },
        { question: 'How is the IITTM merit list prepared?', answer: 'According to the 2026-28 bulletin, the entrance score carries 70%, the group discussion 15% and the personal interview 15%.' },
        { question: 'Can I do a tourism master\'s by distance learning?', answer: 'Yes. IGNOU offers the Master of Tourism and Travel Management (MTTM_NEW) in open and distance mode. It takes 2 to 4 years and costs Rs 18,200 for the full programme, plus registration and development fees.' },
        { question: 'What is the fee for a travel and tourism PG?', answer: 'IGNOU\'s MTTM costs Rs 9,100 a year. The four private institutes with fee data on CollegeDecision list about Rs 75,000 to Rs 2,00,000 a year. These are approximate, so confirm with each institute.' },
        { question: 'Can I teach tourism after a master\'s degree?', answer: 'A relevant master\'s degree is the starting point. UGC NET has a separate subject, Tourism Administration and Management (code 93), for assistant professor eligibility and the Junior Research Fellowship.' }
      ]
    };
  }

  if (slug === 'professional-makeup-artistry') {
    return {
      displayName: 'Professional Makeup Artistry Course',
      h1: 'Professional Makeup Artistry Course: Eligibility, Syllabus, Fees and Careers 2026',
      title: 'Professional Makeup Artistry Course: Syllabus, Fees 2026',
      description:
        'Professional makeup artistry courses in 2026: B&WSSC NSQF qualifications, eligibility, training hours, syllabus, specialisations, approximate fees and careers.',
      keywords: ['professional makeup artistry course', 'makeup artist course', 'makeup course fees', 'bridal makeup course', 'makeup artist course syllabus', 'NSQF makeup artist', 'B&WSSC makeup artist'],
      intro:
        'Professional makeup artistry is a hands-on skill course for bridal, fashion, photo and screen makeup. See the national B&WSSC qualifications, who can join, what you learn, what it costs and how makeup careers really work.',
      crossLink: {
        href: '/courses/beauty',
        anchor: 'Read the beauty courses guide',
        note: 'Looking for a wider beauty or cosmetology programme? Start with our beauty courses guide.'
      },
      faqs: [
        { question: 'Is professional makeup artistry a degree course?', answer: 'Usually not. Most makeup artistry courses in India are certificates or diplomas from academies, skill centres and some colleges. Degree options in this area are broader programmes such as a B.Voc in beauty and wellness or a B.Sc in cosmetology.' },
        { question: 'Is there a national standard for makeup artist courses?', answer: 'Yes. The Beauty & Wellness Sector Skill Council publishes qualification packs, including Professional Makeup Artist (BWS/Q0306, NSQF Level 4) and Bridal, Fashion and Portfolio Makeup Artist (BWS/Q0301, NSQF Level 5).' },
        { question: 'How long is a professional makeup artist course?', answer: 'The B&WSSC model curriculum for Professional Makeup Artist sets at least 510 hours, including 60 hours of on-the-job training, or 600 hours with optional electives. Private short courses can be much shorter.' },
        { question: 'What is the eligibility for a makeup artist course?', answer: 'Private academies set their own rules, often Class 10 or 12. The national Professional Makeup Artist qualification sets a minimum job-entry age of 18 and combinations such as Class 10 with relevant training or industry experience.' },
        { question: 'Is there an entrance exam for makeup courses?', answer: 'No national entrance exam exists. Admission is usually direct or after an interview. Skill-council courses end with a practical assessment against the qualification standards.' },
        { question: 'How much does a makeup artistry course cost?', answer: 'A one-year makeup diploma listed on CollegeDecision costs about Rs 50,000 a year. Short private courses vary widely, and the makeup kit is often an extra cost. Confirm the fee with the institute.' },
        { question: 'What can I do after a makeup artistry course?', answer: 'Common routes are freelance bridal and event makeup, salon work, fashion and photo shoots, assisting in film and TV, brand and retail roles and, with experience, training others.' }
      ]
    };
  }

  if (slug === 'mvoc') {
    return {
      displayName: 'M.Voc (Master of Vocation)',
      h1: 'M.Voc Course: Eligibility, Admission, Syllabus, Fees and Scope 2026',
      title: 'M.Voc Course 2026: Eligibility, Admission, Syllabus & Scope',
      description:
        'M.Voc (Master of Vocation) for 2026: B.Voc and other eligibility routes, admission, PG Diploma exit, syllabus, specialisations, colleges and careers.',
      keywords: ['M.Voc', 'M.Voc course', 'Master of Vocation', 'M.Voc eligibility', 'M.Voc after B.Voc', 'M.Voc admission 2026', 'M.Voc syllabus', 'M.Voc colleges'],
      intro:
        'The M.Voc (Master of Vocation) is a two-year, skill-heavy master\'s degree that follows the B.Voc. Check who can apply, how admission works, the PG Diploma exit, specialisations, colleges and where it can realistically lead.',
      crossLink: {
        href: '/courses/pg-diploma',
        anchor: 'Read the PG diploma guide',
        note: 'Want a shorter skill-focused option after graduation? Compare it with a one-year PG diploma.'
      },
      faqs: [
        { question: 'What is the full form of M.Voc?', answer: 'M.Voc stands for Master of Vocation. It is a postgraduate degree specified by UGC for the skill-based (vocational) track that starts with the B.Voc.' },
        { question: 'What is the duration of an M.Voc?', answer: 'Two years, usually four semesters. Many universities let you leave after the first year with a PG Diploma and complete the M.Voc after the second year.' },
        { question: 'Who is eligible for an M.Voc?', answer: 'Usually a B.Voc graduate in a related trade. Many universities also accept other graduates. Ambedkar University Delhi, for example, accepts a B.Voc with 50%, any graduate with 50% and two years of industry experience, or NSQF Level 7 certification.' },
        { question: 'Is there an entrance exam for M.Voc?', answer: 'There is no national M.Voc entrance exam. Universities admit on bachelor\'s marks, their own test, an interview or a portfolio. If a university uses CUET PG, check its programme list for the M.Voc paper.' },
        { question: 'Can I do an M.Voc without a B.Voc?', answer: 'Often yes. Several universities accept any bachelor\'s degree, sometimes with work experience. Dayalbagh Educational Institute accepts a bachelor\'s with at least second class and asks trade changers to take a bridge course.' },
        { question: 'What is the fee for an M.Voc?', answer: 'Fee data is limited. Approximate total course fees listed on CollegeDecision range from about Rs 42,000 at Devi Ahilya Vishwavidyalaya to about Rs 5,60,000 for design programmes at ARCH College, Jaipur. Confirm the full two-year fee with the college.' },
        { question: 'Can I do a PhD after an M.Voc?', answer: 'UGC\'s vocational scheme allows progression to research-level study, but PhD eligibility is set by each university. Check the rules of your target universities before you enrol.' }
      ]
    };
  }

  if (slug === 'master-of-event-management') {
    return {
      displayName: 'Master of Event Management',
      h1: 'Master of Event Management: Eligibility, Admission, Fees and Scope 2026',
      title: 'Master of Event Management: MBA/MA Options, Fees & Scope 2026',
      description:
        'Event management at master\'s level in 2026: MBA, MA and M.Sc options, eligibility, CAT/CMAT/MAT routes, syllabus, listed fees, colleges and careers.',
      keywords: ['master of event management', 'MBA in event management', 'MA event management', 'event management PG course', 'event management fees', 'event management eligibility', 'PG diploma in event management'],
      intro:
        'In India, event management at master\'s level is usually offered as an MBA in Event Management, an MA in PR and Events, an M.Sc or a PG diploma, not a degree titled "Master of Event Management". Compare eligibility, exams, fees and careers.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'Read the MBA / PGDM guide',
        note: 'Most master\'s-level event programmes are MBA specialisations, so the MBA admission rules apply.'
      },
      faqs: [
        { question: 'Is "Master of Event Management" a recognised degree in India?', answer: 'Not under that title. UGC\'s Specification of Degrees does not list it. The subject is usually offered as an MBA in Event Management, an MA or Master of Communication in PR and Events, an M.Sc in Sports and Events Management, or a PG diploma.' },
        { question: 'What is the duration of a master\'s in event management?', answer: 'A master\'s degree such as an MBA or MA takes two years. Most PG diplomas in event management take one year.' },
        { question: 'Who is eligible for an MBA in Event Management?', answer: 'A bachelor\'s degree in any discipline, often with about 50% marks, plus the test the university accepts. For AICTE-approved PGDM programmes, AICTE asks for a three-year degree with 50% (45% for reserved categories) and a valid test score.' },
        { question: 'Which entrance exams are accepted?', answer: 'MBA routes commonly accept CAT, XAT, CMAT or MAT, or the university\'s own test. Many MA and PG diploma programmes admit on graduation marks and an interview.' },
        { question: 'What is the fee for event management at master\'s level?', answer: 'Approximate first-year fees listed on CollegeDecision have a median of about Rs 1,50,000 a year across 11 records, from about Rs 60,000 to Rs 5,00,000. Confirm with each institute.' },
        { question: 'Is a PG diploma in event management the same as a master\'s degree?', answer: 'No. A PG diploma is not a master\'s degree. Check what the final certificate will say and which university or body awards it.' },
        { question: 'Can I do event management after any graduation?', answer: 'Yes, most programmes accept graduates from any discipline. Hospitality, mass communication and BBA graduates often apply, but they are not the only ones admitted.' }
      ]
    };
  }

  if (slug === 'diploma-travel') {
    return {
      displayName: 'Diploma in Travel and Tourism',
      h1: 'Diploma in Travel and Tourism: Eligibility, Admission, Fees and Careers 2026',
      title: 'Diploma in Travel and Tourism: Eligibility, Fees & Jobs 2026',
      description:
        'Travel and tourism diploma for 2026: polytechnic and IGNOU eligibility, admission without a national exam, syllabus, IATA training, fees, colleges and careers.',
      keywords: ['diploma in travel and tourism', 'travel and tourism diploma', 'travel and tourism course after 12th', 'IGNOU DTS', 'travel and tourism polytechnic', 'air ticketing course', 'travel diploma fees'],
      intro:
        'A diploma in travel and tourism is a short, practical course in itineraries, air ticketing, travel documents and tour operations. Check the different formats, eligibility, admission, fees and where it can realistically lead.',
      crossLink: {
        href: '/courses/dhmct',
        anchor: 'Read the hotel management diploma guide',
        note: 'More interested in hotel work? The hotel management, catering and tourism diploma guide covers front office and food service.'
      },
      faqs: [
        { question: 'What is the duration of a diploma in travel and tourism?', answer: 'It depends on the format. The MSBTE polytechnic diploma in Maharashtra takes 3 years after Class 10. IGNOU\'s Diploma in Tourism Studies has a minimum duration of 1 year after Class 12. Private certificate courses often run 6 months to 1 year.' },
        { question: 'What is the eligibility for a travel and tourism diploma?', answer: 'Maharashtra polytechnics ask for Class 10 (SSC) with at least 35% aggregate. IGNOU\'s DTS needs Class 12 or equivalent, or IGNOU\'s BPP. Most private colleges ask for Class 12.' },
        { question: 'Is there an entrance exam for a travel and tourism diploma?', answer: 'No. There is no national entrance exam. Maharashtra polytechnic seats are filled on merit through the DTE centralised admission process, IGNOU admits on eligibility, and private institutes admit directly or after an interview.' },
        { question: 'What is the fee for a travel and tourism diploma?', answer: 'IGNOU lists Rs 4,500 for the full DTS programme, plus registration and exam fees. Private academies on CollegeDecision list about Rs 1,12,000 to Rs 1,40,000 for one-year travel courses. Fee data is limited, so confirm with the institute.' },
        { question: 'What is the IATA Foundation in Travel and Tourism?', answer: 'It is an entry-level IATA certificate covering travel documents, air fares, ticketing and reservation systems. The self-study version gives 12 months to finish and ends with an online exam of 80 multiple-choice questions, with 60% needed to pass.' },
        { question: 'What jobs can I get after a travel and tourism diploma?', answer: 'Common entry roles include travel consultant, reservation and ticketing executive, tour operations executive and travel support desk roles. Outcomes depend on the employer, city and your skills.' },
        { question: 'Can I do a degree after a travel diploma?', answer: 'Yes. Common next steps are a Bachelor of Tourism Studies (BTS) or a BBA in tourism, and later an MBA in tourism and travel management. Some states allow polytechnic diploma holders lateral entry to selected degrees.' }
      ]
    };
  }

  if (slug === 'special') {
    return {
      displayName: 'Special Education',
      h1: 'Special Education Courses: M.Ed. and B.Ed. Special Education, Eligibility, Fees and Careers 2026',
      title: 'Special Education Courses: M.Ed., B.Ed., RCI Rules & Fees 2026',
      description:
        'Special education courses for 2026: RCI-approved B.Ed. and M.Ed. Special Education, eligibility, disability areas, admission, fees, CRR registration and careers.',
      keywords: ['special education course', 'M.Ed special education', 'B.Ed special education', 'special education eligibility', 'RCI approved courses', 'CRR registration', 'special educator course'],
      intro:
        'Special education courses train teachers for children with disabilities and are regulated by the Rehabilitation Council of India (RCI). Check the B.Ed. and M.Ed. Special Education routes, eligibility, disability areas, fees and careers.',
      crossLink: {
        href: '/courses/m-ed',
        anchor: 'Read the M.Ed. course guide',
        note: 'Comparing postgraduate teacher education? The M.Ed. guide covers the general M.Ed. route.'
      },
      faqs: [
        { question: 'What does the "Special" course on CollegeDecision mean?', answer: 'It is a postgraduate listing with no programmes currently linked to it. Most postgraduate courses with "special" in the name in India are special education courses, so this page covers special education.' },
        { question: 'Who regulates special education courses in India?', answer: 'The Rehabilitation Council of India (RCI), set up under the RCI Act, 1992. RCI approves special education courses and institutions and keeps the Central Rehabilitation Register (CRR).' },
        { question: 'What is the eligibility for M.Ed. Special Education?', answer: 'RCI norms ask for a B.Ed. Special Education with at least 50% in the same disability area, or a B.Ed. plus an RCI-recognised D.Ed. Special Education with 50% in each, or a 4-year integrated B.Ed. Special Education.' },
        { question: 'How long is the M.Ed. Special Education?', answer: 'The regular M.Ed. Special Education is 2 years (4 semesters) and must be completed within 3 years. RCI lists distance M.Ed. Special Education courses at 2.5 years.' },
        { question: 'What is the eligibility for B.Ed. Special Education?', answer: 'A bachelor\'s or master\'s degree in sciences, social sciences or humanities with at least 50% marks, or a B.E. or B.Tech with science and mathematics with 55%, as per RCI norms.' },
        { question: 'Is RCI registration compulsory for special educators?', answer: 'Yes. Under Section 13 of the RCI Act, only people with a recognised qualification who are enrolled on the Central Rehabilitation Register may practise as rehabilitation professionals, including special educators.' },
        { question: 'What is the fee for special education courses?', answer: 'Approximate B.Ed. Special Education tuition listed on CollegeDecision ranges from about Rs 29,000 to Rs 1,00,000 a year across six colleges. We do not yet have M.Ed. Special Education fee records. Confirm with the college.' },
        { question: 'What jobs can I get after special education?', answer: 'Common roles include special educator in schools, resource room teacher, teacher educator, and roles in early intervention and NGOs. Kendriya Vidyalaya special educator notices also ask for CTET and a valid CRR number.' }
      ]
    };
  }

  if (slug === 'diploma') {
    return {
      displayName: 'Diploma Courses',
      h1: 'Diploma Courses in India: Types, Eligibility, Fees and Scope 2026',
      title: 'Diploma Courses in India: Types, Eligibility & Fees 2026',
      description:
        'Diploma courses explained for 2026: polytechnic after Class 10, lateral entry, UG and PG diplomas, D.Voc, AICTE and UGC rules, admission, fees and careers.',
      keywords: ['diploma courses', 'diploma course after 10th', 'diploma after 12th', 'types of diploma courses', 'diploma eligibility', 'diploma fees', 'polytechnic diploma', 'diploma vs degree'],
      intro:
        'A diploma in India is a level of qualification, not one course. See how polytechnic, UG, PG and vocational diplomas differ, who approves them, how admission works and which one fits you.',
      crossLink: {
        href: '/courses/ug-diploma',
        anchor: 'Read the UG diploma guide',
        note: 'Already a graduate? See the PG diploma and management diploma guides instead.'
      },
      faqs: [
        { question: 'What is a diploma course?', answer: 'A diploma is a qualification below a degree, or after a degree in the case of PG diplomas. The level depends on who awards it: AICTE-approved polytechnics, universities under UGC rules, or NCVET-approved awarding bodies.' },
        { question: 'Can I do a diploma after Class 10?', answer: 'Yes. AICTE\'s Approval Process Handbook 2024-27 lists three-year diplomas in engineering and technology, design, and applied arts and crafts with Class 10 as the entry qualification.' },
        { question: 'What diploma can I do after Class 12?', answer: 'You can join the second year of an AICTE diploma through lateral entry, take a two-year NCVET Diploma (Advanced) in a relevant subject, or choose an institute-level or vocational diploma. Rules differ by state and institute.' },
        { question: 'What is a UG diploma under the new UGC framework?', answer: 'Under UGC\'s Curriculum and Credit Framework (2022), a degree student who exits after two years with 80 credits, plus a 4-credit vocational course in the summer, is awarded a UG Diploma and can re-enter within three years.' },
        { question: 'Is a diploma equal to a degree?', answer: 'No. A diploma is a separate, usually shorter qualification. Some diplomas allow lateral entry into the second year of a degree, such as an engineering diploma into B.Tech.' },
        { question: 'What is the fee for a diploma course?', answer: 'It varies by type. For polytechnic diplomas listed on CollegeDecision, approximate first-year tuition has a median of about Rs 11,000 at public and Rs 30,000 at private institutes. Confirm with each institute.' },
        { question: 'How do I check if a diploma is recognised?', answer: 'Check that the institute and programme are approved for the current year by the relevant body, such as AICTE for technical diplomas, and that the certificate is issued by a state board, university or approved awarding body.' }
      ]
    };
  }

  if (slug === 'dphil') {
    return {
      displayName: 'D.Phil (Doctor of Philosophy)',
      h1: 'D.Phil Course: Meaning, Eligibility, Admission and Fees 2026',
      title: 'D.Phil Course: Meaning, Eligibility, Admission & Fees 2026',
      description:
        'D.Phil is the Doctor of Philosophy, the same degree as a PhD in India. See UGC 2022 eligibility, NET-based admission, coursework, fees and careers.',
      keywords: ['D.Phil course', 'D.Phil full form', 'D.Phil vs PhD', 'Doctor of Philosophy', 'D.Phil eligibility', 'D.Phil admission 2026', 'PhD admission through NET', 'UGC PhD regulations 2022'],
      intro:
        'D.Phil is another name for the Doctor of Philosophy. In India it follows the same UGC rules as a PhD. Check eligibility, NET-based admission, coursework, fees and where a doctorate can lead.',
      crossLink: {
        href: '/courses/phd',
        anchor: 'Read the PhD course guide',
        note: 'Most universities now advertise this degree as a PhD. Compare current doctoral programmes there.'
      },
      faqs: [
        { question: 'What is the full form of D.Phil?', answer: 'D.Phil stands for Doctor of Philosophy. UGC\'s specification of degrees lists it as Doctor of Philosophy (Ph.D. or D.Phil.).' },
        { question: 'Is D.Phil the same as PhD?', answer: 'Yes, in India. Both are the same research doctorate and both follow the UGC (Minimum Standards and Procedures for Award of Ph.D. Degree) Regulations, 2022.' },
        { question: 'Who is eligible for a D.Phil?', answer: 'Under UGC 2022 rules, you need a master\'s degree with at least 55% marks, or a four-year bachelor\'s with at least 75%. A 5% relaxation applies to SC, ST, OBC (non-creamy layer), differently-abled and EWS candidates as UGC decides.' },
        { question: 'How long does a D.Phil take?', answer: 'A minimum of three years including coursework and a maximum of six years, with up to two more years through re-registration under the UGC 2022 regulations.' },
        { question: 'Is NET required for D.Phil admission?', answer: 'Many universities now admit using UGC or CSIR NET scores plus an interview. The University of Allahabad, for example, used NET scores for 2025-26 and held its own CRET only where NET-qualified applicants were not enough.' },
        { question: 'What is the fee for a D.Phil?', answer: 'No D.Phil fees are listed on CollegeDecision. For PhD programmes, approximate first-year tuition has a median of about Rs 10,500 at public and Rs 84,000 at private institutes. Confirm with the university.' },
        { question: 'Which universities award a D.Phil?', answer: 'The title is now uncommon in India; most universities advertise the degree as a PhD. Abroad, the University of Oxford calls its research doctorate a DPhil.' }
      ]
    };
  }

  if (slug === 'dvoc') {
    return {
      displayName: 'D.Voc (Diploma of Vocation)',
      h1: 'D.Voc Course: Full Form, Eligibility, Levels, Fees and Scope 2026',
      title: 'D.Voc Course: Full Form, Eligibility, Levels & Scope 2026',
      description:
        'D.Voc (Diploma of Vocation) explained: AICTE and UGC B.Voc schemes, NSQF levels, eligibility after Class 10 or 12, admission, syllabus, fees and careers.',
      keywords: ['D.Voc course', 'D.Voc full form', 'Diploma of Vocation', 'D.Voc eligibility', 'D.Voc after 10th', 'D.Voc vs B.Voc', 'NSQF diploma', 'vocational diploma'],
      intro:
        'D.Voc stands for Diploma of Vocation, a skill-based diploma aligned to national skill levels. See how the AICTE and UGC B.Voc schemes differ, who can apply, what you study and where it leads.',
      crossLink: {
        href: '/courses/bvoc',
        anchor: 'Read the B.Voc course guide',
        note: 'The D.Voc is the first exit point of a UGC B.Voc, so the B.Voc guide has fuller college and fee data.'
      },
      faqs: [
        { question: 'What is the full form of D.Voc?', answer: 'D.Voc stands for Diploma of Vocation. AICTE\'s Approval Process Handbook lists it by that name.' },
        { question: 'Can I do a D.Voc after Class 10?', answer: 'Yes, on AICTE\'s diploma track. A Class 10 pass student can exit after one year with a Certificate of Vocation (C.Voc) and after two years with a Diploma of Vocation.' },
        { question: 'What is the difference between D.Voc and B.Voc?', answer: 'Under UGC\'s B.Voc guidelines, the Diploma is awarded after one year (NSQF level 5, 60 credits), the Advanced Diploma after two years (level 6) and the B.Voc degree after three years (level 7).' },
        { question: 'Is there an entrance exam for D.Voc?', answer: 'There is no national entrance exam. Most institutes admit on Class 10 or Class 12 marks, sometimes with an aptitude test or interview.' },
        { question: 'What subjects are taught in a D.Voc?', answer: 'In UGC\'s scheme, a one-year Diploma has 36 skill credits linked to a job role and 24 general education credits. Sectors include banking, tourism, software, retail and laboratory technology.' },
        { question: 'What is the fee for a D.Voc?', answer: 'No D.Voc fees are listed on CollegeDecision yet. As a rough guide, B.Voc first-year tuition has a median of about Rs 18,000 at public and Rs 50,000 at private institutes. Confirm with the institute.' },
        { question: 'What can I do after a D.Voc?', answer: 'You can take an entry-level skilled job or apprenticeship, or continue to the Advanced Diploma and B.Voc, and later an M.Voc.' }
      ]
    };
  }

  if (slug === 'executive-programme') {
    return {
      displayName: 'Executive Programme',
      h1: 'Executive Programme: Eligibility, Admission, Fees and Scope 2026',
      title: 'Executive Programme Course: Eligibility, Exams & Fees 2026',
      description:
        'Executive programmes for working professionals in 2026: one-year MBAs, AICTE executive PGDMs and certificates, with eligibility, exams, fees and careers.',
      keywords: ['executive programme', 'executive programme course', 'executive MBA India', 'executive PGDM', 'executive programme eligibility', 'one year MBA for executives', 'executive programme fees'],
      intro:
        'An executive programme is a course for people who are already working, but the label covers one-year MBAs, 18-month AICTE PGDMs and short certificates. See how to tell them apart, who is eligible, which exams apply and what to check before you pay.',
      crossLink: {
        href: '/courses/online-executive-programme',
        anchor: 'Read the online executive programme guide',
        note: 'Want to study online while you work? Compare online executive programmes.'
      },
      faqs: [
        { question: 'What is an executive programme?', answer: 'It is a course designed for working professionals. The label is not one qualification: it can be a one-year MBA for executives, an AICTE-approved PGDM for working professionals, a weekend diploma or a short certificate.' },
        { question: 'Who is eligible for an executive programme?', answer: 'Usually graduates with work experience. AICTE allows an 18-month PGDM for working professionals with at least 3 years of relevant managerial or supervisory experience. IIM Ahmedabad\'s MBA-PGPX asks for at least 4 years of full-time work after graduation.' },
        { question: 'Is GMAT required for an executive programme?', answer: 'For many one-year MBAs for executives, yes. IIM Ahmedabad\'s MBA-PGPX needs a test-centre GMAT or GRE score taken within five years. Weekend diplomas and certificates often use their own test or an interview instead.' },
        { question: 'Is an executive programme the same as an MBA?', answer: 'Not always. Some executive programmes award an MBA or an AICTE-approved PGDM, but many award only a certificate from the institute. Check exactly what you will be awarded before you apply.' },
        { question: 'What is the fee for an executive programme?', answer: 'Fees vary widely between short certificates and full-time one-year programmes. CollegeDecision has no tuition or total-fee records for this course yet, so check the institute\'s official fee page and ask for a written total.' },
        { question: 'Does work experience during college count?', answer: 'Usually not. Institutes such as SPJIMR count only full-time work experience after graduation and exclude internships or project work done as part of the degree.' },
        { question: 'Can I do a PhD after an executive programme?', answer: 'It depends on the award. A recognised master\'s degree or two-year PG diploma can meet doctoral eligibility, as at IIM Ahmedabad, but a short executive certificate usually will not.' }
      ]
    };
  }
  if (slug === 'fellowship') {
    return {
      displayName: 'Fellowship',
      h1: 'Fellowship Course: Types, Eligibility, Admission and Scope 2026',
      title: 'Fellowship Course: FPM, FNB & JRF Eligibility 2026',
      description:
        'Fellowship courses in India explained for 2026: Fellow Programme in Management, NBEMS FNB medical fellowships and UGC NET JRF, with eligibility and exams.',
      keywords: ['fellowship course', 'fellow programme in management', 'FPM', 'FNB fellowship', 'NBEMS FET', 'UGC NET JRF', 'fellowship eligibility'],
      intro:
        'A fellowship can be a doctoral programme in management, a two-year NBEMS medical fellowship or a funded research fellowship such as JRF. Find out which is which, who is eligible, which entrance tests apply and how to check recognition.',
      crossLink: {
        href: '/courses/phd',
        anchor: 'Read the PhD course guide',
        note: 'Looking for a research degree? The PhD guide covers UGC rules, entrance tests and admission.'
      },
      faqs: [
        { question: 'What is a fellowship course?', answer: 'In India the word covers three things: a Fellow Programme in Management (doctoral-level study at business schools), a medical fellowship such as the NBEMS FNB, and a funded research fellowship such as the UGC NET Junior Research Fellowship.' },
        { question: 'Is a Fellow Programme in Management equal to a PhD?', answer: 'It depends on the institute and the award. IIM Ahmedabad now runs its former FPM as a Doctoral Programme in Management leading to a PhD. For any other fellow programme, ask the institute in writing what is awarded and whether it is recognised as equivalent to a PhD.' },
        { question: 'What is the eligibility for a management fellow or doctoral programme?', answer: 'At IIM Ahmedabad, a master\'s degree or two-year PG diploma with 55% marks, or a four-year bachelor\'s degree with 65%, among other routes, with a 5-point relaxation for reserved categories. Candidates need CAT or an accepted test in lieu of it.' },
        { question: 'How long is an FNB fellowship?', answer: 'NBEMS fellowship (FNB) courses last two years and are full-time training at NBEMS-accredited hospitals.' },
        { question: 'How do I get admission to an FNB course?', answer: 'Through the Fellowship Entrance Test (FET) conducted by NBEMS, followed by centralised merit-based counselling. You need an MD, MS, DNB, DM, MCh or DrNB in an eligible feeder specialty.' },
        { question: 'What is the minimum mark for PhD admission under UGC rules?', answer: 'UGC\'s 2022 PhD regulations ask for at least 55% in a master\'s degree, or at least 75% in a four-year bachelor\'s degree, with relaxations for reserved categories.' },
        { question: 'What are the fees for a fellowship programme?', answer: 'CollegeDecision has no fee records for this course. Many doctoral programmes offer financial support and research fellowships pay a stipend, so check the official prospectus or bulletin.' }
      ]
    };
  }
  if (slug === 'foundation-course') {
    return {
      displayName: 'Foundation Course',
      h1: 'Foundation Course: Eligibility, Exams, Fees and Next Steps 2026',
      title: 'Foundation Course: CA Foundation & Institute Courses 2026',
      description:
        'Foundation courses in 2026: CA Foundation eligibility, exam dates and fee from ICAI, plus short hotel management and design foundation courses and next steps.',
      keywords: ['foundation course', 'CA Foundation', 'CA Foundation eligibility', 'foundation course after 12th', 'hotel management foundation course', 'interior design foundation course'],
      intro:
        'A foundation course is a first step, not a degree. Learn how CA Foundation works under ICAI rules, what institute-run foundation courses in hospitality and design cover, what they cost and what to study next.',
      crossLink: {
        href: '/courses/hotel-management-diploma',
        anchor: 'Read the hotel management diploma guide',
        note: 'Ready for a full qualification? A hotel management diploma is a common next step after a hospitality foundation course.'
      },
      faqs: [
        { question: 'What is a foundation course?', answer: 'It is an entry-level course that prepares you for a longer professional qualification or a field of work. Examples are ICAI\'s CA Foundation and short institute courses in hotel management or interior design. It is not a degree.' },
        { question: 'Can I register for CA Foundation after Class 10?', answer: 'Yes, provisionally. ICAI allows registration after passing Class 10, but you can take the Foundation exam only after appearing in Class 12 and completing four months of registered study.' },
        { question: 'How many times a year is the CA Foundation exam held?', answer: 'Three times a year, in January, May and September, according to ICAI.' },
        { question: 'What is the passing criteria for CA Foundation?', answer: 'ICAI requires at least 40% in each paper and 50% in aggregate in one sitting. Papers 3 and 4 are objective and carry 0.25 negative marking per wrong answer.' },
        { question: 'What is the CA Foundation registration fee?', answer: 'ICAI\'s FAQs give the Foundation registration fee as Rs 9,000, including the prospectus and study material. The exam fee is separate. Confirm the current fee on the ICAI portal.' },
        { question: 'Does ICSI still have a CS Foundation course?', answer: 'No. ICSI replaced the CS Foundation Programme with the CS Executive Entrance Test (CSEET).' },
        { question: 'Is a hotel management foundation course enough to get a job?', answer: 'It can help with entry-level roles, but many employers prefer a diploma or degree for supervisory jobs. Ask the institute where its recent students went, and consider a hotel management diploma or BHM next.' }
      ]
    };
  }
  if (slug === 'pg-diploma-labour-laws') {
    return {
      displayName: 'PG Diploma in Labour Laws and Labour Welfare',
      h1: 'PG Diploma in Labour Laws: Eligibility, Admission, Syllabus, Fees and Scope 2026',
      title: 'PG Diploma in Labour Laws 2026: Eligibility, Syllabus & Scope',
      description:
        'PG Diploma in Labour Laws and Labour Welfare for 2026: eligibility, admission, syllabus under the four Labour Codes, fees, colleges and careers.',
      keywords: ['PG Diploma in Labour Laws', 'PGDLL', 'PG Diploma in Labour Law and Labour Welfare', 'labour law diploma eligibility', 'labour law diploma syllabus', 'labour codes course'],
      intro:
        'A one-year postgraduate diploma for graduates of any stream who work with wages, payroll, compliance and industrial relations. See eligibility, admission, how the four Labour Codes change the syllabus, fees, colleges and careers.',
      crossLink: {
        href: '/courses/law',
        anchor: 'Read the LLB guide',
        note: 'Want to practise as a lawyer? This diploma does not qualify you; you need an LLB.'
      },
      faqs: [
        { question: 'What is a PG Diploma in Labour Laws?', answer: 'It is a one-year postgraduate diploma, usually run by a university law faculty, covering industrial relations, wages, social security, working conditions and labour welfare.' },
        { question: 'Who is eligible for a PG Diploma in Labour Laws?', answer: 'Usually any graduate. Published minimums vary: MSU Baroda asks for 40% at graduation, Rabindranath Tagore University 45% (40% for SC/ST), and Parul University 50%.' },
        { question: 'Is there an entrance exam?', answer: 'There is no national entrance exam. Most universities admit on graduation marks; a few hold their own test or interview. CLAT PG is not needed.' },
        { question: 'Does the syllabus cover the new Labour Codes?', answer: 'It should. The four Labour Codes took effect on 21 November 2025 and central rules were notified on 8 May 2026. Check that your university has updated its syllabus.' },
        { question: 'What is the fee for a PG Diploma in Labour Laws?', answer: 'Our listings have no fee records for this course. As an example, Parul University lists Rs 30,000 for its one-year programme. Most universities publish fees in the prospectus.' },
        { question: 'Can I practise law after this diploma?', answer: 'No. To enrol as an advocate you need an LLB. The diploma adds depth for HR, compliance and industrial relations work, or for lawyers who already hold an LLB.' },
        { question: 'What can I do after the diploma?', answer: 'Common routes are HR and industrial relations roles, statutory compliance and payroll, labour welfare posts where rules allow, and consulting. For further study, consider an LLB, an MBA in HR or an MSW.' }
      ]
    };
  }
  if (slug === 'vocational-diploma') {
    return {
      displayName: 'Vocational Diploma',
      h1: 'Vocational Diploma Courses: Eligibility, Admission, Trades, Fees and Scope 2026',
      title: 'Vocational Diploma 2026: Eligibility, Trades, Fees & Scope',
      description:
        'Vocational diploma courses for 2026: UGC skill-scheme exits, eligibility, admission, trades, approximate fees, colleges and the path to a B.Voc.',
      keywords: ['vocational diploma', 'vocational diploma course', 'diploma in vocational studies', 'UGC vocational diploma', 'vocational diploma after 12th', 'skill diploma NSQF'],
      intro:
        'A short, practical qualification in one trade. Learn how UGC skill-scheme diplomas differ from stand-alone certificates, who can apply, what you study, fees, colleges and how a diploma leads to a B.Voc.',
      crossLink: {
        href: '/courses/bvoc',
        anchor: 'Read the B.Voc guide',
        note: 'Want a full degree in your trade? A one-year diploma can lead into the second year of a B.Voc.'
      },
      faqs: [
        { question: 'What is a vocational diploma?', answer: 'A skill-based qualification in one trade. Under UGC\'s skill-based scheme, a one-year diploma is an exit award on the way to a B.Voc; colleges also run stand-alone trade certificates and diplomas.' },
        { question: 'What is the eligibility for a vocational diploma?', answer: 'For UGC-scheme programmes, Class 12 pass or equivalent from a recognised board, with no age bar. Stand-alone certificates set their own rules and some accept Class 10.' },
        { question: 'How long is a vocational diploma?', answer: 'Under the UGC scheme: certificate after 6 months, diploma after 1 year and advanced diploma after 2 years, based on credits earned.' },
        { question: 'Can I join a B.Voc after a vocational diploma?', answer: 'Under UGC guidelines, a one-year diploma allows entry to the second year of a B.Voc and a two-year advanced diploma to the third year, in the same trade, subject to university rules.' },
        { question: 'What is the fee for a vocational diploma?', answer: 'Data is thin. The one institution with a tuition record in our listings, MKM Group of Colleges for Girls, Faridabad, shows about Rs 6,000 a year. Confirm with the college.' },
        { question: 'Is there an entrance exam?', answer: 'No national exam. Colleges admit on Class 10 or 12 marks, sometimes with a short interview or aptitude check.' }
      ]
    };
  }
  if (slug === 'diploma-library-science') {
    return {
      displayName: 'Diploma in Library Science (D.Lib / DLIS)',
      h1: 'Diploma in Library Science: Eligibility, Admission, Syllabus, Fees and Scope 2026',
      title: 'Diploma in Library Science 2026: Eligibility, Syllabus & Jobs',
      description:
        'Diploma in Library Science (D.Lib / DLIS) for 2026: eligibility after Class 12, admission, syllabus, colleges, careers and the path to B.Lib.I.Sc.',
      keywords: ['Diploma in Library Science', 'D.Lib', 'DLIS', 'DLISc', 'library science diploma after 12th', 'library science diploma syllabus', 'library assistant course'],
      intro:
        'A one-year diploma after Class 12 that teaches classification, cataloguing, library management and library software. See eligibility, admission, syllabus, colleges, careers and how it leads to the B.Lib.I.Sc.',
      crossLink: {
        href: '/courses/b-lib',
        anchor: 'Read the B.Lib guide',
        note: 'Already a graduate? The one-year B.Lib.I.Sc is the qualification most professional librarian posts ask for.'
      },
      faqs: [
        { question: 'What is the full form of D.Lib?', answer: 'D.Lib stands for Diploma in Library Science. Many universities call it DLIS or DLISc, Diploma in Library and Information Science.' },
        { question: 'What is the eligibility for a Diploma in Library Science?', answer: 'Class 12 in any stream. Minimum marks vary: Nirwan University asks only for 10+2, MLSU Udaipur 40%, and Guru Kashi and Desh Bhagat universities 45% (with relaxation for reserved categories).' },
        { question: 'How long is the course?', answer: 'One year, either annual or in two semesters, usually with an internship or library visit.' },
        { question: 'Can I do a B.Lib.I.Sc after the diploma?', answer: 'Not directly. The B.Lib.I.Sc needs a bachelor\'s degree in any subject, so you first complete graduation.' },
        { question: 'What jobs can I get after a library science diploma?', answer: 'Library assistant or attendant, documentation assistant, record keeper or archive assistant and cataloguing roles. Government posts list their own qualifications, so check each notification.' },
        { question: 'What is the fee?', answer: 'Our listings have no fee record for this course. Universities publish the fee in their prospectus each session; confirm whether exam and registration charges are extra.' }
      ]
    };
  }
  if (slug === 'diploma-science') {
    return {
      displayName: 'Diploma in Science (Paramedical)',
      h1: 'Diploma in Science (Paramedical): Eligibility, Admission, Streams, Fees and Scope 2026',
      title: 'Diploma in Science 2026: Paramedical Eligibility & Scope',
      description:
        'Diploma in Science on CollegeDecision means paramedical science diplomas. 2026 guide to eligibility, NCAHP rules, streams, colleges and careers.',
      keywords: ['Diploma in Science', 'diploma in paramedical science', 'paramedical diploma after 12th', 'paramedical diploma eligibility', 'NCAHP diploma', 'allied health diploma'],
      intro:
        '"Diploma in Science" is a broad label; the programmes listed under it here are Diplomas in Paramedical Science. See eligibility, NCAHP regulation, streams such as lab, imaging and dialysis, colleges and careers.',
      crossLink: {
        href: '/courses/healthcare',
        anchor: 'Read the allied health courses guide',
        note: 'Looking for a degree in an allied health field? Compare paramedical diplomas with UG allied health courses.'
      },
      faqs: [
        { question: 'What is a Diploma in Science?', answer: 'It is not a single fixed course. On CollegeDecision, the programmes listed under it are Diplomas in Paramedical Science, which train technicians for hospitals and labs.' },
        { question: 'Who regulates paramedical diplomas?', answer: 'The National Commission for Allied and Healthcare Professions (NCAHP), set up under the NCAHP Act, 2021, which covers 57 professions in 10 categories.' },
        { question: 'What is the eligibility for a paramedical science diploma?', answer: 'Usually Class 12, preferably with science. Assam down town University also describes a three-year route after Class 10 with a one-year bridging course; its notices differ, so confirm with the university.' },
        { question: 'How long is the course?', answer: 'Two or three years at the institutions in our listings. The NCAHP Act sets at least 2,000 hours over two to four years for allied health diplomas.' },
        { question: 'Is NEET required for a paramedical diploma?', answer: 'Not normally for diploma-level allied health courses, but some states and institutions set their own rules, so read the admission notice.' },
        { question: 'What can I do after a paramedical diploma?', answer: 'Technician roles in hospitals, diagnostic labs, imaging centres and dialysis units, or a bachelor\'s degree in the same allied field such as BMLT.' },
        { question: 'Can I study a paramedical diploma online?', answer: 'Be cautious. Allied health training depends on supervised practical work, and NCAHP and UGC have issued letters on online and distance allied health courses. Check NCAHP notices first.' }
      ]
    };
  }
  if (slug === 'diploma-dental') {
    return {
      displayName: 'Diploma in Dental (Dental Hygiene and Dental Mechanics)',
      h1: 'Diploma in Dental: Hygienist and Dental Mechanic Courses, Eligibility, Fees 2026',
      title: 'Diploma in Dental 2026: Hygienist & Mechanic Course Guide',
      description:
        'Diploma in Dental 2026: dental hygienist and dental mechanic courses, 10+2 PCB eligibility, admission, syllabus, fees, colleges and the new National Dental Commission.',
      keywords: ['diploma in dental', 'dental hygienist course', 'dental mechanic course', 'diploma in dental hygiene', 'diploma in dental mechanics', 'dental diploma after 12th', 'dental technician course'],
      intro:
        'A Diploma in Dental usually means a two-year dental hygienist or dental mechanic course run by a dental college after Class 12 with PCB. See eligibility, admission, syllabus, fees, colleges and how the 2026 move to the National Dental Commission affects you.',
      crossLink: {
        href: '/courses/dental',
        anchor: 'Read the BDS course guide',
        note: 'Want to become a dentist? Only a BDS degree, through NEET UG, lets you treat patients independently.'
      },
      faqs: [
        { question: 'What is a Diploma in Dental?', answer: 'It usually refers to one of two two-year courses run by dental colleges: the Diploma in Dental Hygiene, which trains dental hygienists, and the Diploma in Dental Mechanics, which trains dental technicians who make dentures and appliances.' },
        { question: 'What is the eligibility for a dental hygienist or dental mechanic diploma?', answer: 'Under the Dental Council of India\'s 2008 course regulations, you need 10+2 or equivalent with Physics, Chemistry and Biology, must be at least 17 at admission or within three months of it, and must be medically fit. Colleges may set a minimum percentage, such as 50% at Government Dental College, Srinagar.' },
        { question: 'How long is the dental diploma course?', answer: 'Both the dental hygiene and dental mechanics diplomas run for two academic years of full-time study in a dental college, with an examination at the end of each year.' },
        { question: 'Is NEET required for a dental diploma?', answer: 'Generally no. NEET UG is the exam for BDS. Most colleges admit diploma students on Class 12 marks, and some government colleges use a state admission body. Check your state\'s notice each year.' },
        { question: 'Can a dental hygienist or dental mechanic treat patients independently?', answer: 'No. A dental hygienist works under the supervision of a registered dental surgeon, and a dental mechanic does laboratory work only, with no chair-side work. Opening a dental practice needs a BDS degree.' },
        { question: 'Who regulates dental diplomas now?', answer: 'The National Dental Commission replaced the Dental Council of India on 19 March 2026, and the Dentists Act, 1948 was repealed. Ask the college how the diploma is recognised under the new framework before you enrol.' },
        { question: 'What is the fee for a Diploma in Dental?', answer: 'We have very little fee data. The only listed records on CollegeDecision are from People\'s University, Bhopal: about Rs 75,000 a year for the hygienist diploma and Rs 2,20,000 for the mechanic diploma. These are approximate, so confirm with each college.' }
      ]
    };
  }

  if (slug === 'masters-entrepreneurship-family-business') {
    return {
      displayName: 'Masters in Entrepreneurship and Family Business',
      h1: 'Masters in Entrepreneurship and Family Business: MBA Eligibility, Admission, Fees 2026',
      title: 'Entrepreneurship & Family Business MBA 2026: Fees, Admission',
      description:
        'Masters in Entrepreneurship and Family Business 2026: MBA and PGDM eligibility, entrance tests, Nirma and ISB examples, syllabus, approximate fees, colleges and careers.',
      keywords: ['MBA family business', 'masters in entrepreneurship and family business', 'MBA entrepreneurship and family business', 'family business management course', 'PGDM family business', 'ISB PGP MFAB', 'Nirma MBA FBE'],
      intro:
        'A master\'s in entrepreneurship and family business is an MBA or PGDM for people who plan to run, grow or take over a business. See eligibility, entrance tests, the Nirma and ISB examples, syllabus, fees and career routes.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'See all MBA / PGDM programmes',
        note: 'Family business programmes are listed as MBA and PGDM specialisations on CollegeDecision.'
      },
      faqs: [
        { question: 'What is a Masters in Entrepreneurship and Family Business?', answer: 'In India it is usually an MBA or PGDM with a specialisation in entrepreneurship and family business. It covers the management core plus new ventures, family governance, succession and growth strategy.' },
        { question: 'What is the eligibility for an MBA in Family Business and Entrepreneurship?', answer: 'Usually a bachelor\'s degree in any discipline. Nirma University\'s MBA (FBE), for example, asks for a three-year bachelor\'s degree with at least 50% aggregate marks or equivalent CGPA.' },
        { question: 'Do I need to belong to a business family?', answer: 'Not for most MBA specialisations. Nirma gives 5 extra points to candidates from business families but does not require it. ISB\'s PGP in Management for Family Business does require applicants to be members of a family business who intend to carry it forward.' },
        { question: 'Which entrance exams are accepted?', answer: 'Most programmes accept CAT, XAT, CMAT or MAT. Nirma runs its own entrance test for the MBA (FBE), and ISB\'s family business programme uses the Business Admissions Test (BAT).' },
        { question: 'How is the Nirma MBA (FBE) merit list made?', answer: 'Nirma\'s 2026 process weighted the entrance test at 60%, personal interview at 20%, theme development and presentation at 10% and past academic performance at 10%.' },
        { question: 'How long is the programme?', answer: 'Most MBA and PGDM programmes are two years full-time. ISB\'s PGP MFAB is a 15-month modular programme with one week on campus every four to six weeks.' },
        { question: 'What is the fee?', answer: 'Approximate first-year fees listed on CollegeDecision for 28 institutes have a median of about Rs 3 lakh, with most between about Rs 1.7 lakh and Rs 5.2 lakh. Confirm current fees with each institute.' }
      ]
    };
  }

  if (slug === 'rural-management') {
    return {
      displayName: 'Rural Management (MBA / PGDM-RM)',
      h1: 'Rural Management Course: MBA and PGDM-RM Eligibility, Exams, Fees and Careers 2026',
      title: 'Rural Management Course 2026: MBA/PGDM-RM, Exams & Fees',
      description:
        'Rural management course guide 2026: MBA and PGDM-RM eligibility, CAT, XAT and CMAT, IRMA admission process, syllabus, approximate fees, colleges and careers.',
      keywords: ['rural management', 'MBA rural management', 'PGDM rural management', 'PGDM-RM', 'IRMA admission 2026', 'rural management colleges', 'rural management course fees'],
      intro:
        'Rural management is an MBA or PGDM specialisation for managing cooperatives, development organisations, rural finance and agri-business. See eligibility, CAT, XAT and CMAT routes, the IRMA process, syllabus, fees and careers.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'See all MBA / PGDM programmes',
        note: 'Rural management programmes are listed under MBA / PGDM on CollegeDecision.'
      },
      faqs: [
        { question: 'What is rural management?', answer: 'Rural management is a branch of management education focused on organisations that work in rural areas, such as cooperatives, producer organisations, microfinance institutions, NGOs, CSR foundations and agri-businesses. In India it is usually studied as an MBA or PGDM specialisation.' },
        { question: 'What is the eligibility for an MBA or PGDM in rural management?', answer: 'A bachelor\'s degree in any discipline. At IRMA, for the 2026 cycle, the minimum was 50% at graduation (45% for SC, ST, OBC (NC), EWS and PwD candidates) with at least 15 years of education.' },
        { question: 'Which entrance exams are accepted for rural management?', answer: 'Most institutes accept CAT, XAT, CMAT or MAT. IRMA shortlists on CAT, XAT or CMAT scores and then holds a written ability test and a personal interview.' },
        { question: 'How long is a rural management course?', answer: 'The MBA or PGDM in rural management is usually two years full-time. Some institutes also offer one-year diplomas, executive programmes and doctoral fellow programmes.' },
        { question: 'What is the fee for rural management?', answer: 'Approximate first-year fees listed on CollegeDecision for 16 institutes have a median of about Rs 1.1 lakh, ranging from about Rs 26,000 to Rs 6.8 lakh. Confirm the current fee with each institute.' },
        { question: 'Is field work part of a rural management programme?', answer: 'Yes, at most institutes. Programmes usually include village stays or placements with rural organisations, and these are a key part of the learning.' },
        { question: 'What jobs can I get after rural management?', answer: 'Common routes include cooperatives and producer organisations, NGOs and CSR foundations, government livelihood programmes, microfinance and rural banking, agri-business and rural marketing, and research or evaluation work.' }
      ]
    };
  }

  if (slug === 'online-ma-jmc') {
    return {
      displayName: 'Online MA JMC (Journalism and Mass Communication)',
      h1: 'Online MA JMC: Eligibility, UGC Approval, Syllabus, Admission and Careers 2026',
      title: 'Online MA JMC 2026: UGC Approval, Eligibility & Syllabus',
      description:
        'Online MA JMC 2026: eligibility, how to check UGC-DEB entitlement, admission, syllabus, fees to confirm, universities on the UGC list and career routes in media.',
      keywords: ['online MA JMC', 'online MA journalism and mass communication', 'MA JMC online UGC approved', 'online MA mass communication', 'online MAJMC eligibility', 'online MA JMC syllabus'],
      intro:
        'An online MA JMC is a two-year media master\'s you study online from a UGC-entitled university. See who can apply, how to check UGC-DEB approval, admission steps, syllabus, what fees to confirm and where it can lead.',
      crossLink: {
        href: '/courses/mass-communication-pg',
        anchor: 'Read the mass communication PG guide',
        note: 'Prefer a campus programme with studios and newsroom training? Compare regular MA and MJMC options.'
      },
      faqs: [
        { question: 'Is an online MA JMC valid?', answer: 'Yes, if it is awarded by a university that UGC has entitled or recognised to offer that programme online in your academic session. Under UGC\'s 2020 regulations, such online degrees are treated as equivalent to conventional degrees. Check the list on deb.ugc.ac.in.' },
        { question: 'Who is eligible for an online MA JMC?', answer: 'Graduates in any discipline from a recognised university can usually apply. Each university sets its own minimum marks, so check the prospectus.' },
        { question: 'Is there an entrance exam for an online MA JMC?', answer: 'Usually not. Most universities admit on graduation marks, though some hold a short eligibility test or interview. CUET PG is generally used for campus programmes, not online ones.' },
        { question: 'How long is an online MA JMC?', answer: 'Two years, usually split into four semesters. Durations follow UGC\'s Specification of Degrees.' },
        { question: 'How do I check whether a university can offer an online MA JMC?', answer: 'Open the UGC Distance Education Bureau website, find the entitled or recognised list for the current academic year, and confirm that both the university and the MA (Journalism and Mass Communication) programme appear.' },
        { question: 'Can an edtech company award an online MA JMC?', answer: 'No. The degree must be awarded by the university. UGC and AICTE have warned that online degrees cannot be offered through franchise arrangements with edtech companies, though a university may use a platform to deliver its course.' },
        { question: 'Can I do a PhD or UGC NET after an online MA JMC?', answer: 'A master\'s from a UGC-entitled university lets you apply for a PhD under that university\'s rules. UGC NET has a Mass Communication and Journalism subject, which is needed for assistant professor posts.' }
      ]
    };
  }

  if (slug === 'm-s') {
    return {
      displayName: 'M.S (Master of Surgery)',
      h1: 'M.S Course (Master of Surgery): Eligibility, NEET-PG, Fees 2026',
      title: 'M.S Course (Master of Surgery): Eligibility, NEET-PG & Fees 2026',
      description:
        'M.S here means Master of Surgery, a 3-year NMC-regulated PG medical degree. See eligibility, NEET-PG admission, specialities, fees and careers.',
      keywords: ['M.S course', 'MS full form', 'Master of Surgery', 'MS eligibility', 'MS admission 2026', 'NEET PG MS', 'MS specialities', 'MS vs MD'],
      intro:
        'M.S on CollegeDecision usually means Master of Surgery, the three-year PG degree for MBBS doctors. Check NMC eligibility, NEET-PG counselling, specialities, listed fees and career routes.',
      crossLink: {
        href: '/courses/master-of-surgery',
        anchor: 'Read the Master of Surgery guide',
        note: 'Same degree, separate page. Compare surgical PG programmes there.'
      },
      faqs: [
        { question: 'What is the full form of M.S?', answer: 'In medicine, M.S stands for Master of Surgery, a postgraduate broad-speciality degree for MBBS graduates. Some technical institutes also use M.S. for a Master of Science by research.' },
        { question: 'How long is the M.S course?', answer: 'Under NMC\'s PGMER-2023, an MS takes three years including the examination period, or two years for students who already hold a recognised two-year PG diploma in the same subject.' },
        { question: 'Who is eligible for M.S (Master of Surgery)?', answer: 'You need a recognised MBBS degree, medical registration and a completed internship by the cut-off date in the NBEMS bulletin, and you must qualify NEET-PG.' },
        { question: 'Is NEET-PG compulsory for M.S admission?', answer: 'Yes, for now. PGMER-2023 says NEET-PG continues until the National Exit Test (NExT) replaces it. Institutes such as AIIMS admit through INI-CET instead.' },
        { question: 'Can a college admit M.S students directly?', answer: 'No. NMC rules require all PG medical admissions to go through government counselling based on NEET-PG merit. Students admitted otherwise can be discharged.' },
        { question: 'What are the main M.S specialities?', answer: 'General Surgery, Orthopaedics, Ophthalmology, ENT, Obstetrics and Gynaecology and Anatomy are the MS subjects most often listed on CollegeDecision.' },
        { question: 'What is the fee for M.S?', answer: 'Fees vary hugely. Approximate listed figures on CollegeDecision range from about Rs 4,000 a year at a public university to over Rs 30 lakh a year at a deemed university. Check the official seat matrix for your seat.' },
        { question: 'What can I study after M.S?', answer: 'The main option is a three-year M.Ch super-speciality degree through NEET-SS. Fellowships, post-doctoral certificate courses and a PhD are other routes.' }
      ]
    };
  }
  if (slug === 'medical-diploma') {
    return {
      displayName: 'Medical Diploma (Allied Health Diplomas)',
      h1: 'Medical Diploma Courses: Eligibility, Admission, Fees and Scope 2026',
      title: 'Medical Diploma Courses: Eligibility, Fees & Scope 2026',
      description:
        'Medical diploma courses after Class 12 in 2026: DMLT, radiology, ophthalmic and other allied health diplomas, NCAHP rules, eligibility, fees and careers.',
      keywords: ['medical diploma courses', 'medical diploma after 12th', 'paramedical diploma', 'DMLT course', 'allied health diploma', 'NCAHP diploma curriculum', 'medical diploma fees', 'diploma in radiology technology'],
      intro:
        '"Medical diploma" usually means an allied health diploma after Class 12, such as DMLT, radiology and imaging or ophthalmic assistant. Check NCAHP rules, eligibility, admission, fees and where each diploma can lead.',
      crossLink: {
        href: '/courses/bmlt',
        anchor: 'Read the BMLT course guide',
        note: 'Thinking beyond a diploma? A lab technology degree gives more room to grow, and DMLT holders may get lateral entry.'
      },
      faqs: [
        { question: 'What is a medical diploma course?', answer: 'On CollegeDecision it is a label for allied health diplomas after Class 12, such as DMLT, radiology and imaging technology, ophthalmic assistant, operation theatre and dialysis technology. It is not an MBBS-level qualification.' },
        { question: 'Who regulates medical diploma courses?', answer: 'Allied and healthcare professions come under the National Commission for Allied and Healthcare Professions (NCAHP), set up under the NCAHP Act, 2021. Nursing, pharmacy and dental diplomas have their own councils: INC, PCI and DCI.' },
        { question: 'What is the eligibility for DMLT?', answer: 'NCAHP\'s DMLT curriculum asks for Class 12 (10+2) with Physics, Chemistry and Biology from a recognised board and a minimum age of 17. The course lasts two years.' },
        { question: 'Is NEET required for a medical diploma?', answer: 'Usually not. NCAHP\'s curricula for DMLT, radiology and imaging, and ophthalmic assistant describe selection on Class 12 merit. Some states or universities may hold their own test, so check the official notice.' },
        { question: 'What is the fee for a medical diploma?', answer: 'Approximate annual tuition at private institutes listed on CollegeDecision has a median of about Rs 50,000 (19 records). Government colleges often charge less, but few publish fees. Confirm the full course cost with the college.' },
        { question: 'Can I do a degree after DMLT?', answer: 'Yes. NCAHP\'s medical laboratory science curriculum allows DMLT holders from recognised institutions to join the second year of BMLS through lateral entry, limited to 10% of sanctioned seats and given on merit.' },
        { question: 'Is the radiology diploma being phased out?', answer: 'NCAHP\'s Diploma in Medical Radiology and Imaging Technology curriculum recommends phasing out the diploma within three to five years, by about 2030, to promote bachelor\'s and master\'s programmes.' }
      ]
    };
  }

  if (slug === 'mth') {
    return {
      displayName: 'M.Th (Master of Theology)',
      h1: 'M.Th Course (Master of Theology): Eligibility, Admission 2026',
      title: 'M.Th Course (Master of Theology): Eligibility & Admission 2026',
      description:
        'M.Th is the Master of Theology, a 2-year degree after a BD or M.Div. See Serampore eligibility, admission tests, branches, costs and careers.',
      keywords: ['M.Th course', 'M.Th full form', 'Master of Theology', 'M.Th eligibility', 'M.Th admission 2026', 'Serampore M.Th', 'M.Th branches', 'BD to M.Th'],
      intro:
        'M.Th is the Master of Theology, a two-year degree for BD or M.Div graduates, mostly awarded under the Senate of Serampore College. Check eligibility, admission tests, branches and careers.',
      crossLink: {
        href: '/courses/ma',
        anchor: 'Read the MA course guide',
        note: 'No M.Th programmes are listed yet. Compare MA options in religion, philosophy and history.'
      },
      faqs: [
        { question: 'What is the full form of M.Th?', answer: 'M.Th stands for Master of Theology, a postgraduate degree in Christian theology and related subjects.' },
        { question: 'How long is the M.Th course?', answer: 'Usually two years. Serampore College describes its M.Th as a two-year residential course that can be extended up to four years.' },
        { question: 'Who is eligible for M.Th?', answer: 'Most colleges ask for a Senate of Serampore BD with at least a B grade, or an M.Div, plus required papers in the chosen branch. Exact rules differ by college.' },
        { question: 'Is there an entrance exam for M.Th?', answer: 'There is no national test. Colleges hold their own written test and interview; Trinity Theological College, for example, also tests English.' },
        { question: 'Can I do M.Th after a BA?', answer: 'Not directly. The M.Th builds on a first theology degree such as a BD or M.Div. If you want religion at master\'s level after a BA, consider an MA in Religious Studies or Philosophy.' },
        { question: 'What are the main M.Th branches?', answer: 'Official college pages list Old Testament, New Testament, Christian Theology, History of Christianity, Religions, Missiology, Pastoral Care and Counselling, and Christian Education.' },
        { question: 'What can I do after M.Th?', answer: 'Graduates often teach in theological colleges, serve in church ministry or counselling, or go on to a D.Th or PhD in theology.' }
      ]
    };
  }
  if (slug === 'mpa') {
    return {
      displayName: 'M.P.A (Master of Performing Arts)',
      h1: 'M.P.A Course (Master of Performing Arts): Eligibility, Admission, Syllabus and Scope 2026',
      title: 'MPA Course (Performing Arts): Eligibility, Admission 2026',
      description:
        'M.P.A (Master of Performing Arts) course details for 2026: eligibility, auditions and CUET PG, syllabus, music and dance specialisations, fees and careers.',
      keywords: ['MPA course', 'Master of Performing Arts', 'MPA course details', 'MPA eligibility', 'MPA admission 2026', 'MPA in Kathak', 'MPA in music', 'MPA syllabus'],
      intro:
        'On CollegeDecision, M.P.A means the Master of Performing Arts, a two-year master\'s in music, dance or theatre. Check eligibility, auditions, specialisations, costs and where it can lead.',
      crossLink: {
        href: '/courses/mfa',
        anchor: 'See performing arts programmes under the MFA guide',
        note: 'Many Master of Performing Arts programmes are listed under our MFA course, so check both.'
      },
      faqs: [
        { question: 'What is the full form of M.P.A here?', answer: 'On CollegeDecision, M.P.A stands for Master of Performing Arts. UGC\'s 2014 Specification of Degrees lists MPA as Master of Performing Arts. It is different from the Master of Public Administration.' },
        { question: 'What is the duration of an MPA?', answer: 'Most Master of Performing Arts programmes in India run for two years, split into four semesters. Check the duration in the university\'s prospectus.' },
        { question: 'Who is eligible for an MPA?', answer: 'Usually a graduate with a BPA, or a BA with music, dance or theatre, in the same art form. Each university sets its own marks rule and practical test.' },
        { question: 'Is there an entrance exam for MPA?', answer: 'Most universities hold an audition, practical test or interview. Some central universities that take part in CUET PG use it for performing arts master\'s programmes.' },
        { question: 'Which specialisations are offered in MPA?', answer: 'Common fields include vocal music, Tabla and other instruments, Kathak and other classical dance forms, and theatre. Programmes linked to M.P.A on CollegeDecision include Kathak, Tabla and vocal music.' },
        { question: 'What is the fee for an MPA?', answer: 'CollegeDecision does not yet list fees for programmes under this course, so ask each college for the full two-year cost, including exam, instrument and hostel charges.' },
        { question: 'Can I teach in a college after an MPA?', answer: 'An MPA is a relevant master\'s degree, but UGC rules for assistant professor posts also require NET, SLET/SET or a PhD. UGC NET has subjects for Music and Performing Arts.' }
      ]
    };
  }
  if (slug === 'mped') {
    return {
      displayName: 'M.P.Ed (Master of Physical Education)',
      h1: 'M.P.Ed Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'M.P.Ed Course: Eligibility, Admission, Fees & Syllabus 2026',
      description:
        'M.P.Ed course details for 2026: NCTE eligibility (B.P.Ed with 50%), entrance and fitness tests, syllabus, fees, colleges and careers in physical education.',
      keywords: ['M.P.Ed course', 'Master of Physical Education', 'MPEd eligibility', 'M.P.Ed admission 2026', 'M.P.Ed fees', 'M.P.Ed syllabus', 'M.P.Ed after B.P.Ed', 'NCTE M.P.Ed'],
      intro:
        'The M.P.Ed (Master of Physical Education) is a two-year, NCTE-regulated master\'s for B.P.Ed graduates. Check eligibility, entrance and fitness tests, syllabus, fees and careers.',
      crossLink: {
        href: '/courses/bped',
        anchor: 'Read the B.P.Ed course guide',
        note: 'You need a B.P.Ed (or equivalent) before an M.P.Ed. Many M.P.Ed programmes are also listed under our M.Ed course.'
      },
      faqs: [
        { question: 'What is the duration of M.P.Ed?', answer: 'Under the NCTE Regulations, 2014, the M.P.Ed runs for two academic years or four semesters, and students may complete it within a maximum of three years.' },
        { question: 'What is the eligibility for M.P.Ed?', answer: 'NCTE norms require a B.P.Ed or equivalent with at least 50% marks, or a B.Sc in Health and Physical Education with at least 50% marks. Reservation and relaxation follow government rules.' },
        { question: 'Who regulates the M.P.Ed course?', answer: 'The National Council for Teacher Education (NCTE). Its norms and standards for the M.P.Ed are in Appendix 8 of the NCTE Regulations, 2014. Only NCTE-recognised institutions can run the course.' },
        { question: 'Is there an entrance exam for M.P.Ed?', answer: 'Most universities hold a written test and a physical fitness test, and many add marks for sports achievements. Some central universities use CUET PG.' },
        { question: 'Can I do M.P.Ed after a BA with physical education?', answer: 'Usually not on its own. NCTE norms ask for a B.P.Ed or equivalent, or a B.Sc in Health and Physical Education, with at least 50% marks.' },
        { question: 'What is the fee for M.P.Ed?', answer: 'Listed fees on CollegeDecision range from about Rs 2,000 a year in tuition at a state university to about Rs 1 lakh a year in total fees at a private university. They are approximate; confirm with the college.' },
        { question: 'Can I become a college lecturer after M.P.Ed?', answer: 'An M.P.Ed is the relevant master\'s degree, but UGC rules for assistant professor posts also require NET, SLET/SET or a PhD.' }
      ]
    };
  }
  if (slug === 'mplan') {
    return {
      displayName: 'M.Plan (Master of Planning)',
      h1: 'M.Plan Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'M.Plan Course: Eligibility, GATE, Fees & Syllabus 2026',
      description:
        'M.Plan course details for 2026: ITPI eligibility (55%), GATE and admission, syllabus, urban, transport and housing specialisations, fees, colleges and careers.',
      keywords: ['M.Plan course', 'Master of Planning', 'M.Plan eligibility', 'M.Plan admission 2026', 'M.Plan fees', 'M.Plan syllabus', 'M.Plan urban planning', 'M.Plan through GATE'],
      intro:
        'The M.Plan (Master of Planning) is a two-year professional master\'s in urban, regional, transport and housing planning. Check ITPI eligibility, GATE and admission, fees and careers.',
      crossLink: {
        href: '/courses/march',
        anchor: 'See more planning programmes under the M.Arch guide',
        note: 'Many Master of Planning programmes on CollegeDecision are listed under our M.Arch course, so check both.'
      },
      faqs: [
        { question: 'What is the duration of M.Plan?', answer: 'ITPI\'s norms for planning institutions set the master\'s in planning at two years, or four semesters.' },
        { question: 'Who is eligible for M.Plan?', answer: 'Under ITPI norms, a bachelor\'s degree in planning, civil engineering or architecture, or a master\'s degree in economics, sociology or geography. Candidates need at least 55% aggregate, relaxable for SC and ST as per government rules.' },
        { question: 'Is GATE required for M.Plan?', answer: 'Many public institutes, such as NITs and Schools of Planning and Architecture, use GATE scores from the Architecture and Planning paper. Private universities often run their own test and interview.' },
        { question: 'Who recognises M.Plan programmes?', answer: 'The Institute of Town Planners, India (ITPI) recognises planning programmes for membership and publishes a list of recognised courses. Check it before you apply.' },
        { question: 'Can a civil engineer do M.Plan?', answer: 'Yes. A bachelor\'s degree in civil engineering is one of the qualifications listed in ITPI\'s norms, subject to the marks rule and each institute\'s conditions.' },
        { question: 'What is the fee for M.Plan?', answer: 'Listed annual fees on CollegeDecision range from about Rs 57,500 to Rs 3 lakh, depending on the institute. They are approximate; confirm with the institute.' },
        { question: 'What are the main M.Plan specialisations?', answer: 'Urban planning and urban and regional planning are the most common. Others include transport planning, housing, environmental planning and infrastructure planning.' }
      ]
    };
  }
  if (slug === 'mmlt') {
    return {
      displayName: 'M.M.L.T (Master of Medical Laboratory Technology)',
      h1: 'M.M.L.T Course: Eligibility, Admission, Fees, Syllabus and Scope 2026',
      title: 'M.M.L.T Course 2026: Eligibility, Admission, Fees & Syllabus',
      description:
        'M.M.L.T course details for 2026: BMLT eligibility, entrance tests, the new UGC M.MLS name, syllabus, specialisations, approximate fees, colleges and careers.',
      keywords: ['MMLT course', 'M.M.L.T', 'Master of Medical Laboratory Technology', 'MMLT eligibility', 'MMLT admission 2026', 'MMLT fees', 'M.MLS course', 'M.Sc MLT'],
      intro:
        'M.M.L.T (Master of Medical Laboratory Technology) is a two-year master\'s for medical lab graduates, now listed by UGC as M.MLS. Check eligibility, entrance tests, specialisations, fees and realistic careers.',
      crossLink: {
        href: '/courses/healthcare-pg',
        anchor: 'Read the PG healthcare courses guide',
        note: 'Comparing allied health master\'s degrees? The PG healthcare guide covers M.MLS, M.OT, MPH and more.'
      },
      faqs: [
        { question: 'What is the full form of M.M.L.T?', answer: 'M.M.L.T stands for Master of Medical Laboratory Technology. UGC\'s 2026 amendment to the Specification of Degrees lists the master\'s degree in this field as Master of Medical Laboratory Science (M.MLS).' },
        { question: 'What is the duration of M.M.L.T?', answer: 'Two years. UGC lists M.MLS as a two-year master\'s degree after a bachelor\'s, and JIPMER\'s M.Sc MLT programmes in microbiology and pathology also run for two years.' },
        { question: 'Who is eligible for M.M.L.T?', answer: 'Usually graduates with a BMLT, B.Sc MLT or B.MLS from a recognised university. VMRF, for example, asks for a pass in B.MLS in regular mode and registration with a State Allied and Healthcare Council for its 2026-27 M.MLS.' },
        { question: 'Is there an entrance exam for M.M.L.T?', answer: 'There is no single national exam. Institutes such as JIPMER and VMRF hold their own entrance tests, while many private universities admit on bachelor\'s marks or an interview.' },
        { question: 'What are the specialisations in M.M.L.T?', answer: 'The 2026 UGC list has four M.MLS specialisations: medical biochemistry, medical microbiology, haematology and transfusion medicine, and histology and cytopathology.' },
        { question: 'What is the fee for M.M.L.T?', answer: 'Six private fee records on CollegeDecision range from about Rs 40,000 to Rs 1,45,000 a year, with a median near Rs 80,000. These are approximate. Confirm the current fee with the college.' },
        { question: 'Who regulates medical laboratory professionals in India?', answer: 'Medical laboratory sciences professionals come under the National Commission for Allied and Healthcare Professions (NCAHP) Act, 2021. Degree names are specified by UGC.' }
      ]
    };
  }

  if (slug === 'mfsc') {
    return {
      displayName: 'M.F.Sc (Master of Fisheries Science)',
      h1: 'M.F.Sc Course: Eligibility, ICAR AIEEA PG, Syllabus and Scope 2026',
      title: 'M.F.Sc Course: Eligibility, ICAR Exam, Syllabus & Scope 2026',
      description:
        'M.F.Sc (Master of Fisheries Science) in 2026: B.F.Sc eligibility, ICAR AIEEA PG by NTA, OGPA rules, disciplines like aquaculture, colleges and careers.',
      keywords: ['M.F.Sc course', 'Master of Fisheries Science', 'MFSc eligibility', 'MFSc admission 2026', 'ICAR AIEEA PG fisheries', 'MFSc aquaculture', 'MFSc after BFSc', 'CIFE MFSc'],
      intro:
        'The M.F.Sc (Master of Fisheries Science) is a two-year, research-based master\'s degree after a B.F.Sc. Check ICAR AIEEA (PG) eligibility, the exam pattern, disciplines, colleges and where the degree can lead.',
      crossLink: {
        href: '/courses/msc',
        anchor: 'Read the M.Sc course guide',
        note: 'Hold a B.Sc rather than a B.F.Sc? An M.Sc in fisheries, aquaculture or marine biology is usually the route.'
      },
      faqs: [
        { question: 'What is the full form of M.F.Sc?', answer: 'M.F.Sc stands for Master of Fisheries Science, sometimes written Master of Fishery Science. It is a two-year postgraduate degree in fisheries.' },
        { question: 'Who is eligible for an M.F.Sc?', answer: 'The ICAR AIEEA (PG) 2026 bulletin requires a B.F.Sc for all 12 fisheries disciplines. For ICAR-AU admission the degree must be four years long, with an OGPA of at least 6.60/10 (5.60/10 for SC, ST, PwBD and Third Gender candidates).' },
        { question: 'Which exam is needed for M.F.Sc admission?', answer: 'ICAR AIEEA (PG), conducted by NTA, fills 30% of master\'s seats in agricultural universities and all seats at ICAR deemed universities such as CIFE, Mumbai. State universities fill other seats under their own rules.' },
        { question: 'What is the ICAR AIEEA PG exam pattern?', answer: 'In 2026 it was a computer-based test of 120 multiple-choice questions in 120 minutes, in English only, with 4 marks for a correct answer and 1 mark deducted for a wrong one.' },
        { question: 'Can I do an M.F.Sc after a B.Sc?', answer: 'Not through ICAR AIEEA (PG), where every fisheries discipline asks for a B.F.Sc. B.Sc graduates usually look at an M.Sc in fisheries, aquaculture or marine biology instead.' },
        { question: 'What are the M.F.Sc specialisations?', answer: 'The ICAR 2026 bulletin lists 12, including aquaculture, fisheries resource management, fish processing technology, aquatic animal health management, fish genetics and breeding, fish nutrition and feed technology, and fish biotechnology.' },
        { question: 'What can I do after an M.F.Sc?', answer: 'Common routes include aquaculture and hatchery work, seafood quality roles, state fisheries departments, research projects and a PhD. ASRB\'s NET is the eligibility test for teaching posts in agricultural universities.' }
      ]
    };
  }

  if (slug === 'mva') {
    return {
      displayName: 'M.V.A (Master of Visual Arts)',
      h1: 'M.V.A Course (Master of Visual Arts): Eligibility, Admission, Fees 2026',
      title: 'M.V.A Course: Eligibility, Admission, Fees & MFA Link 2026',
      description:
        'M.V.A is the Master of Visual Arts, a 2-year studio degree close to an MFA. See eligibility, portfolio-based admission, specialisations, fees and careers.',
      keywords: ['MVA course', 'MVA full form', 'Master of Visual Arts', 'MVA eligibility', 'MVA admission 2026', 'MVA vs MFA', 'MVA specialisations', 'MVA fees'],
      intro:
        'M.V.A is the Master of Visual Arts, a two-year studio degree for BVA and BFA graduates, close in content to an MFA. Check eligibility, portfolio-based admission, specialisations, fees and careers.',
      crossLink: {
        href: '/courses/mfa',
        anchor: 'Read the MFA course guide',
        note: 'MVA and MFA cover similar ground. See more colleges and fee data in the MFA guide.'
      },
      faqs: [
        { question: 'What is the full form of M.V.A?', answer: 'M.V.A stands for Master of Visual Arts, a postgraduate degree in painting, sculpture, applied art, printmaking or art history.' },
        { question: 'Is MVA the same as MFA?', answer: 'They are closely related two-year master\'s degrees in art. The name depends on the university: MSU Baroda awards an MVA, while Delhi University and BHU award an MFA.' },
        { question: 'How long is the MVA course?', answer: 'Two years over four semesters at MSU Baroda and Dada Lakhmi Chand State University of Performing and Visual Arts, Rohtak.' },
        { question: 'Who is eligible for MVA?', answer: 'Usually a BVA or BFA in a related subject. DLCSUPVA asks for at least 50%, and MSU Baroda accepts only a four-year (12+4) BVA for its studio MVAs.' },
        { question: 'Is there an entrance exam for MVA?', answer: 'There is no national MVA test. DLCSUPVA admits on the merit of the qualifying exam, while MSU Baroda uses a portfolio, aptitude test and interview.' },
        { question: 'What is the MVA fee?', answer: 'At DLCSUPVA, the 2026-27 prospectus lists about Rs 31,750 for the first semester and Rs 32,250 for each later semester, excluding hostel. Private fees vary, so confirm with each university.' },
        { question: 'What can I do after an MVA?', answer: 'Graduates work in studio practice, art teaching, illustration and design, galleries and museums, or go on to a PhD. College teaching posts need NET or a PhD under UGC rules.' }
      ]
    };
  }
  if (slug === 'moptm') {
    return {
      displayName: 'M.Optm (Master of Optometry)',
      h1: 'M.Optm (Master of Optometry) Course: Eligibility, Admission, Fees and Scope 2026',
      title: 'M.Optm (M.Optom) Course 2026: Eligibility, Fees & Syllabus',
      description:
        'M.Optm (Master of Optometry) course details for 2026: B.Optom eligibility, NCAHP registration, entrance tests, syllabus, specialisations, fees, colleges, careers.',
      keywords: ['M.Optm course', 'M.Optom', 'Master of Optometry', 'M.Optom eligibility', 'M.Optom admission 2026', 'M.Optom fees', 'M.Optom syllabus', 'MSc Optometry'],
      intro:
        'M.Optm, listed by UGC as M.Optom., is the two-year Master of Optometry for B.Optom graduates. Check eligibility, registration rules, entrance tests, specialisations, fees and realistic careers.',
      crossLink: {
        href: '/courses/medical-pg',
        anchor: 'Read the medical PG courses guide',
        note: 'Master in Optometry programmes on CollegeDecision are listed under medical PG courses.'
      },
      faqs: [
        { question: 'What is the full form of M.Optm?', answer: 'M.Optm stands for Master of Optometry. UGC\'s 2026 fifth amendment to the Specification of Degrees lists it with the abbreviation M.Optom.' },
        { question: 'What is the duration of M.Optom?', answer: 'Two years. UGC lists M.Optom. as a two-year master\'s degree after a bachelor\'s degree.' },
        { question: 'Who is eligible for M.Optom?', answer: 'Usually graduates with a B.Optom in regular mode from a recognised university. Several 2026 prospectuses, such as those of VMRF, DPU and Bharati Vidyapeeth, also ask for NCAHP or State Allied and Healthcare Council registration.' },
        { question: 'Is there an entrance exam for M.Optom?', answer: 'There is no national exam. Universities run their own, such as the VMRF all-India entrance test and AIPGOET at Dr. D. Y. Patil Vidyapeeth. Bharati Vidyapeeth uses a test plus a group discussion.' },
        { question: 'What is the fee for M.Optom?', answer: 'Seven private fee records on CollegeDecision have a median of about Rs 1,10,000 a year. VMRF lists Rs 1,00,000 a year for 2026-27. Hostel and other charges are extra, so confirm with the college.' },
        { question: 'Is M.Optom the same as M.Sc Optometry?', answer: 'They cover similar ground, but the degree names differ. UGC\'s listed name is M.Optom., so check the exact degree title and eligibility on each university\'s prospectus.' },
        { question: 'Who regulates optometrists in India?', answer: 'Optometrists are listed under ophthalmic sciences in the National Commission for Allied and Healthcare Professions (NCAHP) Act, 2021.' }
      ]
    };
  }

  if (slug === 'mlt') {
    return {
      displayName: 'M.L.T (Master\'s in Medical Laboratory Technology)',
      h1: 'M.L.T Course: Master\'s in Medical Lab Technology, Eligibility and Fees 2026',
      title: 'M.L.T Course: Master\'s in Medical Lab Technology 2026',
      description:
        'M.L.T at master\'s level in 2026: M.Sc MLT, MMLT and NCAHP\'s MMLS explained, with BMLS eligibility, entrance and interview, specialisations, fees and careers.',
      keywords: ['MLT course', 'M.L.T course', 'M.Sc MLT', 'master of medical laboratory technology', 'MMLS course', 'MLT eligibility', 'MLT admission 2026', 'MLT fees'],
      intro:
        '"M.L.T" here means a two-year master\'s in medical laboratory technology, offered as M.Sc MLT, MMLT or MMLS. Check NCAHP\'s eligibility rules, admission, specialisations, fees and careers.',
      crossLink: {
        href: '/courses/mmlt',
        anchor: 'Read the M.M.L.T course guide',
        note: 'Most colleges list this master\'s as M.Sc MLT or MMLT. Compare current programmes there.'
      },
      faqs: [
        { question: 'What is M.L.T?', answer: 'MLT stands for Medical Laboratory Technology. At master\'s level it is usually offered as M.Sc MLT or MMLT. NCAHP\'s 2025 national curriculum calls it the Master of Medical Laboratory Science (MMLS).' },
        { question: 'Who regulates medical laboratory technology courses?', answer: 'The National Commission for Allied and Healthcare Professions (NCAHP), under the NCAHP Act, 2021. Medical Lab Technologist is listed in the Act\'s Schedule under Medical Laboratory and Life Sciences.' },
        { question: 'What is the eligibility for a master\'s in MLT?', answer: 'NCAHP\'s curriculum asks for a Bachelor of Medical Laboratory Science from a recognised Indian university with at least 50% aggregate. Many universities still accept a B.Sc MLT or BMLT, so check the prospectus.' },
        { question: 'How is admission done?', answer: 'Through a university entrance exam based on the BMLS syllabus, followed by an interview. NCAHP\'s curriculum says no direct admission should be given.' },
        { question: 'How long is the course?', answer: 'Two years (four semesters) in NCAHP\'s curriculum, with 2,240 hours of teaching and training, 86 credits and a dissertation in the final semester.' },
        { question: 'What are the specialisations?', answer: 'NCAHP\'s master\'s curriculum has tracks in medical microbiology, haematology and transfusion medicine, clinical biochemistry, and histopathology and cytology.' },
        { question: 'What is the fee for a master\'s in MLT?', answer: 'Approximate annual tuition at private institutes listed on CollegeDecision has a median of about Rs 75,000 (6 records). Listed total annual fees have a median of about Rs 1,10,000 (5 records). Confirm with each college.' }
      ]
    };
  }

  if (slug === 'mot') {
    return {
      displayName: 'M.O.T (Master of Occupational Therapy)',
      h1: 'M.O.T (Master of Occupational Therapy) Course: Eligibility, Admission, Fees and Scope 2026',
      title: 'M.O.T Course 2026: Eligibility, Admission, Fees & Syllabus',
      description:
        'M.O.T (Master of Occupational Therapy) for 2026: BOT eligibility, PGET and MET tests, UGC M.OT specialisations, syllabus, approximate fees, colleges, careers.',
      keywords: ['MOT course', 'M.O.T', 'Master of Occupational Therapy', 'MOT eligibility', 'MOT admission 2026', 'MOT fees', 'M.OT specialisations', 'MOT after BOT'],
      intro:
        'M.O.T (Master of Occupational Therapy) is a two-year master\'s for BOT graduates, now listed by UGC as eight specialised M.OT degrees. Check eligibility, entrance tests, fees and realistic careers.',
      crossLink: {
        href: '/courses/healthcare-pg',
        anchor: 'Read the PG healthcare courses guide',
        note: 'Comparing M.OT with MPH, MHA and other allied health master\'s degrees? Start with the PG healthcare guide.'
      },
      faqs: [
        { question: 'What is the duration of M.O.T?', answer: 'Two years. UGC\'s 2026 fifth amendment to the Specification of Degrees lists each M.OT specialisation as a two-year master\'s degree after a bachelor\'s.' },
        { question: 'Who is eligible for M.O.T?', answer: 'Occupational therapists with a BOT and a completed internship. SVNIRTAR, for example, asked for a regular, on-campus BOT with 50% marks and internship completed by 4 August 2026.' },
        { question: 'What are the M.OT specialisations notified by UGC?', answer: 'Musculoskeletal Sciences, Paediatrics and Neonatology, Neurosciences, Mental Health, Cardiovascular and Pulmonary Sciences, Rehabilitation, Geriatrics, Hand, and Oncological Sciences. Universities offering an MOT are expected to restructure to these.' },
        { question: 'Which entrance exams are used for M.O.T?', answer: 'There is no single national exam. Institutes run their own, such as SVNIRTAR\'s PGET (100 marks, 90 minutes in 2026) and the Manipal Entrance Test at MAHE.' },
        { question: 'What is the fee for M.O.T?', answer: 'Fee data is limited. Two listings on CollegeDecision show about Rs 1,00,000 to Rs 1,16,000 a year, and MAHE lists Rs 7,40,000 for its two-year M.OT (Hand) for 2026. Confirm with each institute.' },
        { question: 'Who regulates occupational therapists in India?', answer: 'Occupational therapists are listed as an allied and healthcare profession under the National Commission for Allied and Healthcare Professions (NCAHP) Act, 2021.' },
        { question: 'Is M.O.T the same as the PG healthcare course?', answer: 'No. PG healthcare is a broad label for many master\'s degrees and diplomas. M.O.T is one specific clinical master\'s degree for occupational therapists.' }
      ]
    };
  }

  if (slug === 'pgp') {
    return {
      displayName: 'PGP (Post Graduate Programme in Management)',
      h1: 'PGP Course: Eligibility, CAT Admission, Fees, Syllabus and Scope 2026',
      title: 'PGP Course: Eligibility, CAT, Fees & Syllabus 2026',
      description:
        'PGP (Post Graduate Programme) explained for 2026: IIM and ISB eligibility, CAT and GMAT routes, syllabus, specialisations, listed fees, careers and what you are awarded.',
      keywords: ['PGP course', 'PGP full form', 'Post Graduate Programme in Management', 'PGP eligibility', 'PGP admission 2026', 'PGP fees', 'IIM PGP', 'ISB PGP'],
      intro:
        'PGP usually means a business school\'s flagship postgraduate programme in management, such as the two-year PGP at IIM Ahmedabad or ISB\'s one-year PGP. See eligibility, CAT and GMAT routes, syllabus, listed fees and how to check what you will be awarded.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'Read the MBA / PGDM course guide',
        note: 'Most IIM and business-school PGPs are listed under our MBA / PGDM course.'
      },
      faqs: [
        { question: 'What is the full form of PGP?', answer: 'PGP stands for Post Graduate Programme. In management education it usually means Post Graduate Programme in Management, the flagship programme of IIMs and several business schools. The CAT 2026 bulletin groups the IIMs\' flagship courses under this name.' },
        { question: 'Is a PGP the same as an MBA?', answer: 'At the IIMs it is effectively the MBA. The IIM Act, 2017 allows each IIM to grant degrees, and IIM Ahmedabad describes its two-year PGP as its flagship MBA programme. At other institutes a PGP may lead to a diploma or a certificate, so check what is awarded.' },
        { question: 'What is the eligibility for a PGP at an IIM?', answer: 'The CAT 2026 bulletin asks for a bachelor\'s degree with at least 50% marks or equivalent CGPA (45% for SC, ST and PwBD). Final-year students can apply and join provisionally. Each IIM adds its own conditions in its admission policy.' },
        { question: 'Which exam is needed for a PGP?', answer: 'CAT is needed for IIM PGPs and is accepted by listed non-IIM schools. CAT 2026 is on 29 November 2026. ISB\'s PGP uses a test-centre GMAT or GRE score instead.' },
        { question: 'How long is a PGP?', answer: 'IIM PGPs such as IIM Ahmedabad\'s are two-year, full-time programmes. ISB\'s PGP runs for 12 months and asks for at least 24 months of full-time work experience. Online PGPs from private providers vary widely.' },
        { question: 'What is the fee for a PGP?', answer: 'Approximate first-year tuition listed on CollegeDecision ranges from about Rs 4.5 lakh to Rs 14 lakh a year for two-year PGPs, and about Rs 24.7 lakh for ISB\'s one-year PGP. Hostel and other charges are extra. Confirm with each school.' },
        { question: 'Are online PGP courses from edtech platforms valid?', answer: 'They are usually certificates, not degrees. UGC\'s public notice of 16 January 2022 said degree and diploma programmes offered through franchise arrangements with EdTech companies are not permitted, and advised students to check a programme\'s status on the UGC DEB website.' }
      ]
    };
  }

  if (slug === 'professional-certificate') {
    return {
      displayName: 'Professional Certificate Courses',
      h1: 'Professional Certificate Courses: Eligibility, Recognition, Fees and Scope 2026',
      title: 'Professional Certificate Courses: Eligibility, Fees 2026',
      description:
        'Professional certificate courses explained for 2026: what they are, who can join, NSQF and regulator recognition, assessments, popular areas, fees and how to check the issuer.',
      keywords: ['professional certificate', 'professional certificate course', 'professional certificate courses in India', 'professional certificate eligibility', 'NSQF certificate', 'NISM certification', 'short term professional courses'],
      intro:
        'A professional certificate is a short, job-focused course that proves a specific skill. It is not a degree, and its value depends on who issues it. See eligibility, NSQF and regulator recognition, assessments, popular areas, fees and a checklist for choosing one.',
      crossLink: {
        href: '/courses/certificate-program',
        anchor: 'Read the certificate programmes guide',
        note: 'Looking for listed certificate courses at colleges? Start with our certificate programmes guide.'
      },
      faqs: [
        { question: 'What is a professional certificate course?', answer: 'It is a short, skill-focused course that ends in a certificate rather than a degree. Universities, government bodies, professional institutes and private providers all offer them, and the value depends on who issues the certificate.' },
        { question: 'Is a professional certificate a degree?', answer: 'No. It does not replace a bachelor\'s or master\'s degree where one is required. Some skill certificates are aligned to NSQF levels, which helps employers understand the level of the course.' },
        { question: 'Who can join a professional certificate course?', answer: 'Each provider sets its own rules. Skill-level certificates often ask for Class 10 or 12, while advanced and executive certificates usually ask for a bachelor\'s degree and sometimes work experience.' },
        { question: 'What is NSQF?', answer: 'The National Skills Qualification Framework is a competency-based framework with levels from 1 to 8, including half levels. NCVET publishes approved skill qualifications on the National Qualifications Register.' },
        { question: 'Are some professional certificates compulsory?', answer: 'In some regulated roles, yes. SEBI has notified that people selling mutual fund products need the NISM Series V-A certification, and NISM runs certification exams for several other securities-market roles.' },
        { question: 'How much does a professional certificate cost?', answer: 'There is no standard fee. No programme is listed under this course on CollegeDecision yet; related "professional" certificate records in our listings show tuition of about Rs 20,000 to Rs 77,400 a year. Confirm with the provider.' },
        { question: 'How do I check if an online certificate is genuine?', answer: 'Confirm the issuing body on its official website. If the course claims a university link, UGC advises checking the programme on the UGC DEB website, and its January 2022 notice said franchise-style online programmes are not permitted.' }
      ]
    };
  }

  if (slug === 'online-executive-programme') {
    return {
      displayName: 'Online Executive Programme',
      h1: 'Online Executive Programme: Eligibility, Recognition, Fees and Scope 2026',
      title: 'Online Executive Programme: Eligibility, UGC Rules & Fees 2026',
      description:
        'Online executive programmes for working professionals in 2026: online MBAs, EMBAs, PG diplomas and certificates, with eligibility, UGC recognition, fees and careers.',
      keywords: ['online executive programme', 'online executive programme India', 'online executive MBA', 'online executive course for working professionals', 'UGC approved online programme', 'online executive programme fees', 'online executive certificate'],
      intro:
        'An online executive programme lets you study while you keep working, but the label covers UGC-recognised online degrees, university PG diplomas and short institute or edtech certificates. See how to tell them apart, check recognition and compare costs before you enrol.',
      crossLink: {
        href: '/courses/executive-programme',
        anchor: 'Read the executive programme guide',
        note: 'Open to campus, weekend or one-year formats too? Compare all executive programmes.'
      },
      faqs: [
        { question: 'What is an online executive programme?', answer: 'It is a course for working professionals delivered mainly online. The label is not one qualification: it can be a UGC-recognised online MBA or Executive MBA, an online PG diploma, a university certificate or a short certificate from a business school or training provider.' },
        { question: 'Is an online executive programme valid in India?', answer: 'It depends on the award. Under Regulation 22 of the UGC (Open and Distance Learning Programmes and Online Programmes) Regulations, 2020, online degrees and PG diplomas from institutions recognised by UGC for online mode are treated as equivalent to the same awards in conventional mode. Short certificates are not degrees.' },
        { question: 'How do I check whether an online programme is UGC recognised?', answer: 'Check the UGC Distance Education Bureau (DEB) website for the institution, the programme and the session you are joining. UGC asks students to confirm this before enrolling.' },
        { question: 'Do IIM online executive programmes need UGC approval?', answer: 'No. UGC\'s Distance Education Bureau states that IITs, IIMs, IISc and other Institutions of National Importance do not come under its purview, so check what the award is on the institute\'s own website.' },
        { question: 'Who is eligible for an online executive programme?', answer: 'Usually graduates, and many programmes also ask for some years of work experience. Each university or institute sets its own rule, so read the programme page.' },
        { question: 'Is there an entrance exam for online executive programmes?', answer: 'There is no national exam. Most programmes admit on your degree, a profile review or an interview, and some universities run their own online test.' },
        { question: 'What is the fee for an online executive programme?', answer: 'Fees vary widely between short certificates and two-year online degrees. CollegeDecision has no tuition or total-fee records for this course yet, so use the institute\'s official fee page and ask for a written total.' },
        { question: 'Can I do a PhD online after an online executive programme?', answer: 'UGC does not permit research programmes such as M.Phil and PhD in online or distance mode. A recognised online master\'s degree can support a PhD application, but the PhD itself has to be done through a regular route.' }
      ]
    };
  }
  if (slug === 'post-graduate-program') {
    return {
      displayName: 'Post Graduate Program',
      h1: 'Post Graduate Program: What It Means, Eligibility, Exams and Fees 2026',
      title: 'Post Graduate Program: Meaning, Eligibility, Exams & Fees 2026',
      description:
        'What a Post Graduate Program really awards in India in 2026: MBA degree, PGDM or certificate, with eligibility, CAT rules, listed fees and how to choose.',
      keywords: ['post graduate program', 'post graduate programme', 'post graduate program meaning', 'post graduate program in management', 'PGP vs MBA', 'post graduate program eligibility', 'post graduate program fees'],
      intro:
        '"Post Graduate Program" is a title institutes use for courses after graduation, not a single qualification. Learn how to tell whether it leads to an MBA degree, an AICTE-approved PGDM or a certificate, who is eligible, which exams apply and what fees look like.',
      crossLink: {
        href: '/courses/pgp',
        anchor: 'Read the PGP guide',
        note: 'Comparing IIM-style two-year programmes? See the PGP guide.'
      },
      faqs: [
        { question: 'What is a Post Graduate Program?', answer: 'It is a name institutes use for programmes taken after graduation. Depending on the institute, it can lead to an MBA degree, an AICTE-approved PGDM or PGCM, a university PG diploma, or only the institute\'s own certificate.' },
        { question: 'Is a Post Graduate Program the same as an MBA?', answer: 'Not always. IIMs were registered societies that awarded post graduate diplomas until the IIM Act, 2017 allowed them to grant degrees. Other institutes may award a PGDM or a certificate under the same name, so check exactly what you will receive.' },
        { question: 'What is the eligibility for a Post Graduate Program?', answer: 'Usually a bachelor\'s degree. For CAT-based admissions, CAT 2026 requires at least 50% marks or equivalent CGPA (45% for SC, ST and PwBD candidates), and final-year students can apply.' },
        { question: 'Which entrance exam is needed for a Post Graduate Program?', answer: 'CAT for IIM programmes. Other institutes accept CAT or tests such as XAT, CMAT, MAT or GMAT, and design or media programmes may use a portfolio or interview.' },
        { question: 'What is the fee for a Post Graduate Program?', answer: 'It varies widely. No fee records are linked to this course itself on CollegeDecision. Related programmes list approximate first-year fees from about Rs 90,000 to about Rs 13 lakh per year; confirm current fees with each institute.' },
        { question: 'How long is a Post Graduate Program?', answer: 'Commonly one or two years. Two-year programmes are typical for freshers, one-year programmes for experienced professionals, and short programmes with the same name also exist.' },
        { question: 'Can I do a PhD after a Post Graduate Program?', answer: 'Yes, if the award is an MBA or a recognised two-year PG diploma that meets the doctoral programme\'s eligibility. A short certificate usually will not qualify.' }
      ]
    };
  }
  if (slug === 'online-certificate') {
    return {
      displayName: 'Online Certificate Courses',
      h1: 'Online Certificate Courses: Eligibility, UGC Rules, Fees and Scope 2026',
      title: 'Online Certificate Courses 2026: UGC-DEB Rules, Fees & Scope',
      description:
        'Online certificate courses in 2026: who can offer them under UGC-DEB rules, eligibility, SWAYAM exams, subjects, fees, colleges and how to check a certificate.',
      keywords: ['online certificate courses', 'online certificate course', 'UGC approved online certificate', 'SWAYAM certificate', 'online certificate eligibility', 'online certificate fees', 'short online courses India', 'online certificate after 12th'],
      intro:
        'An online certificate is a short, non-degree course you study over the internet. Check who is allowed to offer one under UGC-DEB rules, how SWAYAM exams work, what you can study, costs and how to judge its value.',
      crossLink: {
        href: '/courses/online-programmes',
        anchor: 'Browse Online Learning Programmes',
        note: 'Most online certificates on CollegeDecision are listed under our Online Learning Programmes page.'
      },
      faqs: [
        { question: 'Is an online certificate a degree?', answer: 'No. An online certificate is a short, certificate-level course. UGC-DEB describes equivalence with conventional awards for degrees and PG diplomas earned online from recognised universities, not for short certificates.' },
        { question: 'Can any university offer online certificate courses?', answer: 'No. According to UGC-DEB, only a university recognised to offer UG degree, PG degree or PG diploma programmes in ODL or online mode may offer certificate or diploma programmes in those modes, with approval of its statutory and regulatory bodies.' },
        { question: 'How do I check if an online certificate is recognised?', answer: 'For a university course, check the UGC-DEB website for the university\'s recognition for the session you plan to join. UGC-DEB says recognition for a previous year does not mean recognition for the next.' },
        { question: 'Are SWAYAM certificates free?', answer: 'SWAYAM courses are free to study. To get a certificate you must register for the final proctored exam, which has a fee, and take it in person at a designated centre.' },
        { question: 'Which subjects cannot be studied online?', answer: 'UGC-DEB lists engineering, medical, paramedical, pharmacy, nursing, dental, architecture, law, agriculture, hotel management, visual arts, sports and aviation, among others, as prohibited in ODL and online mode. From August 2026 this also covers allied and healthcare programmes under the NCAHP Act, including psychology.' },
        { question: 'What is the eligibility for an online certificate?', answer: 'There is no national rule. Each provider sets its own entry requirement. Some courses are open to all, while others ask for Class 12, a degree or work experience.' },
        { question: 'Can I get credit for an online certificate?', answer: 'Sometimes. UGC has a credit framework for online courses through SWAYAM, and universities that approve credit transfer can use the marks or certificate from those courses. Confirm with your own university first.' }
      ]
    };
  }

  if (slug === 'post-graduate-certificate') {
    return {
      displayName: 'Post Graduate Certificate (PGC)',
      h1: 'Post Graduate Certificate Course: Eligibility, Admission, Fees and Scope 2026',
      title: 'Post Graduate Certificate 2026: Eligibility, PGCM, Fees & Scope',
      description:
        'Post Graduate Certificate (PGC/PGCM) course details for 2026: AICTE duration and eligibility, admission, fields like management and law, fees, colleges and careers.',
      keywords: ['post graduate certificate', 'PG certificate course', 'PGCM course', 'post graduate certificate in management', 'PG certificate eligibility', 'PG certificate fees', 'PG certificate vs PG diploma', 'one year PG certificate'],
      intro:
        'A Post Graduate Certificate is a short postgraduate award for graduates who want depth in one area. Check AICTE rules for the PGCM, eligibility, admission, common fields, listed fees and how it compares with a PG diploma.',
      crossLink: {
        href: '/courses/pg-diploma',
        anchor: 'Read the PG Diploma course guide',
        note: 'Most postgraduate certificate and diploma programmes on CollegeDecision are listed under our PG Diploma page.'
      },
      faqs: [
        { question: 'What is a Post Graduate Certificate?', answer: 'It is a short postgraduate award taken after a bachelor\'s degree, focused on one area. It ranks below a PG diploma and a master\'s degree and is not a degree.' },
        { question: 'What is the duration of a PG Certificate?', answer: 'AICTE\'s Approval Process Handbook 2024-27 sets the Post Graduate Certificate in Management (PGCM) and the engineering PG certificate at one year. Programmes in other fields vary by institute.' },
        { question: 'What is the eligibility for PGCM?', answer: 'Under AICTE norms, a bachelor\'s degree of at least three years with at least 50% marks, or 45% for reserved categories.' },
        { question: 'Is there an entrance exam for a PG Certificate?', answer: 'There is no common exam. Each institute sets its own selection method, which may use entrance test scores, academic record, an interview or work experience.' },
        { question: 'What is the difference between PGCM and PGDM?', answer: 'Under AICTE rules, the PGCM lasts one year and the PGDM two years. AICTE also allows a PGDM student to exit with a PGCM after the first year, subject to earning the required credits.' },
        { question: 'What is the fee for a PG Certificate?', answer: 'Fees vary widely. The few total-fee records on CollegeDecision range from about Rs 1.3 lakh to about Rs 10 lakh. They are approximate; confirm with each institute.' },
        { question: 'In which fields are PG Certificates offered?', answer: 'Programmes listed on CollegeDecision cover management, finance and securities, law, communication and film, dentistry and technology. AICTE also names the PG certificate in fields such as logistics, travel and tourism, computer applications, AI and cyber security.' }
      ]
    };
  }

  if (slug === 'mvsc') {
    return {
      displayName: 'M.V.Sc (Master of Veterinary Science)',
      h1: 'M.V.Sc Course: Eligibility, ICAR AIEEA PG, Subjects and Admission 2026',
      title: 'M.V.Sc Course: Eligibility, ICAR AIEEA PG & Admission 2026',
      description:
        'M.V.Sc (Master of Veterinary Science) guide: B.V.Sc eligibility, ICAR AIEEA PG exam by NTA, admission routes, subjects, coursework, fees and careers.',
      keywords: ['M.V.Sc course', 'MVSc full form', 'Master of Veterinary Science', 'M.V.Sc eligibility', 'ICAR AIEEA PG', 'M.V.Sc admission 2026', 'M.V.Sc subjects', 'veterinary PG in India'],
      intro:
        'M.V.Sc is the two-year master\'s degree for B.V.Sc & A.H. graduates. See who can apply, how ICAR AIEEA (PG) and state university tests work, which subjects you can choose and where the degree leads.',
      faqs: [
        { question: 'What is the full form of M.V.Sc?', answer: 'M.V.Sc stands for Master of Veterinary Science, a postgraduate degree in a specific branch of veterinary or animal science.' },
        { question: 'Who is eligible for M.V.Sc?', answer: 'You need a B.V.Sc & A.H. degree. For ICAR AIEEA (PG) 2026, the minimum was 60% marks or an OGPA of 6.60/10 for General, OBC, UPS and EWS candidates, and 50% or 5.60/10 for SC, ST, PwBD and third gender candidates.' },
        { question: 'How long is the M.V.Sc course?', answer: 'Two years, spread over four semesters. VCI\'s draft PG regulations allow it to be extended up to eight semesters.' },
        { question: 'Which entrance exam is used for M.V.Sc admission?', answer: 'ICAR AIEEA (PG), conducted by NTA, fills 30% of master\'s seats in agricultural universities and all seats at IVRI, IARI, NDRI and CIFE. State universities fill their own seats through their own tests or merit lists.' },
        { question: 'What is the ICAR AIEEA (PG) exam pattern?', answer: 'In 2026 it was a 2-hour computer-based test with 120 multiple-choice questions in English, with +4 marks for a correct answer and -1 for a wrong answer.' },
        { question: 'Can B.V.Sc students in their final year apply?', answer: 'Yes. The 2026 bulletin let veterinary candidates appear provisionally, but they had to complete the degree, including internship, by 15 January 2027.' },
        { question: 'What subjects can I choose in M.V.Sc?', answer: 'Options include Veterinary Medicine, Surgery and Radiology, Gynaecology and Obstetrics, Pathology, Microbiology, Parasitology, Anatomy, Physiology, Animal Nutrition, Animal Genetics and Breeding, Poultry Science and Public Health, among others.' },
        { question: 'What is the fee for M.V.Sc?', answer: 'CollegeDecision does not yet list M.V.Sc fees. Most seats are at state veterinary and agricultural universities, which publish fees in their prospectus. Meritorious ICAR candidates may receive the ICAR PG Scholarship of Rs 12,640 a month.' }
      ]
    };
  }

  if (slug === 'post-doctoral-certificate') {
    return {
      displayName: 'Post Doctoral Certificate (PDCC)',
      h1: 'Post Doctoral Certificate Course (PDCC): Eligibility, Admission and Fees 2026',
      title: 'Post Doctoral Certificate (PDCC): Eligibility & Admission 2026',
      description:
        'Post Doctoral Certificate Course (PDCC) explained: one-year NMC course after MD, MS or DNB, eligibility, SGPGIMS entrance exam, fees and careers.',
      keywords: ['Post Doctoral Certificate', 'PDCC course', 'PDCC full form', 'PDCC after MD', 'PDCC eligibility', 'PDCC admission 2026', 'SGPGIMS PDCC', 'NMC PGMER 2023 PDCC'],
      intro:
        'A Post Doctoral Certificate Course (PDCC) is a one-year sub-speciality training course for doctors with an MD, MS or DNB. See NMC rules, eligibility, how institutes like SGPGIMS admit candidates, fees and where it leads.',
      crossLink: {
        href: '/courses/md',
        anchor: 'Read the MD course guide',
        note: 'Most PDCCs need an MD, MS or DNB first, and CollegeDecision lists only two PDCC programmes, so the MD guide covers the feeder degree in more depth.'
      },
      faqs: [
        { question: 'What is the full form of PDCC?', answer: 'PDCC stands for Post-Doctoral Certificate Course, a sub-speciality medical training course taken after an MD, MS or DNB.' },
        { question: 'How long is a Post Doctoral Certificate Course?', answer: 'One year. NMC\'s Post-Graduate Medical Education Regulations, 2023 list the PDCC duration as one year and the Post-Doctoral Fellowship (PDF) as two years.' },
        { question: 'Who is eligible for a PDCC?', answer: 'Doctors with a recognised MD, MS or DNB in the feeder speciality named for the course. For example, SGPGIMS asks for MD or DNB in Pediatrics for its PDCC in Neonatology.' },
        { question: 'Is a PDCC the same as a postdoc after PhD?', answer: 'No. A PDCC is clinical training after a postgraduate medical degree. A research postdoc after a PhD is a fixed-term research position or fellowship, not a course.' },
        { question: 'How is admission to PDCC done?', answer: 'There is no single national exam. Each institute runs its own test. SGPGIMS Lucknow held a 100-mark, 180-minute objective exam on 12 April 2026, with 50% qualifying marks for PDCC.' },
        { question: 'What is the fee for a PDCC?', answer: 'CollegeDecision has no PDCC fee records. At SGPGIMS for 2026, first-year fees totalled Rs 74,100, including Rs 20,000 refundable caution money, plus a Rs 1,800 medical subscription.' },
        { question: 'Is there reservation in PDCC seats?', answer: 'It depends on the institute. The SGPGIMS 2026 brochure states there is no reservation in its PDCC and PDAF courses.' }
      ]
    };
  }

  if (slug === 'mba') {
    return {
      displayName,
      h1: 'MBA Course in India: Eligibility, Entrance Exams, Fees & Specialisations',
      title: 'MBA Course Details: Eligibility, Exams, Fees & Subjects',
      description:
        'MBA course guide: AICTE eligibility, CAT 2026 and other exams, MBA vs PGDM, specialisations, subjects and fees (median ₹1,62,500 a year in our data).',
      keywords: [
        'MBA course',
        'MBA full form',
        'MBA eligibility',
        'MBA entrance exams',
        'MBA vs PGDM',
        'MBA specializations',
        'MBA fees in India'
      ],
      intro:
        'MBA (Master of Business Administration) is a two-year postgraduate programme after any bachelor’s degree. Check eligibility, entrance exams, MBA vs PGDM, specialisations and fees before you shortlist B-schools.',
      crossLink: {
        href: '/mba-colleges',
        anchor: 'Compare MBA colleges by fees & placements',
        note: 'Ready to shortlist? Browse MBA and PGDM colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of MBA?',
          answer: 'MBA stands for Master of Business Administration, a two-year postgraduate degree in management.'
        },
        {
          question: 'What is the eligibility for MBA?',
          answer: 'Under AICTE rules you need a bachelor’s degree of at least three years in any stream with 50% marks (45% for reserved categories), plus a valid entrance test score. Institutes can set higher cut-offs.'
        },
        {
          question: 'Is MBA only 2 years?',
          answer: 'A full-time MBA or PGDM is two years. AICTE also lists lateral entry into the second year for four-year B.Tech, BBA or BMS graduates where a university offers it, and an 18-month PGDM format for candidates with three years of managerial experience.'
        },
        {
          question: 'Which entrance exams are accepted for MBA?',
          answer: 'The IIMs use CAT. AICTE allows PGDM institutes to admit through CAT, XAT, CMAT, ATMA, MAT or GMAT, or a state or central government test. State CETs such as MAH MBA CET and TANCET, and institute tests such as SNAP and NMAT, are also common.'
        },
        {
          question: 'When is CAT 2026?',
          answer: 'CAT 2026 is on 29 November 2026, conducted by IIM Indore in three sessions. It is a 120-minute computer-based test with VARC, DILR and QA sections of 40 minutes each.'
        },
        {
          question: 'What is the difference between MBA and PGDM?',
          answer: 'An MBA is a degree awarded by a university or an IIM. A PGDM is a diploma awarded by an AICTE-approved autonomous institute. Both have the same AICTE entry rule. Compare approval, curriculum, fees and placements rather than the label.'
        },
        {
          question: 'Which MBA specialisation is most common?',
          answer: 'In our records, Finance (716 programmes), Marketing (709) and Human Resources (629) are the most common, followed by International Business, IT and Operations.'
        },
        {
          question: 'What is the fee for an MBA in India?',
          answer: 'It varies widely. Across 2,718 MBA/PGDM fee records in our database, the median is ₹1,62,500 a year. IIM Bangalore charges ₹26,00,000 for its two-year PGP 2026-28, with mess charges extra.'
        },
        {
          question: 'Can I do an MBA after B.Sc, B.Com or B.Tech?',
          answer: 'Yes. Any bachelor’s degree of at least three years with the required marks makes you eligible. Your stream does not limit which MBA specialisation you can choose.'
        }
      ]
    };
  }

  if (slug === 'engineering') {
    return {
      displayName,
      h1: 'B.Tech / B.E. Course in India: Eligibility, Exams, Fees & Branches',
      title: 'B.Tech Course Details: Eligibility, Fees, Exams & Careers',
      description:
        'B.Tech/B.E. course guide: Class 12 rules by route, Chemistry rules, JEE and state exams, branches, syllabus and fees (median ₹97,500 a year in our data).',
      keywords: [
        'B.Tech course',
        'Bachelor of Technology',
        'B.Tech vs B.E.',
        'B.Tech fees in India',
        'B.Tech eligibility',
        'engineering entrance exams',
        'B.Tech branches',
        'jobs after B.Tech'
      ],
      intro:
        'B.Tech (Bachelor of Technology) and B.E. are four-year engineering degrees after Class 12. Check which eligibility rule applies to you, the entrance exams, branches, syllabus and fees before you shortlist colleges.',
      crossLink: {
        href: '/engineering-colleges',
        anchor: 'Compare Engineering colleges by fees & placements',
        note: 'Ready to shortlist? Browse Engineering colleges, including B.Tech and B.E. programmes, with recorded fees, course focus and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of B.Tech?',
          answer: 'B.Tech stands for Bachelor of Technology, a four-year undergraduate engineering degree. B.E. (Bachelor of Engineering) is its equivalent.'
        },
        {
          question: 'Is B.E. different from B.Tech?',
          answer: 'Not for eligibility or recognition. UGC lists both as four-year bachelor’s degrees after 10+2, and JoSAA and GATE treat them together as B.E./B.Tech. Compare the syllabus and the college, not the name.'
        },
        {
          question: 'Is Chemistry compulsory for B.Tech?',
          answer: 'Not for every branch. Under AICTE rules, CSE, Electrical and Electronics need Physics and Maths plus one listed subject, which need not be Chemistry. Civil, Mechanical and Chemical need Physics, Chemistry and Maths, and IITs require all three for every branch.'
        },
        {
          question: 'Do I need 75% in Class 12 for B.Tech?',
          answer: 'Only for JoSAA admission to IITs, NITs, IIITs and GFTIs, which need 75% (65% for SC, ST and PwD) or a place in the top 20 percentile of your board. The AICTE minimum for other colleges is 45% in the qualifying subjects (40% for reserved categories).'
        },
        {
          question: 'Can I get B.Tech admission without JEE Main?',
          answer: 'Yes. State entrance exams and university tests such as BITSAT or VITEEE are separate routes. You need JEE Main for NITs, IIITs and GFTIs, and to qualify for JEE Advanced for the IITs.'
        },
        {
          question: 'What is the fee for B.Tech in India?',
          answer: 'Fees vary widely. Across 4,549 programme fee records in our database, the median is ₹97,500 a year. For 2026, NIT Trichy charges ₹62,500 tuition per semester and IIT Bombay, Delhi and Madras charge ₹1,00,000 per semester, with income-based waivers.'
        },
        {
          question: 'Can I do B.Tech after a diploma?',
          answer: 'Yes. AICTE allows diploma holders with at least 45% (40% for reserved categories) to join the second year through lateral entry and finish in three years.'
        },
        {
          question: 'What can I do after B.Tech?',
          answer: 'Common paths are a job in your branch, an M.Tech or M.E. through GATE, an MBA, or public-sector and government engineering roles. Outcomes depend on your branch, skills and college.'
        }
      ]
    };
  }

  if (slug === 'medical') {
    return {
      displayName,
      h1: 'MBBS Course in India: Full Form, Duration, Eligibility & Fees',
      title: 'MBBS Course: Duration, Eligibility, NEET, Fees & Seats',
      description:
        'MBBS course guide: full form, 5½-year duration, NEET UG eligibility, counselling, 1,36,939 seats (NMC 2026-27), subjects and government vs private fees.',
      keywords: [
        'MBBS course',
        'MBBS full form',
        'MBBS course duration',
        'MBBS eligibility',
        'MBBS fees in India',
        'MBBS seats in India',
        'MBBS subjects'
      ],
      intro:
        'MBBS (Bachelor of Medicine and Bachelor of Surgery) takes 5½ years, including a one-year internship, and admission is through NEET (UG). Check eligibility, counselling, seats, subjects and fees before you shortlist colleges.',
      crossLink: {
        href: '/mbbs-colleges',
        anchor: 'Compare MBBS colleges by fees & type',
        note: 'Ready to shortlist? Browse MBBS colleges with recorded fees, college type and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of MBBS?',
          answer: 'MBBS stands for Bachelor of Medicine and Bachelor of Surgery. It is a single undergraduate medical degree regulated by the National Medical Commission (NMC).'
        },
        {
          question: 'How many years is the MBBS course?',
          answer: 'MBBS takes 5½ years: 4½ academic years in three phases, followed by a one-year compulsory rotating medical internship, as set by NMC’s Graduate Medical Education Regulations 2023.'
        },
        {
          question: 'Is NEET compulsory for MBBS?',
          answer: 'Yes. NEET (UG) is required for MBBS admission in every medical college in India, including AIIMS and JIPMER. Indian citizens and OCI cardholders also need it to study MBBS abroad.'
        },
        {
          question: 'What is the age limit for MBBS?',
          answer: 'You must be at least 17 years old by 31 December of the year you take NEET (UG). There is no upper age limit.'
        },
        {
          question: 'Which Class 12 subjects are needed for MBBS?',
          answer: 'Physics, Chemistry, Biology/Biotechnology and English. The NEET (UG) 2026 bulletin does not set a minimum Class 12 percentage for taking the exam, but state counselling rules can add conditions.'
        },
        {
          question: 'What is the NEET qualifying percentile for MBBS?',
          answer: 'The 50th percentile for General and EWS candidates, the 45th for General candidates with benchmark disabilities, and the 40th for SC, ST and OBC-NCL candidates. Qualifying makes you eligible for counselling but does not guarantee a seat.'
        },
        {
          question: 'How many MBBS seats are there in India?',
          answer: 'NMC’s seat matrix for 2026-27 lists 1,36,939 MBBS seats in 823 colleges: 63,296 in government and 73,643 in private colleges. Institutes of National Importance such as AIIMS and JIPMER are counted separately.'
        },
        {
          question: 'What is the fee for MBBS in India?',
          answer: 'It depends mainly on the college type. AIIMS New Delhi lists tuition of ₹1,350 for the whole course. In our records the median annual fee is ₹49,800 for government programmes and ₹9,94,000 for private ones, based on a small sample.'
        },
        {
          question: 'What subjects are taught in MBBS?',
          answer: 'Phase I covers Anatomy, Physiology and Biochemistry. Phase II covers Pathology, Pharmacology and Microbiology. Phase III covers Forensic Medicine, Community Medicine, General Medicine, General Surgery, Obstetrics and Gynaecology, Paediatrics and allied subjects.'
        },
        {
          question: 'What can I do after MBBS?',
          answer: 'After the internship and registration, you can practise as a doctor, join government health services, or specialise in MD, MS or DNB programmes through NEET PG.'
        }
      ]
    };
  }

  const curated: Record<string, Omit<CourseSeoPack, 'displayName'>> = {
    bca: {
      h1: 'BCA Course in India: Eligibility, Subjects, Fees & Careers',
      title: 'BCA Course Details: Eligibility, Subjects, Fees & Duration',
      description:
        'BCA course guide: eligibility (is Maths compulsory?), 3 vs 4 years, subjects, specialisations, fees (median ₹64,000 a year in our data) and careers.',
      keywords: ['BCA course', 'BCA full form', 'BCA course details', 'BCA subjects', 'BCA eligibility', 'BCA fees', 'BCA vs B.Tech'],
      intro:
        'BCA (Bachelor of Computer Applications) is a 3- or 4-year undergraduate degree in software and computer applications after Class 12. Check eligibility, subjects, fees and next steps before you shortlist colleges.',
      crossLink: {
        href: '/bca-colleges',
        anchor: 'Compare BCA colleges by fees & placements',
        note: 'Ready to shortlist? Browse BCA colleges with recorded fees, admission routes and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of BCA?',
          answer: 'BCA stands for Bachelor of Computer Applications, an undergraduate degree in software, programming and computer applications.'
        },
        {
          question: 'What is the eligibility for BCA?',
          answer: 'AICTE requires a Class 12 pass, with subject and marks rules set by the affiliating university. A diploma in Commercial Practice or equivalent is also accepted. Check each university’s prospectus for its exact rule.'
        },
        {
          question: 'Is Maths compulsory for BCA?',
          answer: 'Not under AICTE’s rule, but some universities ask for Mathematics or Computer Science in Class 12 while others accept any stream. Without Mathematics, you will need a bridge course if you later join an MCA.'
        },
        {
          question: 'Is BCA a 3-year or 4-year course?',
          answer: 'Both exist. Under the UGC credit framework, a 3-year BCA needs 120 credits and a 4-year BCA (Honours) needs 160 credits. AICTE allows 4-year BCA graduates lateral entry into the second year of an MCA, subject to seats.'
        },
        {
          question: 'How do I get admission to BCA?',
          answer: 'Most colleges admit on Class 12 marks. Participating universities use CUET (UG), and some use their own test or an aptitude test such as UGAT.'
        },
        {
          question: 'What are the main BCA subjects?',
          answer: 'Programming (C, Java or Python), data structures, database management, operating systems, computer networks, web technologies, software engineering and mathematics, plus electives and a final project.'
        },
        {
          question: 'What is the fee for BCA in India?',
          answer: 'Across 462 BCA fee records in our database, the median is ₹64,000 a year and half of programmes charge ₹38,100–₹1,05,000. The public-institute median is ₹40,000 and the private median ₹65,000.'
        },
        {
          question: 'Which is better, BCA or B.Tech CSE?',
          answer: 'B.Tech CSE is a 4-year engineering degree that needs Physics and Mathematics and usually an engineering entrance. BCA is a 3- or 4-year applications degree with more flexible entry. Many software employers hire from both; some roles specify B.E./B.Tech.'
        },
        {
          question: 'What can I do after BCA?',
          answer: 'You can work as a software developer, tester, web developer, support engineer or data analyst, or study further through an MCA, MBA or a master’s in data science.'
        }
      ]
    },
    bsc: {
      h1: 'B.Sc Course in India: Eligibility, Subjects, Fees & Careers',
      title: 'B.Sc Course Details: Subjects List, Eligibility, Fees & Duration',
      description:
        'B.Sc course guide: eligibility and CUET subject rules, 3 vs 4-year Honours, main B.Sc subjects, fees (median ₹55,000 a year in our data) and careers.',
      keywords: ['B.Sc course', 'B.Sc full form', 'B.Sc subjects', 'B.Sc courses list', 'B.Sc Honours', 'B.Sc eligibility', 'B.Sc fees'],
      intro:
        'B.Sc (Bachelor of Science) is a 3- or 4-year undergraduate degree in a science subject after Class 12. Check eligibility, subject options, fees and next steps before you shortlist colleges.',
      crossLink: {
        href: '/bsc-colleges',
        anchor: 'Compare B.Sc colleges by fees & admissions',
        note: 'Ready to shortlist? Browse B.Sc colleges with recorded fees, subjects and admission routes.'
      },
      faqs: [
        {
          question: 'What is the full form of B.Sc?',
          answer: 'B.Sc stands for Bachelor of Science, an undergraduate degree in a science subject such as Physics, Chemistry, Mathematics, Computer Science or the life sciences.'
        },
        {
          question: 'What is the eligibility for B.Sc?',
          answer: 'Each university sets its own rule, usually Class 12 with science subjects that match the major: Physics, Chemistry and Mathematics for physical sciences, or Biology for life sciences. Nursing and Agriculture follow their regulators’ rules.'
        },
        {
          question: 'Is B.Sc a 3-year or 4-year course?',
          answer: 'Both exist. Under the UGC framework, a 3-year B.Sc needs 120 credits and a 4-year B.Sc (Honours) needs 160 credits. Students with 75% or more in the first six semesters can choose Honours with Research.'
        },
        {
          question: 'Is CUET required for B.Sc admission?',
          answer: 'Only at universities that use it, such as central universities. For example, the University of Delhi asks for Physics, Chemistry and Mathematics in CUET (UG) for B.Sc (Hons) Physics. Many state and private colleges admit on Class 12 marks.'
        },
        {
          question: 'Which B.Sc subjects are most common?',
          answer: 'In our records, Chemistry (400 programmes, including biochemistry), Computer Science/IT (387), Mathematics (347) and Physics (270) are the most common, followed by Botany, Zoology and life sciences.'
        },
        {
          question: 'What is the fee for B.Sc in India?',
          answer: 'Across 1,676 B.Sc fee records in our database, the median is ₹55,000 a year. Public institutes are much cheaper (median ₹17,000) than private ones (median ₹69,600).'
        },
        {
          question: 'Can I do M.Sc in one year after B.Sc?',
          answer: 'UGC’s postgraduate framework allows a one-year master’s after a 4-year Honours degree of 160 credits. After a 3-year degree, the master’s is two years. Each university decides which options it offers.'
        },
        {
          question: 'What can I do after B.Sc?',
          answer: 'You can take an M.Sc, MCA, MBA or B.Ed, prepare for government exams, or work in laboratory, data, IT, agriculture or environment roles depending on your subject.'
        }
      ]
    },
    bba: {
      h1: 'BBA Course in India: Eligibility, Entrance Exams, Subjects & Fees',
      title: 'BBA Course Details: Eligibility, Subjects, Fees & Exams',
      description:
        'BBA course guide: eligibility, CUET and entrance routes, BBA vs BMS vs B.Com, specialisations, subjects and fees (median ₹93,333 a year in our data).',
      keywords: ['BBA course', 'BBA full form', 'BBA course details', 'BBA subjects', 'BBA entrance exam', 'BBA fees', 'BBA vs B.Com'],
      intro:
        'BBA (Bachelor of Business Administration) is a 3- or 4-year undergraduate management degree after Class 12 in any stream. Check eligibility, entrance routes, subjects and fees before you shortlist colleges.',
      crossLink: {
        href: '/bba-colleges',
        anchor: 'Compare BBA colleges by fees & placements',
        note: 'Ready to shortlist? Browse BBA colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of BBA?',
          answer: 'BBA stands for Bachelor of Business Administration, an undergraduate degree in management.'
        },
        {
          question: 'What is the eligibility for BBA?',
          answer: 'AICTE requires a Class 12 pass, with marks and subject rules set by the affiliating university. Most universities accept any stream, but some ask for Mathematics, such as DU for BMS and BBA (FIA) through CUET.'
        },
        {
          question: 'Is BBA a 3-year or 4-year course?',
          answer: 'Both exist. AICTE lists BBA/BMS/BBM as 3 or 4 years. Under the UGC framework, a 3-year degree needs 120 credits and a 4-year Honours degree 160 credits.'
        },
        {
          question: 'Which entrance exams are there for BBA?',
          answer: 'CUET (UG) at participating universities, university tests such as the Symbiosis Entrance Test (SET), and aptitude tests such as UGAT. Integrated BBA + MBA programmes at some IIMs use JIPMAT. Many colleges admit on Class 12 marks.'
        },
        {
          question: 'What are the main BBA subjects?',
          answer: 'Principles of management, accounting, marketing, finance, human resource management, business economics, statistics, business law and communication, followed by electives, an internship and a project.'
        },
        {
          question: 'Which is better, BBA or B.Com?',
          answer: 'BBA focuses on management functions such as marketing, HR and operations. B.Com focuses on accounting, taxation and finance and suits CA, CS or CMA. Both can lead to an MBA. In our records B.Com has a lower median fee.'
        },
        {
          question: 'What is the fee for BBA in India?',
          answer: 'Across 975 BBA fee records in our database, the median is ₹93,333 a year and half of programmes charge ₹53,333–₹1,73,744. The public-institute median is ₹40,010 and the private median ₹95,000.'
        },
        {
          question: 'What can I do after BBA?',
          answer: 'You can work in sales, marketing, finance, HR or operations, start or join a family business, or study further through an MBA or a professional qualification.'
        }
      ]
    },
    arts: {
      h1: 'BA (Bachelor of Arts) Course in India: Subjects, Eligibility & Fees',
      title: 'BA Course Details: Subjects List, Eligibility, Fees & Duration',
      description:
        'BA (Bachelor of Arts) guide: eligibility, CUET subject rules, 3 vs 4-year Honours, subjects list, fees (median ₹25,300 a year in our data) and careers.',
      keywords: ['BA course', 'BA full form', 'Bachelor of Arts', 'BA subjects list', 'BA Honours', 'BA course duration', 'BA fees'],
      intro:
        'BA (Bachelor of Arts) is a 3- or 4-year undergraduate degree in the humanities, social sciences or languages after Class 12. Check eligibility, subject options, fees and next steps before you shortlist colleges.',
      crossLink: {
        href: '/ba-colleges',
        anchor: 'Compare BA colleges by fees & admissions',
        note: 'Ready to shortlist? Browse BA colleges with recorded fees, subjects and admission routes.'
      },
      faqs: [
        {
          question: 'What is the full form of BA?',
          answer: 'BA stands for Bachelor of Arts, an undergraduate degree in the humanities, social sciences or languages.'
        },
        {
          question: 'What is the eligibility for BA?',
          answer: 'Each university sets its own rule; most accept Class 12 in any stream. Some majors need a matching subject: for example, Delhi University’s BA (Hons) Economics needs Mathematics in CUET (UG).'
        },
        {
          question: 'Is BA a 3-year or 4-year course?',
          answer: 'Both exist. Under the UGC framework, a 3-year BA needs 120 credits and a 4-year BA (Honours) needs 160 credits. Students with 75% or more in the first six semesters can choose Honours with Research.'
        },
        {
          question: 'Which subjects can I choose in BA?',
          answer: 'Common options include English, Hindi and other languages, Economics, History, Political Science, Psychology, Sociology, Geography, Philosophy, Public Administration and Journalism. In our records English, Economics and Indian languages are the most common.'
        },
        {
          question: 'What is the difference between BA Honours and BA Programme?',
          answer: 'A BA (Honours) focuses deeply on one major subject. A general BA, often called BA Programme, spreads across two or three subjects. Under the UGC framework, a 4-year degree is awarded with Honours.'
        },
        {
          question: 'What is the fee for BA in India?',
          answer: 'Across 923 BA fee records in our database, the median is ₹25,300 a year and half of programmes charge ₹10,390–₹60,000. Public institutes have a median of ₹13,746 and private ones ₹40,000.'
        },
        {
          question: 'Can I do MA in one year after BA?',
          answer: 'UGC’s postgraduate framework allows a one-year master’s after a 4-year Honours degree of 160 credits. After a 3-year BA, the MA is two years. Each university decides which options it offers.'
        },
        {
          question: 'What can I do after BA?',
          answer: 'You can take an MA, B.Ed, LLB or MBA, prepare for civil services and other government exams, or work in content, journalism, research, HR and social-sector roles.'
        }
      ]
    },
    commerce: {
      h1: 'B.Com Course in India: Eligibility, Subjects, Fees & CA Route',
      title: 'B.Com Course Details: Subjects, Eligibility, Fees & Honours',
      description:
        'B.Com guide: eligibility, CUET rules, B.Com vs B.Com (Hons), CA direct entry, subjects, fees (median ₹45,000 a year in our data) and careers.',
      keywords: ['B.Com course', 'B.Com full form', 'B.Com subjects', 'B.Com Honours', 'B.Com course details', 'B.Com with CA', 'B.Com vs BBA'],
      intro:
        'B.Com (Bachelor of Commerce) is a 3- or 4-year undergraduate degree in accounting, finance, tax and business law after Class 12. Check eligibility, subjects, the CA route and fees before you shortlist colleges.',
      crossLink: {
        href: '/bcom-colleges',
        anchor: 'Compare B.Com colleges by fees & admissions',
        note: 'Ready to shortlist? Browse B.Com colleges with recorded fees and admission routes.'
      },
      faqs: [
        {
          question: 'What is the full form of B.Com?',
          answer: 'B.Com stands for Bachelor of Commerce, an undergraduate degree in accounting, finance, taxation, business law and economics.'
        },
        {
          question: 'What is the eligibility for B.Com?',
          answer: 'Each university sets its own rule, usually a Class 12 pass. Many accept any stream for a general B.Com, while B.Com (Honours) often needs Mathematics or Accountancy, as at Delhi University through CUET (UG).'
        },
        {
          question: 'What is the difference between B.Com and B.Com (Hons)?',
          answer: 'B.Com (Honours) goes deeper into accounting, finance and allied subjects and can have stricter entry rules. Under the UGC framework, a 4-year degree of 160 credits is awarded with Honours.'
        },
        {
          question: 'Can I do CA after B.Com?',
          answer: 'Yes. ICAI lets commerce graduates with at least 55% marks (other graduates 60%) skip CA Foundation and register directly for CA Intermediate. Final-year students can register provisionally.'
        },
        {
          question: 'What are the main B.Com subjects?',
          answer: 'Financial and corporate accounting, cost accounting, business and company law, income tax and GST, economics, business statistics, auditing and financial management, plus electives.'
        },
        {
          question: 'What is the fee for B.Com in India?',
          answer: 'Across 535 B.Com fee records in our database, the median is ₹45,000 a year and half of programmes charge ₹19,835–₹83,800. Public institutes have a median of ₹14,760 and private ones ₹50,000.'
        },
        {
          question: 'Which is better, B.Com or BBA?',
          answer: 'B.Com suits accounting, tax and finance and the CA, CS or CMA routes. BBA suits management roles and an MBA. Both can lead to an MBA, and B.Com has a lower median fee in our records.'
        },
        {
          question: 'What can I do after B.Com?',
          answer: 'You can pursue CA, CS or CMA, an M.Com or MBA, or work in accounting, audit, tax, banking, insurance and finance roles.'
        }
      ]
    },
    mca: {
      h1: 'MCA Course in India: Eligibility, NIMCET & Entrance Exams, Fees',
      title: 'MCA Course Details: Eligibility, Subjects, Fees & Exams',
      description:
        'MCA guide: AICTE eligibility and the Maths rule, NIMCET 2026 and other exams, lateral entry, subjects and fees (median ₹65,000 a year in our data).',
      keywords: ['MCA course', 'MCA full form', 'MCA course details', 'MCA subjects', 'MCA eligibility', 'MCA entrance exam', 'NIMCET'],
      intro:
        'MCA (Master of Computer Applications) is a two-year postgraduate degree in software and computer applications after any bachelor’s degree. Check eligibility, entrance exams, lateral entry and fees before you shortlist colleges.',
      crossLink: {
        href: '/mca-colleges',
        anchor: 'Compare MCA colleges by fees & placements',
        note: 'Ready to shortlist? Browse MCA colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of MCA?',
          answer: 'MCA stands for Master of Computer Applications, a postgraduate degree in software development and computer applications.'
        },
        {
          question: 'What is the eligibility for MCA?',
          answer: 'AICTE accepts any bachelor’s degree with 50% marks (45% for reserved categories), preferably with Mathematics at Class 12 or in the degree. Students without Mathematics must take a compulsory bridge course.'
        },
        {
          question: 'Is MCA a 2-year or 3-year course?',
          answer: 'Under current AICTE rules the MCA is 2 years. Graduates of a 4-year BCA or a B.Tech in CSE/IT can join the second year through lateral entry, subject to seat availability.'
        },
        {
          question: 'Can I do MCA without Maths?',
          answer: 'AICTE allows it with a compulsory bridge course, but each university decides. NIMCET, used by the NITs, needs Mathematics or Statistics in a three-year degree, or a B.E./B.Tech.'
        },
        {
          question: 'Which entrance exams are there for MCA?',
          answer: 'NIMCET for the NITs and IIIT Bhopal and Vadodara, state tests such as TANCET, MAH MCA CET, AP ICET, TS ICET, Karnataka PGCET and OJEE, and university tests.'
        },
        {
          question: 'What is the NIMCET exam pattern?',
          answer: 'NIMCET 2026 had 120 questions worth 1,000 marks in two hours, with 25% negative marking. Mathematics carried 600 marks, analytical reasoning 240, computer awareness 120 and English 40.'
        },
        {
          question: 'What is the fee for MCA in India?',
          answer: 'Across 393 MCA fee records in our database, the median is ₹65,000 a year and half of programmes charge ₹37,500–₹1,05,000. The public-institute median is ₹40,000 and the private median ₹66,667.'
        },
        {
          question: 'What can I do after MCA?',
          answer: 'Most MCA graduates work as software developers, testers, data analysts or cloud engineers. You can also pursue a PhD or specialised certifications.'
        }
      ]
    },
    'online-mba': {
      h1: 'Online MBA in India: Validity, UGC Approval, Eligibility & Fees',
      title: 'Online MBA in India: Is It Valid? Eligibility & Fees',
      description:
        'Online MBA guide: UGC validity and how to check a university, eligibility, online vs regular vs distance MBA, fees and tips for working professionals.',
      keywords: ['online MBA', 'online MBA in India', 'UGC approved online MBA', 'online MBA fees', 'online MBA eligibility', 'distance MBA', 'online MBA for working professionals'],
      intro:
        'An online MBA is a two-year MBA delivered over the internet. From a UGC-entitled university it is equivalent to a regular MBA. Check the university’s entitlement, eligibility and total fees before you enrol.',
      crossLink: {
        href: '/online-mba-colleges',
        anchor: 'Compare online MBA colleges',
        note: 'Ready to shortlist? Browse online MBA programmes and check each university on the UGC-DEB list.'
      },
      faqs: [
        {
          question: 'Is an online MBA valid in India?',
          answer: 'Yes, if the university is entitled by UGC to offer it. Under Regulation 22 of the UGC ODL and Online Regulations, 2020, online degrees from recognised institutions are equivalent to the same degree in regular mode.'
        },
        {
          question: 'How do I check if an online MBA is UGC approved?',
          answer: 'Find the university on the UGC Distance Education Bureau (deb.ugc.ac.in) list of institutions entitled to offer online degree programmes for your session, and check that the MBA appears against it.'
        },
        {
          question: 'What is the eligibility for an online MBA?',
          answer: 'UGC requires the same entry qualification as the regular MBA. AICTE’s regular-MBA minimum is a bachelor’s degree of at least three years with 50% marks (45% for reserved categories). Universities set the exact rules.'
        },
        {
          question: 'Do I need CAT for an online MBA?',
          answer: 'Not always. AICTE asks institutions to prefer CAT, XAT, CMAT, ATMA, MAT, GMAT or government entrance-test scores, but many universities also admit through their own test, interview or merit.'
        },
        {
          question: 'How long is an online MBA?',
          answer: 'Two years, the same as a regular MBA, usually in four semesters.'
        },
        {
          question: 'What is the difference between an online MBA and a distance MBA?',
          answer: 'An online MBA uses live and recorded classes on a learning platform. A distance (ODL) MBA relies on study material and occasional contact classes at study centres. Both need UGC-DEB recognition.'
        },
        {
          question: 'What are online MBA fees?',
          answer: 'Fees vary widely between universities, and our database has too few records for a reliable range. Ask each university for the total fee for all four semesters, including exam fees.'
        },
        {
          question: 'Is an Online PGDM the same as an online MBA?',
          answer: 'No. An Online PGDM is a postgraduate diploma from an AICTE-approved institute, while an online MBA is a degree awarded by a university.'
        }
      ]
    },
    bpharm: {
      h1: 'B.Pharm Course in India: Eligibility, Admission, Subjects & Fees',
      title: 'B.Pharm Course Details: Eligibility, Subjects, Fees & Exams',
      description:
        'B.Pharm guide: PCI eligibility (PCM/PCB), entrance exams, lateral entry after D.Pharm, subjects, fees (median ₹95,000 a year in our data) and careers.',
      keywords: ['B.Pharm course', 'B Pharmacy course details', 'B.Pharm eligibility', 'B.Pharm subjects', 'B.Pharm fees', 'B.Pharm lateral entry', 'B.Pharm vs Pharm.D'],
      intro:
        'B.Pharm (Bachelor of Pharmacy) is a four-year degree after Class 12 with Physics, Chemistry and Maths or Biology. Check PCI approval, eligibility, admission routes and fees before you shortlist colleges.',
      crossLink: {
        href: '/bpharm-colleges',
        anchor: 'Compare B.Pharm colleges by fees & placements',
        note: 'Ready to shortlist? Browse B.Pharm colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.Pharm?',
          answer: 'PCI requires a 10+2 pass with English, Physics and Chemistry, plus Mathematics or Biology, from a recognised board. You must be 17 by 31 December of the admission year. Open-school (NIOS) 10+2 is not accepted.'
        },
        {
          question: 'Can PCM students do B.Pharm?',
          answer: 'Yes. Both PCM and PCB students are eligible. Students without Biology take Remedial Biology in the first semester, and students without Mathematics take Remedial Mathematics.'
        },
        {
          question: 'How many years is the B.Pharm course?',
          answer: 'Four years (eight semesters). D.Pharm holders can join the third semester through lateral entry and finish in three years.'
        },
        {
          question: 'Is there an entrance exam for B.Pharm?',
          answer: 'There is no single national test. Many states use their own tests, such as MHT CET, KCET, WBJEE, GUJCET and OJEE. BITS uses BITSAT, and some colleges admit on Class 12 marks.'
        },
        {
          question: 'What subjects are in B.Pharm?',
          answer: 'Pharmaceutics, pharmaceutical and medicinal chemistry, pharmacology, pharmacognosy, biochemistry, microbiology, industrial pharmacy, quality assurance and pharmacy law, plus practice school and a project.'
        },
        {
          question: 'What is the fee for B.Pharm in India?',
          answer: 'Across 157 B.Pharm fee records in our database, the median is ₹95,000 a year and half of programmes charge ₹64,450–₹1,32,500. The public-institute median is ₹64,400 and the private median ₹1,04,250.'
        },
        {
          question: 'Can I become a pharmacist after B.Pharm?',
          answer: 'Yes. A B.Pharm from a PCI-approved institution lets you register as a pharmacist with your State Pharmacy Council (minimum age 18). PCI says B.Pharm (Honours) and B.Pharm + MBA are not approved for registration.'
        },
        {
          question: 'What is the difference between B.Pharm and Pharm.D?',
          answer: 'B.Pharm is a four-year degree focused on medicines and the pharmaceutical industry. Pharm.D is a six-year course after 10+2 with a clinical focus. Both qualify you to register as a pharmacist.'
        }
      ]
    },
    architecture: {
      h1: 'B.Arch Course in India: Eligibility, NATA, Subjects & Fees',
      title: 'B.Arch Course: Eligibility, NATA/JEE, Subjects & Fees',
      description:
        'B.Arch guide: CoA eligibility (Physics + Maths, 45%), NATA vs JEE Main Paper 2A, 5-year structure, fees (median ₹1.15 lakh a year in our data).',
      keywords: ['B.Arch course', 'B.Arch eligibility', 'B.Arch without chemistry', 'NATA vs JEE Main Paper 2', 'B.Arch subjects', 'B.Arch fees', 'B.Arch admission'],
      intro:
        'B.Arch is a five-year degree that leads to registration as an architect with the Council of Architecture. Check the subject rule, the aptitude test your counselling uses, and the total fees before you shortlist colleges.',
      crossLink: {
        href: '/barch-colleges',
        anchor: 'Compare B.Arch colleges by fees & exams',
        note: 'Ready to shortlist? Browse B.Arch colleges with recorded fees, accepted exams and placement outcomes, and check each one\'s CoA approval.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.Arch?',
          answer: 'From the 2024-25 session, CoA requires 10+2 with Physics and Mathematics plus one of Chemistry, Biology, a technical vocational subject, Computer Science, IT, Informatics Practices, Engineering Graphics or Business Studies, with 45% aggregate. A 10+3 diploma with Mathematics and 45% also qualifies. You must also qualify NATA or JEE Main Paper 2A.'
        },
        {
          question: 'Can I do B.Arch without Chemistry?',
          answer: 'Under the CoA minimum, yes, if you have Physics and Mathematics plus another listed subject. But some routes still need PCM: NIT seats through JoSAA ask for Physics, Chemistry and Mathematics, and Jadavpur University through WBJEE asks for 50% in PCM.'
        },
        {
          question: 'Is NATA compulsory for B.Arch?',
          answer: 'You need a qualifying score in an aptitude test: either NATA, run by CoA, or JEE Main Paper 2A, run by NTA. Which one counts depends on the college and counselling body. IIT seats need JEE Advanced plus the Architecture Aptitude Test.'
        },
        {
          question: 'What is the difference between NATA and JEE Main Paper 2A?',
          answer: 'NATA 2026 had 200 marks: an offline drawing part and an adaptive online part, with up to two attempts in Phase 1. JEE Main Paper 2A had 400 marks across Mathematics, Aptitude and a Drawing test, and its rank is used for NIT seats through JoSAA and by several states.'
        },
        {
          question: 'How many years is B.Arch?',
          answer: 'At least five years (10 semesters), including one semester of practical training in the 8th or 9th semester and a design thesis in the 10th. CoA says the course must be finished within eight years.'
        },
        {
          question: 'What is the fee for B.Arch in India?',
          answer: 'Across 123 B.Arch fee records in our database, the median is ₹1,15,000 a year and half of programmes charge ₹89,080–₹1,85,000. The public-institute median is ₹99,000 (21 records) and the private median ₹1,15,000. Confirm current fees with each college.'
        },
        {
          question: 'Do I need to register to work as an architect?',
          answer: 'Yes. Under the Architects Act, 1972, you must be registered with the Council of Architecture to use the title architect. A B.Arch from a CoA-recognised programme, with admission that met CoA eligibility, lets you apply.'
        },
        {
          question: 'What can I do after B.Arch?',
          answer: 'You can work in architecture firms, start your own practice after registration, or move into urban design, conservation, interior architecture, project management or government architect posts. Many students also take an M.Arch or M.Plan.'
        }
      ]
    },
    march: {
      h1: 'M.Arch Course in India: Eligibility, PGETA, GATE & Fees',
      title: 'M.Arch Course: Eligibility, PGETA vs GATE & Fees',
      description:
        'M.Arch guide: CoA eligibility (B.Arch with 50%), PGETA vs GATE AR via CCMT, specialisations and fees (median ₹1.13 lakh a year in our data).',
      keywords: ['M.Arch course', 'M.Arch eligibility', 'M.Arch entrance exam', 'PGETA', 'GATE architecture for M.Arch', 'M.Arch specialisations', 'M.Arch fees in India'],
      intro:
        'M.Arch is a two-year master\'s for B.Arch graduates who want to specialise. Check the 50% eligibility rule, whether your target institute uses PGETA or GATE, and the specialisation before you apply.',
      crossLink: {
        href: '/march-colleges',
        anchor: 'Compare M.Arch colleges by fees & exams',
        note: 'Ready to shortlist? Browse M.Arch colleges with recorded fees and accepted exams, and confirm each programme\'s CoA approval.'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Arch?',
          answer: 'Under the Council of Architecture PG Guidelines 2022, you need a B.Arch or equivalent with at least 50% aggregate marks or equivalent CGPA, and you must qualify an entrance test. Some routes ask for more: CCMT seats at NITs need 60% or 6.5 CGPA (55% or 6.0 for SC, ST and PwD).'
        },
        {
          question: 'Which entrance exam is needed for M.Arch?',
          answer: 'CoA conducts PGETA for admission to PG architecture programmes. NITs, IIEST Shibpur and some IIITs and CFTIs admit M.Arch students through CCMT using GATE Architecture and Planning (AR) scores. Other institutes may use their own test or interview, so check each admission notice.'
        },
        {
          question: 'What is PGETA?',
          answer: 'PGETA is the Council of Architecture\'s Post Graduate Entrance Test in Architecture. In 2026 it was a two-hour computer-based test with four modules, held on three dates; candidates could take up to three attempts and the best score counted. The score is valid for one academic year.'
        },
        {
          question: 'Can I take PGETA or GATE in the final year of B.Arch?',
          answer: 'Yes. The PGETA 2026 brochure allows final-year B.Arch students to take the test, and GATE allows students in the third or higher year of their degree to appear. You must still meet the 50% B.Arch rule at admission.'
        },
        {
          question: 'How long is the M.Arch course?',
          answer: 'At least two years (four semesters of about 18 working weeks) full time. CoA\'s guidelines say it must be finished within three years, with one extra year allowed once in exceptional circumstances.'
        },
        {
          question: 'What are the M.Arch specialisations?',
          answer: 'Common options include sustainable or environmental architecture, landscape, urban design, conservation and construction management. In our records 52 of 68 M.Arch programmes are listed as a general M.Arch, so check each institute\'s actual focus.'
        },
        {
          question: 'What is the fee for M.Arch in India?',
          answer: 'Across 28 M.Arch fee records in our database, the median is ₹1,13,000 a year and half of programmes charge ₹82,750–₹1,33,673. The sample is small, so confirm current fees with each institute.'
        },
        {
          question: 'Is M.Arch the same as M.Plan?',
          answer: 'No. M.Arch deepens architecture in a chosen specialisation, while M.Plan focuses on urban, regional, transport or housing planning. Both are often taught at architecture and planning schools, and NITs admit to both through CCMT using GATE.'
        }
      ]
    },
    'online-mca': {
      h1: 'Online MCA in India: Validity, UGC & AICTE Rules, Eligibility & Fees',
      title: 'Online MCA in India: Is It Valid? Eligibility & Fees',
      description:
        'Online MCA guide: UGC validity, the AICTE rule for deemed universities, eligibility, online vs regular vs distance MCA, fees and how to choose.',
      keywords: ['online MCA', 'online MCA course', 'online MCA fees', 'distance MCA', 'is online MCA valid', 'online MCA vs regular MCA', 'UGC approved online MCA'],
      intro:
        'An online MCA is a two-year MCA studied over the internet. From a UGC-entitled or recognised university it is equivalent to a regular MCA; deemed universities also need AICTE approval. Check the university, eligibility and total fees before you enrol.',
      crossLink: {
        href: '/online-mca-colleges',
        anchor: 'Compare online MCA colleges',
        note: 'Ready to shortlist? Browse online MCA programmes and check each university on the UGC-DEB list for your session.'
      },
      faqs: [
        {
          question: 'Is an online MCA valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer the MCA online for your session. Under Regulation 22 of the UGC ODL and Online Regulations, 2020, such degrees are equivalent to the same degree in regular mode.'
        },
        {
          question: 'Does an online MCA need AICTE approval?',
          answer: 'Only in some cases. UGC-DEB\'s October 2025 notice says central, state and private universities do not need prior AICTE approval for computer applications programmes, but deemed universities must get AICTE\'s prior approval or no-objection to offer them online.'
        },
        {
          question: 'How long is an online MCA?',
          answer: 'Two years, usually four semesters. AICTE lists the MCA as a two-year course in online and distance mode, and UGC requires the same duration as the regular programme.'
        },
        {
          question: 'Can I do an online MCA without Mathematics?',
          answer: 'It depends on the university. AICTE\'s entry routes are a BCA or computer science degree, or a BA, B.Sc or B.Com with Mathematics at Class 12 or degree level plus a bridge course. Check the university\'s own rule before applying.'
        },
        {
          question: 'Is there an entrance exam for an online MCA?',
          answer: 'Not always. AICTE asks institutions to prefer candidates with a State or Central Government entrance-test score, but many universities also admit on merit or through their own process. NIMCET is for the regular MCA at the NITs.'
        },
        {
          question: 'How many universities offer an online MCA?',
          answer: 'We counted 69 universities listed for an online MCA for 2025-26 on the UGC-DEB programme list: 32 private, 23 deemed, 10 state, 2 central and 2 open universities. The list changes each session.'
        },
        {
          question: 'What is the difference between an online MCA and a distance MCA?',
          answer: 'An online MCA uses live and recorded classes on a learning platform. A distance (ODL) MCA relies on study material and contact classes at study centres. Both need UGC-DEB recognition for the session.'
        },
        {
          question: 'What are online MCA fees?',
          answer: 'Fees vary widely between universities, and our database has no fee records for online MCA programmes yet. Ask each university for the total fee for all four semesters, including exam fees.'
        }
      ]
    },
    'online-ma': {
      h1: 'Online MA in India: Validity, Subjects, Eligibility & Fees',
      title: 'Online MA in India: Is It Valid? Subjects & Eligibility',
      description:
        'Online MA guide: UGC validity, checking your subject on the UGC-DEB list, eligibility, subjects offered in 2025-26, online vs distance MA and fees.',
      keywords: ['online MA', 'online MA degree', 'online MA in India', 'online MA course', 'online MA English', 'distance MA', 'is online MA valid'],
      intro:
        'An online MA is a Master of Arts studied over the internet, usually in two years. From a UGC-entitled or recognised university it is equivalent to a regular MA. Check that your exact subject is listed for online mode before you enrol.',
      crossLink: {
        href: '/ma-colleges',
        anchor: 'Compare MA colleges',
        note: 'Prefer campus study? Browse MA colleges, or check each online MA on the UGC-DEB list for your session.'
      },
      faqs: [
        {
          question: 'Is an online MA valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that MA subject online for your session. Under Regulation 22 of the UGC ODL and Online Regulations, 2020, such degrees are equivalent to the same degree in regular mode.'
        },
        {
          question: 'How do I check if an online MA is UGC approved?',
          answer: 'Open the UGC-DEB website and check that the university and your exact MA subject are listed for online mode for your academic session. Approval for one subject does not cover another.'
        },
        {
          question: 'What is the eligibility for an online MA?',
          answer: 'The same as the university\'s regular MA, usually a bachelor\'s degree, often in the same or a related subject. UGC\'s PG framework also lets you join a different subject if you qualify a national or university entrance test in it.'
        },
        {
          question: 'How long is an online MA?',
          answer: 'Usually two years after a three-year bachelor\'s degree. UGC\'s 2024 PG framework also allows a one-year MA after a four-year honours degree where the university offers it.'
        },
        {
          question: 'Which MA subjects can I study online?',
          answer: 'In 2025-26 the UGC-DEB list showed English at 43 universities, journalism and mass communication at 30, economics at 26 and political science at 18, with smaller numbers for sociology, history, Hindi and others.'
        },
        {
          question: 'Can I do an online MA along with a regular degree?',
          answer: 'Yes. UGC\'s PG framework allows one full-time physical programme plus one online or distance programme, or up to two online or distance programmes, from UGC-recognised institutions.'
        },
        {
          question: 'What is the difference between an online MA and a distance MA?',
          answer: 'An online MA uses recorded and live classes and online assessment. A distance (ODL) MA relies on self-learning material and contact classes at study centres. UGC-DEB recognises each separately.'
        },
        {
          question: 'What are online MA fees?',
          answer: 'Fees vary by university and subject, and our database has no fee records for online MA programmes yet. Ask for the total fee for all semesters, including exam fees.'
        }
      ]
    },
    'online-mcom': {
      h1: 'Online M.Com in India: Validity, Eligibility, Subjects & Fees',
      title: 'Online M.Com in India: Is It Valid? Eligibility & Fees',
      description:
        'Online M.Com guide: UGC validity, how to check a university, eligibility, online vs distance M.Com, M.Com vs MBA and who offers it in 2025-26.',
      keywords: ['online M.Com', 'online MCom', 'online MCom course', 'distance MCom', 'is online MCom valid', 'online MCom vs online MBA', 'online MCom fees'],
      intro:
        'An online M.Com is a Master of Commerce studied over the internet, usually in two years. From a UGC-entitled or recognised university it is equivalent to a regular M.Com. Check the university, eligibility and total fees before you enrol.',
      crossLink: {
        href: '/mcom-colleges',
        anchor: 'Compare M.Com colleges',
        note: 'Prefer campus study? Browse M.Com colleges, or check each online M.Com on the UGC-DEB list for your session.'
      },
      faqs: [
        {
          question: 'Is an online M.Com valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer the M.Com online for your session. Under Regulation 22 of the UGC ODL and Online Regulations, 2020, such degrees are equivalent to the same degree in regular mode.'
        },
        {
          question: 'What is the eligibility for an online M.Com?',
          answer: 'The same as the university\'s regular M.Com, commonly a B.Com or a related degree. Minimum marks, if any, are set by each university. Graduates of other subjects may qualify through a national or university entrance test.'
        },
        {
          question: 'How long is an online M.Com?',
          answer: 'Usually two years after a three-year bachelor\'s degree. UGC\'s 2024 PG framework also allows a one-year PG after a four-year honours degree where the university offers it.'
        },
        {
          question: 'Is there an entrance exam for an online M.Com?',
          answer: 'Usually not. Most online M.Com programmes admit on merit after document checks, but read each university\'s admission notice.'
        },
        {
          question: 'How many universities offer an online M.Com?',
          answer: 'We counted 55 universities listed for an online M.Com in 2025-26 on the UGC-DEB programme list: 21 state, 17 private, 10 deemed, 4 central and 3 open universities.'
        },
        {
          question: 'Should I choose an online M.Com or an online MBA?',
          answer: 'An M.Com goes deeper into accounting, finance and taxation and usually needs a B.Com. An MBA covers general management, accepts any bachelor\'s degree and suits management roles or a career switch.'
        },
        {
          question: 'What is the difference between an online M.Com and a distance M.Com?',
          answer: 'An online M.Com uses recorded and live classes on a platform. A distance (ODL) M.Com relies on self-learning material and contact classes. UGC-DEB recognises each mode separately.'
        },
        {
          question: 'What are online M.Com fees?',
          answer: 'Fees vary by university, and our database has no fee records for online M.Com programmes yet. Ask for the total fee for all semesters, including exam fees.'
        }
      ]
    },
    'online-msc': {
      h1: 'Online M.Sc in India: Allowed Subjects, Validity & Eligibility',
      title: 'Online M.Sc in India: Allowed Subjects, Validity & Fees',
      description:
        'Online M.Sc guide: UGC\'s lab rule, which subjects can be studied online, validity, eligibility, online vs distance M.Sc and 2025-26 subject counts.',
      keywords: ['online M.Sc', 'online MSc course', 'online MSc mathematics', 'online MSc data science', 'online MSc in India', 'distance MSc', 'is online MSc valid'],
      intro:
        'An online M.Sc is possible only in subjects without compulsory lab work, such as mathematics, statistics and data science. From a UGC-entitled or recognised university it is equivalent to a regular M.Sc. Check your exact subject on the UGC-DEB list before you enrol.',
      crossLink: {
        href: '/msc-colleges',
        anchor: 'Compare M.Sc colleges',
        note: 'Need a lab subject or prefer campus study? Browse M.Sc colleges, or check each online M.Sc on the UGC-DEB list for your session.'
      },
      faqs: [
        {
          question: 'Can I do an M.Sc online in India?',
          answer: 'Yes, but only in subjects without compulsory lab work. UGC rules prohibit programmes with practical or laboratory courses in online mode unless the practicals are limited to programming, coding and software tools.'
        },
        {
          question: 'Is an online M.Sc in physics or chemistry allowed?',
          answer: 'Not in online mode, because these subjects need laboratory practicals. In the 2025-26 UGC-DEB list, physics, chemistry, zoology and botany M.Sc programmes appear only in distance mode, which has its own conditions for lab subjects.'
        },
        {
          question: 'Which M.Sc subjects are offered online?',
          answer: 'In 2025-26 the UGC-DEB list showed online M.Sc mathematics at 22 universities, data science, AI and analytics at 10, and statistics at 4, with a few in economics or computer applications.'
        },
        {
          question: 'Is an online M.Sc valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that M.Sc subject online for your session. Under Regulation 22 of the UGC ODL and Online Regulations, 2020, such degrees are equivalent to regular degrees.'
        },
        {
          question: 'What is the eligibility for an online M.Sc?',
          answer: 'The same as the university\'s regular M.Sc, usually a B.Sc in the same or a related subject. Minimum marks are set by each university; a national or university entrance test can open other subjects.'
        },
        {
          question: 'How long is an online M.Sc?',
          answer: 'Usually two years after a three-year degree. UGC\'s 2024 PG framework also allows a one-year PG after a four-year honours degree where the university offers it.'
        },
        {
          question: 'What is the difference between an online M.Sc and a distance M.Sc?',
          answer: 'An online M.Sc is limited to subjects whose practicals are software-based. A distance (ODL) M.Sc can include lab subjects, but only at universities meeting UGC\'s NAAC, NIRF or open-university conditions, from approved centres.'
        },
        {
          question: 'What are online M.Sc fees?',
          answer: 'Fees vary by university and subject, and our database has no fee records for online M.Sc programmes yet. Ask for the total fee for all semesters, including exam fees.'
        }
      ]
    },
    law: {
      h1: 'LLB Course in India: 3-Year LLB Eligibility, Exams, Fees & Subjects',
      title: '3-Year LLB Course: Eligibility, Entrance Exams & Fees',
      description:
        '3-year LLB guide: BCI eligibility (45% in any degree), age-limit status, state entrance tests, subjects, fees (median ₹45,000 a year) and careers.',
      keywords: ['LLB course', '3 year LLB', 'LLB eligibility', 'LLB after graduation', 'LLB age limit', 'LLB entrance exam', 'LLB fees'],
      intro:
        'The 3-year LLB is a law degree you take after any bachelor’s degree. Check BCI eligibility, the age-limit position, state entrance tests and fees before you shortlist law colleges.',
      crossLink: {
        href: '/llb-colleges',
        anchor: 'Compare LLB colleges by fees & exams',
        note: 'Ready to shortlist? Browse LLB colleges with recorded fees and accepted exams, and check each college’s BCI approval.'
      },
      faqs: [
        {
          question: 'What is the eligibility for a 3-year LLB?',
          answer: 'A bachelor’s degree in any subject from a recognised university, with at least 45% marks (42% for OBC, 40% for SC/ST) under Bar Council of India rules. You need the 10th, 12th and degree pattern; universities and states may add conditions.'
        },
        {
          question: 'Is there an age limit for LLB admission?',
          answer: 'No upper age limit is enforced at present. BCI’s 2016 circular setting 30 years for the 3-year LLB was stayed by the Supreme Court on 3 March 2017, and the case is pending. Check your university’s current notice.'
        },
        {
          question: 'Can I get into a 3-year LLB through CLAT?',
          answer: 'CLAT UG is for the five-year integrated programmes at National Law Universities after Class 12. For a 3-year LLB, look at state tests such as MAH LL.B 3-Yr CET, TS LAWCET and AP LAWCET, or university tests.'
        },
        {
          question: 'Which entrance exams are there for the 3-year LLB?',
          answer: 'There is no national test. In 2026, Maharashtra ran the MAH LL.B 3-Yr CET, Telangana ran TS LAWCET and Andhra Pradesh ran AP LAWCET. Many universities hold their own test or admit on degree marks.'
        },
        {
          question: 'Is a distance-mode LLB valid for practising law?',
          answer: 'No. BCI rules require a regular course and exclude departments that teach law by correspondence or distance education, so a distance LLB does not lead to enrolment as an advocate.'
        },
        {
          question: 'What is the fee for a 3-year LLB?',
          answer: 'Across 140 three-year LLB fee records in our database, the median is ₹45,000 a year and half of programmes charge ₹30,000–₹98,000. The public-institute median is ₹15,000 and the private median ₹54,000.'
        },
        {
          question: 'What do I need to practise as a lawyer after LLB?',
          answer: 'Enrol with your State Bar Council and pass the All India Bar Examination (AIBE) to receive a Certificate of Practice. Final-semester students without backlogs can apply for the AIBE.'
        },
        {
          question: 'Should I choose a 3-year LLB or a 5-year integrated LLB?',
          answer: 'Take the 3-year LLB if you already have a degree or want to study another subject first. A 5-year course such as BA LLB saves a year if you are sure about law after Class 12.'
        }
      ]
    },
    'integrated-law': {
      h1: 'Integrated Law Course: BA LLB, BBA LLB Eligibility, CLAT & Fees',
      title: '5-Year Integrated LLB: BA LLB, BBA LLB, CLAT & Fees',
      description:
        '5-year integrated LLB guide: BCI eligibility after Class 12, CLAT 2027 and AILET dates, BA LLB vs BBA LLB, subjects and fees (median ₹1 lakh a year).',
      keywords: ['integrated law course', '5 year LLB', 'BA LLB', 'BBA LLB', 'integrated LLB eligibility', 'LLB after 12th', 'BA LLB fees'],
      intro:
        'An integrated law course combines a bachelor’s degree such as a BA or BBA with the LLB in five years after Class 12. Check BCI eligibility, CLAT and AILET dates, combinations and fees before you apply.',
      crossLink: {
        href: '/llb-colleges',
        anchor: 'Compare law colleges by fees & exams',
        note: 'Ready to shortlist? Browse law colleges with recorded fees and accepted exams, and check each college’s BCI approval for the combination you want.'
      },
      faqs: [
        {
          question: 'What is the eligibility for a 5-year integrated LLB?',
          answer: 'Class 12 in any stream from a recognised board with at least 45% marks (42% for OBC, 40% for SC/ST) under Bar Council of India rules. Some NLUs set higher minimums in their brochures.'
        },
        {
          question: 'When is CLAT 2027?',
          answer: 'The Consortium of NLUs will hold CLAT 2027 offline on 6 December 2026, from 2 pm to 4 pm. Applications are open from 3 August to 31 October 2026.'
        },
        {
          question: 'Is there an age limit for BA LLB?',
          answer: 'No upper age limit is enforced at present. A 2016 BCI circular setting 20 years (22 for reserved categories) was stayed by the Supreme Court in March 2017, and CLAT 2027 has no upper age limit.'
        },
        {
          question: 'Which is better, BA LLB or BBA LLB?',
          answer: 'The law papers are the same. BA LLB pairs law with social sciences; BBA LLB pairs it with management and accounts, which suits corporate law. Choose the first degree you will actually use.'
        },
        {
          question: 'Can I join a BA LLB from the commerce or science stream?',
          answer: 'Yes. BCI accepts Class 12 in any stream. Check the individual university’s minimum marks and admission test.'
        },
        {
          question: 'Does NLU Delhi accept CLAT?',
          answer: 'No. NLU Delhi admits to its BA LLB (Hons) through its own test, AILET. AILET 2027 is on 13 December 2026, with applications open until 10 November 2026.'
        },
        {
          question: 'What is the fee for a 5-year integrated LLB?',
          answer: 'Across 274 fee records in our database, the median is ₹1,00,000 a year and half of programmes charge ₹60,000–₹1,80,000. NLU fees can be higher; check each NLU’s CLAT brochure.'
        },
        {
          question: 'How many years is an integrated law course?',
          answer: 'At least five years, usually ten semesters. BCI rules say a law degree combined with a four-year degree, such as engineering, takes six years.'
        }
      ]
    },
    dental: {
      h1: 'BDS Course in India: Eligibility, NEET, Subjects, Internship & Fees',
      title: 'BDS Course Details: Eligibility, NEET, Duration & Fees',
      description:
        'BDS guide: 4 years + 1-year internship, NEET (UG) and 50% PCB eligibility, MCC/state counselling, year-wise subjects and official 2026-27 fees.',
      keywords: ['BDS course', 'BDS course details', 'BDS eligibility', 'BDS course duration', 'BDS subjects', 'BDS fees', 'BDS vs MBBS'],
      intro:
        'BDS (Bachelor of Dental Surgery) takes four academic years plus a one-year paid internship, and every seat is filled through NEET (UG). Check eligibility, counselling routes and the full cost before you shortlist dental colleges.',
      crossLink: {
        href: '/bds-colleges',
        anchor: 'Compare BDS colleges by fees & placements',
        note: 'Ready to shortlist? Browse BDS colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for BDS?',
          answer: 'You must pass Physics, Chemistry, Biology/Biotechnology and English in Class 12 with at least 50% in PCB together (40% for SC, ST and OBC; 45% for locomotor disability), qualify NEET (UG) and be 17 by 31 December of the admission year.'
        },
        {
          question: 'How many years is the BDS course?',
          answer: 'Five years: four academic years with a university exam each year, then a compulsory one-year paid rotating internship. The degree is awarded only after the internship.'
        },
        {
          question: 'Can I get BDS admission without NEET?',
          answer: 'No. DCI regulations make NEET (UG) the single entrance test for BDS, and all admissions, including deemed university and NRI seats, are made from the NEET merit list.'
        },
        {
          question: 'What NEET percentile is needed for BDS?',
          answer: 'The 50th percentile for General candidates, the 40th for SC, ST and OBC, and the 45th for candidates with a benchmark disability in the General category. These only make you eligible; seats depend on your rank.'
        },
        {
          question: 'Who conducts BDS counselling?',
          answer: 'The Medical Counselling Committee (MCC) handles the 15% All India Quota, central university, ESIC Dental and deemed university seats. State authorities handle state-quota and private college seats. Register for both if you are eligible.'
        },
        {
          question: 'What subjects are taught in BDS?',
          answer: 'Anatomy, physiology, biochemistry, dental anatomy and dental materials in year one; pathology, microbiology and pharmacology in year two; general medicine, surgery and oral pathology in year three; and eight clinical dental subjects in the final year.'
        },
        {
          question: 'What are BDS fees in India?',
          answer: 'Official 2026-27 examples: ESIC Dental College, Kalaburagi charges ₹1,00,000 a year in tuition for state and All India Quota seats, and Vinayaka Mission\'s Sankarachariyar Dental College, Salem (deemed) charges ₹4,50,000. Hostel and mess are extra.'
        },
        {
          question: 'What can I do after BDS?',
          answer: 'Register with a State Dental Council and practise as a dentist, join government or Army Dental Corps posts through their own recruitment, or study a three-year MDS through NEET MDS.'
        }
      ]
    },
    mds: {
      h1: 'MDS Course After BDS: Eligibility, NEET MDS, Specialities & Fees',
      title: 'MDS Course: Eligibility, NEET MDS, Specialities & Fees',
      description:
        'MDS guide: 3-year dental PG after BDS + internship, NEET MDS 2026 pattern and lowered cut-off, 9 specialities, fees (median ₹3 lakh/year in our data).',
      keywords: ['MDS course', 'MDS course after BDS', 'MDS eligibility', 'MDS specialities', 'NEET MDS', 'MDS fees', 'MDS course duration'],
      intro:
        'MDS (Master of Dental Surgery) is a three-year specialist degree after BDS and the one-year internship, with admission only through NEET MDS. Compare the nine specialities, the exam rules and the full cost before you choose.',
      crossLink: {
        href: '/mds-colleges',
        anchor: 'Compare MDS colleges by fees & specialities',
        note: 'Ready to shortlist? Browse MDS colleges with recorded fees, specialities and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for MDS?',
          answer: 'A recognised BDS from an Indian university or institute, completion of the one-year compulsory rotatory internship, and provisional or permanent registration with a State Dental Council. You must also qualify NEET MDS.'
        },
        {
          question: 'How many years is the MDS course?',
          answer: 'Three years full-time, including exams, with a maximum of six years to finish. Holders of a dental postgraduate diploma in the same speciality can complete the MDS in two years.'
        },
        {
          question: 'Is NEET MDS compulsory for MDS admission?',
          answer: 'Yes. NEET MDS, conducted by NBEMS, is the single entrance test for MDS seats, including state-quota, private and deemed university seats. No state or private college may hold its own test. AIIMS New Delhi is not covered by NEET MDS.'
        },
        {
          question: 'What is the NEET MDS exam pattern?',
          answer: 'In 2026 it had 240 multiple-choice questions in 180 minutes: Part A with 100 questions in 75 minutes and Part B with 140 in 105 minutes. Each correct answer earns 4 marks and each wrong answer loses 1, for 960 marks.'
        },
        {
          question: 'What is the NEET MDS qualifying percentile?',
          answer: 'The regulations set the 50th percentile for General, 45th for UR-PwD and 40th for SC, ST and OBC. For 2026-27 the National Dental Commission lowered these by 10 points, to the 40th, 35th and 30th percentiles.'
        },
        {
          question: 'Which MDS specialities are there?',
          answer: 'Nine: Conservative Dentistry and Endodontics, Orthodontics, Prosthodontics and Crown & Bridge, Periodontology, Paediatric and Preventive Dentistry, Oral Pathology, Oral Medicine and Radiology, Oral and Maxillofacial Surgery, and Public Health Dentistry.'
        },
        {
          question: 'What are MDS fees in India?',
          answer: 'Across 87 MDS fee records at 18 institutes in our database, the median is ₹3,00,000 a year and half charge ₹2,00,000–₹5,60,000. The public median is ₹1,03,333 and the private median ₹3,73,333.'
        },
        {
          question: 'Is NEET MDS the same as NEET PG?',
          answer: 'No. NEET MDS is for BDS graduates seeking MDS seats. NEET PG is for MBBS graduates seeking MD, MS or DNB seats. Both are conducted by NBEMS.'
        }
      ]
    },
    'chartered-accountancy': {
      h1: 'CA Course in India: Eligibility, Duration, Articleship & Fees',
      title: 'CA Course Details: Eligibility, Duration, Exams & Fees',
      description:
        'CA course guide: ICAI levels, direct entry (55% commerce, 60% others), 2-year articleship, 2026 exam months, ICAI fees and how long CA really takes.',
      keywords: ['CA course', 'CA course details', 'CA course duration', 'CA course fees', 'how to become CA', 'CA eligibility', 'CA after 12th'],
      intro:
        'Chartered Accountancy (CA) is ICAI\'s professional qualification: three exam levels plus two years of articleship. Check both entry routes, exam months, ICAI fees and the real time it takes before you register.',
      crossLink: {
        href: '/bcom-colleges',
        anchor: 'Compare B.Com colleges',
        note: 'Studying for a degree alongside CA? Compare B.Com colleges by fees, timetable and admission route.'
      },
      faqs: [
        {
          question: 'Is CA a degree?',
          answer: 'No. CA is a professional qualification and membership awarded by the Institute of Chartered Accountants of India (ICAI) under the Chartered Accountants Act, 1949. UGC resolved in 2021 that the CA qualification is equivalent to a postgraduate degree.'
        },
        {
          question: 'Can I do CA after Class 12?',
          answer: 'Yes. You can register for ICAI\'s first-level course after Class 10 and sit its exam after appearing in Class 12, once you have been registered for four months.'
        },
        {
          question: 'What is CA direct entry?',
          answer: 'Graduates or postgraduates in commerce with 55% marks, graduates in other streams with 60%, and students who passed the CS or CMA Intermediate level can register straight for CA Intermediate and skip the first level.'
        },
        {
          question: 'How many years does CA take?',
          answer: 'ICAI\'s minimum periods add up to about 43 months after Class 12 (about 3.5 years). Waiting for results, fixed exam months and re-attempts usually make it longer.'
        },
        {
          question: 'When can I start CA articleship?',
          answer: 'Only after passing both groups of the Intermediate exam and completing the four-week ICITSS course. Articleship lasts two years.'
        },
        {
          question: 'How often are CA exams held?',
          answer: 'ICAI holds the first-level and Intermediate exams in January, May and September. From May 2026, the Final exam is held twice a year, in May and November.'
        },
        {
          question: 'What are ICAI\'s CA registration fees?',
          answer: '₹9,000 for the first level, ₹18,000 for Intermediate (both groups) and ₹22,000 for Final (both groups), per ICAI\'s FAQs updated July 2026. Exam fees, ICITSS fees and coaching are extra.'
        },
        {
          question: 'Can I do a B.Com and CA together?',
          answer: 'Yes. Many students study for a degree alongside CA. Check the college\'s attendance rules and plan around ICAI\'s exam months.'
        }
      ]
    },
    cma: {
      h1: 'CMA Course in India: Eligibility, Subjects, Training & Fees',
      title: 'CMA Course Details: Eligibility, Duration & ICMAI Fees',
      description:
        'ICMAI CMA course guide: who can join at which level, Syllabus 2022 papers, 15-month training, June/December exams, fees (about ₹64,350) and CMA vs CA.',
      keywords: ['CMA course', 'CMA course details', 'CMA course duration', 'CMA course fees', 'CMA eligibility', 'CMA vs CA', 'cost and management accounting course'],
      intro:
        'CMA is ICMAI\'s professional qualification in cost and management accounting: three exam levels and 15 months of practical training. Check which level you can start at, the cut-off dates, ICMAI fees and the fastest timeline.',
      crossLink: {
        href: '/bcom-colleges',
        anchor: 'Compare B.Com colleges',
        note: 'Planning CMA alongside a degree? Compare B.Com colleges by fees, timetable and admission route.'
      },
      faqs: [
        {
          question: 'What is the full form of CMA in India?',
          answer: 'CMA stands for Cost and Management Accountant. In India the qualification is awarded by the Institute of Cost Accountants of India (ICMAI).'
        },
        {
          question: 'Can a graduate join CMA directly at Intermediate?',
          answer: 'Yes. Graduates of a recognised university in any discipline other than fine or performing arts can register directly for Intermediate. ICMAI\'s rule sets no minimum percentage.'
        },
        {
          question: 'How long does the CMA course take?',
          answer: 'If you pass every exam at the first attempt, about two years from first-level admission or about one and a half years from Intermediate registration. Re-attempts add six months each.'
        },
        {
          question: 'When are CMA exams held?',
          answer: 'Twice a year, in the June and December terms. Register by 31 January for June or by 31 July for December.'
        },
        {
          question: 'How long is CMA practical training?',
          answer: '15 months for students who registered for Intermediate on or after 11 February 2020. You can start on Intermediate registration and need at least 10 certified months before the Final exam.'
        },
        {
          question: 'What are ICMAI\'s fees for the CMA course?',
          answer: 'Per the CMA Prospectus 2025: ₹6,000 (first level), ₹23,100 (Intermediate) and ₹25,000 (Final) coaching, ₹2,500 training registration and exam fees of ₹1,500 to ₹3,200. About ₹64,350 in total for one attempt each, before GST.'
        },
        {
          question: 'Is CMA equivalent to a postgraduate degree?',
          answer: 'ICMAI states that UGC recognises the CMA qualification as equivalent to a postgraduate degree. Universities set their own rules for PhD admission.'
        },
        {
          question: 'Is ICMAI\'s CMA the same as the US CMA?',
          answer: 'No. The US CMA is a separate qualification from the Institute of Management Accountants. ICMAI\'s CMA is the Indian statutory qualification for cost accountants.'
        }
      ]
    },
    mcom: {
      h1: 'M.Com Course: Eligibility, Entrance Exams, Subjects & Fees',
      title: 'M.Com Course Details: Eligibility, Subjects & Fees',
      description:
        'M.Com guide: 1-year vs 2-year under UGC\'s 2024 rules, eligibility, CUET PG, subjects, specialisations and fees (median ₹34,500 a year in our data).',
      keywords: ['M.Com course', 'M.Com eligibility', 'M.Com subjects list', 'M.Com fees', 'M.Com entrance exam', 'one year M.Com', 'courses after M.Com'],
      intro:
        'M.Com (Master of Commerce) is a postgraduate degree in accounting, finance and tax: two years after a three-year degree, or one year after a four-year honours degree under UGC\'s 2024 framework. Check eligibility, CUET PG, subjects and fees before you shortlist.',
      crossLink: {
        href: '/mcom-colleges',
        anchor: 'Compare M.Com colleges by fees & exams',
        note: 'Ready to shortlist? Browse M.Com colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of M.Com?',
          answer: 'M.Com stands for Master of Commerce, a postgraduate degree in accounting, finance, taxation and business.'
        },
        {
          question: 'Is M.Com one year or two years?',
          answer: 'Under UGC\'s 2024 PG framework it is two years after a three-year bachelor\'s degree, and can be one year after a four-year honours or honours-with-research degree. Each university decides which formats it offers.'
        },
        {
          question: 'Can I leave a two-year M.Com after one year?',
          answer: 'The UGC framework allows one exit point: students who leave after the first year receive a postgraduate diploma.'
        },
        {
          question: 'Which entrance exam is needed for M.Com?',
          answer: 'Many central universities use CUET PG; Delhi University used the Commerce paper COQP08 for 2026-27. Other universities use their own tests or merit.'
        },
        {
          question: 'Can I do an M.Com without a B.Com?',
          answer: 'Some universities accept related degrees such as BBA, BMS or Business Economics. Under the UGC framework, a graduate from another subject can also qualify by passing a national or university entrance test in commerce.'
        },
        {
          question: 'How much does an M.Com cost?',
          answer: 'In CollegeDecision records the median annual fee is ₹34,500 (138 programmes). Public colleges have a median of ₹15,400 a year and private colleges ₹40,000.'
        },
        {
          question: 'Is M.Com better than an MBA?',
          answer: 'They suit different goals. An M.Com focuses on accounting, finance and research and suits teaching or finance roles; an MBA focuses on general management and campus placements.'
        },
        {
          question: 'What can I do after an M.Com?',
          answer: 'Accounts, tax, banking and finance roles; a PhD or UGC-NET for teaching and research; or professional courses such as CA, CMA or CS.'
        }
      ]
    },
    pgdca: {
      h1: 'PGDCA Course: Duration, Eligibility, Syllabus & Fees',
      title: 'PGDCA Course Details: Duration, Eligibility & Syllabus',
      description:
        'PGDCA guide: 1-year duration at IGNOU, MCU, PRSU and GNDU, eligibility for any-stream graduates, syllabus, IGNOU fees and PGDCA vs MCA.',
      keywords: ['PGDCA course', 'PGDCA full form', 'PGDCA duration', 'PGDCA eligibility', 'PGDCA syllabus', 'IGNOU PGDCA', 'PGDCA vs MCA'],
      intro:
        'PGDCA (Post Graduate Diploma in Computer Applications) is a one-year, two-semester diploma for graduates of any stream at the universities we checked. See eligibility, syllabus, IGNOU\'s fee and how it compares with an MCA.',
      crossLink: {
        href: '/mca-colleges',
        anchor: 'Compare MCA colleges by fees & exams',
        note: 'Thinking of a full master\'s degree instead? Browse MCA colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the full form of PGDCA?',
          answer: 'PGDCA stands for Post Graduate Diploma in Computer Applications, a diploma taken after a bachelor\'s degree.'
        },
        {
          question: 'Is PGDCA one year or two years?',
          answer: 'IGNOU, MCU Bhopal, PRSU Raipur and GNDU all run it as a one-year, two-semester programme. IGNOU allows up to three years to finish. Check the prospectus of your university.'
        },
        {
          question: 'Who is eligible for PGDCA?',
          answer: 'Graduates from any stream. IGNOU asks for a bachelor\'s degree of at least three years; students without Maths at 10+2 or in the degree must also clear the bridge course BCS-012.'
        },
        {
          question: 'Can a commerce or arts graduate do PGDCA?',
          answer: 'Yes. The universities we checked accept graduates in any discipline, though some add a Maths condition or minimum marks.'
        },
        {
          question: 'What subjects are taught in PGDCA?',
          answer: 'It varies by university. IGNOU covers C and Python, computer organisation, operating systems, Java, databases and data structures; MCU Bhopal and PRSU Raipur add office software, web development and Tally.'
        },
        {
          question: 'What is the fee for IGNOU PGDCA?',
          answer: 'IGNOU\'s programme page lists ₹11,000 per semester for Indian students, with exam fees charged separately. Confirm the current fee on the IGNOU website before paying.'
        },
        {
          question: 'Is PGDCA equal to MCA?',
          answer: 'No. PGDCA is a postgraduate diploma of usually one year; MCA is a master\'s degree, two years after a three-year bachelor\'s degree under UGC\'s 2024 framework.'
        },
        {
          question: 'Is there an entrance exam for PGDCA?',
          answer: 'There is no national PGDCA entrance test. Universities usually admit directly or on merit; check each admission notice.'
        }
      ]
    },
    healthcare: {
      h1: 'Allied & Healthcare Courses After 12th: List, NCAHP Rules & Fees',
      title: 'Allied Health Courses After 12th: NCAHP Rules & Fees',
      description:
        'Allied and healthcare UG courses: NCAHP\'s 10 categories, new 4–5 year degrees, NEET and eligibility rules for 2026-27, fees and how to choose.',
      keywords: ['allied health courses after 12th', 'allied health sciences courses', 'paramedical courses after 12th', 'NCAHP courses', 'healthcare courses after 12th', 'B.Optom duration', 'allied health courses NEET'],
      intro:
        'Allied and healthcare courses train you for clinical and technical roles such as optometry, lab science, imaging and therapy. From 2026-27, NCAHP curricula, new UGC degree names and NEET rules apply, so check each course carefully.',
      crossLink: {
        href: '/bsc-colleges',
        anchor: 'Compare B.Sc colleges',
        note: 'Many allied health programmes are listed as B.Sc degrees. Check each college\'s NCAHP curriculum and state council approval before you shortlist.'
      },
      faqs: [
        {
          question: 'What are allied and healthcare courses?',
          answer: 'They are diplomas and degrees for professions listed in the NCAHP Act, 2021, such as medical lab technologists, optometrists, physiotherapists, occupational therapists, OT and anaesthesia technologists, imaging technologists and dieticians.'
        },
        {
          question: 'Who regulates allied health courses in India?',
          answer: 'The National Commission for Allied and Healthcare Professions (NCAHP), set up under the NCAHP Act, 2021, which came into force on 25 May 2021. Nursing, pharmacy and medicine have their own regulators.'
        },
        {
          question: 'Is NEET required for allied health courses?',
          answer: 'For some UG courses, yes. NCAHP told school boards in November 2025 that NEET appearance is a basic eligibility criterion for some UG allied and healthcare courses from 2026-27. Check the curriculum for your course and your state\'s counselling rules.'
        },
        {
          question: 'How many years is a B.Optom, BPT or BOT now?',
          answer: 'Five years after 10+2. UGC\'s notification of 27 August 2026 extended B.Optom from 4 years, and B.PT and B.OT from 4½ years. Most other new allied health bachelor\'s degrees, such as B.MLS and B.AOTT, are 4 years.'
        },
        {
          question: 'What is the eligibility for allied health UG courses?',
          answer: 'Each NCAHP curriculum sets its own rule. A common pattern is 10+2 with Physics, Chemistry and Biology and 50% marks, and a minimum age of 17 by 31 December. Some courses, such as optometry, accept Mathematics instead of Biology.'
        },
        {
          question: 'Can I study an allied health course through distance or online mode?',
          answer: 'No. NCAHP has told UGC that only full-time regular qualifications can be recognised under the Act, so distance and online allied health courses are not recognised.'
        },
        {
          question: 'Can I do a diploma in physiotherapy or optometry?',
          answer: 'Not under the NCAHP framework. In August 2026 NCAHP said diplomas are not permitted for healthcare professions under ISCO code 22, which include physiotherapists, optometrists, occupational therapists and dieticians.'
        },
        {
          question: 'What are the fees for allied health degrees?',
          answer: 'Across 17 degree fee records under this page in our database, the median is ₹1,09,300 a year and half charge ₹90,000–₹1,25,000. The sample is small and mostly private, so ask each college for its current fees.'
        }
      ]
    },
    mph: {
      h1: 'MPH Course in India: Eligibility, Admission, Subjects & Fees',
      title: 'MPH Course in India: Eligibility, Admission & Fees',
      description:
        'Master of Public Health (MPH) guide: 2026 eligibility at TISS, IIPHG, PHFI and SCTIMST, CUET PG and institute tests, subjects, fees and careers.',
      keywords: ['MPH course', 'Master of Public Health', 'MPH course in India', 'MPH eligibility', 'MPH course fees', 'MPH admission', 'MPH vs MD Community Medicine'],
      intro:
        'An MPH (Master of Public Health) is a two-year PG degree in population health, open at many institutes to health and non-health graduates. Each institute sets its own eligibility and test, so compare prospectuses before you apply.',
      crossLink: null,
      faqs: [
        {
          question: 'What is the full form of MPH?',
          answer: 'MPH stands for Master of Public Health, a postgraduate degree focused on the health of populations through epidemiology, biostatistics, health policy and programme management.'
        },
        {
          question: 'What is the eligibility for MPH in India?',
          answer: 'It depends on the institute. For 2026, IIPH Gandhinagar accepted a bachelor\'s in any discipline with 50%, PHFI IIPHS listed health, science, technology, management and law degrees with 50%, and SCTIMST accepted health degrees or a relevant master\'s.'
        },
        {
          question: 'Can non-medical students do an MPH?',
          answer: 'Yes, at many institutes. IIPH Gandhinagar, TISS and PHFI IIPHS admit non-medical graduates. SCTIMST accepts some non-medical bachelor\'s degrees, such as B.Tech, but asks most social-science graduates for a master\'s degree.'
        },
        {
          question: 'Is there an entrance exam for MPH?',
          answer: 'There is no single national MPH test. TISS uses CUET PG scores, while SCTIMST, IIPH Gandhinagar, PHFI IIPHS and PGIMER run their own tests, often with an interview.'
        },
        {
          question: 'How many years is the MPH course?',
          answer: 'Two years, usually in four semesters, at all the institutes we checked. Most include internships and a dissertation.'
        },
        {
          question: 'What are MPH fees in India?',
          answer: 'Published 2026 fees vary: ₹1,10,000 tuition for two years at SCTIMST, ₹1,55,400 total at TISS (Social Epidemiology), ₹5,20,000 at PHFI IIPHS and ₹2,86,000 a year in tuition at IIPH Gandhinagar.'
        },
        {
          question: 'What is the difference between MPH and MD Community Medicine?',
          answer: 'MD Community Medicine is a three-year degree for MBBS doctors, admitted through NEET PG or INI-CET. An MPH is a two-year degree open to a wider range of graduates and focuses on public health practice, data and policy.'
        },
        {
          question: 'What jobs can I get after an MPH?',
          answer: 'Graduates work in government health programmes, NGOs, research institutions, international agencies, health insurance and pharma, in roles such as epidemiologist, research analyst, programme manager and policy analyst.'
        }
      ]
    },
    nursing: {
      h1: 'B.Sc Nursing Course in India: Eligibility, Admission, Subjects & Fees',
      title: 'B.Sc Nursing Course: Eligibility, Entrance, Subjects & Fees',
      description:
        'B.Sc Nursing guide: INC eligibility (45% PCB), entrance test rules, 2026-27 dates, 4-year syllabus, fees (median ₹1,06,000 a year) and GNM vs ANM.',
      keywords: ['B.Sc Nursing course', 'B.Sc Nursing eligibility', 'B.Sc Nursing entrance exam', 'B.Sc Nursing syllabus', 'B.Sc Nursing fees', 'B.Sc Nursing vs GNM', 'nursing course after 12th'],
      intro:
        'B.Sc Nursing is a four-year degree after Class 12 with Physics, Chemistry, Biology and English, with admission through a state or university entrance test. Check INC eligibility, the admission schedule and fees before you shortlist colleges.',
      crossLink: {
        href: '/nursing-colleges',
        anchor: 'Compare nursing colleges by fees & courses',
        note: 'Ready to shortlist? Browse nursing colleges and check each one\'s State Nursing Council recognition and INC suitability.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.Sc Nursing?',
          answer: 'INC requires 10+2 in science with at least 45% in Physics, Chemistry and Biology taken together (40% for SC/ST/OBC) and a pass in English. You must be 17 by 31 December of the admission year; the 2020 regulations set an upper limit of 35.'
        },
        {
          question: 'How many years is B.Sc Nursing?',
          answer: 'Four years, in eight semesters. The eighth semester is a 22-week internship.'
        },
        {
          question: 'Is there an entrance exam for B.Sc Nursing?',
          answer: 'Yes. INC says admission must be on the merit of an entrance test run by a state government or university, with parts on nursing aptitude, Physics, Chemistry, Biology and English. West Bengal, for example, uses JENPAS (UG).'
        },
        {
          question: 'What is the qualifying score in the B.Sc Nursing entrance test?',
          answer: 'Under INC\'s 2022 corrigendum, the minimum is the 50th percentile for General candidates, 45th for General PwD and 40th for SC/ST/OBC candidates.'
        },
        {
          question: 'Can NIOS students apply for B.Sc Nursing?',
          answer: 'Yes. INC accepts 10+2 from NIOS or a recognised state open school if you studied the science subjects and English.'
        },
        {
          question: 'What is the fee for B.Sc Nursing?',
          answer: 'Across 24 B.Sc Nursing fee records in our database, almost all private, the median is ₹1,06,000 a year and half of programmes charge ₹77,800–₹1,48,000. Confirm the current fee with each college.'
        },
        {
          question: 'What is the difference between B.Sc Nursing and GNM?',
          answer: 'B.Sc Nursing is a four-year degree after 10+2 science with an entrance test. GNM is a three-year diploma open to 10+2 in any stream with 40%. Both lead to registration as a Registered Nurse and Registered Midwife.'
        },
        {
          question: 'What can I do after B.Sc Nursing?',
          answer: 'After registering with your State Nursing Council you can work as a staff nurse in hospitals or community health services. With one year of experience you can apply for M.Sc Nursing.'
        }
      ]
    },
    dgnm: {
      h1: 'GNM Course (Diploma in General Nursing and Midwifery): 2026-27 Guide',
      title: 'GNM Course: Duration, Eligibility, Fees & 2026-27 Status',
      description:
        'GNM nursing guide: 3-year INC diploma, eligibility (10+2 any stream, 40%), phase-out status for 2026-27, subjects, fees and GNM vs B.Sc Nursing.',
      keywords: ['GNM course', 'Diploma in General Nursing and Midwifery', 'GNM course duration', 'GNM eligibility', 'GNM nursing fees', 'is GNM being phased out', 'GNM vs B.Sc Nursing'],
      intro:
        'GNM is a three-year nursing diploma, internship included, open to Class 12 students from any stream with English and 40% marks. Check INC\'s current admission notice and the school\'s approval before you apply.',
      crossLink: {
        href: '/gnm-colleges',
        anchor: 'Compare GNM colleges',
        note: 'Ready to shortlist? Browse GNM schools and confirm each one\'s State Nursing Council recognition and INC suitability for your admission year.'
      },
      faqs: [
        {
          question: 'What is the duration of the GNM course?',
          answer: 'Three years under the INC syllabus, including a 26-week internship in the third year. You must finish within six years.'
        },
        {
          question: 'What is the eligibility for GNM?',
          answer: '10+2 with English and at least 40% in the qualifying exam, from any stream; science is preferable. NIOS, vocational ANM or health-care science students and registered ANMs are also eligible. Age 17 to 35.'
        },
        {
          question: 'Is the GNM course closed or phased out?',
          answer: 'INC said in 2019 that 2020-21 would be the last GNM admission year, but its Notification 19 of 2026 extended the 2026-27 last date of admission to 31 October 2026 for GNM and other nursing programmes. Check that your chosen school is approved for GNM this year.'
        },
        {
          question: 'Can arts students do GNM?',
          answer: 'Yes. INC accepts 10+2 in any stream with English and 40% marks. Science is preferable but not required.'
        },
        {
          question: 'Is GNM a diploma or a degree?',
          answer: 'GNM is a diploma. It still lets you register as a Registered Nurse and Registered Midwife. For a degree, you can later do Post Basic B.Sc Nursing.'
        },
        {
          question: 'What is the fee for GNM?',
          answer: 'Across 17 private GNM fee records in our database, the median is ₹65,000 a year and half of programmes charge ₹53,000–₹80,000. We have no government fee records.'
        },
        {
          question: 'Which is better, GNM or B.Sc Nursing?',
          answer: 'Both lead to RN & RM registration. B.Sc Nursing is a four-year degree that needs PCB and an entrance test and leads directly to M.Sc Nursing. GNM is three years and open to any stream.'
        },
        {
          question: 'What can I do after GNM?',
          answer: 'Register with your State Nursing Council and work as a staff nurse, or study Post Basic B.Sc Nursing, which then opens M.Sc Nursing.'
        }
      ]
    },
    anm: {
      h1: 'ANM Nursing Course: Eligibility, Duration, Syllabus & Next Steps',
      title: 'ANM Course: Eligibility, Duration, Syllabus & Career Path',
      description:
        'ANM nursing guide: 2-year INC course after 10+2 (arts or science), age 17-35, subjects, clinical requirements, and how to move up to GNM and a degree.',
      keywords: ['ANM course', 'ANM nursing course', 'Auxiliary Nurse Midwife course', 'ANM eligibility', 'ANM course duration', 'ANM syllabus', 'ANM to GNM'],
      intro:
        'ANM is a two-year course, including a six-month internship, that trains you for community and maternal health work. Class 12 students from arts, science or the health-care vocational stream aged 17 to 35 can apply.',
      crossLink: {
        href: '/nursing-colleges',
        anchor: 'Browse nursing colleges',
        note: 'Ready to shortlist? Browse nursing colleges, check which list an ANM programme, and confirm State Nursing Council approval.'
      },
      faqs: [
        {
          question: 'What is the duration of the ANM course?',
          answer: 'Two years: 18 months of study plus a six-month internship, 3,480 hours in total under the INC syllabus.'
        },
        {
          question: 'What is the eligibility for ANM?',
          answer: '10+2 from a recognised board in arts (with English), science or the health-care science vocational stream. NIOS 10+2 is accepted. You must be 17 to 35 and medically fit. INC does not set a minimum percentage.'
        },
        {
          question: 'Can arts students do ANM?',
          answer: 'Yes. INC accepts 10+2 in arts with English core or elective, as well as science and the health-care vocational stream.'
        },
        {
          question: 'Is there an entrance exam for ANM?',
          answer: 'INC does not prescribe one. States and schools admit through their own merit lists, tests or counselling, so check your state\'s notice.'
        },
        {
          question: 'What do ANM students study?',
          answer: 'Community health nursing, health promotion, primary health care nursing and child health in the first year, then midwifery and health centre management, followed by a six-month internship.'
        },
        {
          question: 'What is the difference between ANM and GNM?',
          answer: 'ANM is a two-year course focused on community and maternal health. GNM is a three-year diploma that leads to registration as a Registered Nurse and Registered Midwife. Registered ANMs are eligible for GNM.'
        },
        {
          question: 'Can I do GNM after ANM?',
          answer: 'Yes. INC lists registered ANMs among those eligible for GNM, and its 2024 regulations set out a two-year ANM to GNM bridge programme. Ask your State Nursing Council whether the bridge programme is offered.'
        },
        {
          question: 'What is the fee for ANM?',
          answer: 'Our database has only five ANM fee records, too few for a reliable range. Ask each school for the total fee for both years, including hostel and exam fees.'
        }
      ]
    },
    md: {
      h1: 'MD Course in India: Eligibility, NEET-PG, Subjects & Fees',
      title: 'MD Course Details: Eligibility, NEET-PG, Subjects & Fees',
      description:
        'MD after MBBS: NEET-PG eligibility, 3-year structure under NMC PGMER-2023, 32 MD subjects, MD vs MS, and fees by college type in our data.',
      keywords: ['MD course', 'MD course details', 'MD after MBBS', 'MD eligibility', 'MD subjects list', 'MD vs MS', 'MD course fees'],
      intro:
        'MD (Doctor of Medicine) is a three-year postgraduate degree after MBBS. Admission needs a recognised MBBS, registration, a completed internship and a qualifying NEET-PG score, followed by MCC or state counselling.',
      crossLink: {
        href: '/md-colleges',
        anchor: 'Compare MD colleges by fees and type',
        note: 'Ready to shortlist? Browse MD programmes and check each college\'s NMC permission and counselling fee list.'
      },
      faqs: [
        {
          question: 'What is the eligibility for MD in India?',
          answer: 'An MBBS recognised under the NMC Act, 2019, permanent or provisional registration with NMC or a State Medical Council, and a one-year internship finished by the NBEMS cut-off (30 September 2026 for the 2026-27 session). Foreign medical graduates also need FMGE.'
        },
        {
          question: 'Is NEET-PG compulsory for MD?',
          answer: 'Yes, for almost all seats. The NEET-PG 2026 bulletin says no other state or institution-level entrance is valid for MD, MS or postgraduate diploma seats. AIIMS, PGIMER, JIPMER, NIMHANS and SCTIMST are outside NEET-PG centralised admission and run their own process.'
        },
        {
          question: 'How many years is the MD course?',
          answer: 'Three years including exams under NMC\'s PGMER-2023. If you already hold a recognised two-year postgraduate diploma in the same subject, MD takes two years.'
        },
        {
          question: 'What is the NEET-PG qualifying percentile?',
          answer: 'For NEET-PG 2026 it was the 50th percentile for General/EWS, the 45th for UR-PwBD and the 40th for SC, ST and OBC candidates, including PwBD. Qualifying only makes you eligible for counselling.'
        },
        {
          question: 'How many MD subjects are there?',
          answer: 'PGMER-2023 recognises 32 MD subjects, from General Medicine, Paediatrics and Radio-diagnosis to Anatomy, Pathology, Community Medicine and Hospital Administration.'
        },
        {
          question: 'What is the difference between MD and MS?',
          answer: 'Both are three-year degrees after MBBS. MD covers medical, diagnostic and pre-clinical subjects. MS covers six surgical subjects: General Surgery, Obstetrics and Gynaecology, Ophthalmology, Orthopaedics, Otorhinolaryngology, and Traumatology and Surgery.'
        },
        {
          question: 'What is the District Residency Programme in MD?',
          answer: 'A compulsory three-month rotation in district hospitals or the district health system, done in the 3rd, 4th or 5th semester. Students continue to receive their stipend during the rotation.'
        },
        {
          question: 'What are MD fees in India?',
          answer: 'In our records the median annual fee is ₹82,400 for government/public MD programmes (52 records) and ₹20,22,143 for private programmes (72 records), last updated January 2025. Check the current fee in the MCC or state seat matrix.'
        },
        {
          question: 'Do MD students get a stipend?',
          answer: 'Yes. PGMER-2023 says PG students in all institutions must be paid a stipend at par with PG students in state or central government institutions in that state or union territory.'
        }
      ]
    },
    'medical-pg': {
      h1: 'Medical PG Courses in India: MD, MS, Diplomas, DNB & More',
      title: 'Medical PG Courses After MBBS: List, Duration & Entrance',
      description:
        'PG medical courses after MBBS: MD, MS, diplomas, DNB and D.M./M.Ch with duration under NMC PGMER-2023, NEET-PG and NEET-SS routes, and M.Optom.',
      keywords: ['medical PG courses', 'PG courses after MBBS', 'medical PG course duration in India', 'PG medical courses list', 'MD MS diploma DNB', 'super speciality courses after MD', 'M.Optom'],
      intro:
        'After MBBS, the main PG routes are MD and MS (3 years), postgraduate diplomas (2 years) and NBEMS DNB courses, all through NEET-PG. Super-speciality D.M. and M.Ch courses follow through NEET-SS.',
      crossLink: {
        href: '/medical-pg-colleges',
        anchor: 'Browse institutes in our PG medical listing',
        note: 'This listing is mostly Master of Optometry programmes. For MD seats, compare colleges on the MD page.'
      },
      faqs: [
        {
          question: 'Which PG courses can I do after MBBS?',
          answer: 'MD (32 subjects) and MS (6 subjects), each 3 years; postgraduate diplomas (28 subjects), 2 years; and post-MBBS DNB, direct 6-year DrNB and NBEMS diploma courses. After MD, MS or DNB you can take D.M. or M.Ch super-speciality courses.'
        },
        {
          question: 'What is the duration of PG medical courses in India?',
          answer: 'Under NMC\'s PGMER-2023: MD/MS 3 years (2 years if you hold a recognised diploma in the same subject), postgraduate diploma 2 years, D.M./M.Ch 3 years after MD/MS, direct D.M./M.Ch 6 years, PDCC 1 year and PDF 2 years.'
        },
        {
          question: 'Is NEET-PG required for all PG medical courses?',
          answer: 'NEET-PG is the single entrance for MD, MS and postgraduate diploma seats and is also used for post-MBBS DNB, DrNB and NBEMS diploma seats. AIIMS, PGIMER, JIPMER, NIMHANS and SCTIMST run their own MD/MS admission process.'
        },
        {
          question: 'Which exam is needed for D.M. and M.Ch?',
          answer: 'NEET-SS. PGMER-2023 requires a minimum eligible NEET-SS score, and the central government or its designated authority runs counselling for all super-speciality seats.'
        },
        {
          question: 'Are postgraduate medical diploma seats still available?',
          answer: 'Some still exist, but PGMER-2023 says NMC will not accept new applications to start or increase diploma seats, and colleges may convert diploma seats to degree seats. Check the current seat matrix.'
        },
        {
          question: 'What is the difference between MD and MS?',
          answer: 'Both are 3-year degrees after MBBS. MD covers medical, diagnostic and pre-clinical subjects; MS covers six surgical subjects, including Obstetrics and Gynaecology, Orthopaedics and Ophthalmology.'
        },
        {
          question: 'Can I do a PG health course without MBBS?',
          answer: 'Yes, in other disciplines: MDS after BDS, MPT after BPT, M.Pharm after B.Pharm and M.Optom after B.Optom. These do not lead to MD or MS, which need an MBBS.'
        },
        {
          question: 'What is M.Optom and who can apply?',
          answer: 'Master of Optometry is a two-year, four-semester programme. NCAHP\'s curriculum guideline asks for a B.Optom or equivalent with at least 5.5 CGPA and admission through a university entrance test.'
        }
      ]
    },
    'medical-ug': {
      h1: 'Medical Courses After 12th: MBBS, BDS, AYUSH, BNYS & Diplomas',
      title: 'Medical Courses After 12th: List, Duration & Admission',
      description:
        'Medical courses after 12th: MBBS, BDS, BAMS, BUMS, BSMS, BHMS and BNYS with duration, NEET (UG) eligibility, counselling and paramedical options.',
      keywords: ['medical courses after 12th', 'medical UG courses', 'medical courses list after 12th', 'BNYS course', 'BSMS course', 'AYUSH courses after 12th', 'paramedical diploma courses'],
      intro:
        'Doctor degrees after 12th (MBBS, BDS, BAMS, BUMS, BSMS, BHMS, BNYS) take 5 to 5½ years including internship, and most need NEET (UG). Paramedical diplomas are shorter and run through state boards or universities.',
      crossLink: {
        href: '/medical-ug-colleges',
        anchor: 'Browse institutes in our medical UG listing',
        note: 'This listing is mostly BNYS and paramedical diplomas. For MBBS, see the MBBS course guide.'
      },
      faqs: [
        {
          question: 'Which medical courses can I do after 12th?',
          answer: 'Doctor degrees: MBBS, BDS, BAMS, BUMS, BSMS, BHMS and BNYS. Shorter options include paramedical diplomas (lab technology, optometry, operation theatre, X-ray) and health degrees such as nursing, BPT, B.Pharm and BMLT.'
        },
        {
          question: 'Which courses need NEET (UG)?',
          answer: 'The NEET (UG) 2026 bulletin covers MBBS, BDS, BAMS, BUMS, BSMS and BHMS. The score is also used for the 15% VCI quota in BVSc & AH and for B.Sc Nursing at some central institutions.'
        },
        {
          question: 'How long are medical degrees after 12th?',
          answer: 'MBBS, BAMS, BUMS, BSMS and BHMS take 5½ years including a 1-year internship. BDS takes 5 years (4 years plus a 1-year paid rotating internship). BNYS is 5½ years as per the Tamil Nadu prospectus.'
        },
        {
          question: 'What is the eligibility for NEET-based medical courses?',
          answer: 'Physics, Chemistry, Biology/Biotechnology and English in Class 12, a minimum age of 17 by 31 December of the admission year, and the NEET (UG) qualifying percentile: 50th for General, 45th for General-PwBD, 40th for SC, ST and OBC.'
        },
        {
          question: 'Is NEET required for BNYS?',
          answer: 'It depends on the state. BNYS was not listed in the NEET (UG) 2026 bulletin. Telangana\'s 2026-27 prospectus uses NEET (UG) ranks for BNYS, while Tamil Nadu\'s 2025-26 BNYS prospectus ranked candidates on Class 12 science marks.'
        },
        {
          question: 'Who conducts counselling for AYUSH courses?',
          answer: 'AACCC fills All India Quota seats in government and aided BAMS, BUMS, BSMS and BHMS colleges and seats in central and deemed universities. State authorities fill state-quota seats.'
        },
        {
          question: 'Are there special language rules for BUMS and BSMS?',
          answer: 'Yes. BUMS needs Urdu, Arabic or Persian in Class 10, or a Class 10-level Urdu test where conducted. BSMS needs Tamil in Class 10 or 12, or Tamil study in the first professional year.'
        },
        {
          question: 'Can I do a paramedical diploma instead of a doctor degree?',
          answer: 'Yes. Diplomas in lab technology, optometry, operation theatre or X-ray technology prepare you for technician roles, not for practising medicine. Rules are set by each state board or university.'
        }
      ]
    },
    'online-bca': {
      h1: 'Online BCA in India: Validity, UGC & AICTE Approval, Eligibility',
      title: 'Online BCA in India: Is It Valid? Eligibility & Approval',
      description:
        'Online BCA guide: UGC validity, AICTE approval, how to check a university, eligibility, online vs regular vs distance BCA and what to verify on fees.',
      keywords: ['online BCA', 'online BCA in India', 'UGC approved online BCA', 'is online BCA valid', 'online BCA eligibility', 'online BCA vs regular BCA', 'distance BCA'],
      intro:
        'An online BCA is a Bachelor of Computer Applications studied over the internet. From a university entitled or recognised by UGC for the programme, it is equivalent to a regular BCA. Check UGC-DEB status, AICTE approval and the total fee before you enrol.',
      crossLink: {
        href: '/bca-colleges',
        anchor: 'Compare BCA colleges',
        note: 'Prefer campus study? Browse BCA colleges with recorded fees and placements. For online options, check each university on the UGC-DEB list.'
      },
      faqs: [
        {
          question: 'Is an online BCA valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that online programme. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats such degrees as equivalent to the same degree in regular mode.'
        },
        {
          question: 'How do I check if an online BCA is UGC approved?',
          answer: 'Open the UGC-DEB website (deb.ugc.ac.in), find the list of institutions entitled or recognised for online degree programmes for your session, and check that a BCA is listed against the university.'
        },
        {
          question: 'Does an online BCA need AICTE approval?',
          answer: 'BCA is in AICTE\'s list of courses it approves in online mode, and its handbook says institutions may not admit students to such courses without the Council\'s approval. Ask the university for its AICTE approval.'
        },
        {
          question: 'What is the eligibility for an online BCA?',
          answer: 'The same as the university\'s regular BCA. AICTE\'s minimum is a Class 12 pass with the eligibility set by the university, or a diploma in Commercial Practice. Some universities ask for Mathematics.'
        },
        {
          question: 'Can a BCA be done fully online if it has practicals?',
          answer: 'Yes. UGC bars programmes with practical or lab courses from online mode, except where the practical work is limited to programming, coding and software tools, which covers BCA practicals.'
        },
        {
          question: 'How long is an online BCA?',
          answer: 'Usually three years, the same as a regular BCA. Some universities list a 4-year Honours version. UGC allows up to double the minimum duration to complete it.'
        },
        {
          question: 'How many universities offer an online BCA?',
          answer: 'We counted 63 of 126 UGC-entitled institutions and 9 of 22 UGC-recognised institutions listing a BCA for the 2026-27 session. Lists change every session.'
        },
        {
          question: 'What are online BCA fees?',
          answer: 'Fees vary widely, and our database has no online BCA fee records. Ask each university for the written total fee for all semesters, including exam and registration fees.'
        }
      ]
    },
    'online-bba': {
      h1: 'Online BBA in India: Validity, Approval, Eligibility & Admission',
      title: 'Online BBA in India: Is It Valid? Eligibility & Admission',
      description:
        'Online BBA guide: UGC validity, AICTE approval, DEB-ID admission steps, eligibility, online vs regular BBA and the 3-year vs 4-year choice for an MBA.',
      keywords: ['online BBA', 'online BBA in India', 'is online BBA valid', 'UGC approved online BBA', 'online BBA admission', 'online BBA eligibility', 'distance BBA'],
      intro:
        'An online BBA is a Bachelor of Business Administration studied over the internet. From a university entitled or recognised by UGC for the programme, it is equivalent to a regular BBA. Check UGC-DEB status, AICTE approval, your DEB-ID and the total fee before you enrol.',
      crossLink: {
        href: '/bba-colleges',
        anchor: 'Compare BBA colleges',
        note: 'Prefer campus study? Browse BBA colleges with recorded fees and placements. For online options, check each university on the UGC-DEB list.'
      },
      faqs: [
        {
          question: 'Is an online BBA valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that online programme. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats such degrees as equivalent to regular-mode degrees.'
        },
        {
          question: 'What is the eligibility for an online BBA?',
          answer: 'The same as the university\'s regular BBA. AICTE\'s minimum is a Class 12 pass with the eligibility set by the university; most universities accept any stream.'
        },
        {
          question: 'What is a DEB-ID and do I need one for an online BBA?',
          answer: 'Yes. A DEB-ID is created on the UGC-DEB portal using your ABC-ID. UGC made it mandatory for Indian students joining online or distance programmes from the session that began in October 2024.'
        },
        {
          question: 'Does an online BBA need AICTE approval?',
          answer: 'BBA is in AICTE\'s list of courses it approves in online mode, and its handbook says institutions may not admit students to such courses without the Council\'s approval. Ask the university for its approval.'
        },
        {
          question: 'Is there an entrance exam for an online BBA?',
          answer: 'AICTE\'s handbook does not name a test for online BBA. Universities decide whether to use a test, an interview or Class 12 marks.'
        },
        {
          question: 'How many universities offer an online BBA?',
          answer: 'We counted 84 of 126 UGC-entitled institutions and 14 of 22 UGC-recognised institutions listing a BBA for the 2026-27 session, more than any other undergraduate degree.'
        },
        {
          question: 'Can I do an MBA after an online BBA?',
          answer: 'Yes, a recognised online BBA counts like a regular BBA. AICTE\'s regular-MBA minimum is a bachelor\'s degree with 50% marks (45% for reserved categories).'
        },
        {
          question: 'What are online BBA fees?',
          answer: 'Fees vary widely, and our database has no online BBA fee records. Ask each university for the written total fee for all semesters, including exam and registration fees.'
        }
      ]
    },
    'online-bcom': {
      h1: 'Online B.Com in India: Validity, Eligibility & How Classes Work',
      title: 'Online B.Com in India: Is It Valid? Classes & Eligibility',
      description:
        'Online B.Com guide: UGC validity, how to check a university, eligibility, DEB-ID, how online classes and exams work, and online vs regular B.Com.',
      keywords: ['online B.Com', 'online BCom in India', 'is online B.Com valid', 'UGC approved online B.Com', 'B.Com online classes', 'online B.Com admission', 'distance B.Com'],
      intro:
        'An online B.Com is a Bachelor of Commerce studied over the internet. From a university entitled or recognised by UGC for the programme, it is equivalent to a regular B.Com. Check UGC-DEB status, your DEB-ID, how exams work and the total fee before you enrol.',
      crossLink: {
        href: '/bcom-colleges',
        anchor: 'Compare B.Com colleges',
        note: 'Prefer campus study? Browse B.Com colleges with recorded fees. For online options, check each university on the UGC-DEB list.'
      },
      faqs: [
        {
          question: 'Is an online B.Com valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that online programme. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats such degrees as equivalent to regular-mode degrees.'
        },
        {
          question: 'How do I check if an online B.Com is UGC approved?',
          answer: 'Open deb.ugc.ac.in, find the lists of institutions entitled or recognised for online degree programmes for your session, and check that the exact B.Com is listed against the university.'
        },
        {
          question: 'What is the eligibility for an online B.Com?',
          answer: 'The same as the university\'s regular B.Com, usually a Class 12 pass. Each university sets the subject and marks rules; Honours programmes more often ask for Mathematics or Accountancy.'
        },
        {
          question: 'How do online B.Com classes work?',
          answer: 'Through a learning platform with video lessons, e-content, a discussion forum and self-assessment. UGC expects at least two hours of activity every fortnight and 75% participation before end-semester exams.'
        },
        {
          question: 'How are online B.Com exams conducted?',
          answer: 'End-semester exams are proctored and carry at least 70% of the marks. Proctoring can be pen-and-paper, computer-based or fully online under supervision, depending on the university.'
        },
        {
          question: 'Do I need a DEB-ID for an online B.Com?',
          answer: 'Yes. UGC made the DEB-ID, created with your ABC-ID on the UGC-DEB portal, mandatory for Indian students joining online or distance programmes from the October 2024 session.'
        },
        {
          question: 'Is there an online B.Com (Hons)?',
          answer: 'Yes, at some universities. Of 81 B.Com listings in the UGC-DEB 2026-27 lists, 19 are Honours and 8 of those are stated as 4-year programmes.'
        },
        {
          question: 'What are online B.Com fees?',
          answer: 'Fees vary widely, and our database has no online B.Com fee records. Ask each university for the written total fee for all semesters, including exam and registration fees.'
        }
      ]
    },
    'online-bsc': {
      h1: 'Online B.Sc in India: Allowed Subjects, Validity & Eligibility',
      title: 'Online B.Sc in India: Allowed Subjects & Validity',
      description:
        'Online B.Sc guide: UGC\'s lab rule, which subjects can be studied online, the 2026-27 UGC-DEB list, validity, eligibility and online vs distance B.Sc.',
      keywords: ['online B.Sc', 'online BSc in India', 'is online B.Sc valid', 'UGC approved online B.Sc', 'online B.Sc data science', 'distance B.Sc', 'online B.Sc admission'],
      intro:
        'An online B.Sc is a Bachelor of Science studied over the internet, but UGC bars programmes with lab or practical courses from online mode unless the practicals are limited to programming and software tools. Where it is allowed, a degree from a UGC entitled or recognised university is equivalent to a regular B.Sc.',
      crossLink: {
        href: '/bsc-colleges',
        anchor: 'Compare B.Sc colleges',
        note: 'Need a lab subject such as physics or chemistry? Those cannot be studied online; browse B.Sc colleges for campus study.'
      },
      faqs: [
        {
          question: 'Is an online B.Sc valid in India?',
          answer: 'Yes, if the subject is permitted online and the university is entitled or recognised by UGC for that programme. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats such degrees as equivalent to regular-mode degrees.'
        },
        {
          question: 'Can I do a B.Sc in physics, chemistry or biology online?',
          answer: 'No. UGC prohibits any programme that requires practical or laboratory courses in online mode, except where practicals are limited to programming, coding and software tools. Lab-based science needs a regular B.Sc or a distance B.Sc at an eligible university.'
        },
        {
          question: 'Which B.Sc subjects are available online?',
          answer: 'Only subjects without wet-lab practicals. The four online B.Sc programmes in the UGC-DEB 2026-27 lists are in data science, information systems and management, and economics.'
        },
        {
          question: 'Can I study nursing, agriculture or psychology online or by distance?',
          answer: 'No. Nursing, agriculture, horticulture, para-medical and other listed disciplines are prohibited in both online and distance mode. UGC has also barred allied and healthcare programmes under the NCAHP Act, including psychology as a specialisation; UGC-DEB applies this from the August 2026 session.'
        },
        {
          question: 'How do I check if an online B.Sc is UGC approved?',
          answer: 'Open deb.ugc.ac.in, find the lists of institutions entitled or recognised for online degree programmes for your session, and check that the exact B.Sc, with the same subject, is listed against the university.'
        },
        {
          question: 'What is the eligibility for an online B.Sc?',
          answer: 'The same as the university\'s regular B.Sc, usually a Class 12 pass with subject and marks rules set by the university. Data science or economics programmes may ask for Mathematics.'
        },
        {
          question: 'Do I need a DEB-ID for an online B.Sc?',
          answer: 'Yes. UGC made the DEB-ID, created with your ABC-ID on the UGC-DEB portal, mandatory for Indian students joining online or distance programmes from the October 2024 session.'
        },
        {
          question: 'What is the difference between an online and a distance B.Sc?',
          answer: 'An online B.Sc cannot include lab courses. A distance (ODL) B.Sc with lab work is allowed only at eligible universities, with practicals at the headquarters or at centres that have run the same programme in regular mode for at least seven years.'
        },
        {
          question: 'What are online B.Sc fees?',
          answer: 'Our database has one online B.Sc programme and no fee records, so we do not give a range. Ask each university for the written total fee for all semesters, including exam and registration fees.'
        }
      ]
    },
    'online-ba': {
      h1: 'Online BA in India: Validity, Subjects, Eligibility & How to Choose',
      title: 'Online BA in India: Is It Valid? Subjects & Eligibility',
      description:
        'Online BA guide: UGC validity, how to check a university, subjects in the 2026-27 UGC-DEB lists, what UGC bars online, eligibility and DEB-ID.',
      keywords: ['online BA', 'online BA in India', 'is online BA valid', 'UGC approved online BA', 'online BA subjects', 'online BA admission', 'distance BA'],
      intro:
        'An online BA is a Bachelor of Arts studied over the internet. From a university entitled or recognised by UGC for the programme, it is equivalent to a regular BA. Some subjects, including visual arts, law and psychology as a specialisation, cannot be studied online.',
      crossLink: {
        href: '/ba-colleges',
        anchor: 'Compare BA colleges',
        note: 'Want psychology, fine arts or campus study? Browse BA colleges. For online options, check each university on the UGC-DEB list.'
      },
      faqs: [
        {
          question: 'Is an online BA valid in India?',
          answer: 'Yes, if the university is entitled or recognised by UGC to offer that online programme. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats such degrees as equivalent to regular-mode degrees.'
        },
        {
          question: 'How do I check if an online BA is UGC approved?',
          answer: 'Open deb.ugc.ac.in, find the lists of institutions entitled or recognised for online degree programmes for your session, and check that a BA, with the subject you want, is listed against the university.'
        },
        {
          question: 'Which subjects can I study in an online BA?',
          answer: 'In the 2026-27 UGC-DEB lists, English and political science are named most often, followed by history, economics, sociology and Hindi. Many programmes let you combine three subjects from a list.'
        },
        {
          question: 'Can I study psychology in an online BA?',
          answer: 'Not from the August 2026 session. UGC has barred allied and healthcare programmes under the NCAHP Act, including psychology as a specialisation, in online and distance mode.'
        },
        {
          question: 'Which arts subjects are not allowed online?',
          answer: 'Visual arts, sports and law are prohibited in online and distance mode. Yoga and tourism and hospitality management are not permitted online, and any subject with lab practicals cannot be offered online.'
        },
        {
          question: 'What is the eligibility for an online BA?',
          answer: 'The same as the university\'s regular BA, usually a Class 12 pass with any subject or marks rules set by the university.'
        },
        {
          question: 'Do I need a DEB-ID for an online BA?',
          answer: 'Yes. UGC made the DEB-ID, created with your ABC-ID on the UGC-DEB portal, mandatory for Indian students joining online or distance programmes from the October 2024 session.'
        },
        {
          question: 'Is an online BA 3 years or 4 years?',
          answer: 'Usually 3 years (120 credits). Under the UGC undergraduate framework, a 4-year Honours BA needs 160 credits. In the 2026-27 UGC-DEB lists, 10 of 51 BA listings are Honours and 4 state 4 years.'
        },
        {
          question: 'What are online BA fees?',
          answer: 'Our database has one online BA programme and no fee records, so we do not give a range. Ask each university for the written total fee for all semesters, including exam and registration fees.'
        }
      ]
    },
    msc: {
      h1: 'MSc Course in India: Duration, Eligibility, Entrance Exams & Fees',
      title: 'MSc Course Details: Eligibility, Exams, Subjects & Fees',
      description:
        'MSc guide: 1-year vs 2-year MSc under UGC rules, eligibility, IIT JAM and CUET PG, subjects, fees by subject (median ₹60,000 a year) and careers.',
      keywords: ['MSc course', 'MSc course details', 'MSc eligibility', 'MSc entrance exam', 'MSc subjects', 'MSc fees', 'one year MSc'],
      intro:
        'An MSc is a postgraduate science degree: two years after a three-year B.Sc, or one year after a four-year honours degree under UGC\'s 2024 framework. Check eligibility, the entrance test each university uses and the total fees before you apply.',
      crossLink: {
        href: '/msc-colleges',
        anchor: 'Compare MSc colleges by fees & exams',
        note: 'Ready to shortlist? Browse MSc programmes with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'Is MSc a one-year or two-year course?',
          answer: 'Usually two years after a three-year B.Sc. UGC\'s 2024 postgraduate framework also allows a one-year MSc for students with a four-year honours or honours-with-research degree, but each university decides whether to offer it.'
        },
        {
          question: 'What is the eligibility for MSc?',
          answer: 'Under UGC\'s framework you are eligible in a subject you studied as a major or minor in your bachelor\'s degree, or in any subject whose national or university entrance test you qualify. Universities add their own subject and minimum-marks rules.'
        },
        {
          question: 'Which entrance exams are used for MSc admission?',
          answer: 'IIT JAM for the IITs and, through CCMN counselling, IISc, NITs and other institutes; CUET PG for central and participating universities; state tests such as APPGCET (Andhra Pradesh) and TG CPGET (Telangana); and university tests.'
        },
        {
          question: 'When is IIT JAM 2027?',
          answer: 'IIT Kharagpur is organising JAM 2027. Applications close on 19 October 2026, the exam is on 14 February 2027 and results are due on 18 March 2027, according to the official JAM website.'
        },
        {
          question: 'Can I do an MSc in a different subject from my B.Sc?',
          answer: 'Yes, in many cases. UGC\'s framework makes you eligible for any PG discipline if you qualify a national or university entrance test in that discipline. Individual programmes may still list required subjects, so check their eligibility tables.'
        },
        {
          question: 'What is the fee for an MSc in India?',
          answer: 'Across 1,024 annual MSc fee records in our database, the median is ₹60,000 a year. The public-institute median is ₹23,000 and the private median ₹70,000. Fees also vary by subject, from about ₹32,000 for Zoology and Botany to ₹1,16,000 for Nursing.'
        },
        {
          question: 'Which MSc subjects are most common?',
          answer: 'In our records Chemistry is the most common MSc subject, followed by Mathematics and Statistics, Physics, Computer Science and IT, and Biotechnology.'
        },
        {
          question: 'What can I do after an MSc?',
          answer: 'You can go on to a PhD, take research or laboratory posts, work in industry roles linked to your subject, or move towards college teaching, which needs further eligibility such as UGC NET.'
        }
      ]
    },
    ma: {
      h1: 'MA Course in India: Duration, Eligibility, Admission, Subjects & Fees',
      title: 'MA Course Details: Eligibility, Admission, Subjects & Fees',
      description:
        'MA guide: 1-year vs 2-year MA under UGC rules, eligibility, CUET PG codes by subject, state tests, fees (public median ₹12,599 a year) and careers.',
      keywords: ['MA course', 'MA course details', 'MA eligibility', 'MA course duration', 'MA admission', 'MA subjects', 'MA fees'],
      intro:
        'An MA is a postgraduate degree in a humanities, social science or language subject: two years after a three-year degree, or one year after a four-year honours degree under UGC\'s 2024 framework. Check eligibility, the CUET PG code or state test each university uses, and total fees.',
      crossLink: {
        href: '/ma-colleges',
        anchor: 'Compare MA colleges by fees & exams',
        note: 'Ready to shortlist? Browse MA programmes with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'How many years is an MA course?',
          answer: 'Two years (four semesters) after a three-year bachelor\'s degree. UGC\'s 2024 postgraduate framework also allows a one-year MA after a four-year honours or honours-with-research degree, where the university offers it.'
        },
        {
          question: 'What is the eligibility for MA?',
          answer: 'Under UGC\'s framework you are eligible for an MA in a subject you took as a major or minor in your bachelor\'s degree, or in any subject whose national or university entrance test you qualify. Universities set their own minimum marks.'
        },
        {
          question: 'Can I do an MA after B.Com or B.Sc?',
          answer: 'Often yes. UGC\'s framework lets you switch subject at PG level if you qualify a national or university entrance test in the new subject. Check that the university accepts graduates from your stream for that MA.'
        },
        {
          question: 'Which CUET PG paper is needed for an MA?',
          answer: 'It depends on the university. In CUET PG 2026, for example, English was LAQP01, History HUQP09, Political Science HUQP18, Psychology HUQP20 and Economics COQP10, but some universities use the General paper (COQP11) instead.'
        },
        {
          question: 'Is there an entrance exam for MA in Andhra Pradesh and Telangana?',
          answer: 'Yes. State universities in Andhra Pradesh admitted through APPGCET 2026, conducted by Sri Venkateswara University for APSCHE, and Telangana universities through TG CPGET 2026, conducted by Kakatiya University.'
        },
        {
          question: 'What is the fee for an MA in India?',
          answer: 'Across 512 annual MA fee records in our database, the median is ₹30,000 a year: ₹12,599 at public institutes and ₹60,000 at private ones. Psychology and Journalism programmes have the highest subject medians.'
        },
        {
          question: 'What is the difference between an MA and an online MA?',
          answer: 'Both have the same entry rules and level. A regular MA is taught on campus; an online MA is delivered through a learning platform by a UGC-entitled university and suits learners who cannot attend classes.'
        },
        {
          question: 'What can I do after an MA?',
          answer: 'You can take UGC NET for assistant professor eligibility, JRF awards or PhD admission, apply for a PhD, or work in writing, journalism, policy, development and research roles. School teaching also needs a teacher-education qualification such as a B.Ed.'
        }
      ]
    },
    phd: {
      h1: 'PhD in India: Eligibility, Admission, NET Route, Duration & Fees',
      title: 'PhD Admission in India: Eligibility, NET, Duration & Fees',
      description:
        'PhD guide to UGC 2022 rules: 55% master\'s or 75% 4-year degree, NET categories, entrance test and interview, 3–6 year duration, fees and checklist.',
      keywords: ['PhD admission', 'PhD eligibility', 'PhD course duration', 'UGC NET for PhD admission', 'PhD entrance exam', 'part-time PhD', 'PhD fees in India'],
      intro:
        'A PhD is India\'s highest research degree. Under the UGC PhD Regulations, 2022, you need a master\'s with 55% or a four-year degree with 75%, admission is through NET or a university test plus interview, and the programme lasts three to six years.',
      crossLink: {
        href: '/phd-colleges',
        anchor: 'Compare PhD colleges by fees & admission routes',
        note: 'Ready to shortlist? Browse PhD programmes with recorded fees and admission details, then check each university\'s PhD prospectus.'
      },
      faqs: [
        {
          question: 'What is the eligibility for a PhD in India?',
          answer: 'Under the UGC PhD Regulations, 2022: a master\'s degree with at least 55% marks, or a four-year bachelor\'s degree with at least 75%, or an M.Phil with 55%. SC, ST, OBC (non-creamy layer), EWS and differently-abled candidates get a 5% relaxation.'
        },
        {
          question: 'Can I do a PhD after a four-year bachelor\'s degree?',
          answer: 'Yes. UGC allows direct PhD admission after a four-year (eight-semester) bachelor\'s degree with 75% marks, or 70% for reserved categories. Such graduates can also take UGC NET for JRF and PhD admission.'
        },
        {
          question: 'How long does a PhD take?',
          answer: 'At least three years including coursework and at most six years from admission. Universities can allow two more years by re-registration (eight in total), and women and persons with more than 40% disability can get a further two years.'
        },
        {
          question: 'Is UGC NET required for PhD admission?',
          answer: 'Not always. Universities can admit NET/JRF, CSIR NET, GATE or CEED fellowship holders on interview, use NET category 2 and 3 scores (70% NET marks, 30% interview), or hold their own entrance test followed by an interview.'
        },
        {
          question: 'When is UGC NET December 2026?',
          answer: 'NTA has scheduled UGC-NET December 2026 for 14 to 19 December 2026. Applications are open from 8 to 28 October 2026, with a late-fee window until 31 October. NTA calls the dates tentative.'
        },
        {
          question: 'Can I do a PhD online or by distance learning?',
          answer: 'No. Regulation 13 of the UGC PhD Regulations, 2022 bars universities from running PhD programmes in distance or online mode. A part-time PhD is allowed if you meet all the conditions and have your employer\'s no-objection certificate.'
        },
        {
          question: 'What is the fee for a PhD in India?',
          answer: 'Across 466 annual PhD fee records in our database, the median is ₹54,000 a year: ₹27,150 at public institutes and ₹84,000 at private ones. These records were last updated in January 2025, so check each prospectus.'
        },
        {
          question: 'Is M.Phil still required before a PhD?',
          answer: 'No. UGC\'s 2022 regulations say universities shall not offer the M.Phil. A master\'s degree with 55%, or a four-year bachelor\'s with 75%, is enough to apply.'
        }
      ]
    },
    mtech: {
      h1: 'M.Tech / M.E. in India: Eligibility, GATE, State Tests & Fees',
      title: 'M.Tech / M.E. Admission 2026-27: Eligibility, GATE & Fees',
      description:
        'M.Tech/M.E. guide: AICTE 50% eligibility, GATE 2027 dates, state tests (CEETA-PG, APPGECET, TG PGECET, PGCET), branches and fee data.',
      keywords: ['M.Tech admission', 'M.Tech eligibility', 'M.Tech through GATE', 'M.Tech entrance exam', 'M.Tech fees in India', 'M.Tech specialisations', 'M.E. vs M.Tech'],
      intro:
        'An M.Tech or M.E. is a two-year postgraduate engineering degree. AICTE requires a bachelor\'s degree with 50% marks (45% reserved). IITs and NITs admit mainly through GATE; state colleges use tests such as CEETA-PG, APPGECET, TG PGECET and PGCET.',
      crossLink: {
        href: '/mtech-colleges',
        anchor: 'Compare M.Tech colleges by fees & admission routes',
        note: 'Ready to shortlist? Browse M.Tech and M.E. programmes with recorded fees and accepted exams, then check each institute\'s admission notice.'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Tech?',
          answer: 'AICTE\'s Approval Process Handbook 2024-27 requires a bachelor\'s degree or equivalent with at least 50% marks (45% for reserved categories). Most programmes ask for a B.E. or B.Tech in the same or a related branch; some accept an M.Sc for allied branches.'
        },
        {
          question: 'Is there any difference between M.Tech and M.E.?',
          answer: 'They are the same level of degree. The UGC PG framework lists M.E. and M.Tech together at NHEQF level 7, and AICTE approves both as postgraduate degrees in engineering and technology. The name depends on the university.'
        },
        {
          question: 'Is GATE compulsory for M.Tech?',
          answer: 'No. GATE is the main route to IITs, NITs and IISc, but state colleges also admit through state tests such as CEETA-PG (Tamil Nadu), APPGECET (Andhra Pradesh), TG PGECET (Telangana) and PGCET (Karnataka), and some institutes hold their own tests.'
        },
        {
          question: 'When is GATE 2027?',
          answer: 'IIT Madras will hold GATE 2027 on 6, 7, 13, 14, 20 and 21 February 2027, with results on 19 March 2027. Registration with a late fee closed on 12 October 2026, and the correction window runs from 14 to 21 October 2026. Scores are valid for three years.'
        },
        {
          question: 'Is TANCET required for M.Tech in Tamil Nadu?',
          answer: 'No. In the 2026 cycle, TANCET covered only MBA and MCA. M.E., M.Tech, M.Arch and M.Plan admissions at Anna University and government and aided colleges used CEETA-PG, and GATE candidates also had to take CEETA-PG.'
        },
        {
          question: 'Can working professionals do an M.Tech?',
          answer: 'Yes. AICTE allows approved institutions to run classes in flexible timings for employed candidates, even beyond office hours. These are treated as regular-mode programmes, not evening or part-time ones, so confirm the institution\'s approval.'
        },
        {
          question: 'What is the fee for M.Tech in India?',
          answer: 'Across 1,889 annual M.Tech and M.E. fee records in our database, the median is ₹79,850 a year: ₹74,658 at public institutes and ₹81,000 at private ones. Records were updated between January 2025 and October 2026; check each institute\'s notice.'
        },
        {
          question: 'Which M.Tech branches are most common?',
          answer: 'In our 4,069 active records, computer science, IT, AI and data programmes are the most common (989), followed by electronics, communication and VLSI (971), mechanical and production (739), electrical and power (502) and civil (459).'
        }
      ]
    },
    'd-pharm': {
      h1: 'D.Pharm Course in India: Eligibility, Subjects, Exit Exam & Fees',
      title: 'D.Pharm Course Details: Eligibility, Duration, Fees',
      description:
        'D.Pharm guide: PCI eligibility (PCB/PCM), 2 years + 500 hours training, subjects, exit-exam status, fees (median ₹78,500 a year) and next steps.',
      keywords: ['D.Pharm course', 'D Pharma course details', 'Diploma in Pharmacy', 'D.Pharm eligibility', 'D.Pharm course duration', 'D.Pharm exit exam', 'D.Pharm fees'],
      intro:
        'D.Pharm (Diploma in Pharmacy) is a two-year PCI-approved diploma after Class 12 science, plus 500 hours of practical training. It is the minimum qualification to register as a pharmacist.',
      crossLink: null,
      faqs: [
        {
          question: 'What is the eligibility for D.Pharm?',
          answer: 'PCI requires a pass in 10+2 (science) with Physics, Chemistry and Biology or Mathematics, or a PCI-approved equivalent. States and institutes set minimum marks.'
        },
        {
          question: 'How many years is the D.Pharm course?',
          answer: 'Two academic years (Part I and Part II), each of at least 180 working days, followed by 500 hours of practical training (Part III) spread over at least three months.'
        },
        {
          question: 'Can PCM students do D.Pharm?',
          answer: 'Yes. PCI accepts Physics and Chemistry with either Biology or Mathematics, so both PCB and PCM students are eligible.'
        },
        {
          question: 'Is there an entrance exam for D.Pharm?',
          answer: 'There is no national test. Each state decides: Maharashtra used Class 12 merit through DTE counselling in 2026-27, while Uttar Pradesh allotted seats through JEECUP counselling. Many private institutes admit on Class 12 marks.'
        },
        {
          question: 'Is the D.Pharm exit exam (DPEE) compulsory?',
          answer: 'PCI notified DPEE regulations in 2022, but a PCI circular of 20 February 2026 asked State Pharmacy Councils to register D.Pharm passouts under section 32(2) of the Pharmacy Act. Check your State Pharmacy Council\'s current rule.'
        },
        {
          question: 'What subjects are in D.Pharm?',
          answer: 'Year one covers pharmaceutics, pharmaceutical chemistry, pharmacognosy, human anatomy and physiology, and social pharmacy. Year two covers pharmacology, community pharmacy, biochemistry, pharmacotherapeutics, hospital and clinical pharmacy, and pharmacy law.'
        },
        {
          question: 'What is the fee for D.Pharm?',
          answer: 'Across 59 D.Pharm fee records in our database, the median is ₹78,500 a year and half of programmes charge ₹63,750–₹99,900. Almost all records are private institutes.'
        },
        {
          question: 'Can I do B.Pharm after D.Pharm?',
          answer: 'Yes. D.Pharm holders from a PCI-approved institution can join B.Pharm in the third semester through lateral entry. PCI also approves a two-year B.Pharm (Practice) after D.Pharm.'
        }
      ]
    },
    'd-pharma-course': {
      h1: 'D.Pharma Admission After 12th: State Process, Fees & Choice',
      title: 'D.Pharma Admission After 12th: State Process & Fees',
      description:
        'D.Pharma admission after 12th: eligibility, how Maharashtra, UP and Haryana fill seats, 2026-27 dates, fees in our data and D.Pharma vs B.Pharma.',
      keywords: ['D.Pharma admission', 'D.Pharma admission after 12th', 'D.Pharma admission process', 'D.Pharma entrance exam', 'D.Pharma vs B.Pharma', 'D.Pharma fees'],
      intro:
        'D.Pharma admission needs Class 12 science with Physics, Chemistry and Biology or Maths. There is no national test: each state fills seats by Class 12 merit or its own entrance test.',
      crossLink: {
        href: '/bpharm-colleges',
        anchor: 'Compare B.Pharm colleges',
        note: 'Weighing D.Pharma against a degree? Browse B.Pharm colleges with recorded fees and accepted exams.'
      },
      faqs: [
        {
          question: 'Can I get D.Pharma admission after 12th with PCM?',
          answer: 'Yes. PCI accepts 10+2 science with Physics and Chemistry plus either Biology or Mathematics, so PCM and PCB students are both eligible.'
        },
        {
          question: 'Is there an entrance exam for D.Pharma?',
          answer: 'Not nationally. In 2026-27, Uttar Pradesh allotted seats on the JEECUP entrance-test result, while Maharashtra and Haryana admitted on Class 12 merit through state counselling.'
        },
        {
          question: 'How does D.Pharma admission work in Maharashtra?',
          answer: 'DTE Maharashtra runs a Centralised Admission Process. The merit list uses HSC marks in Physics, Chemistry and the higher of Biology or Mathematics.'
        },
        {
          question: 'What is the last date for D.Pharma admission in Haryana in 2026?',
          answer: 'HSTES lists 30 October 2026 as the final cut-off date for all Diploma Pharmacy admissions, including institute-level rounds, which start on 19 October.'
        },
        {
          question: 'Can commerce or arts students do D.Pharma?',
          answer: 'Not under PCI\'s rule, which needs Physics and Chemistry plus Biology or Mathematics at 10+2 in the science stream.'
        },
        {
          question: 'How much does D.Pharma cost?',
          answer: 'Across 59 programmes in our records, the median annual fee is ₹78,500; in Uttar Pradesh the median across 18 programmes is ₹92,700. Ask each institute for its current fee.'
        },
        {
          question: 'Which is better after 12th, D.Pharma or B.Pharma?',
          answer: 'D.Pharma is a two-year route to pharmacist registration and pharmacy work. B.Pharma takes four years but opens industry roles and M.Pharm. D.Pharma holders can later join B.Pharma in the third semester.'
        }
      ]
    },
    mpharm: {
      h1: 'M.Pharm Course in India: Eligibility, GPAT, Specialisations & Fees',
      title: 'M.Pharm Course: Eligibility, GPAT, Specialisations & Fees',
      description:
        'M.Pharm guide: PCI eligibility (B.Pharm 55%), GPAT 2026 rules, specialisations, semester structure, fees (median ₹1,21,050 a year) and careers.',
      keywords: ['M.Pharm course', 'M.Pharm eligibility', 'M.Pharm admission through GPAT', 'M.Pharm specialisations', 'M.Pharm fees', 'Master of Pharmacy', 'M.Pharm subjects'],
      intro:
        'M.Pharm is a two-year PG degree after a PCI-approved B.Pharm with 55% (50% for SC/ST). Check the admission route, GPAT rules, specialisation and fees before you shortlist colleges.',
      crossLink: {
        href: '/mpharm-colleges',
        anchor: 'Compare M.Pharm colleges by fees & placements',
        note: 'Ready to shortlist? Browse M.Pharm colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Pharm?',
          answer: 'PCI requires a B.Pharm from a PCI-approved institution with at least 55% aggregate across four years (50% for SC/ST). You must also register with a State Pharmacy Council within one month of admission.'
        },
        {
          question: 'Is GPAT compulsory for M.Pharm?',
          answer: 'Not everywhere. PCI allows selection by a state or university test, a national test such as GPAT, or B.Pharm marks. GPAT is needed for M.Pharm scholarships, and some states, such as Telangana, give GPAT-qualified candidates first preference.'
        },
        {
          question: 'What is the GPAT 2026 exam pattern?',
          answer: 'NBEMS held GPAT 2026 on 7 March 2026: 125 multiple-choice questions in English in 3 hours, with +4 for a correct answer and −1 for a wrong one.'
        },
        {
          question: 'How long is a GPAT score valid?',
          answer: 'NBEMS states that the GPAT 2026 score is valid for three years.'
        },
        {
          question: 'Which M.Pharm specialisations are there?',
          answer: 'PCI lists Pharmaceutics, Industrial Pharmacy, Pharmaceutical Technology, Pharmaceutical Chemistry, Analysis, Quality Assurance, Regulatory Affairs, Biotechnology, Pharmacy Practice, Pharmacology, Pharmacognosy and Phytopharmacy & Phytomedicine.'
        },
        {
          question: 'What is the fee for M.Pharm in India?',
          answer: 'Across 252 M.Pharm fee records in our database, the median is ₹1,21,050 a year and half of programmes charge ₹86,000–₹1,70,000. The public median is ₹60,000 and the private median ₹1,30,000.'
        },
        {
          question: 'What is studied in the second year of M.Pharm?',
          answer: 'Mostly research. Semester III adds Research Methodology and Biostatistics, a journal club and your research proposal; semester IV is research work and the final presentation.'
        },
        {
          question: 'Can I teach after M.Pharm?',
          answer: 'Yes, M.Pharm is a common teaching qualification; PCI\'s D.Pharm regulations, for example, list M.Pharm or Pharm.D for lecturers. Check PCI\'s teacher-qualification rules for the level you want to teach.'
        }
      ]
    },
    polytechnic: {
      h1: 'Polytechnic Course After 10th: Eligibility, Admission, Branches & Fees',
      title: 'Polytechnic Course After 10th: Eligibility, Admission & Fees',
      description:
        'Polytechnic diploma after 10th: AICTE eligibility, state admission (POLYCET or merit), branches, fees (median ₹30,150 a year), B.Tech lateral entry.',
      keywords: ['polytechnic course', 'polytechnic course after 10th', 'polytechnic eligibility', 'polytechnic admission', 'polytechnic course fees', 'polytechnic lateral entry to B.Tech', 'diploma in engineering'],
      intro:
        'A polytechnic course is a 3-year engineering diploma you can join after Class 10. Check your state\'s admission route, the branch, fees and the lateral-entry path to B.Tech before you pick a college.',
      crossLink: {
        href: '/polytechnic-colleges',
        anchor: 'Compare polytechnic colleges by fees & branches',
        note: 'Ready to shortlist? Browse polytechnic colleges with recorded fees, branches and admission details.'
      },
      faqs: [
        {
          question: 'What is the eligibility for a polytechnic course?',
          answer: 'Under the AICTE Approval Process Handbook 2024-27, you need a pass in Class 10 (SSC) to join the 3-year diploma. States can add conditions; Telangana, for example, asks for Mathematics and at least 35% in Class 10.'
        },
        {
          question: 'Is there an entrance exam for polytechnic admission?',
          answer: 'It depends on the state. Telangana uses POLYCET, held by SBTET on 13 May 2026. Haryana filled 2026-27 diploma engineering seats on Class 10 merit without a test. There is no national polytechnic entrance test.'
        },
        {
          question: 'What is the TS POLYCET exam pattern?',
          answer: 'POLYCET-2026 had 150 multiple-choice questions in 2½ hours: Mathematics 60, Physics 30, Chemistry 30 and Biology 30, with no negative marking. The polytechnic rank uses the 120 marks in Maths, Physics and Chemistry, and the qualifying mark is 36.'
        },
        {
          question: 'Can I join a polytechnic after 12th?',
          answer: 'Yes. AICTE allows students who passed 10+2 with listed subjects, or Class 10 plus a 2-year ITI, to join the diploma directly in the second year through lateral entry.'
        },
        {
          question: 'Can I do B.Tech after a polytechnic diploma?',
          answer: 'Yes. AICTE lets diploma holders with at least 45% marks (40% for reserved categories) join B.E./B.Tech in the second year. Lateral-entry seats are up to 10% of approved intake plus unfilled first-year seats; states run the admission.'
        },
        {
          question: 'What is the fee for a polytechnic course?',
          answer: 'Across 276 polytechnic fee records in our database, the median is ₹30,150 a year and half of programmes charge ₹19,750–₹42,000. The government/public median is ₹11,225 and the private median ₹33,300. Telangana\'s government polytechnics charged ₹3,800 a year in 2026.'
        },
        {
          question: 'Which polytechnic branch is most common?',
          answer: 'In our records, Mechanical (117 programmes) and Civil (97) are the most common, followed by Electrical/EEE (59), Electronics/ECE (54) and Computer Science (54).'
        },
        {
          question: 'How long is a polytechnic course?',
          answer: 'Three years when you join after Class 10, and two years if you join the second year through lateral entry after 10+2 or ITI.'
        }
      ]
    },
    bams: {
      h1: 'BAMS Course: Duration, Eligibility, Subjects, Fees & Admission',
      title: 'BAMS Course Details: Duration, Eligibility & Fees',
      description:
        'BAMS guide: 5½-year structure, NCISM eligibility after the 2025 change, NEET (UG) and AACCC counselling, subjects, fees and careers.',
      keywords: ['BAMS course', 'BAMS full form', 'BAMS course duration', 'BAMS eligibility', 'BAMS subjects', 'BAMS fees', 'BAMS vs MBBS'],
      intro:
        'BAMS (Bachelor of Ayurvedic Medicine and Surgery) is a 5½-year Ayurveda degree after Class 12 with Physics, Chemistry and Biology. Admission is only through NEET (UG) and official counselling; check NCISM permission and total fees before you choose a college.',
      crossLink: {
        href: '/bams-colleges',
        anchor: 'Compare BAMS colleges by fees & location',
        note: 'Ready to shortlist? Browse BAMS colleges with recorded fees, then check each one on NCISM\'s list of permitted colleges for your year.'
      },
      faqs: [
        {
          question: 'What is the full form of BAMS?',
          answer: 'BAMS stands for Bachelor of Ayurvedic Medicine and Surgery. NCISM\'s regulations name the degree Ayurvedacharya (Bachelor of Ayurvedic Medicine and Surgery – B.A.M.S).'
        },
        {
          question: 'How many years is the BAMS course?',
          answer: 'Five and a half years: First, Second and Third Professional phases of 18 months each, followed by a 12-month compulsory rotatory internship. The degree is awarded only after the internship.'
        },
        {
          question: 'What is the eligibility for BAMS?',
          answer: 'A Class 12 pass with Physics, Chemistry, and Biology or Biotechnology; a qualifying NEET (UG) percentile (50th for General/EWS, 45th for General PwBD, 40th for SC, ST and OBC); and a minimum age of 17 by 31 December of the admission year.'
        },
        {
          question: 'Is 50% in PCB still required for BAMS?',
          answer: 'No. NCISM withdrew the minimum-percentage rule by its letter of 11 July 2025, so a pass in Physics, Chemistry and Biology or Biotechnology is enough. State counselling authorities can still add their own conditions.'
        },
        {
          question: 'Is there an upper age limit for BAMS?',
          answer: 'No. NCISM\'s admission directives for Ayurveda, Siddha, Unani and Homoeopathy courses state there is no upper age limit. The minimum age is 17.'
        },
        {
          question: 'Can I get BAMS admission without NEET?',
          answer: 'Not for Indian candidates. Every seat except foreign-national seats is filled through AACCC or state counselling on the basis of NEET (UG) merit. NCISM does not approve direct admissions.'
        },
        {
          question: 'Who conducts BAMS counselling?',
          answer: 'AACCC (Ministry of Ayush) fills 15% All India Quota seats in government and aided colleges, all deemed university seats and listed national institute seats. State and UT authorities fill the 85% state quota and private college seats.'
        },
        {
          question: 'What is the fee for BAMS?',
          answer: 'It varies widely. Across only 19 annual fee records in our database (updated January 2025), the median is ₹2,02,500 a year and the middle half ranges from ₹51,400 to ₹2,90,000. Check each college\'s current fee schedule.'
        },
        {
          question: 'What is the difference between BAMS and MBBS?',
          answer: 'Both take 5½ years and admit through NEET (UG). BAMS trains you in Ayurveda under NCISM; MBBS trains you in modern medicine under the National Medical Commission, with separate MCC and state counselling.'
        }
      ]
    },
    bums: {
      h1: 'BUMS Course: Duration, Urdu Rule, Eligibility, Fees & Admission',
      title: 'BUMS Course Details: Duration, Eligibility & Urdu Rule',
      description:
        'BUMS guide: 5½-year Unani degree, the Urdu rule, NEET (UG) and AACCC counselling, Pre-Tib route, 2026-27 seats by state and careers.',
      keywords: ['BUMS course', 'BUMS full form', 'BUMS course duration', 'BUMS eligibility', 'BUMS Urdu requirement', 'BUMS subjects', 'BUMS vs BAMS'],
      intro:
        'BUMS (Bachelor of Unani Medicine and Surgery) is a 5½-year Unani degree after Class 12 with Physics, Chemistry and Biology. Admission is through NEET (UG) and official counselling; if you did not study Urdu, Arabic or Persian, you study Urdu in the first year.',
      crossLink: {
        href: '/exams/neet',
        anchor: 'Read the NEET (UG) exam guide',
        note: 'BUMS seats are filled on NEET (UG) merit through AACCC and state counselling. Check the exam pattern and dates before you plan.'
      },
      faqs: [
        {
          question: 'What is the full form of BUMS?',
          answer: 'BUMS stands for Bachelor of Unani Medicine and Surgery. NCISM\'s regulations name the degree Kamile Tib o Jarahat (Bachelor of Unani Medicine and Surgery – B.U.M.S.).'
        },
        {
          question: 'How many years is the BUMS course?',
          answer: 'Five and a half years: First, Second and Third Professional phases of 18 months each, followed by a 12-month compulsory rotatory internship. The degree is awarded only after the internship.'
        },
        {
          question: 'Is Urdu compulsory for BUMS?',
          answer: 'Not for admission. NCISM expects Urdu, Arabic or Persian as a subject in Class 10 or 12; students without it must study Urdu, Arabic and Mantiq wa Falsafa (logic and philosophy) in the First Professional year.'
        },
        {
          question: 'What is the eligibility for BUMS?',
          answer: 'A Class 12 pass with Physics, Chemistry, and Biology or Biotechnology; a qualifying NEET (UG) percentile (50th for General/EWS, 45th for General PwBD, 40th for SC, ST and OBC); the language rule; and a minimum age of 17 by 31 December of the admission year.'
        },
        {
          question: 'Is there an upper age limit for BUMS?',
          answer: 'No. The AACCC 2026-27 bulletin says NCISM and NCH decided in July 2022 not to apply any upper age limit to BAMS, BSMS, BUMS and BHMS admissions.'
        },
        {
          question: 'Can I get BUMS admission without NEET?',
          answer: 'Only through Pre-Tib, a one-year programme for holders of listed oriental qualifications such as Fazil, limited to 10% of a college\'s BUMS seats. All other seats, except foreign-national seats, are filled on NEET (UG) merit through counselling.'
        },
        {
          question: 'Who conducts BUMS counselling?',
          answer: 'AACCC (Ministry of Ayush) fills 15% All India Quota seats in government and aided colleges, all deemed university seats and 50% of BUMS seats at AMU, Aligarh. State and UT authorities fill the 85% state quota and private college seats.'
        },
        {
          question: 'How many BUMS seats are there in India?',
          answer: 'NCISM\'s list of permitted existing Unani colleges for 2026-27, as on 9 October 2026, shows 2,425 BUMS seats in 41 colleges. Uttar Pradesh has 715 and Maharashtra 504.'
        },
        {
          question: 'What is the difference between BUMS and BAMS?',
          answer: 'Both are 5½-year NCISM degrees with NEET (UG) admission. BUMS teaches Unani medicine with Urdu and Arabic terminology; BAMS teaches Ayurveda with Sanskrit texts.'
        }
      ]
    },
    bhms: {
      h1: 'BHMS Course: Duration, Eligibility, Subjects, Fees & Admission',
      title: 'BHMS Course Details: Duration, Eligibility & Fees',
      description:
        'BHMS guide: 5½-year structure, NCH eligibility after the 2025 change, NEET (UG) 2026 scores, AACCC counselling, seats by state and fees.',
      keywords: ['BHMS course', 'BHMS full form', 'BHMS course duration', 'BHMS eligibility', 'BHMS subjects', 'BHMS fees', 'BHMS vs BAMS'],
      intro:
        'BHMS (Bachelor of Homoeopathic Medicine and Surgery) is a 5½-year homoeopathy degree after Class 12 with Physics, Chemistry and Biology. Admission is through NEET (UG) and official counselling; check NCH permission and total fees before you choose a college.',
      crossLink: {
        href: '/bhms-colleges',
        anchor: 'Compare BHMS colleges by fees & location',
        note: 'Ready to shortlist? Browse BHMS colleges with recorded fees, then check each one on NCH\'s permission status list for your year.'
      },
      faqs: [
        {
          question: 'What is the full form of BHMS?',
          answer: 'BHMS stands for Bachelor of Homoeopathic Medicine and Surgery. It is regulated by the National Commission for Homoeopathy (NCH).'
        },
        {
          question: 'How many years is the BHMS course?',
          answer: 'Five and a half years: First BHMS of 18 months, Second, Third and Fourth BHMS of 12 months each, followed by a 12-month compulsory rotatory internship.'
        },
        {
          question: 'What is the eligibility for BHMS?',
          answer: 'A Class 12 pass with Physics, Chemistry, and Biology or Biotechnology; a qualifying NEET (UG) percentile (50th for General/EWS, 45th for General PwBD, 40th for SC, ST and OBC); and a minimum age of 17 by 31 December of the admission year.'
        },
        {
          question: 'Is 50% in PCB required for BHMS?',
          answer: 'No. The NCH BHMS Amendment Regulations, 2025 replaced the 50% rule with a simple pass in Physics, Chemistry, and Biology or Biotechnology. State counselling authorities can still add their own conditions.'
        },
        {
          question: 'What NEET score was needed for BHMS in 2026?',
          answer: 'The qualifying scores for NEET (UG) 2026 were 213 out of 720 for General/EWS (50th percentile), 194 for General PwBD and 177 for SC, ST and OBC, as published by Dr NTR UHS. Government seats need much higher ranks.'
        },
        {
          question: 'Is there an upper age limit for BHMS?',
          answer: 'No. The NCH regulations set only a minimum age of 17, and the AACCC 2026-27 bulletin confirms there is no upper age limit.'
        },
        {
          question: 'Who conducts BHMS counselling?',
          answer: 'AACCC (Ministry of Ayush) fills 15% All India Quota seats in government and aided colleges, all deemed university seats and NIH Kolkata seats. State and UT authorities fill the 85% state quota and private college seats.'
        },
        {
          question: 'How many BHMS seats are there in India?',
          answer: 'NCH\'s 2026-27 status list, as on 9 October 2026, shows 18,702 permitted BHMS seats in 236 colleges, led by Maharashtra (4,995) and Gujarat (4,340). NCH denied permission to 63 colleges.'
        },
        {
          question: 'Do BHMS graduates have to pass NExT?',
          answer: 'The Ministry of Ayush decided in September 2025 that the National Exit Test applies to BHMS students admitted from 2021-22 onwards. Check NCH\'s website for the exam schedule.'
        }
      ]
    },
    physiotherapy: {
      h1: 'BPT Course in India: Eligibility, NEET Rule, Duration, Subjects & Fees',
      title: 'BPT Course: Eligibility, NEET Rule, 5-Year Duration & Fees',
      description:
        'BPT guide: NCAHP eligibility (PCB 50%), NEET from 2027-28, the new 5-year course with internship, subjects, fees (median ₹86,000/yr) and registration.',
      keywords: ['BPT course', 'Bachelor of Physiotherapy', 'BPT eligibility', 'is NEET required for BPT', 'BPT course duration', 'BPT subjects', 'BPT fees'],
      intro:
        'BPT (Bachelor of Physiotherapy) is now a five-year degree, including a one-year internship, open after Class 12 with Physics, Chemistry and Biology. Check NCAHP eligibility, the NEET timeline, fees and registration before you shortlist colleges.',
      crossLink: {
        href: '/bpt-colleges',
        anchor: 'Compare BPT colleges by fees & placements',
        note: 'Ready to shortlist? Browse BPT colleges with recorded fees and placement outcomes, then confirm each college follows the five-year NCAHP curriculum.'
      },
      faqs: [
        {
          question: 'How many years is the BPT course now?',
          answer: 'Five years: four academic years plus a one-year full-time rotatory internship. NCAHP\'s physiotherapy curriculum is compulsory from 2026-27, and UGC\'s August 2026 notification lists B.PT as a five-year degree, up from 4.5 years.'
        },
        {
          question: 'Is NEET required for BPT admission?',
          answer: 'Not for 2026-27: NCAHP deferred the NEET requirement and admission is on Class 12 PCB marks. From 2027-28 you must have appeared in NEET (UG) that year. NCAHP sets no minimum NEET score; admission is on NEET merit.'
        },
        {
          question: 'What is the eligibility for BPT?',
          answer: '10+2 with Physics, Chemistry and Biology (or Botany and Zoology), at least 50% in PCB together (40% for SC, ST, OBC-NCL and PwBD), a pass in English, and age 17 by 31 December of the admission year. A medical fitness certificate is also required.'
        },
        {
          question: 'Can PCM students do BPT?',
          answer: 'Not under NCAHP\'s 2026-27 criteria. They require Physics, Chemistry and Biology (or Botany and Zoology) at 10+2.'
        },
        {
          question: 'What is the fee for BPT in India?',
          answer: 'Across 57 BPT fee records in our database, the median is ₹86,000 a year and half of programmes charge ₹65,000–₹1,20,000. Records were last updated in January 2025, so ask each college for its current five-year fee schedule.'
        },
        {
          question: 'Can I do BPT through distance or online mode?',
          answer: 'No. NCAHP has told UGC that only full-time regular allied health courses can be recognised under the NCAHP Act, 2021.'
        },
        {
          question: 'Is a diploma in physiotherapy valid?',
          answer: 'NCAHP\'s curriculum says the government aims to phase out physiotherapy diplomas, and an NCAHP clarification of August 2026 says diploma qualifications are not permitted for health professions under ISCO code 22. Choose the BPT degree.'
        },
        {
          question: 'Do I need to register after BPT?',
          answer: 'Yes. Under the NCAHP Act only registered professionals can provide services in a recognised category. You apply to your State Council (or the Central Register if your state has none); registration is valid for five years.'
        },
        {
          question: 'What can I do after BPT?',
          answer: 'You can work as a physiotherapist in hospitals, clinics, sports and fitness settings or community rehabilitation, or study a two-year MPT in one of eight specialisations and then a PhD.'
        }
      ]
    },
    bpt: {
      h1: 'How to Become a Physiotherapist in India: Courses & Registration',
      title: 'How to Become a Physiotherapist: Courses & Registration',
      description:
        'How to become a physiotherapist in India: B.PT, M.PT and PhD routes, NCAHP registration, state council status, work settings and career levels.',
      keywords: ['how to become a physiotherapist', 'physiotherapist course', 'physiotherapy career in India', 'physiotherapist registration', 'NCAHP physiotherapy', 'bachelor of physiotherapy', 'physiotherapy courses after 12th'],
      intro:
        'To practise as a physiotherapist in India you need a full-time Bachelor of Physiotherapy (now five years with internship) and registration with your state allied health council under the NCAHP Act, 2021. See the qualification ladder, registration steps and career levels.',
      crossLink: {
        href: '/bpt-colleges',
        anchor: 'Compare BPT colleges by fees & placements',
        note: 'Ready to shortlist? Browse BPT colleges with recorded fees and placement outcomes, then confirm each one runs the full-time five-year NCAHP curriculum.'
      },
      faqs: [
        {
          question: 'How do I become a physiotherapist in India?',
          answer: 'Complete 10+2 with Physics, Chemistry and Biology, study a full-time Bachelor of Physiotherapy (B.PT) at a recognised university, and register with the allied health council of the state where you live. The B.PT now lasts five years, including a one-year internship.'
        },
        {
          question: 'Who regulates physiotherapy in India?',
          answer: 'The National Commission for Allied and Healthcare Professions (NCAHP), set up under the NCAHP Act, 2021, together with state and Union Territory councils. Physiotherapy is one of the 10 professional categories listed in the Act.'
        },
        {
          question: 'Is registration compulsory for physiotherapists?',
          answer: 'Yes. Under the NCAHP Act only registered professionals can provide services in a recognised category, hold such a government post or sign certificates that the law requires such a professional to sign.'
        },
        {
          question: 'What if my state has no allied health council?',
          answer: 'You apply to NCAHP for entry on the Central Register (fee ₹2,000). Your entry moves to the State Register once the council is set up. In October 2026, NCAHP listed Chandigarh, Delhi, Ladakh and Lakshadweep as not having notified a council.'
        },
        {
          question: 'How long is physiotherapy registration valid?',
          answer: 'Five years. To renew, you need at least 15 hours a year (75 hours in five years) of continuing professional development, no more than half of it online, and you must apply six months before expiry.'
        },
        {
          question: 'Can I become a physiotherapist with a diploma?',
          answer: 'NCAHP\'s curriculum says the government aims to phase out physiotherapy diplomas, and its August 2026 letter says diplomas are not permitted for health professions under ISCO code 22. The entry qualification is the B.PT degree.'
        },
        {
          question: 'Which M.PT specialisations are recognised?',
          answer: 'UGC\'s August 2026 notification lists eight: Musculoskeletal, Neuro, Cardio-Pulmonary, Sports, Pediatrics and Neonatal, Obstetrics and Gynecology, Oncology, and Community Rehabilitation Sciences.'
        },
        {
          question: 'Do I need an M.PT to teach physiotherapy?',
          answer: 'Yes. NCAHP\'s curriculum recommends an M.PT for the entry teaching post of assistant professor, and a PhD for associate professor and above. Each employer\'s recruitment rules apply.'
        }
      ]
    },
    mpt: {
      h1: 'MPT Course in India: Eligibility, Admission, Specialisations & Fees',
      title: 'MPT Course: Eligibility, Entrance, Specialisations & Fees',
      description:
        'MPT (Master of Physiotherapy): 2-year PG after a regular B.PT, university entrance (not NEET-PG), 8 UGC specialisations, fees (median ₹1,23,900/yr).',
      keywords: ['MPT course', 'Master of Physiotherapy', 'MPT full form', 'MPT eligibility', 'MPT entrance exam', 'NEET PG for MPT', 'MPT specialisations'],
      intro:
        'MPT (Master of Physiotherapy) is a two-year, full-time postgraduate degree after a regular B.PT. Admission is through a university entrance exam and registration is compulsory. Compare the eight UGC-named specialisations, course structure, fees and careers.',
      crossLink: {
        href: '/mpt-colleges',
        anchor: 'Compare MPT colleges by fees & placements',
        note: 'Ready to shortlist? Browse MPT colleges with recorded fees and placement outcomes, then confirm which of the eight UGC degree names each one awards.'
      },
      faqs: [
        {
          question: 'What is the full form of MPT?',
          answer: 'MPT stands for Master of Physiotherapy (written M.PT in NCAHP and UGC documents). It is a two-year, full-time postgraduate degree for physiotherapists.'
        },
        {
          question: 'What is the eligibility for MPT?',
          answer: 'A pass in a B.PT studied in regular mode at a recognised university, registration as a physiotherapist, and a medical fitness certificate. Until the first 2026-27 batch completes, an equivalent bachelor\'s degree such as the older 4.5-year BPT is also accepted.'
        },
        {
          question: 'Is NEET-PG required for MPT?',
          answer: 'No NCAHP document we checked uses NEET-PG for MPT. NCAHP\'s curriculum, its Corrigendum-1 and its letter to UGC all name an entrance exam held by the university. NEET-PG is for medical graduates.'
        },
        {
          question: 'How is MPT admission done?',
          answer: 'Through an entrance exam conducted by the university, with admission by the State, UT or university and reservation as per government norms. For 2026-27, NCAHP set 31 October 2026 as the last date for allied PG admissions.'
        },
        {
          question: 'Which MPT specialisations are recognised?',
          answer: 'UGC\'s notification of 27 August 2026 lists eight: Musculoskeletal, Neuro, Cardio-Pulmonary, Sports, Pediatrics and Neonatal, Obstetrics and Gynecology, Oncology, and Community Rehabilitation Sciences. Universities must restructure older MPT names to these.'
        },
        {
          question: 'What is the fee for MPT in India?',
          answer: 'Across 52 MPT fee records in our database, the median is ₹1,23,900 a year and half of programmes charge ₹95,000–₹1,54,891. Almost all records are from private institutes, so ask each college for its current fee.'
        },
        {
          question: 'Can I do MPT through distance or online mode?',
          answer: 'No. NCAHP recognises only full-time regular allied health courses, and the curriculum requires full-time clinical training.'
        },
        {
          question: 'What can I do after MPT?',
          answer: 'Work as a specialist physiotherapist, teach as an assistant professor (NCAHP recommends an MPT for this post), or study a PhD, which needs an MPT in a recognised speciality with 55% marks.'
        }
      ]
    },
    bmlt: {
      h1: 'BMLT Course in India: Eligibility, 4-Year B.MLS, Subjects & Careers',
      title: 'BMLT Course: Eligibility, Subjects, Duration & Registration',
      description:
        'BMLT (now B.MLS): 4-year lab science degree with internship after 10+2 PCB, admission on Class 12 merit, D.MLT lateral entry and registration.',
      keywords: ['BMLT course', 'BMLT full form', 'BMLT eligibility', 'BMLT course duration', 'BMLT subjects', 'B.MLS course', 'BMLT course admission 2026'],
      intro:
        'BMLT trains you to run diagnostic laboratory tests. From 2026-27, NCAHP\'s curriculum calls it B.MLS: four years including a one-year internship, open after 10+2 with PCB, with admission on Class 12 merit. See eligibility, subjects, registration and further study.',
      crossLink: null,
      faqs: [
        {
          question: 'What is the full form of BMLT?',
          answer: 'BMLT stands for Bachelor of Medical Laboratory Technology. NCAHP\'s curriculum, compulsory from 2026-27, uses the name Bachelor of Medical Laboratory Science (B.MLS) for the degree.'
        },
        {
          question: 'How many years is the BMLT course?',
          answer: 'Under NCAHP\'s curriculum the B.MLS takes four years: six semesters of study plus a one-year internship in semesters 7 and 8. Older three-year and 3.5-year degrees studied in regular mode are still recognised for registration.'
        },
        {
          question: 'What is the eligibility for BMLT?',
          answer: '10+2 with Physics, Chemistry and Biology (or Botany and Zoology), and age 17 by 31 December of the admission year. A medical fitness certificate endorsed by a government medical officer is also required. Universities may set their own minimum marks.'
        },
        {
          question: 'Is NEET required for BMLT?',
          answer: 'No. NCAHP\'s Corrigendum-1 of 20 March 2026 replaced the earlier NEET wording; admission to B.MLS is on 10+2 merit, conducted by the State, UT or university.'
        },
        {
          question: 'Can D.MLT holders get lateral entry into BMLT?',
          answer: 'Yes. Holders of a Diploma in Medical Laboratory Technology with 50% marks can join the second year (3rd semester) of the B.MLS.'
        },
        {
          question: 'What subjects are taught in BMLT?',
          answer: 'Anatomy, physiology, microbiology, biochemistry and haematology in the first year; bacteriology, immunology, genetics and clinical pathology in the second; parasitology, transfusion medicine, histopathology and clinical biochemistry in the third; then a 12-month laboratory internship.'
        },
        {
          question: 'Do I need to register after BMLT?',
          answer: 'Yes. Under the NCAHP Act only registered professionals can provide services in a recognised category. You register with your State Council, or the NCAHP Central Register where no council functions, and renew every five years.'
        },
        {
          question: 'What can I study after BMLT?',
          answer: 'A two-year Master of Medical Laboratory Science (M.MLS) in Medical Biochemistry, Medical Microbiology, Haematology and Transfusion Medicine, or Histology and Cytopathology, through a university entrance exam. A PhD needs an M.MLS with 55%.'
        }
      ]
    },
    'design-ug': {
      h1: 'B.Des Course in India: Eligibility, Exams, Specialisations & Fees',
      title: 'B.Des Course: Eligibility, UCEED, NID DAT, NIFT & Fees',
      description:
        'B.Des guide: any-stream eligibility, UCEED vs NID DAT vs NIFT, 245 IIT seats, specialisations, fees (median ₹1.87 lakh a year in our data).',
      keywords: ['B.Des course', 'Bachelor of Design', 'B.Des eligibility', 'B.Des entrance exams', 'B.Des fees', 'B.Des specialisations', 'B.Des after 12th'],
      intro:
        'B.Des (Bachelor of Design) is a four-year degree you can join after Class 12 in any stream at most institutes. Admission is through design aptitude tests such as UCEED, NID DAT and the NIFT entrance test.',
      crossLink: {
        href: '/bdes-colleges',
        anchor: 'Compare B.Des colleges by fees & exams',
        note: 'Ready to shortlist? Browse B.Des colleges with recorded fees and accepted entrance exams.'
      },
      faqs: [
        {
          question: 'Can commerce or arts students do B.Des?',
          answer: 'Yes. NID, NIFT and most universities accept Class 12 in any stream. Through UCEED, IIT Bombay, IIT Delhi, IIT Hyderabad and IIT Indore accept all streams, but IIT Guwahati and IIT Roorkee need Physics, Chemistry and Maths.'
        },
        {
          question: 'How many years is a B.Des?',
          answer: 'Four years (eight semesters) at the IITs, NIFT and NID Assam. For 2027-28, NID Ahmedabad, Gandhinagar and Bengaluru admit Class 12 students to a 5.5-year integrated programme instead.'
        },
        {
          question: 'Which entrance exams are used for B.Des?',
          answer: 'UCEED for the IITs and IIITDM Jabalpur, the NID Design Aptitude Test for the NIDs and the NIFT entrance test for NIFT. Many universities run their own test or accept these scores.'
        },
        {
          question: 'What is in the UCEED exam?',
          answer: 'One 3-hour paper of 300 marks. Part A (200 marks) is computer-based with numerical, multiple-select and multiple-choice questions. Part B (100 marks) has one sketching and one design aptitude question.'
        },
        {
          question: 'How does NIFT select B.Des students?',
          answer: 'Through a General Ability Test (30%) and a Creative Ability Test (50%), followed by a Situation Test (20%) in which you build a model from given materials.'
        },
        {
          question: 'How many B.Des seats are there through UCEED?',
          answer: 'The seven participating institutes had 245 B.Des seats in 2026-27, excluding female supernumerary seats. Check the 2027-28 seat matrix on the UCEED website.'
        },
        {
          question: 'What is the fee for B.Des in India?',
          answer: 'Across 235 B.Des fee records at 84 institutes in our database, the median is ₹1,87,000 a year and half of programmes charge ₹1,25,000–₹3,00,000. NIFT\'s first-year fee for the 2026-27 batch is ₹3,41,700 including one-time charges.'
        },
        {
          question: 'Is a portfolio needed for B.Des?',
          answer: 'The UCEED, NID and NIFT admission documents do not list a portfolio submission; they test drawing and making skills in the exam itself. Several private universities ask for a portfolio presentation and interview, so keep a folder of your work.'
        }
      ]
    },
    'fashion-design-ug': {
      h1: 'Fashion Design Course After 12th: B.Des, B.Sc, Diploma & NIFT',
      title: 'Fashion Design Course After 12th: NIFT, Eligibility, Fees',
      description:
        'Fashion design after 12th: B.Des vs B.Sc vs diploma, NIFT eligibility and Situation Test, 801 NIFT seats, subjects, fees and careers.',
      keywords: ['fashion designing course after 12th', 'fashion design course', 'B.Des fashion design', 'B.Sc fashion design', 'NIFT fashion design admission', 'fashion designing course fees', 'fashion design eligibility'],
      intro:
        'After Class 12 you can study fashion design through a four-year B.Des, a three- or four-year B.Sc, or a shorter diploma. Most programmes accept any stream; NIFT admits through a written test and a hands-on Situation Test.',
      crossLink: {
        href: '/fashion-design-ug-colleges',
        anchor: 'Compare fashion design colleges',
        note: 'Ready to shortlist? Browse fashion design colleges and check whether each programme is a degree or a diploma.'
      },
      faqs: [
        {
          question: 'Which fashion design course is best after 12th?',
          answer: 'It depends on your goal. A B.Des (4 years at NIFT) or B.Sc (3 years, or 4 for honours) gives you a degree that leads to a master\'s. A diploma is shorter and skill-focused but is not a degree.'
        },
        {
          question: 'Can commerce or arts students study fashion design?',
          answer: 'Yes. NIFT accepts Class 12 from any stream for its B.Des, and most universities do the same. Only NIFT\'s B.F.Tech needs Mathematics.'
        },
        {
          question: 'What is the age limit for NIFT B.Des?',
          answer: 'You must be below 24 years on 1 August of the admission year. SC, ST and PwD candidates get five years\' relaxation.'
        },
        {
          question: 'How does NIFT select fashion design students?',
          answer: 'Through a General Ability Test (30%) and a Creative Ability Test (50%), then a Situation Test (20%) in which you build a model from given materials. You then choose Fashion Design at seat allocation.'
        },
        {
          question: 'How many fashion design seats does NIFT have?',
          answer: 'NIFT offered 801 regular and state-domicile B.Des Fashion Design seats across its campuses in 2026, out of 3,423 B.Des seats in total.'
        },
        {
          question: 'What subjects are taught in fashion design?',
          answer: 'Fashion illustration, pattern-making, draping, garment construction, textiles and design software such as CLO 3D, plus electives, a craft cluster visit, an industry internship and a final collection or project.'
        },
        {
          question: 'What is the fee for a fashion design course?',
          answer: 'In our thin sample, the median annual fee is ₹86,200 for degrees (28 records) and ₹81,000 for diplomas (23 records). NIFT\'s first-year B.Des fee for the 2026-27 batch is ₹3,41,700 including one-time charges.'
        },
        {
          question: 'Is a B.Sc in Fashion Design a valid degree?',
          answer: 'Yes, when a recognised university awards it. Under the UGC framework it runs for three years, or four for honours, and you can exit early with a certificate after one year or a diploma after two.'
        }
      ]
    },
    'fashion-design-pg': {
      h1: 'PG in Fashion Design: NIFT M.Des, M.F.M, M.F.Tech & NID M.Des',
      title: 'PG in Fashion Design: NIFT & NID Master\'s, Eligibility, Fees',
      description:
        'Master\'s in fashion after graduation: NIFT M.Des, M.F.M and M.F.Tech vs NID M.Des, eligibility, selection weightage, seats and official fees.',
      keywords: ['PG in fashion designing', 'masters in fashion design', 'NIFT M.Des', 'NIFT MFM', 'M.F.Tech', 'NID M.Des apparel design', 'fashion design course after graduation'],
      intro:
        'After graduation you can study fashion at master\'s level through NIFT\'s M.Des, M.F.M and M.F.Tech or NID\'s M.Des in Apparel, Textile or Lifestyle Accessory Design. Check eligibility, the selection process and whether a programme is a degree or a diploma.',
      crossLink: {
        href: '/fashion-design-pg-colleges',
        anchor: 'Compare PG fashion design colleges',
        note: 'Ready to shortlist? Browse PG fashion programmes and check whether each one is a master\'s degree or a diploma.'
      },
      faqs: [
        {
          question: 'Can I do a master\'s in fashion design after any degree?',
          answer: 'Yes for NIFT\'s M.Des and M.F.M, which accept a bachelor\'s degree in any discipline or a three-year NIFT/NID diploma, and for NID\'s M.Des. NIFT\'s M.F.Tech needs B.E./B.Tech or a four-year B.F.Tech.'
        },
        {
          question: 'Is there an age limit for NIFT master\'s programmes?',
          answer: 'No. NIFT\'s M.Des, M.F.M and M.F.Tech have no age limit. NID\'s M.Des does: for 2027-28, General and EWS candidates must be born on or after 1 July 1995.'
        },
        {
          question: 'How does NIFT select M.Des students?',
          answer: 'General Ability Test 30%, Creative Ability Test 40% and personal interview 30%. M.F.M and M.F.Tech use the General Ability Test (70%) and interview (30%).'
        },
        {
          question: 'Is NIFT\'s M.Des a fashion design course?',
          answer: 'It is a multi-disciplinary design master\'s with tracks in design thinking, interaction and experience design, sustainability, trend research and strategic design. NIFT says it assumes you already know design fundamentals.'
        },
        {
          question: 'How long is a master\'s in fashion design?',
          answer: 'Two years at NIFT and two and a half years for NID\'s M.Des. University master\'s degrees take two years after a three-year bachelor\'s, or one year after a four-year honours degree.'
        },
        {
          question: 'How many seats does NIFT have for master\'s programmes?',
          answer: 'In 2026 NIFT offered 275 M.Des, 719 M.F.M and 68 M.F.Tech regular and state-domicile seats across its campuses, plus NRI seats.'
        },
        {
          question: 'What is the fee for NIFT\'s master\'s programmes?',
          answer: 'For the 2026-27 batch (non-NRI), tuition is ₹1,50,000 a semester in the first year. The first year costs ₹3,41,700 and the two years ₹6,84,600 including one-time charges, before hostel.'
        },
        {
          question: 'Is a PG diploma in fashion the same as a master\'s degree?',
          answer: 'No. Standalone postgraduate diplomas from private institutes are not degrees. Check the exact qualification name and who awards it before you pay.'
        }
      ]
    },
    'animation-ug': {
      h1: 'Animation Course After 12th: B.Sc Animation, Eligibility & Fees',
      title: 'Animation Course After 12th: Eligibility, Duration, Fees',
      description:
        'Animation after 12th: B.Sc Animation and VFX, NID and IIT design routes, diplomas, university eligibility rules, subjects and official fees.',
      keywords: ['animation course after 12th', 'B.Sc animation', 'B.Sc animation and VFX', 'animation course eligibility', 'animation course fees', 'animation course duration'],
      intro:
        'After 12th you can study animation through a three- or four-year B.Sc in Animation and VFX, a design degree with an animation track, or a diploma. Compare entry rules, what you will learn and official fees before you apply.',
      crossLink: {
        href: '/animation-ug-colleges',
        anchor: 'Compare animation colleges',
        note: 'Ready to shortlist? Browse animation programmes and check whether each one is a degree or a diploma.'
      },
      faqs: [
        {
          question: 'Which animation course can I do after 12th?',
          answer: 'A B.Sc in Animation and VFX or a similar bachelor\'s degree, a design degree with an animation track such as NID\'s Animation Film Design or IIT Hyderabad\'s design programme through UCEED, or a diploma or short course.'
        },
        {
          question: 'Can I do a B.Sc in Animation after 12th in any stream?',
          answer: 'At some universities, yes. DY Patil and NorthCap University accept any stream, while LPU asks for 60% with Physics, Maths and English. Check each university\'s rules.'
        },
        {
          question: 'How long is a B.Sc in Animation?',
          answer: 'Three years, or four years with honours. Under the UGC framework you can exit with a certificate after one year or a diploma after two years.'
        },
        {
          question: 'Is there an entrance exam for animation courses?',
          answer: 'There is no single national test. Universities use 12th marks, their own tests, national tests, or a portfolio and interview. NID uses its Design Aptitude Test and IITs use UCEED.'
        },
        {
          question: 'What are the fees for a B.Sc in Animation?',
          answer: 'They vary widely. DY Patil lists ₹5,50,000 a year for 2026-27 and NorthCap University lists a total annual fee of ₹1,59,000. Add the cost of a computer and software.'
        },
        {
          question: 'What will I study in an animation degree?',
          answer: 'Drawing, character design and storyboarding; 2D and 3D animation, modelling, rigging and lighting; VFX, compositing and motion graphics; and a showreel and internship.'
        },
        {
          question: 'Is an animation diploma the same as a degree?',
          answer: 'No. A diploma is not a bachelor\'s degree, and you will normally need a degree for a master\'s in India. Check the qualification name and awarding body.'
        },
        {
          question: 'What jobs can I get after an animation course?',
          answer: 'Animator, storyboard or character artist, modeller, rigger, VFX or compositing artist, game artist and motion graphics designer. Your portfolio and showreel matter most.'
        }
      ]
    },
    'mass-communication': {
      h1: 'Mass Communication After 12th: BJMC Eligibility, Fees & Admission',
      title: 'Mass Communication After 12th: BJMC Eligibility & Fees',
      description:
        'Mass communication after 12th: BA (JMC)/BJMC eligibility, admission via university tests or CUET, 3 vs 4 years, annual fee range and IIMC routes.',
      keywords: ['mass communication course after 12th', 'BJMC course', 'BA journalism and mass communication', 'BJMC eligibility', 'BJMC fees', 'mass communication course duration', 'GGSIPU BJMC admission'],
      intro:
        'After 12th you can study mass communication through a three- or four-year BA (JMC) or BJMC degree. Compare eligibility, admission routes, annual fees and postgraduate options such as IIMC before you apply.',
      crossLink: {
        href: '/mass-communication-colleges',
        anchor: 'Compare mass communication colleges',
        note: 'Ready to shortlist? Browse mass communication programmes and check whether each one is a degree or a diploma.'
      },
      faqs: [
        {
          question: 'Can I do mass communication after 12th in any stream?',
          answer: 'Yes, at most universities. A common rule is 12th pass with at least 50% marks and English as a subject, but each university sets its own eligibility.'
        },
        {
          question: 'How long is a mass communication degree?',
          answer: 'Three years for a bachelor\'s degree, or four years for an honours degree under the UGC framework. Some universities, such as GGSIPU, list the programme as four years.'
        },
        {
          question: 'Is there an entrance exam for BJMC?',
          answer: 'It depends on the university. GGSIPU admits through its own CET first and then CUET for vacant seats. Others use 12th marks, CUET-UG or their own test and interview.'
        },
        {
          question: 'What is the GGSIPU CET pattern for BA (JMC)?',
          answer: 'Four sections of 25% each: English language and comprehension, general awareness, reasoning, and media aptitude (GGSIPU brochure 2026-27).'
        },
        {
          question: 'What are the fees for a mass communication degree?',
          answer: 'In our database of 66 bachelor\'s programmes at 62 institutes (mostly private, updated January 2025), the median annual fee is ₹80,000 and the middle half ranges from ₹59,467 to ₹1,26,667.'
        },
        {
          question: 'What is the BA (JMC) fee at GGSIPU?',
          answer: 'At the university\'s own schools, the 2026-27 first-year fee is ₹1,56,500, rising each year to ₹1,94,551 in the fourth year. Affiliated colleges follow Delhi fee committee rates.'
        },
        {
          question: 'Is a diploma in mass communication the same as a degree?',
          answer: 'No. A diploma or certificate is not a bachelor\'s degree. Check the qualification name and who awards it before you pay.'
        },
        {
          question: 'Can I join IIMC after 12th?',
          answer: 'No. IIMC\'s master\'s programmes and postgraduate diplomas need a bachelor\'s degree. For 2026-27, admission was through CUET-PG in Mass Communication and Journalism.'
        }
      ]
    },
    'b-ed': {
      h1: 'B.Ed Course in India: Eligibility, Admission, ITEP Changes & Fees',
      title: 'B.Ed Course: Eligibility, Duration, Fees & 2026 Rules',
      description:
        'B.Ed guide: NCTE eligibility (50% in graduation), 2-year course, ITEP and one-year B.Ed status, internship, TET rules and fees (median ₹50,000/yr).',
      keywords: ['B.Ed course', 'B.Ed eligibility', 'B.Ed course duration', 'B.Ed fees', 'one year B.Ed', 'ITEP vs B.Ed', 'B.Ed subjects'],
      intro:
        'B.Ed is a two-year NCTE-regulated degree for graduates who want to teach classes VI to XII. Check eligibility, the ITEP and one-year B.Ed changes, TET rules and fees before you shortlist colleges.',
      crossLink: {
        href: '/bed-colleges',
        anchor: 'Compare B.Ed colleges by fees & placements',
        note: 'Ready to shortlist? Browse B.Ed colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.Ed?',
          answer: 'NCTE requires at least 50% marks in a bachelor\'s or master\'s degree in sciences, social sciences or humanities, or 55% in B.E./B.Tech with Science and Mathematics. Reserved categories get relaxation as per government rules, and universities may add subject conditions.'
        },
        {
          question: 'Is B.Ed now a one-year course?',
          answer: 'Not yet. NCTE\'s draft regulations of February 2025 propose a one-year B.Ed for four-year degree or postgraduate holders, but on 12 October 2026 they had not been notified. The regular B.Ed is still two years.'
        },
        {
          question: 'What is ITEP and how is it different from B.Ed?',
          answer: 'ITEP is a four-year Integrated Teacher Education Programme taken after Class 12 that combines a B.A., B.Sc. or B.Com. with a B.Ed. Admission is through NCET, conducted by NTA. The regular B.Ed is a two-year course after graduation.'
        },
        {
          question: 'Is there an entrance exam for B.Ed?',
          answer: 'There is no single national test. States and universities decide, for example UP B.Ed JEE in Uttar Pradesh and GGSIPU CET in Delhi. CUET PG has B.Ed papers for participating universities, and some colleges admit on degree marks.'
        },
        {
          question: 'Can a B.Ed holder teach classes I to V?',
          answer: 'No. The Supreme Court quashed NCTE\'s 2018 notification on 11 August 2023. For classes I to V, NCTE\'s routes are a two-year D.El.Ed or a four-year B.El.Ed, plus a TET pass.'
        },
        {
          question: 'Is CTET compulsory after B.Ed?',
          answer: 'For classes VI to VIII, NCTE\'s minimum qualifications require a TET pass. CTET applies to Central Government schools such as KVS and NVS, and state schools use the state TET. A score of 60% is a pass and the CTET certificate is valid for life.'
        },
        {
          question: 'What is the fee for B.Ed in India?',
          answer: 'Across 130 B.Ed fee records in our database, the median is ₹50,000 a year and half of programmes charge ₹30,000–₹60,000. The public-institute median is ₹25,308 and the private median ₹50,000. Fee year is not stored.'
        },
        {
          question: 'Can I do B.Ed through distance education?',
          answer: 'Only if you are already a trained in-service elementary teacher or have completed an NCTE-recognised face-to-face teacher education programme. Fresh graduates need a regular B.Ed.'
        }
      ]
    },
    'm-ed': {
      h1: 'M.Ed Course in India: Eligibility, Admission, Structure & Fees',
      title: 'M.Ed Course: Eligibility, Duration, Fees & Careers',
      description:
        'M.Ed guide: NCTE eligibility (B.Ed or B.El.Ed with 50%), 2-year structure, CUET PG paper, M.Ed vs MA Education, careers and fees (median ₹54,000/yr).',
      keywords: ['M.Ed course', 'M.Ed eligibility', 'M.Ed course duration', 'M.Ed fees', 'M.Ed vs MA Education', 'M.Ed entrance exam', 'one year M.Ed'],
      intro:
        'M.Ed is a two-year NCTE-regulated master\'s degree for B.Ed and B.El.Ed graduates who want to become teacher educators, researchers or school leaders. Check eligibility, admission, structure and fees before you shortlist colleges.',
      crossLink: {
        href: '/med-colleges',
        anchor: 'Compare M.Ed colleges by fees & placements',
        note: 'Ready to shortlist? Browse M.Ed colleges with recorded fees, accepted exams and placement outcomes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Ed?',
          answer: 'NCTE requires at least 50% marks in a B.Ed, B.A.B.Ed, B.Sc.B.Ed or B.El.Ed, or in a D.El.Ed together with a bachelor\'s degree (50% in each). Reserved categories get relaxation as per government rules, and universities may add their own conditions.'
        },
        {
          question: 'How long is the M.Ed course?',
          answer: 'Two academic years, which must be completed within three years of admission. It includes core courses, a specialisation, a research dissertation and at least four weeks of field attachment.'
        },
        {
          question: 'Is there an entrance exam for M.Ed?',
          answer: 'NCTE allows admission on qualifying-exam marks and/or an entrance test. CUET PG 2026 has an M.Ed paper (COQP15) for participating universities, and many universities run their own test or interview.'
        },
        {
          question: 'Is M.Ed now a one-year course?',
          answer: 'Not yet. NCTE\'s draft regulations of February 2025 propose a one-year M.Ed and a two-year part-time M.Ed, but on 12 October 2026 they had not been notified. The regular M.Ed is still two years.'
        },
        {
          question: 'What is the difference between M.Ed and MA Education?',
          answer: 'M.Ed is a professional teacher-education degree regulated by NCTE that needs a B.Ed or similar. MA Education is an academic master\'s degree run under university rules. NCTE accepts both, with 55%, for some faculty posts in teacher-education colleges.'
        },
        {
          question: 'What can I do after M.Ed?',
          answer: 'M.Ed with 55% is one of NCTE\'s faculty qualifications for B.Ed and M.Ed colleges. Graduates also work in curriculum and teacher-training bodies, school leadership and research, and many go on to a PhD in Education.'
        },
        {
          question: 'What is the fee for M.Ed in India?',
          answer: 'Across 39 M.Ed fee records in our database, the median is ₹54,000 a year and half of programmes charge ₹35,000–₹73,980. The private median is ₹55,000 (30 records); there are too few public records for a public median.'
        }
      ]
    },
    deled: {
      h1: 'D.El.Ed Course: Eligibility, Admission, Syllabus & Teaching Rules',
      title: 'D.El.Ed Course: Eligibility, Duration, Syllabus & TET',
      description:
        'D.El.Ed guide: NCTE eligibility (50% in Class 12), 2-year course, 20-week internship, BTC/JBT/D.Ed names, TET and CTET rules, and D.El.Ed vs B.Ed.',
      keywords: ['D.El.Ed course', 'D.El.Ed full form', 'D.El.Ed eligibility', 'D.El.Ed course duration', 'D.El.Ed syllabus', 'D.El.Ed vs B.Ed', 'BTC course'],
      intro:
        'D.El.Ed is a two-year NCTE-regulated diploma after Class 12 that trains teachers for classes I to VIII. Check eligibility, state admission routes, the internship, and the TET and CTET rules before you apply.',
      crossLink: {
        href: '/courses/b-ed',
        anchor: 'Compare with the B.Ed course',
        note: 'Want to teach classes VI to XII instead? Read our B.Ed guide for eligibility, ITEP changes and fees.'
      },
      faqs: [
        {
          question: 'What is the full form of D.El.Ed?',
          answer: 'Diploma in Elementary Education. It is a two-year teacher-training programme for classes I to VIII, regulated by the National Council for Teacher Education (NCTE).'
        },
        {
          question: 'What is the eligibility for D.El.Ed?',
          answer: 'NCTE requires at least 50% marks in Class 12 (higher secondary) or an equivalent exam, with relaxation for reserved categories as per government rules. States may add age, domicile or other conditions.'
        },
        {
          question: 'Are BTC, JBT and D.Ed the same as D.El.Ed?',
          answer: 'Yes, for the two-year elementary teacher-training course. NCTE\'s norms say the programme called BTC, JBT or D.Ed in different states is to be named D.El.Ed everywhere. The RCI\'s D.Ed in special education for teaching children with disabilities is a different course.'
        },
        {
          question: 'How do I get admission to D.El.Ed?',
          answer: 'Each state decides. NCTE allows admission on Class 12 merit, an entrance test or another selection process. For example, Uttar Pradesh uses a state merit list and counselling, and Bihar holds a joint entrance exam.'
        },
        {
          question: 'Can I teach after D.El.Ed without TET?',
          answer: 'No. NCTE\'s minimum qualifications require a pass in a Teacher Eligibility Test. Class 12 with 50% plus D.El.Ed and TET Paper I covers classes I to V; graduation plus D.El.Ed and TET Paper II covers classes VI to VIII.'
        },
        {
          question: 'Which is better for primary teaching, D.El.Ed or B.Ed?',
          answer: 'For classes I to V, a B.Ed no longer qualifies: the Supreme Court quashed NCTE\'s 2018 notice on 11 August 2023. NCTE\'s main routes for primary teaching are the two-year D.El.Ed and the four-year B.El.Ed.'
        },
        {
          question: 'Can I do D.El.Ed through distance learning?',
          answer: 'Only if you are already a working teacher. NCTE\'s distance D.El.Ed needs 50% in Class 12, two years of teaching in a government or recognised elementary school, and current employment as a teacher.'
        },
        {
          question: 'What is the fee for D.El.Ed?',
          answer: 'Fees are set by the affiliating body or state government, and NCTE bars donations and capitation fees. Our database does not have enough D.El.Ed fee records for reliable figures, so check your state\'s admission notice.'
        }
      ]
    },
    ded: {
      h1: 'D.Ed vs D.El.Ed: What the D.Ed Course Means Today',
      title: 'D.Ed Course: Meaning, D.Ed vs D.El.Ed & Spl.Ed. Rules',
      description:
        'What D.Ed means today: NCTE\'s old name for D.El.Ed, or RCI\'s D.Ed in special education. Eligibility, regulators, TET rules and how to check a course.',
      keywords: ['D.Ed course', 'D.Ed full form', 'D.Ed vs D.El.Ed', 'D.Ed special education', 'D.Ed eligibility', 'D.Ed course duration'],
      intro:
        'D.Ed can mean NCTE\'s elementary teacher diploma, now called D.El.Ed, or RCI\'s two-year D.Ed in special education. Learn which is which, who regulates each, and what each lets you teach before you apply.',
      crossLink: {
        href: '/courses/deled',
        anchor: 'Read the full D.El.Ed course guide',
        note: 'Looking at an elementary D.Ed? It is the D.El.Ed under NCTE rules. See eligibility, admission, syllabus and TET details.'
      },
      faqs: [
        {
          question: 'What is the full form of D.Ed?',
          answer: 'Diploma in Education. In most states it was the name of the two-year elementary teacher-training course that NCTE now calls the Diploma in Elementary Education (D.El.Ed).'
        },
        {
          question: 'Is D.Ed the same as D.El.Ed?',
          answer: 'For elementary teacher training, yes. NCTE\'s 2014 norms say the programme called BTC, JBT or D.Ed is to be named D.El.Ed in all states, and NCTE\'s minimum qualifications accept the two-year diploma by whatever name known. The RCI\'s D.Ed in special education is a different course.'
        },
        {
          question: 'What is D.Ed in special education?',
          answer: 'A two-year Rehabilitation Council of India (RCI) diploma that trains teachers of children with disabilities. RCI currently lists it in hearing impairment, visual impairment, intellectual and developmental disabilities, and multiple disabilities.'
        },
        {
          question: 'What is the eligibility for D.Ed?',
          answer: 'For the NCTE elementary diploma (D.El.Ed), 50% in Class 12 with relaxation as per government rules. For the RCI D.Ed in special education, RCI\'s 2023 curricula ask for Class 12 with 50% in any stream.'
        },
        {
          question: 'Can I teach in a primary school after D.Ed?',
          answer: 'Yes, if you also pass a TET. NCTE accepts Class 12 with 50% plus a two-year elementary diploma for classes I to V. A D.Ed in special education is also accepted for classes I to V, but the teacher must complete an NCTE-recognised six-month elementary programme after appointment.'
        },
        {
          question: 'Do I need RCI registration after D.Ed special education?',
          answer: 'Yes. RCI says every rehabilitation professional or personnel must hold its registration certificate to work in disability rehabilitation, and must renew it periodically.'
        },
        {
          question: 'How do I know which D.Ed a college offers?',
          answer: 'Check the regulator: an elementary D.Ed should be on NCTE\'s recognised-institutions list, and a D.Ed in special education should be RCI-approved. Also check the class range or disability area, the two-year duration and the certificate wording.'
        }
      ]
    },
    masscomm: {
      h1: '4-Year Bachelor of Mass Communication: Syllabus & Specialisations',
      title: '4-Year Mass Communication Degree: Syllabus & Honours',
      description:
        '4-year mass communication degree: 160-credit UGC structure, year-wise syllabus, specialisations, honours with research, BJMC vs BMM and admissions.',
      keywords: ['4 year mass communication course', 'BJMC honours syllabus', 'mass communication specialisations', 'BA honours journalism', 'BJMC vs BMM', 'honours with research mass communication', 'mass communication subjects year wise'],
      intro:
        'A four-year bachelor\'s in mass communication is the 160-credit honours version of BJMC or B.A. (Hons.) Journalism. See what you study each year, the specialisation tracks and when the research route makes sense.',
      crossLink: {
        href: '/mass-communication-colleges',
        anchor: 'Compare mass communication colleges',
        note: 'Shortlisting? Browse mass communication programmes and check whether each one offers the fourth honours year and the research route.'
      },
      faqs: [
        {
          question: 'How many credits does a four-year mass communication degree need?',
          answer: 'Under the UGC Curriculum and Credit Framework (December 2022), a four-year honours degree needs at least 160 credits, including 80 in the major. The three-year degree needs 120. Universities can set more, for example 176 at Delhi University.'
        },
        {
          question: 'What is the difference between honours and honours with research?',
          answer: 'Both need 160 credits. Honours with research is for students with at least 75% marks in the first six semesters (UGC rule) and includes a 12-credit dissertation. Other honours students take three advanced courses worth 12 credits instead.'
        },
        {
          question: 'What CGPA do I need for the research route?',
          answer: 'The UGC rule is 75% marks in semesters 1 to 6. Some universities set it as a CGPA: SCMC Pune and the University of Mumbai\'s BAMMC ask for 7.5 or above.'
        },
        {
          question: 'Can I leave a four-year mass communication course after three years?',
          answer: 'Yes, under the UGC framework you can leave after three years with a 120-credit bachelor\'s degree. You can also exit with a UG certificate after year 1 or a UG diploma after year 2, if you complete a 4-credit summer vocational course or internship.'
        },
        {
          question: 'What subjects are taught in each year?',
          answer: 'At Delhi University\'s B.A. (Hons.) Journalism, year 1 covers journalism, media history, reporting and editing, advertising and PR, and broadcast media. Year 2 adds new media, photography and multimedia journalism, year 3 ethics, law and media industries, and year 4 a dissertation or project.'
        },
        {
          question: 'Is BJMC the same as BMM or B.A. (Hons.) Journalism?',
          answer: 'They overlap, so compare syllabi. BJMC degrees are usually broad. DU\'s B.A. (Hons.) Journalism is journalism-led. Mumbai\'s BAMMC (formerly BMM) adds an advertising or journalism minor from the second year.'
        },
        {
          question: 'Which specialisations can I choose in mass communication?',
          answer: 'The main tracks are journalism, advertising and PR, film and television, digital media, and media business. Some universities offer them as electives or minors. MCU Bhopal runs separate degrees, such as BA (Advertising and PR) and B.Sc. (Film and Communication Studies).'
        },
        {
          question: 'Does a four-year honours degree shorten the master\'s?',
          answer: 'It can. The UGC postgraduate framework allows a one-year master\'s after a four-year honours degree. MCU Bhopal, for example, runs a one-year MA (Mass Communication) for 160-credit honours graduates.'
        }
      ]
    },
    bhm: {
      h1: 'BHM Course: Eligibility, NCHM JEE, Duration, Subjects & Fees',
      title: 'BHM Course: Eligibility, NCHM JEE, Subjects & Fees',
      description:
        'BHM guide: 3-year IHM B.Sc. HHA vs 4-year BHMCT, NCHM JEE 2026 pattern, eligibility, subjects, official IHM fee (₹3.38 lakh) and careers.',
      keywords: ['BHM course', 'BHM course details', 'BHM eligibility', 'B.Sc Hospitality and Hotel Administration', 'BHM course duration', 'hotel management course after 12th', 'BHM fees'],
      intro:
        'BHM is a hotel management degree you can join after Class 12 in any stream. Check whether your programme is the 3-year IHM B.Sc. HHA or a 4-year BHMCT, and the NCHM JEE rules, before you shortlist colleges.',
      crossLink: {
        href: '/bhm-colleges',
        anchor: 'Compare BHM colleges by fees & exams',
        note: 'Ready to shortlist? Browse BHM colleges with recorded fees and accepted exams, and confirm each programme\'s duration and approval.'
      },
      faqs: [
        {
          question: 'What is the eligibility for BHM?',
          answer: 'For the B.Sc. HHA at IHMs, NCHMCT needs a 10+2 pass in any stream with English as a subject, with no minimum percentage stated. AICTE-approved 4-year HMCT degrees need 10+2 with 45% (40% for reserved categories). Universities set their own rules.'
        },
        {
          question: 'Is there an age limit for NCHM JEE?',
          answer: 'No. The NCHM JEE 2026 Information Bulletin states there is no age restriction. You must meet the 10+2 and English requirement and submit a medical fitness certificate at admission.'
        },
        {
          question: 'Is BHM a 3-year or 4-year course?',
          answer: 'Both exist. NCHMCT\'s B.Sc. HHA at IHMs is 3 years, with a possible Honours fourth year under NEP 2020. AICTE\'s Bachelor of HMCT is 4 years. In our database, 121 hotel-management bachelor\'s records are 3-year and 102 are 4-year.'
        },
        {
          question: 'What is the NCHM JEE exam pattern?',
          answer: 'In 2026 it was a 2-hour computer-based test with 120 questions: English 45, Aptitude for Service Sector 30, and 15 each in Numerical Ability, Reasoning and General Knowledge. Each correct answer gets 4 marks and each wrong answer loses 1.'
        },
        {
          question: 'What is the fee for B.Sc. HHA at a government IHM?',
          answer: 'NCHMCT\'s standard fee for the 2026-29 batch is ₹3,37,915 for six semesters, before hostel. IHMs in large cities may raise tuition by up to 40% or 24%, and private affiliated IHMs may charge up to double the standard tuition.'
        },
        {
          question: 'Can I take admission to BHM through UGAT?',
          answer: 'Yes, at institutes that take part in AIMA UGAT. BHM candidates answer 180 questions in 3 hours, including Service Aptitude and Scientific Aptitude sections. AIMA advises checking that your chosen institute accepts the score.'
        },
        {
          question: 'Can I study BHM after NIOS 10+2?',
          answer: 'For NCHM JEE, yes. The 2026 bulletin accepts NIOS and state open-school 10+2 with at least five subjects including English. Other colleges set their own rules, so check the prospectus.'
        },
        {
          question: 'What can I do after BHM?',
          answer: 'Work in hotels, flight kitchens, catering, cruise lines, railways or Indian Navy hospitality services, or study further: NCHMCT\'s M.Sc. in Hospitality Administration, a Master of HMCT (AICTE needs a 4-year degree) or an MBA.'
        }
      ]
    },
    'hotel-management-pg': {
      h1: 'Hotel Management PG Courses: M.Sc, M.HMCT, MHM, MBA & Diplomas',
      title: 'Hotel Management PG Courses: M.Sc, MHM, MBA & Fees',
      description:
        'PG in hotel management: NCHMCT M.Sc. HA (any graduate, 8 IHMs), M.HMCT 4-year rule, MBA and PG diplomas, 2026 admission and fees.',
      keywords: ['hotel management PG courses', 'M.Sc Hospitality Administration', 'MHM course', 'Master of Hotel Management', 'hotel management after graduation', 'M.Sc JEE NCHMCT', 'PG diploma in hotel management'],
      intro:
        'Hotel management PG courses take 1 to 2 years after graduation. Compare NCHMCT\'s M.Sc. in Hospitality Administration, the Master of HMCT, an MBA and PG diplomas by eligibility, admission and fees before you apply.',
      crossLink: {
        href: '/hotel-management-pg-colleges',
        anchor: 'Compare hotel management PG colleges',
        note: 'Ready to shortlist? Browse PG hotel management colleges with recorded fees, and check whether each programme accepts your bachelor\'s degree.'
      },
      faqs: [
        {
          question: 'Can I do a PG in hotel management without a hotel management degree?',
          answer: 'Yes, for some routes. NCHMCT\'s M.Sc. in Hospitality Administration accepts graduates of any discipline, its PG Diploma in Accommodation Operations & Management needs any degree with 50%, and an MBA accepts any 3-year degree.'
        },
        {
          question: 'What is the eligibility for the NCHMCT M.Sc. in Hospitality Administration?',
          answer: 'Graduation in any discipline, including hospitality, from a recognised university. NCHMCT\'s notice does not state a minimum percentage. The 2026 notice also mentions direct admission for candidates with work experience who meet the brochure\'s criteria.'
        },
        {
          question: 'Which institutes offer the M.Sc. in Hospitality Administration?',
          answer: 'Eight IHMs for the 2026-28 batch: NCHM-IH Noida (50 seats), IHM Pusa Delhi (47), and IHM Chennai, Kolkata, Bhopal, Guwahati, Jaipur and Mumbai (30 each). JNU awards the degree.'
        },
        {
          question: 'How do I get admission to the M.Sc. Hospitality Administration?',
          answer: 'Through NCHMCT\'s M.Sc. JEE and online counselling. In 2026 the online test was on 23 May and results came on 8 June. Counselling costs ₹2,000, and an allotted seat needs a ₹20,000 seat acceptance fee.'
        },
        {
          question: 'Can a 3-year B.Sc. HHA graduate do a Master of HMCT?',
          answer: 'AICTE\'s rule for the Master of HMCT asks for a hotel-management bachelor\'s degree of at least four years with 50% marks (45% reserved). Some university MHM programmes have their own rules, so check with the university.'
        },
        {
          question: 'What is the fee for the NCHMCT M.Sc. in Hospitality Administration?',
          answer: 'The standard fee for the 2026-28 batch is ₹2,17,915 for four semesters, before hostel. IHMs in large cities may raise the tuition part by up to 40% or 24%, and caution money and other charges are extra.'
        },
        {
          question: 'Is a Master of Hospital Management the same as hotel management?',
          answer: 'No. Hospital management trains you to run hospitals and health services. Hotel management PG courses cover hospitality businesses such as hotels, restaurants and catering.'
        },
        {
          question: 'Should I choose an M.Sc. in hospitality or an MBA?',
          answer: 'Choose the M.Sc. HA or M.HMCT if you want to stay in hospitality, training or teaching; the NCHMCT M.Sc. has a research-focused second year. An MBA covers many industries and uses tests such as CAT, MAT and CMAT.'
        }
      ]
    },
    'design-pg': {
      h1: 'M.Des Course in India: Eligibility, CEED, NID DAT, Fees & Careers',
      title: 'M.Des Course: Eligibility, CEED, NID DAT & Fees',
      description:
        'M.Des guide: CEED, NID DAT and NIFT routes, who can apply, specialisations, CEED 2027 pattern, fees (median ₹1.68 lakh a year) and careers.',
      keywords: ['M.Des course', 'M.Des eligibility', 'M.Des admission', 'CEED exam', 'NID M.Des', 'M.Des specialisations', 'M.Des fees'],
      intro:
        'M.Des (Master of Design) is a postgraduate design degree after a bachelor’s degree. Compare the CEED, NID DAT and NIFT routes, eligibility, specialisations and fees before you shortlist.',
      crossLink: {
        href: '/mdes-colleges',
        anchor: 'Compare M.Des colleges by fees & exams',
        note: 'Ready to shortlist? Browse M.Des colleges with recorded fees and admission routes, and check each institute’s eligibility for your degree.'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Des?',
          answer: 'It depends on the route. CEED needs a three-year degree or the GD Art diploma. NID and NIFT accept a bachelor’s degree in any discipline. Each IIT sets its own degree and marks rules; IIT Bombay asks for 55% (50% for SC/ST/PwD) and mostly four-year degrees.'
        },
        {
          question: 'Can I do an M.Des after a three-year B.A., B.Sc or B.Com?',
          answer: 'Yes at NID and NIFT, which accept any bachelor’s degree, and you can sit CEED. But most IIT Bombay streams need a four-year degree or diploma, so check each IIT’s rules before relying on CEED.'
        },
        {
          question: 'Is there an age limit for M.Des?',
          answer: 'CEED and NIFT have no age limit. NID does: for 2027-28, General and EWS candidates must be born on or after 1 July 1995, OBC-NCL, SC and ST candidates on or after 1 July 1992, and PwD candidates on or after 1 July 1990.'
        },
        {
          question: 'Does a CEED score guarantee M.Des admission?',
          answer: 'No. After CEED you apply to each institute, which may hold its own test and interview. The CEED 2027 score is valid for one year from the result on 3 March 2027.'
        },
        {
          question: 'What is the CEED exam pattern?',
          answer: 'CEED 2027 has Part A (150 marks, one hour, on computer) and Part B (100 marks, two hours, drawn and written). Part B is marked only for those above the Part A cut-off, and the final score is 0.25 × Part A + 0.75 × Part B.'
        },
        {
          question: 'How long is an M.Des?',
          answer: 'Two years at the IITs, IISc and NIFT. NID’s M.Des at Ahmedabad, Gandhinagar and Bengaluru runs for two and a half years.'
        },
        {
          question: 'What is the fee for an M.Des?',
          answer: 'Across 108 design master’s fee records in our database, the median is ₹1,68,000 a year and half charge ₹1,00,000–₹2,85,200. NIFT’s official 2026-27 first-year total for master’s programmes is ₹3,41,700 (non-NRI).'
        },
        {
          question: 'Which M.Des specialisations can I choose?',
          answer: 'Options include industrial or product design, communication design, interaction design, animation, mobility and vehicle design, textile and apparel, and strategic design. NID lists 22 disciplines for 2027-28; each IIT offers its own set.'
        }
      ]
    },
    'animation-pg': {
      h1: 'Animation PG Courses in India: M.Des, M.Sc Animation & Eligibility',
      title: 'Animation PG Courses: M.Des, M.Sc & Eligibility',
      description:
        'Animation after graduation: M.Des at IIT Bombay, IIT Hyderabad and NID, M.Sc and M.Voc options, eligibility by degree, selection, seats and fees.',
      keywords: ['animation PG course', 'M.Des animation', 'M.Sc animation', 'animation course after graduation', 'NID animation film design', 'IIT Bombay M.Des animation', 'masters in animation in India'],
      intro:
        'Postgraduate animation study in India runs through an M.Des at IIT Bombay, IIT Hyderabad or NID, or a university M.Sc or M.Voc. Check which routes your first degree opens before you apply.',
      crossLink: {
        href: '/mdes-colleges',
        anchor: 'Compare M.Des colleges, including animation',
        note: 'Ready to shortlist design schools? Browse M.Des colleges with recorded fees and admission routes; filter for animation specialisations and confirm eligibility for your degree.'
      },
      faqs: [
        {
          question: 'Which PG courses can I do in animation after graduation?',
          answer: 'An M.Des with an animation specialisation (IIT Bombay Animation Design, IIT Hyderabad Photography, Film and Animation, NID Animation Film Design), a two-year M.Sc or M.Voc in animation at a university, or a postgraduate diploma, which is not a degree.'
        },
        {
          question: 'Can I do an M.Des in animation after a three-year B.Sc Animation?',
          answer: 'At NID, yes: it accepts a bachelor’s degree in any discipline, subject to its age limit. IIT Bombay’s Animation Design lists four-year degrees, a four-year BFA, a four-year design diploma or GD Art, so a three-year B.Sc alone is not listed.'
        },
        {
          question: 'What is the eligibility for M.Des Animation at IIT Bombay?',
          answer: 'A valid CEED score and at least 55% (50% for SC/ST/PwD) in a four-year degree in design, engineering, architecture or interior design, a four-year professional design diploma, a four-year BFA, or GD Art with one year of design experience (2026 brochure).'
        },
        {
          question: 'Is there an age limit for animation M.Des?',
          answer: 'CEED has no age limit. NID does: for 2027-28, General and EWS candidates must be born on or after 1 July 1995, OBC-NCL, SC and ST on or after 1 July 1992, and PwD on or after 1 July 1990.'
        },
        {
          question: 'How many seats are there in animation M.Des programmes?',
          answer: 'IIT Bombay listed 12 Animation Design seats for 2026-27. NID lists 19 seats in Animation Film Design for 2027-28, plus 19 in Digital Game Design and 12 in Toy and Game Design. IIT Hyderabad does not list seats per specialisation.'
        },
        {
          question: 'Is a master diploma in animation a master’s degree?',
          answer: 'No. A postgraduate or “master” diploma from a private academy is not a degree. Under the UGC framework, a postgraduate diploma is also what you receive if you leave a two-year university master’s after one year.'
        },
        {
          question: 'What does an animation master’s cost?',
          answer: 'Our records are too thin for a range. IIT Bombay’s 2026-27 semester fee for new master’s students is ₹26,150 with an assistantship, ₹68,150 if self-financed and ₹8,150 for SC/ST/PwD, plus admission fee and deposit; hostel is extra.'
        }
      ]
    },
    'hotel-management-diploma': {
      h1: 'Hotel Management Diploma: IHM Courses, Eligibility, Fees & Admission',
      title: 'Hotel Management Diploma: IHM Courses, Fees & Eligibility',
      description:
        'Hotel management diplomas after 10th or 12th: NCHMCT IHM trade diplomas, AICTE HMCT diploma, eligibility, admission and 2026-27 fees (₹58,200–78,700).',
      keywords: ['hotel management diploma', 'diploma in hotel management after 12th', 'hotel management course after 10th', 'IHM diploma courses', 'NCHMCT diploma courses', 'diploma in food production', 'hotel management diploma fees'],
      intro:
        'Hotel management diplomas train you for one hotel department in about 18 months. Compare NCHMCT IHM diplomas, craft courses after Class 10 and AICTE HMCT diplomas before you apply.',
      crossLink: {
        href: '/hotel-management-diploma-colleges',
        anchor: 'Compare hotel management diploma colleges',
        note: 'Ready to shortlist? Browse colleges offering hotel management diplomas, then check each institute’s NCHMCT affiliation or AICTE approval and its current fee notice.'
      },
      faqs: [
        {
          question: 'What is the eligibility for a hotel management diploma?',
          answer: 'NCHMCT’s five trade diplomas need a Class 12 (10+2) pass; Front Office Operations also lists English as a subject. Its craft courses in food production and in food and beverage service need only Class 10. Marks and age rules vary by IHM, so read the institute’s notice.'
        },
        {
          question: 'Can I do hotel management after 10th?',
          answer: 'Yes. NCHMCT runs a 1½-year Craftsmanship Certificate Course in Food Production and a 24-week course in Food & Beverage Service after Class 10. AICTE also allows a 5-year Diploma in Hotel Management and Catering Technology after Class 10.'
        },
        {
          question: 'How long is a hotel management diploma at an IHM?',
          answer: 'NCHMCT trade diplomas take 1½ years: about one teaching year followed by 24 weeks of industrial training in a hotel. Some craft courses last 24 weeks. AICTE HMCT diplomas take 3 years after 10+2.'
        },
        {
          question: 'Is NCHMCT JEE required for IHM diploma courses?',
          answer: 'No. NCHMCT JEE is for the 3-year B.Sc in Hospitality and Hotel Administration. For diplomas, each IHM advertises its own admissions, usually around June, and selects candidates itself.'
        },
        {
          question: 'What is the fee for a hotel management diploma at an IHM?',
          answer: 'NCHMCT’s fee table for 2026-27 entry totals ₹78,700 for Food Production and Bakery & Confectionery and ₹58,200 for F&B Service, Front Office and Housekeeping, in two instalments. Hostel is extra and IHMs may set fees within NCHMCT’s ceiling.'
        },
        {
          question: 'Which is better, a hotel management diploma or BHM?',
          answer: 'A diploma is shorter and trains you for one department, such as kitchen or service, for operational jobs. BHM or B.Sc HHA takes 3–4 years and covers all departments plus management, which suits supervisory and management goals.'
        },
        {
          question: 'Which diplomas does NCHMCT offer?',
          answer: 'NCHMCT lists five 1½-year diplomas: Food Production, Food & Beverage Service, Front Office Operations, Housekeeping Operations, and Bakery & Confectionery. It also lists craftsmanship certificates in food production, F&B service and professional bartending.'
        }
      ]
    },
    'polytechnic-diploma': {
      h1: 'Polytechnic Diploma After 12th or ITI: 2-Year Lateral Entry Guide',
      title: 'Polytechnic Diploma After 12th or ITI: Lateral Entry Guide',
      description:
        'Join a polytechnic diploma in year 2 after 12th or ITI: AICTE eligibility, subjects by branch, Haryana 2026-27 dates, private fees, B.Tech next.',
      keywords: ['polytechnic diploma after 12th', 'lateral entry diploma', 'polytechnic lateral entry eligibility', 'diploma after ITI', '2 year polytechnic diploma', 'lateral entry diploma fees'],
      intro:
        'With Class 12 or a 2-year ITI you can join a polytechnic diploma in the second year and finish in 2 years. Check your subjects against the branch, your state\'s admission process and fees first.',
      crossLink: {
        href: '/polytechnic-colleges',
        anchor: 'Compare polytechnic colleges',
        note: 'Shortlisting? Browse polytechnic colleges and check which ones offer lateral entry in your branch.'
      },
      faqs: [
        {
          question: 'Can I do a polytechnic diploma after 12th?',
          answer: 'Yes. AICTE allows students who passed 10+2 with subjects matching the branch to join the diploma directly in the second year, so the course takes 2 years instead of 3.'
        },
        {
          question: 'Can I join a polytechnic diploma after ITI?',
          answer: 'Yes. Under AICTE rules, Class 10 plus a 2-year ITI certificate makes you eligible for the second year of an engineering diploma. Haryana\'s 2026-27 prospectus asks for an ITI in an engineering trade for engineering branches.'
        },
        {
          question: 'Can a commerce or arts student join a lateral-entry diploma?',
          answer: 'Only in branches with no mandatory science subject. In the HSTES 2026-27 table, Fashion Design and Packaging Technology have none, and non-engineering diplomas accept 10+2 arts or commerce. Civil and Mechanical need Physics, Chemistry and Maths.'
        },
        {
          question: 'Is there an entrance exam for lateral entry to a diploma?',
          answer: 'There is no national test. States decide. Haryana filled 2026-27 lateral-entry seats through online counselling ranked on the percentage in the qualifying exam, with no test.'
        },
        {
          question: 'How many lateral-entry seats does a polytechnic have?',
          answer: 'AICTE allows up to 10% of a course\'s approved intake as extra lateral-entry seats, plus any first-year seats left unfilled.'
        },
        {
          question: 'Is a lateral-entry diploma the same as a regular diploma?',
          answer: 'You study years 2 and 3 with the regular batch and receive the diploma from the same board or university, but you may have to clear bridge or additional courses set by the board.'
        },
        {
          question: 'Can I do B.Tech after a 2-year lateral-entry diploma?',
          answer: 'Yes. AICTE lets holders of a 3-year or a 2-year lateral-entry diploma with at least 45% (40% for reserved categories) join B.E./B.Tech in the second year.'
        }
      ]
    },
    'online-emba': {
      h1: 'Online Executive MBA in India: Eligibility, Validity, Fees and How to Check',
      title: 'Online Executive MBA: Eligibility, Validity and Fees',
      description:
        'Online EMBA for working professionals: 3-year work rule, UGC validity checks, IIM Udaipur and NMIMS fees (₹4 lakh to ₹14.2 lakh) and checks before paying.',
      keywords: ['online executive MBA', 'online EMBA India', 'executive MBA for working professionals', 'online EMBA eligibility', 'is online executive MBA valid', 'online EMBA fees'],
      intro:
        'An online Executive MBA is a two-year MBA for people with about three years of work. Check who awards the degree, the UGC-DEB list and the full fee before you apply.',
      crossLink: {
        href: '/online-mba-colleges',
        anchor: 'Compare online MBA colleges',
        note: 'Shortlisting? Compare universities offering online MBA and executive MBA programmes.'
      },
      faqs: [
        {
          question: 'What is the eligibility for an online Executive MBA?',
          answer: 'Usually a bachelor\'s degree and about three years of work. IIM Udaipur asks for three years of full-time work after graduation and a CAT, GMAT, GRE or IIMU Test score; NMIMS asks for 55% (50% reserved) and 3+ years of experience.'
        },
        {
          question: 'Is an online Executive MBA valid in India?',
          answer: 'It is valid when a recognised university or institute awards an MBA and, for universities, is entitled by UGC to run that programme online. Check the UGC-DEB list for your session.'
        },
        {
          question: 'Is an Executive MBA a different degree from an MBA?',
          answer: 'No. UGC\'s Specification of Degrees lists MBA as the degree name. "Executive" describes a programme for working professionals; IIM Udaipur, for example, awards the degree Master of Business Administration.'
        },
        {
          question: 'How much does an online Executive MBA cost?',
          answer: 'Published examples: ₹4,00,000 for the NMIMS MBA (Working Executive) if paid in full, and ₹14,20,800 for the IIM Udaipur EMBA 2027-29, paid in seven instalments.'
        },
        {
          question: 'Do online EMBA programmes offer placements?',
          answer: 'Not always. IIM Udaipur states that placement support is not offered for its EMBA, though career advisory is part of the programme. Ask each institute in writing.'
        },
        {
          question: 'How much time does an online EMBA need each week?',
          answer: 'IIM Udaipur holds about seven 90-minute live sessions a week on weekends and two weekday evenings, plus two one-week campus modules.'
        }
      ]
    },
    'online-programmes': {
      h1: 'Online Degree Programmes in India: Validity, Rules and How to Check',
      title: 'Online Degree Programmes: Are They Valid? UGC Rules',
      description:
        'Are online degrees valid in India? UGC rules on who can offer them, subjects not allowed online, SWAYAM credits vs certificates, and a 5-step check.',
      keywords: ['online degree programmes India', 'is online degree valid', 'UGC approved online courses', 'UGC DEB online list', 'online degree vs certificate', 'SWAYAM credit transfer'],
      intro:
        'Online degrees from UGC-entitled universities count the same as regular degrees. Check the university, programme and session on the UGC-DEB list before you pay.',
      crossLink: {
        href: '/online-mba-colleges',
        anchor: 'Compare online universities',
        note: 'Looking for an online degree? Compare universities offering online programmes.'
      },
      faqs: [
        {
          question: 'Are online degrees valid in India?',
          answer: 'Yes, when a university entitled by UGC for that programme awards them. Regulation 22 of the UGC ODL and Online Regulations, 2020 treats them as equal to regular-mode degrees.'
        },
        {
          question: 'Which universities can offer online degrees?',
          answer: 'Universities with NAAC 3.26 or more, or a NIRF university top-100 rank at least twice in three cycles, can start online degrees without prior approval. Others need UGC recognition first.'
        },
        {
          question: 'Which courses cannot be done online?',
          answer: 'UGC prohibits online degrees in engineering, medical, dental, pharmacy, nursing, physiotherapy and other paramedical subjects, architecture, law, agriculture, horticulture, hotel management, catering, culinary sciences, aircraft maintenance, visual arts, sports, M.Phil and Ph.D.'
        },
        {
          question: 'How do I check if an online programme is UGC approved?',
          answer: 'Open the UGC-DEB website, find the online list for your session, and check that the university and exact programme name are listed for that period.'
        },
        {
          question: 'Can SWAYAM courses count towards my degree?',
          answer: 'Yes, if your university has adopted SWAYAM credit transfer. UGC allows up to 40% of the courses in a programme in a semester to be taken through SWAYAM.'
        },
        {
          question: 'Is an online certificate the same as an online degree?',
          answer: 'No. A certificate is set and issued by the provider and is not a degree. Only UGC-entitled universities can award online degrees.'
        }
      ]
    },
    'mass-communication-pg': {
      h1: 'Mass Communication PG: MA vs PG Diploma, Eligibility, IIMC and Fees',
      title: 'Mass Communication PG Courses: MA, PG Diploma and Fees',
      description:
        'Mass communication after graduation: MA vs PG diploma, IIMC 2026-27 CUET-PG admission, 320 MA seats, fees from ₹1.15 lakh, and fees across 53 colleges.',
      keywords: ['mass communication PG course', 'MA mass communication', 'MJMC', 'PG diploma in mass communication', 'IIMC admission 2026', 'mass communication after graduation'],
      intro:
        'After graduation you can take a master\'s (MA or MJMC) or a one-year PG diploma in mass communication. Check eligibility, CUET-PG, age limits and total fees first.',
      crossLink: {
        href: '/mass-communication-colleges',
        anchor: 'Compare mass communication colleges',
        note: 'Shortlisting? Compare colleges offering MA, MJMC and PG diplomas in mass communication.'
      },
      faqs: [
        {
          question: 'What is the eligibility for MA in mass communication?',
          answer: 'Usually a bachelor\'s degree in any discipline. IIMC asks for at least 55% for its MA programmes in 2026-27, plus a valid CUET-PG score in Mass Communication and Journalism.'
        },
        {
          question: 'How long is a PG course in mass communication?',
          answer: 'A master\'s takes 2 years after a 3-year bachelor\'s degree, or 1 year after a 4-year honours degree under UGC\'s PG framework. IIMC\'s PG diplomas take one year over two semesters.'
        },
        {
          question: 'How do I get admission to IIMC?',
          answer: 'For 2026-27, IIMC admitted MA and most PG diploma students through the CUET-PG score in Mass Communication and Journalism (COQP17), followed by e-counselling.'
        },
        {
          question: 'Is there an age limit for IIMC courses?',
          answer: 'There is no age limit for IIMC MA programmes. For PG diplomas in 2026-27, General candidates had to be born on or after 1 August 2001, with later limits for OBC, SC, ST and PwD.'
        },
        {
          question: 'What is the fee for IIMC courses?',
          answer: 'For 2026-27, IIMC PG diplomas cost ₹1,15,000 to ₹1,75,000 and MA programmes ₹2,82,000 to ₹3,42,000 for the full course, excluding hostel.'
        },
        {
          question: 'MA or PG diploma: which is better?',
          answer: 'Choose an MA for a degree that leads to research or teaching; choose a PG diploma for a shorter, practical route into journalism, broadcasting or advertising jobs.'
        }
      ]
    },
    'digital-marketing': {
      h1: 'PG Course in Digital Marketing: Diploma, NSQF or MBA?',
      title: 'PG Diploma in Digital Marketing: Options, Syllabus and Fees',
      description:
        'Digital marketing after graduation: a 1-year university PG diploma (GTU, ₹25,000), NSQF Level 6 Digital Marketing Manager, or MBA. Syllabus and checks.',
      keywords: ['PG diploma in digital marketing', 'digital marketing course after graduation', 'digital marketing syllabus', 'NSQF digital marketing manager', 'one year digital marketing course'],
      intro:
        'Digital marketing PG courses are mostly one-year diplomas or skill certificates. Compare who awards the course, the syllabus and the total cost before you pay.',
      crossLink: {
        href: '/mba-colleges',
        anchor: 'Compare MBA colleges',
        note: 'Thinking of a two-year route? Compare MBA and PGDM colleges with marketing specialisations.'
      },
      faqs: [
        {
          question: 'Is a PG diploma in digital marketing a degree?',
          answer: 'No. It is a diploma. For example, Gujarat Technological University\'s PGDDM is a one-year postgraduate diploma for graduates.'
        },
        {
          question: 'What is the eligibility for a PG diploma in digital marketing?',
          answer: 'Usually any graduate. GTU\'s PGDDM is open to any eligible graduate, as well as marketing professionals and entrepreneurs.'
        },
        {
          question: 'What subjects are taught in digital marketing?',
          answer: 'At GTU: basics of marketing, fundamentals of digital marketing, SEO, search engine marketing, social media marketing, content and email marketing, web analytics or e-commerce, and a project.'
        },
        {
          question: 'What is the NSQF Digital Marketing Manager qualification?',
          answer: 'An NCVET-approved NSQF Level 6 certificate (NQR 2022/ME/MESC/05446) with 840 hours of training. Postgraduates can enrol directly; graduates need relevant work experience.'
        },
        {
          question: 'How much does a digital marketing PG diploma cost?',
          answer: 'It varies by provider. GTU lists tuition of ₹25,000 for its entire one-year PGDDM for Indian students.'
        },
        {
          question: 'Should I do an MBA instead of a digital marketing diploma?',
          answer: 'Choose an MBA or PGDM if you want a broader management qualification over two years; choose a diploma or NSQF course for a shorter, skill-focused route.'
        }
      ]
    },
    'bftech': {
      h1: 'B.FTech Course: NIFT Eligibility, GAT Pattern, Fees and Careers',
      title: 'B.FTech at NIFT: Eligibility, Exam Pattern and Fees',
      description:
        'NIFT B.FTech (Apparel Production): 10+2 with Maths, GAT-only selection (30:70), 591 seats in 2026, ₹13.81 lakh four-year fee, internships and roles.',
      keywords: ['BFTech course', 'BFTech NIFT', 'BFTech eligibility', 'NIFT BFTech exam pattern', 'NIFT BFTech fees', 'bachelor of fashion technology'],
      intro:
        'B.FTech is NIFT\'s four-year apparel production degree for Class 12 students with Maths. Check the age limit, GAT pattern and full four-year fee before applying.',
      crossLink: {
        href: '/exams/nift',
        anchor: 'NIFT entrance exam guide',
        note: 'Preparing for NIFT? See exam dates, pattern and updates for the NIFT entrance test.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.FTech at NIFT?',
          answer: '10+2 with Mathematics from a recognised board (or NIOS with five subjects including Maths), or a 3/4-year engineering diploma. You must be under 24 on 1 August, with 5 years\' relaxation for SC, ST and PwD.'
        },
        {
          question: 'Is there a creative test or interview for B.FTech?',
          answer: 'No. NIFT selects B.FTech candidates on the General Ability Test only: Section A carries 30% and Section B 70%.'
        },
        {
          question: 'What is the NIFT B.FTech exam pattern?',
          answer: 'For 2026: GAT Section A had 100 questions in 120 minutes and Section B 50 questions in 60 minutes. Each wrong answer costs 0.25 marks.'
        },
        {
          question: 'How many B.FTech seats does NIFT have?',
          answer: 'NIFT listed 591 B.FTech seats for 2026: 542 regular and 49 state-domicile seats.'
        },
        {
          question: 'What is the total fee for B.FTech at NIFT?',
          answer: 'For the 2026 non-NRI batch, academic fees total ₹13,81,300 over four years, plus a ₹6,200 alumni fee and a ₹12,600 refundable deposit. Hostel is extra.'
        },
        {
          question: 'What jobs can I get after B.FTech?',
          answer: 'NIFT lists roles such as production merchandiser, quality assurance manager, product developer, retail and e-commerce merchandiser, supply chain manager and sample coordinator.'
        }
      ]
    },
    'bfa': {
      h1: 'BFA (Bachelor of Fine Arts): Admission, Specialisations, Fees and Careers',
      title: 'BFA Course 2026: Eligibility, Entrance Tests, Fees, Careers',
      description:
        'BFA is a 4-year studio degree after Class 12. See eligibility, DU and Maharashtra entrance routes, specialisations, typical fees and art careers.',
      keywords: ['BFA course', 'Bachelor of Fine Arts', 'BFA admission 2026', 'BFA eligibility', 'BFA fees', 'BFA entrance exam', 'BFA applied art', 'BFA painting'],
      intro:
        'A four-year studio degree in painting, applied art, sculpture or print making, usually entered through a practical test after Class 12.',
      crossLink: {
        href: '/courses/mfa',
        anchor: 'MFA course guide',
        note: 'for postgraduate study after BFA'
      },
      faqs: [
        {
          question: 'Is BFA a 3-year or 4-year course?',
          answer: 'At the University of Delhi, in Maharashtra and at Government College of Art, Chandigarh, BFA is a four-year, eight-semester degree.'
        },
        {
          question: 'Can a science or commerce student do BFA?',
          answer: 'Yes. These institutions accept Class 12 in any stream; selection depends mainly on the practical or aptitude test.'
        },
        {
          question: 'What is the fee for BFA?',
          answer: 'Among 43 institutes publishing annual fees, the middle value is about ₹60,000 a year; most fall between ₹40,000 and ₹1,04,000.'
        },
        {
          question: 'Which entrance exam is needed for BFA?',
          answer: 'It depends on the university: DU uses CUET plus its own practical test, Maharashtra uses the state Fine Art CET, and many colleges run their own aptitude test.'
        }
      ]
    },
    'bvoc': {
      h1: 'B.Voc (Bachelor of Vocation): Structure, Exit Options, Fees and Jobs',
      title: 'B.Voc Course 2026: Eligibility, NSQF Levels, Fees, Careers',
      description:
        'B.Voc is a 3-year skill degree with exits at diploma and advanced diploma. See UGC rules, NSQF levels, credit split, typical fees and jobs.',
      keywords: ['B.Voc course', 'Bachelor of Vocation', 'B.Voc eligibility', 'B.Voc fees', 'B.Voc NSQF', 'B.Voc jobs', 'B.Voc vs BSc', 'UGC B.Voc guidelines'],
      intro:
        'A three-year UGC skill degree mapped to NSQF levels 5 to 7, with a diploma after one year and an advanced diploma after two.',
      crossLink: {
        href: '/courses/diploma',
        anchor: 'Diploma courses',
        note: 'if you want a shorter skill programme'
      },
      faqs: [
        {
          question: 'Is B.Voc a valid degree?',
          answer: 'Yes. B.Voc is a UGC bachelor\'s degree at NSQF Level 7, awarded by universities and autonomous colleges.'
        },
        {
          question: 'Can I leave B.Voc after one year?',
          answer: 'Yes. Under the UGC scheme you get a Diploma (NSQF Level 5) after one year and an Advanced Diploma (Level 6) after two.'
        },
        {
          question: 'How much of B.Voc is practical?',
          answer: 'At least 60% of credits are skill credits, and the revised UGC guidelines allow up to 70%.'
        },
        {
          question: 'What is the fee for B.Voc?',
          answer: 'Among 38 institutes publishing annual fees, the middle value is about ₹50,000 a year.'
        }
      ]
    },
    'bped': {
      h1: 'B.P.Ed (Bachelor of Physical Education): Eligibility, Fitness Test and Careers',
      title: 'B.P.Ed Course 2026: NCTE Eligibility, Admission, Careers',
      description:
        'B.P.Ed is a 2-year NCTE teacher programme after graduation. See eligibility, sports participation rules, fitness tests and PE teacher careers.',
      keywords: ['B.P.Ed course', 'Bachelor of Physical Education', 'B.P.Ed eligibility', 'B.P.Ed admission', 'B.P.Ed NCTE', 'PE teacher course', 'B.P.Ed duration', 'B.P.Ed jobs'],
      intro:
        'A two-year, NCTE-regulated teacher education programme that trains graduates to teach physical education in schools.',
      crossLink: {
        href: '/courses/dped',
        anchor: 'D.P.Ed course guide',
        note: 'for the diploma route after Class 12'
      },
      faqs: [
        {
          question: 'What is the duration of B.P.Ed?',
          answer: 'Two academic years (four semesters), with a maximum of three years to complete at many universities.'
        },
        {
          question: 'Can I do B.P.Ed after 12th?',
          answer: 'No, the standard B.P.Ed needs a bachelor\'s degree. After Class 12 you can consider the 4-year integrated programme, BPES or D.P.Ed.'
        },
        {
          question: 'What marks are required for B.P.Ed?',
          answer: 'The common NCTE route is 50% in graduation plus sports participation; some routes allow 45%.'
        },
        {
          question: 'Is there a physical test for B.P.Ed?',
          answer: 'Most universities hold a physical fitness test along with a written test and marks for sports achievements.'
        }
      ]
    },
    'bms': {
      h1: 'BMS (Bachelor of Management Studies): Admission, CUET and MAH CET Routes',
      title: 'BMS Course 2026: Eligibility, CUET, MAH CET, Careers',
      description:
        'BMS is an undergraduate management degree. See DU CUET subject rules, Mumbai routes via MAH BBA/BMS CET, what you study and career options.',
      keywords: ['BMS course', 'Bachelor of Management Studies', 'BMS admission 2026', 'BMS CUET', 'BMS eligibility', 'BMS vs BBA', 'DU BMS', 'MAH BMS CET'],
      intro:
        'An undergraduate management degree, best known at Delhi University (via CUET with Maths) and Mumbai University (via MAH BBA/BMS CET).',
      crossLink: {
        href: '/courses/bba',
        anchor: 'BBA course guide',
        note: 'to compare the BBA route'
      },
      faqs: [
        {
          question: 'Is Maths compulsory for BMS?',
          answer: 'At the University of Delhi, yes: you must pass Maths or Applied Maths in Class 12 and take it in CUET (UG) 2026.'
        },
        {
          question: 'Which entrance exam is needed for BMS?',
          answer: 'DU uses CUET (UG); in Maharashtra, many BMS admissions use the MAH BBA/BMS/BBM CET.'
        },
        {
          question: 'Is BMS better than BBA?',
          answer: 'The content is similar. Choose based on college quality, internships and placements.'
        },
        {
          question: 'Can I do an MBA after BMS?',
          answer: 'Yes. Any graduate can take CAT, XAT, CMAT or MAH MBA/MMS CET for MBA or MMS.'
        }
      ]
    },
    'mms': {
      h1: 'MMS (Master of Management Studies): MAH MBA/MMS CET, Eligibility and Careers',
      title: 'MMS Course 2026: MAH CET Pattern, Eligibility, Careers',
      description:
        'MMS is a 2-year management master\'s in Maharashtra. See MAH MBA/MMS CET 2026 eligibility, exam pattern, how MMS compares with MBA, and careers.',
      keywords: ['MMS course', 'Master of Management Studies', 'MAH MBA CET', 'MMS eligibility', 'MMS vs MBA', 'MMS admission 2026', 'MAH CET exam pattern', 'JBIMS MMS'],
      intro:
        'A two-year management master\'s, mainly offered by University of Mumbai institutes, with admission through MAH MBA/MMS CET.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'MBA course guide',
        note: 'to compare national MBA routes'
      },
      faqs: [
        {
          question: 'Is MMS equal to MBA?',
          answer: 'Yes. MMS is the name used by the University of Mumbai and some Maharashtra institutes for a two-year management master\'s, equivalent to an MBA.'
        },
        {
          question: 'What is the eligibility for MAH MBA/MMS CET?',
          answer: 'A three-year bachelor\'s degree with 50% (45% for Maharashtra reserved, EWS and PwD candidates); final-year students may apply.'
        },
        {
          question: 'Is there negative marking in MAH CET?',
          answer: 'No. It has 200 one-mark questions in 150 minutes with no negative marking.'
        },
        {
          question: 'How many sections are in MAH MBA CET?',
          answer: 'Four: Logical Reasoning (75), Abstract Reasoning (25), Quantitative Aptitude (50) and Verbal Ability/RC (50).'
        }
      ]
    },
    'masters': {
      h1: 'Master\'s Degree in India: 1-Year vs 2-Year PG, Credits and Admission',
      title: 'Master\'s Degree in India 2026: Duration, Credits, CUET-PG',
      description:
        'How master\'s degrees work in India under the UGC 2024 PG framework: 1-year vs 2-year PG, credit rules, CUET-PG admission and how to pick a programme.',
      keywords: ['masters degree India', '1 year PG UGC', '2 year masters', 'UGC PG framework 2024', 'CUET PG', 'masters after 4 year UG', 'MA MSc MCom duration', 'postgraduate course India'],
      intro:
        'A plain guide to how postgraduate degrees are structured in India after the UGC 2024 PG framework, and how admission works.',
      crossLink: {
        href: '/courses/ma',
        anchor: 'MA course guide',
        note: 'for arts and humanities master\'s'
      },
      faqs: [
        {
          question: 'Is a 1-year master\'s valid in India?',
          answer: 'Yes. The UGC 2024 PG framework allows a 1-year, 40-credit master\'s for students who hold a 4-year bachelor\'s degree.'
        },
        {
          question: 'Can I do a 1-year master\'s after a 3-year degree?',
          answer: 'No. After a 3-year bachelor\'s, the framework provides a 2-year, 80-credit master\'s.'
        },
        {
          question: 'Which exam is needed for a master\'s?',
          answer: 'It depends: CUET-PG for many universities, CAT and others for MBA, GATE for M.Tech, NEET-PG for MD/MS.'
        },
        {
          question: 'How many credits is a master\'s degree?',
          answer: '40 credits for a 1-year programme and 80 credits for a 2-year programme.'
        }
      ]
    },
    'master-of-physiotherapy-mpt': {
      h1: 'MPT (Master of Physiotherapy): Eligibility, Specialisations and Fees',
      title: 'MPT Course 2026: Eligibility, Specialisations, Fees, Careers',
      description:
        'MPT is a 2-year physiotherapy master\'s after BPT. See eligibility (BPT 50% + internship), specialisations, entrance routes, fees and careers.',
      keywords: ['MPT course', 'Master of Physiotherapy', 'MPT eligibility', 'MPT specialisation', 'MPT fees', 'MPT admission 2026', 'MPT after BPT', 'MPT musculoskeletal'],
      intro:
        'A two-year clinical master\'s for BPT graduates, specialising in areas such as musculoskeletal, neuro, cardiopulmonary or sports physiotherapy.',
      crossLink: {
        href: '/courses/bpt',
        anchor: 'BPT course guide',
        note: 'for the undergraduate physiotherapy route'
      },
      faqs: [
        {
          question: 'What is the eligibility for MPT?',
          answer: 'A BPT from a recognised university, typically with 50% aggregate, and a completed six-month internship.'
        },
        {
          question: 'How long is MPT?',
          answer: 'Two years, full-time.'
        },
        {
          question: 'Which MPT specialisation is best?',
          answer: 'It depends on your goal: musculoskeletal and sports suit private practice; neuro and cardiopulmonary suit hospital work.'
        },
        {
          question: 'What is the fee for MPT?',
          answer: 'Published annual fees in a small sample of six institutes range from ₹60,000 to ₹3,50,000, with a middle value near ₹1,10,000.'
        }
      ]
    },
    'msw': {
      h1: 'MSW (Master of Social Work): Eligibility, Fieldwork, Fees and Careers',
      title: 'MSW Course 2026: Eligibility, Fieldwork, Fees, Careers',
      description:
        'MSW is a 2-year social work master\'s open to any graduate. See eligibility, entrance and interview, fieldwork, typical fees and social work careers.',
      keywords: ['MSW course', 'Master of Social Work', 'MSW eligibility', 'MSW admission 2026', 'MSW fees', 'MSW fieldwork', 'MSW jobs', 'MA Social Work'],
      intro:
        'A two-year professional master\'s in social work, open to graduates of any discipline, built around supervised fieldwork.',
      crossLink: {
        href: '/courses/bsw',
        anchor: 'BSW course guide',
        note: 'for the undergraduate social work route'
      },
      faqs: [
        {
          question: 'Can I do MSW after BCom or BSc?',
          answer: 'Yes. MSW is open to graduates of any discipline.'
        },
        {
          question: 'Is MSW the same as MA Social Work?',
          answer: 'The content is equivalent; some universities, such as the University of Delhi, name it MA Social Work.'
        },
        {
          question: 'What is fieldwork in MSW?',
          answer: 'Supervised practice with an agency for part of each week, plus camps and a block placement.'
        },
        {
          question: 'What is the fee for MSW?',
          answer: 'Among 30 institutes publishing annual fees, the middle value is about ₹37,100 a year.'
        }
      ]
    },
    'm-lib': {
      h1: 'Master of Library Science (M.Lib / MLISc): What You Study and Careers',
      title: 'Master of Library Science: Syllabus, Fees, Library Careers',
      description:
        'Master of Library Science (MLISc) is a 1-year course after BLISc. See what you study, fees, and careers in academic, public and digital libraries.',
      keywords: ['Master of Library Science', 'M.Lib course', 'MLISc syllabus', 'library science master\'s', 'MLISc fees', 'librarian career', 'MLISc jobs', 'library science UGC NET'],
      intro:
        'A one-year master\'s after BLISc that prepares you for professional librarian, information manager and library teaching roles.',
      crossLink: {
        href: '/courses/mlibsc',
        anchor: 'M.Lib.Sc admission guide',
        note: 'for entrance routes and regular vs distance options'
      },
      faqs: [
        {
          question: 'How long is the Master of Library Science?',
          answer: 'One year (two semesters) at the University of Delhi and IGNOU; some universities run a two-year integrated version.'
        },
        {
          question: 'Can I do MLISc without BLISc?',
          answer: 'Not for the one-year course; BLISc is the entry qualification. Integrated two-year programmes accept graduates directly.'
        },
        {
          question: 'Is UGC-NET needed to be a college librarian?',
          answer: 'Generally yes, along with a master\'s in library science, as per UGC rules for library posts.'
        }
      ]
    },
    'mlibsc': {
      h1: 'M.Lib.Sc Admission: CUET-PG, Open University and Distance Routes',
      title: 'M.Lib.Sc Admission 2026: CUET-PG, DU SOL, IGNOU Routes',
      description:
        'How to get into M.Lib.Sc: DU admission via CUET-PG paper COQP13, DU SOL online eligibility, IGNOU MLIS, and how to choose between them.',
      keywords: ['M.Lib.Sc admission', 'MLISc admission 2026', 'CUET PG library science', 'COQP13', 'DU MLISc', 'IGNOU MLIS', 'MLISc distance', 'MLISc eligibility'],
      intro:
        'An admission-focused guide to M.Lib.Sc: regular, open and distance routes, and what each asks for.',
      crossLink: {
        href: '/courses/m-lib',
        anchor: 'Master of Library Science guide',
        note: 'for syllabus, fees and careers'
      },
      faqs: [
        {
          question: 'Which CUET-PG paper is needed for DU M.Lib.I.Sc?',
          answer: 'Paper code COQP13, as listed by the DU Department of Library and Information Science.'
        },
        {
          question: 'How many seats does DU have for M.Lib.I.Sc?',
          answer: '58 seats, divided equally between two applicant categories.'
        },
        {
          question: 'Can I do M.Lib.Sc by distance?',
          answer: 'Yes. IGNOU offers the MLIS, and DU SOL offers M.Lib.I.Sc for 2026-27.'
        }
      ]
    },
    'b-lib': {
      h1: 'Bachelor of Library Science (B.Lib / BLISc): What You Study, Fees and Jobs',
      title: 'Bachelor of Library Science: Syllabus, Fees, Library Jobs',
      description:
        'Bachelor of Library Science (BLISc) is a 1-year course after graduation. See what you study, eligibility, typical fees and library careers.',
      keywords: ['Bachelor of Library Science', 'B.Lib course', 'BLISc syllabus', 'library science course', 'BLISc fees', 'library assistant job', 'BLISc after graduation', 'BLISc eligibility'],
      intro:
        'A one-year professional course after graduation that teaches how libraries organise, find and manage information.',
      crossLink: {
        href: '/courses/blisc',
        anchor: 'B.Li.Sc admission guide',
        note: 'for CUET-PG, DU SOL and IGNOU routes'
      },
      faqs: [
        {
          question: 'Is BLISc a one-year course?',
          answer: 'Yes, at the University of Delhi and IGNOU it is one year (two semesters at DU).'
        },
        {
          question: 'Can I do BLISc after 12th?',
          answer: 'No. It is taken after a bachelor\'s degree.'
        },
        {
          question: 'What is the fee for BLISc?',
          answer: 'Among 17 institutes publishing annual fees, the middle value is about ₹25,000.'
        }
      ]
    },
    'blisc': {
      h1: 'B.Li.Sc Admission: CUET-PG at DU, DU SOL and IGNOU Routes',
      title: 'B.Li.Sc Admission 2026: CUET-PG COQP11, DU SOL, IGNOU',
      description:
        'How to get into B.Li.Sc: DU admission via CUET-PG paper COQP11 with 78 seats, DU SOL online entry, IGNOU distance BLIS, and which suits you.',
      keywords: ['B.Li.Sc admission', 'BLISc admission 2026', 'CUET PG COQP11', 'DU BLISc seats', 'IGNOU BLIS', 'BLISc distance', 'DU SOL BLISc', 'library science admission'],
      intro:
        'An admission guide to B.Li.Sc: the CUET-PG route at Delhi University, DU\'s School of Open Learning and IGNOU distance study.',
      crossLink: {
        href: '/courses/b-lib',
        anchor: 'Bachelor of Library Science guide',
        note: 'for syllabus, fees and jobs'
      },
      faqs: [
        {
          question: 'Which CUET-PG paper is for DU BLISc?',
          answer: 'Paper code COQP11.'
        },
        {
          question: 'How many BLISc seats does DU have?',
          answer: '78 seats, plus up to 5 for international students.'
        },
        {
          question: 'Can engineering graduates do BLISc at DU?',
          answer: 'Yes, a B.E./B.Tech with science and mathematics is accepted.'
        }
      ]
    },
    'bplan': {
      h1: 'B.Plan (Bachelor of Planning): JEE Main Paper 2B, Eligibility and Careers',
      title: 'B.Plan Course 2026: JEE Main Paper 2B Pattern, Eligibility',
      description:
        'B.Plan is a 4-year urban planning degree. See JEE Main 2026 Paper 2B pattern, JoSAA eligibility, SPA Delhi seats, and planning careers.',
      keywords: ['B.Plan course', 'Bachelor of Planning', 'JEE Main Paper 2B', 'B.Planning eligibility', 'B.Plan admission 2026', 'SPA Delhi B.Plan', 'urban planning course', 'B.Plan syllabus'],
      intro:
        'A four-year degree in urban and regional planning, entered through JEE Main Paper 2B and JoSAA counselling.',
      crossLink: {
        href: '/courses/architecture',
        anchor: 'B.Arch course guide',
        note: 'if you are deciding between architecture and planning'
      },
      faqs: [
        {
          question: 'Which exam is needed for B.Plan?',
          answer: 'JEE Main Paper 2B for SPAs, NITs and other JoSAA institutes; some state and private universities use their own process.'
        },
        {
          question: 'Is Maths compulsory for B.Plan?',
          answer: 'Yes, Class 12 with Mathematics is required.'
        },
        {
          question: 'How many questions are in JEE Main Paper 2B?',
          answer: '100 questions for 400 marks: Maths 25, Aptitude 50, Planning 25.'
        },
        {
          question: 'How long is B.Plan?',
          answer: 'Four years (eight semesters) at SPA New Delhi.'
        }
      ]
    },
    'mechatronics': {
      h1: 'Mechatronics (M.Tech): GATE Admission, What You Study and Careers',
      title: 'M.Tech Mechatronics 2026: GATE, CCMT, Syllabus, Careers',
      description:
        'Mechatronics at postgraduate level: M.Tech admission through GATE and CCMT, eligible B.Tech branches, what you study, and robotics and automation careers.',
      keywords: ['M.Tech Mechatronics', 'mechatronics course', 'mechatronics GATE', 'mechatronics admission 2026', 'CCMT mechatronics', 'mechatronics syllabus', 'robotics automation career', 'mechatronics eligibility'],
      intro:
        'A two-year M.Tech that combines mechanical, electrical, electronics and control engineering for robotics and automation.',
      crossLink: {
        href: '/courses/mtech',
        anchor: 'M.Tech course guide',
        note: 'for other M.Tech specialisations'
      },
      faqs: [
        {
          question: 'Which GATE paper is needed for M.Tech Mechatronics?',
          answer: 'It depends on the institute; mechanical, electrical, electronics and instrumentation papers are commonly accepted. Check the programme table.'
        },
        {
          question: 'How long is M.Tech Mechatronics?',
          answer: 'Two years, with the second year focused on a thesis or project.'
        },
        {
          question: 'Can an electronics graduate do mechatronics?',
          answer: 'Usually yes; electronics and instrumentation graduates are commonly eligible.'
        }
      ]
    },
    'b-chem-eng': {
      h1: 'B.Chem.Engg: ICT Mumbai Admission, Eligibility and Careers',
      title: 'B.Chem.Engg 2026: ICT Mumbai Seats, MHT-CET, JEE Main',
      description:
        'B.Chem.Engg is a 4-year chemical engineering degree best known at ICT Mumbai. See 2026-27 eligibility, MHT-CET and JEE Main seats, and careers.',
      keywords: ['B.Chem.Engg', 'B.Chem Eng', 'ICT Mumbai chemical engineering', 'B.Chem.Engg admission 2026', 'MHT CET chemical engineering', 'chemical engineering eligibility', 'ICT Mumbai seats', 'chemical engineer career'],
      intro:
        'A four-year chemical engineering degree, best known at the Institute of Chemical Technology, Mumbai, with seats through MHT-CET and JEE Main.',
      crossLink: {
        href: '/courses/m-chem-eng',
        anchor: 'M.Chem.Engg course guide',
        note: 'for the postgraduate route'
      },
      faqs: [
        {
          question: 'Is B.Chem.Engg the same as B.Tech Chemical Engineering?',
          answer: 'Yes, it is the same discipline; ICT Mumbai uses the name B.Chem.Engg.'
        },
        {
          question: 'How many B.Chem.Engg seats does ICT Mumbai have?',
          answer: '75 in 2026: 52 through MHT-CET and 23 all-India through JEE Main.'
        },
        {
          question: 'What marks are needed for B.Chem.Engg?',
          answer: '45% in PCM (40% for Maharashtra reserved, EWS and PwD candidates) plus an MHT-CET or JEE Main score.'
        }
      ]
    },
    'm-chem-eng': {
      h1: 'M.Chem.Engg: ICT Mumbai Admission Levels, GATE and Eligibility',
      title: 'M.Chem.Engg 2026: ICT Mumbai Eligibility, GATE Levels',
      description:
        'M.Chem.Engg is a 2-year chemical engineering master\'s. See ICT Mumbai 2026-27 eligibility (60%), GATE Level 1 and Level 2 admission, and careers.',
      keywords: ['M.Chem.Engg', 'M.Chem Eng', 'ICT Mumbai M.Chem.Engg', 'M.Chem.Engg admission 2026', 'chemical engineering masters GATE', 'ICT Mumbai GATE', 'M.Tech chemical engineering', 'M.Chem.Engg eligibility'],
      intro:
        'A two-year chemical engineering master\'s, best known at ICT Mumbai, admitted through GATE with a two-level process.',
      crossLink: {
        href: '/courses/b-chem-eng',
        anchor: 'B.Chem.Engg course guide',
        note: 'for the undergraduate route'
      },
      faqs: [
        {
          question: 'What is the eligibility for M.Chem.Engg at ICT?',
          answer: 'A four-year chemical or related engineering degree with 60% (55% for backward class).'
        },
        {
          question: 'Is GATE compulsory for ICT M.Chem.Engg?',
          answer: 'Yes. Level 1 uses relevant GATE; Level 2 uses GATE in another specialisation plus ICT\'s test.'
        },
        {
          question: 'How long is M.Chem.Engg?',
          answer: 'Two years: two semesters of papers and two of thesis.'
        }
      ]
    },
    'master-of-civil-engineering': {
      h1: 'Master of Civil Engineering: M.E./M.Tech Admission Through GATE, Specialisations and Careers',
      title: 'Master of Civil Engineering 2026: GATE, CCMT, Specialisations, Careers',
      description:
        'Master of Civil Engineering (M.E./M.Tech) is a 2-year PG degree. See GATE CE and CCMT admission, popular specialisations, eligibility and careers.',
      keywords: ['Master of Civil Engineering', 'M.Tech Civil Engineering', 'M.E. Civil', 'GATE CE', 'civil engineering masters', 'CCMT civil', 'M.Tech civil specialisation', 'civil engineering PG'],
      intro:
        'A two-year M.E./M.Tech in civil engineering, mostly admitted through GATE, with specialisation from the first semester.',
      crossLink: {
        href: '/courses/mtech',
        anchor: 'M.Tech course guide',
        note: 'for all M.Tech specialisations'
      },
      faqs: [
        {
          question: 'Which GATE paper is needed?',
          answer: 'Usually GATE CE; some specialisations accept other papers. Check each brochure.'
        },
        {
          question: 'How long is it?',
          answer: 'Two years, with the second year mainly a dissertation.'
        },
        {
          question: 'Can I get admission without GATE?',
          answer: 'Some state and private universities admit through their own test or merit; IITs and NITs use GATE.'
        }
      ]
    },
    'master-of-mechanical-engineering': {
      h1: 'Master of Mechanical Engineering: M.E./M.Tech Admission Through GATE, Specialisations and Careers',
      title: 'Master of Mechanical Engineering 2026: GATE, CCMT, Specialisations, Careers',
      description:
        'Master of Mechanical Engineering (M.E./M.Tech) is a 2-year PG degree. See GATE ME and CCMT admission, popular specialisations, eligibility and careers.',
      keywords: ['Master of Mechanical Engineering', 'M.Tech Mechanical Engineering', 'M.E. Mechanical', 'GATE ME', 'mechanical engineering masters', 'CCMT mechanical', 'M.Tech mechanical specialisation', 'mechanical engineering PG'],
      intro:
        'A two-year M.E./M.Tech in mechanical engineering, mostly admitted through GATE, with specialisation from the first semester.',
      crossLink: {
        href: '/courses/mtech',
        anchor: 'M.Tech course guide',
        note: 'for all M.Tech specialisations'
      },
      faqs: [
        {
          question: 'Which GATE paper is needed?',
          answer: 'Usually GATE ME; some specialisations accept other papers. Check each brochure.'
        },
        {
          question: 'How long is it?',
          answer: 'Two years, with the second year mainly a dissertation.'
        },
        {
          question: 'Can I get admission without GATE?',
          answer: 'Some state and private universities admit through their own test or merit; IITs and NITs use GATE.'
        }
      ]
    },
    'master-in-hospital-management': {
      h1: 'Master of Hospital Management (MHA): Eligibility, Entrance and Careers',
      title: 'Hospital Management Master\'s 2026: MHA Eligibility, Entrance',
      description:
        'Hospital management master\'s (MHA) is a 2-year PG course. See TISS (CAT) and SGPGIMS (MBBS/BDS) routes, AIIMS MD Hospital Administration and careers.',
      keywords: ['Master of Hospital Management', 'MHA course', 'hospital administration masters', 'MHA eligibility', 'TISS MHA', 'MHA admission 2026', 'MD hospital administration', 'hospital management career'],
      intro:
        'A two-year postgraduate course that trains managers for hospitals and health systems, with routes for any graduate and for doctors.',
      crossLink: {
        href: '/courses/mba',
        anchor: 'MBA course guide',
        note: 'for general management routes'
      },
      faqs: [
        {
          question: 'Can a non-medical graduate do MHA?',
          answer: 'Yes, at programmes like TISS that accept any graduate; some MHAs, like SGPGIMS, are only for MBBS/BDS.'
        },
        {
          question: 'Which entrance is used for TISS MHA?',
          answer: 'For the 2026 batch, TISS used CAT 2025 scores.'
        },
        {
          question: 'How long is MHA?',
          answer: 'Two years at TISS and SGPGIMS.'
        }
      ]
    },
    'master-of-surgery': {
      h1: 'MS (Master of Surgery): NEET-PG, Duration and Surgical Specialities',
      title: 'MS Master of Surgery 2026: NEET-PG, Duration, Specialities',
      description:
        'MS (Master of Surgery) is a 3-year NMC postgraduate degree after MBBS. See NEET-PG and INI-CET admission, MS specialities and what residency involves.',
      keywords: ['Master of Surgery', 'MS course', 'MS after MBBS', 'MS duration', 'NEET PG MS', 'MS specialities', 'MS General Surgery', 'MS Orthopaedics'],
      intro:
        'A three-year NMC-regulated surgical postgraduate degree for MBBS doctors, admitted through NEET-PG or INI-CET.',
      crossLink: {
        href: '/courses/md',
        anchor: 'MD course guide',
        note: 'for non-surgical postgraduate degrees'
      },
      faqs: [
        {
          question: 'How many years is MS after MBBS?',
          answer: 'Three years under NMC PGMER 2023; two years for holders of a recognised two-year PG diploma in the same subject.'
        },
        {
          question: 'Which exam is needed for MS?',
          answer: 'NEET-PG, or INI-CET for AIIMS and other INIs.'
        },
        {
          question: 'Can colleges admit MS students directly?',
          answer: 'No. Admission is only through online common counselling by the central or state authority.'
        }
      ]
    },
    'dcs': {
      h1: 'DCA (Diploma in Computer Applications): Syllabus, Eligibility and Jobs',
      title: 'DCA Course 2026: One-Year Syllabus, Eligibility, Jobs',
      description:
        'DCA is a one-year computer diploma after Class 12. See real university syllabi, eligibility (40-45%), regular vs open-university options and entry-level jobs.',
      keywords: ['DCA course', 'Diploma in Computer Applications', 'DCA syllabus', 'DCA eligibility', 'DCA after 12th', 'DCA jobs', 'DCA open university', 'DCA vs BCA'],
      intro:
        'A one-year, two-semester diploma that teaches office software, programming basics, DBMS and web skills after Class 12.',
      crossLink: {
        href: '/courses/bca',
        anchor: 'BCA course guide',
        note: 'if you want a full computer applications degree'
      },
      faqs: [
        {
          question: 'What is the duration of DCA?',
          answer: 'One year, in two semesters, at the universities checked; BAOU allows up to two years to finish.'
        },
        {
          question: 'What is the eligibility for DCA?',
          answer: 'Class 12 in any stream; some universities set a minimum of 40% or 45%.'
        },
        {
          question: 'Is DCA better than BCA?',
          answer: 'They serve different goals: DCA is a one-year skills diploma, BCA is a three-year degree for developer careers.'
        },
        {
          question: 'Is there an entrance test for DCA?',
          answer: 'Usually not; most universities admit directly.'
        }
      ]
    },
    'diploma-design': {
      h1: 'Design Diploma Courses: Who They Suit, Fees and the B.Des Alternative',
      title: 'Design Diploma 2026: Fees, Skills, vs B.Des at NID',
      description:
        'Design diplomas are short, studio-based courses. See typical fees, what you learn, and how they compare with B.Des routes such as NID DAT.',
      keywords: ['design diploma', 'diploma in design', 'diploma in interior design', 'diploma in graphic design', 'design diploma fees', 'design diploma vs B.Des', 'NID DAT 2026', 'design course after 12th'],
      intro:
        'Short, practical design courses in areas like interior, graphic, product or fashion design, mostly at private institutes.',
      crossLink: {
        href: '/courses/design-ug',
        anchor: 'Design (UG) course guide',
        note: 'for B.Des routes'
      },
      faqs: [
        {
          question: 'How long is a design diploma?',
          answer: 'Most are about one year, though the length is set by each institute.'
        },
        {
          question: 'What is the fee for a design diploma?',
          answer: 'Among 10 private institutes publishing annual fees, the middle value is about ₹1,32,500.'
        },
        {
          question: 'Is a design diploma equal to B.Des?',
          answer: 'No. A B.Des is a four-year degree; a diploma is a shorter skills course.'
        },
        {
          question: 'Can I do a design diploma after 12th in any stream?',
          answer: 'Many institutes accept Class 12 in any stream; check each one.'
        }
      ]
    },
    'diploma-media': {
      h1: 'Media Diploma (DJMC): One-Year Journalism and Mass Communication Courses',
      title: 'Media Diploma 2026: DJMC Syllabus, Eligibility, Careers',
      description:
        'A one-year media diploma (DJMC) after Class 12: what universities teach, eligibility, campus vs open university, and first jobs in media.',
      keywords: ['media diploma', 'Diploma in Journalism and Mass Communication', 'DJMC', 'DJMC syllabus', 'journalism diploma after 12th', 'DJMC eligibility', 'media course one year', 'mass communication diploma'],
      intro:
        'A one-year, two-semester diploma in journalism and mass communication, open to Class 12 pass students.',
      crossLink: {
        href: '/courses/media-ug',
        anchor: 'Media (UG) course guide',
        note: 'for bachelor\'s degrees in media'
      },
      faqs: [
        {
          question: 'How long is a media diploma?',
          answer: 'Usually one year in two semesters.'
        },
        {
          question: 'Can I do a DJMC after 12th?',
          answer: 'Yes, most require a Class 12 pass in any stream.'
        },
        {
          question: 'Is a DJMC enough to become a journalist?',
          answer: 'It can get you entry-level roles, but many national newsrooms prefer a degree or PG diploma.'
        }
      ]
    },
    'media-ug': {
      h1: 'Media Degrees After 12th: BJMC, BA JMC and Mass Communication',
      title: 'Media UG Courses 2026: BJMC Eligibility, CUET, Fees',
      description:
        'Undergraduate media degrees (BJMC, BA JMC, mass communication): eligibility, GGSIPU and CUET routes, 3 or 4-year options, fees and careers.',
      keywords: ['media course after 12th', 'BJMC', 'BA JMC', 'mass communication degree', 'BJMC eligibility', 'GGSIPU BA JMC', 'CUET mass media', 'media UG fees'],
      intro:
        'Bachelor\'s degrees in journalism, mass communication and media, now offered as three-year degrees or four-year honours.',
      crossLink: {
        href: '/courses/media-pg',
        anchor: 'Media (PG) course guide',
        note: 'for postgraduate options'
      },
      faqs: [
        {
          question: 'Is BJMC three years or four?',
          answer: 'It depends on the university: UGC allows a 3-year degree (120 credits) or a 4-year honours (160 credits); GGSIPU\'s BA (JMC) is four years.'
        },
        {
          question: 'What marks are needed for media courses after 12th?',
          answer: 'GGSIPU asks for 50% in the best four subjects including English; others set their own criteria.'
        },
        {
          question: 'What is the fee for BJMC?',
          answer: 'Among 22 institutes publishing annual fees, the middle value is about ₹94,500.'
        }
      ]
    },
    'media-pg': {
      h1: 'Media PG Courses: IIMC PG Diplomas, MA in Journalism and Mass Communication',
      title: 'Media PG Courses 2026: IIMC, MA JMC, CUET-PG, Fees',
      description:
        'Postgraduate media options: IIMC one-year PG Diplomas via CUET-PG (seats, age limits), two-year MA JMC, typical fees and how to choose.',
      keywords: ['media PG courses', 'IIMC PG Diploma', 'MA Journalism and Mass Communication', 'CUET PG mass communication', 'COQP17', 'IIMC admission 2026', 'media masters India', 'PG diploma journalism'],
      intro:
        'Postgraduate routes into media: one-year PG diplomas such as IIMC\'s, and two-year master\'s degrees in journalism and mass communication.',
      crossLink: {
        href: '/courses/media-ug',
        anchor: 'Media (UG) course guide',
        note: 'for bachelor\'s options'
      },
      faqs: [
        {
          question: 'Which CUET-PG paper is needed for IIMC?',
          answer: 'Mass Communication and Journalism, paper code COQP17.'
        },
        {
          question: 'Is there an age limit for IIMC?',
          answer: 'Yes. For 2026-27: 25 for general, 28 for OBC and 30 for SC, ST and PwD, as on 1 August 2026.'
        },
        {
          question: 'How many seats does IIMC have in English Journalism?',
          answer: '256 across six campuses in 2026-27.'
        },
        {
          question: 'Should I do a PG diploma or an MA?',
          answer: 'A PG diploma is faster for jobs; an MA is better for teaching, research and UGC-NET.'
        }
      ]
    },
    'bachelor-of-tourism-studies': {
      h1: 'BTS (Bachelor of Tourism Studies): IGNOU Structure, Fees and Careers',
      title: 'BTS Course 2026: IGNOU Tourism Degree, Fees, Careers',
      description:
        'BTS is a 3-year tourism degree. See IGNOU\'s 96-credit BTS (distance and online), eligibility, low fees, what you study and tourism careers.',
      keywords: ['BTS course', 'Bachelor of Tourism Studies', 'IGNOU BTS', 'BTS eligibility', 'BTS fees', 'tourism degree India', 'BTS online', 'tourism careers'],
      intro:
        'A three-year bachelor\'s in tourism, best known through IGNOU\'s 96-credit distance and online programme.',
      crossLink: {
        href: '/courses/travel-tourism-ug',
        anchor: 'Travel and tourism (UG) guide',
        note: 'for campus tourism degrees'
      },
      faqs: [
        {
          question: 'How long is BTS?',
          answer: 'IGNOU\'s BTS is a three-year, 96-credit degree that can be completed within six years.'
        },
        {
          question: 'What is the fee for IGNOU BTS?',
          answer: '₹4,900 per year for distance mode and ₹3,400 per year online for Indian students, plus applicable registration fees.'
        },
        {
          question: 'Is there an age limit for BTS?',
          answer: 'No, IGNOU sets no minimum or maximum age.'
        },
        {
          question: 'Is BTS a BA degree?',
          answer: 'Yes, IGNOU awards it as a Bachelor of Arts (Tourism Studies).'
        }
      ]
    },
    'diploma-fashion': {
      h1: 'Fashion Design Diploma: One-Year Courses, Syllabus, Fees and Jobs',
      title: 'Fashion Design Diploma 2026: Syllabus, Fees, Careers',
      description:
        'A one-year fashion design diploma after Class 12: real university syllabi, admission, typical fees, and jobs in apparel, styling and boutiques.',
      keywords: ['fashion design diploma', 'diploma in fashion design', 'fashion diploma after 12th', 'fashion diploma fees', 'fashion design syllabus', 'UPRTOU fashion diploma', 'fashion designer course', 'boutique career'],
      intro:
        'A one-year diploma that teaches sketching, pattern making, sewing, textiles and portfolio building.',
      crossLink: {
        href: '/courses/cfd',
        anchor: 'Certificate in Fashion Design guide',
        note: 'for the six-month option'
      },
      faqs: [
        {
          question: 'How long is a fashion design diploma?',
          answer: 'Usually one year.'
        },
        {
          question: 'Can I do a fashion diploma after 12th arts or commerce?',
          answer: 'Yes, most accept Class 12 in any stream.'
        },
        {
          question: 'What is the fee for a fashion diploma?',
          answer: 'Among 8 private institutes publishing annual fees, the middle value is about ₹62,500.'
        }
      ]
    },
    'cfd': {
      h1: 'Certificate in Fashion Design: IGNOU CFDE and Short Fashion Courses',
      title: 'Certificate in Fashion Design 2026: IGNOU CFDE, Fees',
      description:
        'A certificate in fashion design is a short course after Class 12. See IGNOU CFDE (16 credits, 6 months, ₹5,200), what you learn and next steps.',
      keywords: ['certificate in fashion design', 'IGNOU CFDE', 'fashion design certificate', 'short fashion course', 'fashion course 6 months', 'CFDE fee', 'fashion certificate after 12th', 'online fashion course'],
      intro:
        'A short, entry-level fashion course; IGNOU\'s CFDE is a 16-credit, six-month certificate open to Class 12 pass students.',
      crossLink: {
        href: '/courses/diploma-fashion',
        anchor: 'Fashion design diploma guide',
        note: 'for the one-year option'
      },
      faqs: [
        {
          question: 'How long is IGNOU\'s Certificate in Fashion Design?',
          answer: 'Six months minimum, with up to two years to complete.'
        },
        {
          question: 'What is the fee for IGNOU CFDE?',
          answer: 'IGNOU lists ₹5,200 for the full programme.'
        },
        {
          question: 'Who can apply for CFDE?',
          answer: 'Anyone who has passed 10+2 from a recognised board.'
        }
      ]
    },
    'diploma-fine-arts': {
      h1: 'Fine Arts Diploma: Short Studio Courses, Who They Suit and What Next',
      title: 'Fine Arts Diploma 2026: Eligibility, Studio Skills, Next Steps',
      description:
        'A fine arts diploma is a shorter studio course in drawing, painting and sculpture. See who it suits, an example at GCA Chandigarh, and how it compares with BFA.',
      keywords: ['fine arts diploma', 'diploma in fine arts', 'painting diploma', 'art diploma after 10th', 'fine arts course', 'DFASA', 'diploma vs BFA', 'art teacher course'],
      intro:
        'A shorter studio qualification in drawing, painting, sculpture or applied art, offered by art colleges and universities.',
      crossLink: {
        href: '/courses/bfa',
        anchor: 'BFA course guide',
        note: 'for the four-year degree'
      },
      faqs: [
        {
          question: 'Can I do a fine arts diploma after 10th?',
          answer: 'Some institutes accept Class 10; for example, GCA Chandigarh\'s DFASA admits Class 10 candidates through an aptitude test.'
        },
        {
          question: 'Is a fine arts diploma enough to teach art?',
          answer: 'It can be enough for hobby centres; colleges and many schools ask for a BFA or higher.'
        },
        {
          question: 'Is a diploma or BFA better?',
          answer: 'A BFA is the standard route to MFA, UGC-NET and college teaching; a diploma is a shorter studio option.'
        }
      ]
    },
    'diploma-culinary-arts-patisserie': {
      h1: 'Culinary Arts and Patisserie Diploma: IHM Routes, Training and Careers',
      title: 'Culinary & Patisserie Diploma 2026: NCHMCT Courses, Jobs',
      description:
        'Culinary and patisserie diplomas: NCHMCT Food Production and Bakery & Confectionery diplomas (1.5 years incl. training), eligibility and careers.',
      keywords: ['culinary arts diploma', 'patisserie diploma', 'bakery and confectionery diploma', 'diploma in food production', 'IHM diploma', 'NCHMCT diploma', 'chef course after 12th', 'pastry chef course'],
      intro:
        'Kitchen-focused diplomas in cooking and pastry; NCHMCT\'s IHM diplomas run 1.5 years including industrial training.',
      crossLink: {
        href: '/courses/bachelor-hotel-hospitality-tourism',
        anchor: 'Hotel and hospitality degree guide',
        note: 'for the three-year B.Sc route'
      },
      faqs: [
        {
          question: 'How long is the IHM Diploma in Bakery and Confectionery?',
          answer: 'One and a half years (three semesters), including 24 weeks of industrial training.'
        },
        {
          question: 'What is the eligibility for NCHMCT culinary diplomas?',
          answer: 'Class 12 or equivalent with English as a subject.'
        },
        {
          question: 'Can I become a chef after 10th?',
          answer: 'Yes, through craft courses such as Craftsmanship in Food Production and Patisserie at IHMs.'
        }
      ]
    },
    'bachelors': {
      h1: 'Bachelor\'s Degree in India: 3-Year vs 4-Year, Exits and Credits Explained',
      title: 'Bachelor\'s Degree India 2026: 3 or 4 Years, Exits, Credits',
      description:
        'How bachelor\'s degrees now work in India under the UGC framework: 3-year vs 4-year honours, certificate and diploma exits, credits and CUET.',
      keywords: ['bachelors degree India', '4 year UG programme', 'UGC FYUP', '3 year vs 4 year degree', 'UG certificate diploma exit', 'UGC credit framework', 'honours with research', 'CUET UG'],
      intro:
        'A plain guide to how undergraduate degrees are structured in India under the UGC framework, with multiple entry and exit options.',
      crossLink: {
        href: '/courses/masters',
        anchor: 'Master\'s degree guide',
        note: 'for 1-year vs 2-year PG rules'
      },
      faqs: [
        {
          question: 'Is a 4-year degree compulsory now?',
          answer: 'No. The UGC framework allows both a 3-year degree (120 credits) and a 4-year honours degree (160 credits).'
        },
        {
          question: 'Can I leave after one year and get something?',
          answer: 'Yes, a UG Certificate after 40 credits plus a 4-credit vocational course.'
        },
        {
          question: 'What is Honours with Research?',
          answer: 'A fourth-year track with a research project for students who meet the university\'s marks threshold.'
        }
      ]
    },
    'bca-1': {
      h1: 'Bachelor of Computer Applications Under AICTE: What Changed From 2024-25',
      title: 'BCA Under AICTE 2026: Approval, 3 vs 4 Years, Admission',
      description:
        'Since 2024-25, BCA colleges need AICTE approval. See what that means for students, 3-year vs 4-year BCA, admission routes and how to check a college.',
      keywords: ['BCA AICTE approval', 'BCA AICTE 2024-25', 'Bachelor of Computer Applications', 'BCA 4 year', 'BCA admission 2026', 'AICTE approved BCA college', 'BCA CUET', 'check AICTE approval'],
      intro:
        'How AICTE regulation of BCA from 2024-25 affects students, plus degree length options and admission routes.',
      crossLink: {
        href: '/courses/bca',
        anchor: 'BCA course guide',
        note: 'for the full course overview'
      },
      faqs: [
        {
          question: 'Is AICTE approval needed for BCA now?',
          answer: 'Yes, from 2024-25 AICTE requires institutions offering BCA, BBA and BMS to seek its approval.'
        },
        {
          question: 'Is BCA 3 or 4 years?',
          answer: 'Universities may offer a 3-year degree (120 credits) or a 4-year honours (160 credits) under the UGC framework.'
        },
        {
          question: 'How do I check if a BCA college is approved?',
          answer: 'Look for it in AICTE\'s approved-institutions list for the current academic year.'
        }
      ]
    },
    'advance-certificate': {
      h1: 'Advanced Certificate Courses: NSQF Levels, Recognition and How to Choose',
      title: 'Advanced Certificate Courses 2026: NSQF Levels, Recognition',
      description:
        'What an advanced certificate is worth: how NSQF levels work, how to verify a course on the National Qualifications Register, and how to choose one.',
      keywords: ['advanced certificate course', 'advance certificate', 'NSQF level', 'National Qualifications Register', 'skill certificate India', 'certificate course after 12th', 'NCVET approved course', 'short course recognition'],
      intro:
        'Short, focused courses that go beyond basics in one skill; this guide explains how to judge their level and recognition.',
      crossLink: {
        href: '/courses/certification',
        anchor: 'Certification guide',
        note: 'for industry and skill certifications'
      },
      faqs: [
        {
          question: 'Is an advanced certificate recognised?',
          answer: 'It depends on who awards it. Check its NSQF level and look it up on the National Qualifications Register.'
        },
        {
          question: 'What is NSQF?',
          answer: 'The National Skills Qualification Framework, which grades qualifications on levels 1 to 8 with half-levels.'
        },
        {
          question: 'Can a certificate count towards a degree?',
          answer: 'University certificates with defined credits, such as the UGC UG Certificate, can.'
        }
      ]
    },
    'advance-course': {
      h1: 'Advanced Courses and Add-on Courses: Online Credits, SWAYAM and Value',
      title: 'Advanced and Add-on Courses 2026: SWAYAM Credits, Value',
      description:
        'Advanced and add-on courses explained: how SWAYAM credits can count towards your degree (up to 40% per semester), how to judge value, and what to avoid.',
      keywords: ['advanced course', 'add-on course', 'SWAYAM credit transfer', 'online course credits UGC', 'value added course', 'SWAYAM 40 percent', 'short advanced course', 'skill course for students'],
      intro:
        'Short advanced or add-on courses taken alongside a degree or job, including UGC-recognised online courses on SWAYAM.',
      crossLink: {
        href: '/courses/advance-certificate',
        anchor: 'Advanced certificate guide',
        note: 'for NSQF levels and verification'
      },
      faqs: [
        {
          question: 'Can an online course count towards my degree?',
          answer: 'Yes, if your university has adopted the SWAYAM course for credit transfer; up to 40% of a semester’s courses can be online.'
        },
        {
          question: 'Are SWAYAM courses free?',
          answer: 'Learning is generally free; an exam fee applies for certification.'
        },
        {
          question: 'How do I know if an advanced course is worth it?',
          answer: 'Check its outcome, assessment, instructor, recognition and time demand.'
        }
      ]
    },
    'advance-diploma': {
      h1: 'Advanced Diploma: B.Voc Exit, NSQF Level 6 and Where It Leads',
      title: 'Advanced Diploma 2026: NSQF Level 6, B.Voc Exit, Value',
      description:
        'An advanced diploma is a two-year skill qualification. See how it fits in B.Voc (NSQF level 6, 120 credits), lateral entry, and how to check others.',
      keywords: ['advanced diploma', 'advance diploma course', 'B.Voc advanced diploma', 'NSQF level 6', 'advanced diploma vs degree', 'advanced diploma after 12th', 'lateral entry B.Voc', 'skill diploma'],
      intro:
        'A two-year skill qualification; in the UGC B.Voc scheme it is the NSQF level 6 exit after the second year.',
      crossLink: {
        href: '/courses/bvoc',
        anchor: 'B.Voc course guide',
        note: 'for the full degree'
      },
      faqs: [
        {
          question: 'What level is an advanced diploma?',
          answer: 'In the UGC B.Voc scheme it is NSQF level 6, awarded after two years.'
        },
        {
          question: 'How many credits is an advanced diploma?',
          answer: '120 credits in the B.Voc scheme.'
        },
        {
          question: 'Can I complete a degree after an advanced diploma?',
          answer: 'UGC guidelines allow lateral entry to the next level in the same sector, i.e. the B.Voc third year.'
        }
      ]
    },
    'certificate-program': {
      h1: 'Certificate Programmes: University, Open University and Skill Certificates',
      title: 'Certificate Programmes 2026: Types, Credits, How to Choose',
      description:
        'Certificate programmes compared: UGC UG certificates (40 credits), B.Voc exits (NSQF 5+), open-university certificates and skill certificates.',
      keywords: ['certificate programme', 'certificate course', 'UG certificate UGC', 'IGNOU certificate', 'B.Voc diploma', 'short certificate course', 'certificate after 12th', 'certificate course recognition'],
      intro:
        'A comparison of the main kinds of certificate programmes in India and what each is worth.',
      crossLink: {
        href: '/courses/advance-certificate',
        anchor: 'Advanced certificate guide',
        note: 'for NSQF levels and verification'
      },
      faqs: [
        {
          question: 'What is a UG Certificate?',
          answer: 'Under the UGC framework, the award for exiting after the first year of a degree with 40 credits plus a 4-credit vocational course.'
        },
        {
          question: 'Are certificate courses recognised?',
          answer: 'University and NSQF-aligned certificates are; check credits or the NSQF level and the awarding body.'
        },
        {
          question: 'How long is a certificate programme?',
          answer: 'From a few weeks to one year, depending on the type.'
        }
      ]
    },
    'certification': {
      h1: 'Professional and Skill Certifications: NSQF, Awarding Bodies and Value',
      title: 'Certifications 2026: NSQF Skill Certification, How to Verify',
      description:
        'How professional and skill certifications work in India: NCVET-recognised awarding bodies, NSQF levels, verifying on the NQR, and choosing well.',
      keywords: ['skill certification India', 'NCVET awarding body', 'NSQF certification', 'professional certification', 'National Qualifications Register', 'industry certification', 'Skill India certificate', 'verify certificate'],
      intro:
        'How skill and professional certifications are issued and verified in India, and how to pick ones employers value.',
      crossLink: {
        href: '/courses/certificate-program',
        anchor: 'Certificate programmes guide',
        note: 'for university and open-university certificates'
      },
      faqs: [
        {
          question: 'How do I verify a skill certificate?',
          answer: 'Look up the qualification on the National Qualifications Register (nqr.gov.in) using its code.'
        },
        {
          question: 'Who issues NSQF certificates?',
          answer: 'NCVET-recognised awarding bodies, for qualifications approved by the National Skills Qualification Committee.'
        },
        {
          question: 'Are vendor certifications useful?',
          answer: 'Often, when they come from established issuers, have proctored exams and appear in job ads for your target role.'
        }
      ]
    },
    'animation-diploma': {
      h1: 'Animation Diploma: One-Year 2D and 3D Courses, Syllabus and Careers',
      title: 'Animation Diploma 2026: 2D/3D Syllabus, Eligibility, Jobs',
      description:
        'A one-year animation diploma after Class 12: real university syllabi (2D, 3D, rigging, rendering), eligibility, and first jobs in animation and VFX.',
      keywords: ['animation diploma', 'diploma in animation', '2D 3D animation course', 'animation course after 12th', 'diploma in multimedia and animation', 'animation syllabus', 'animation jobs', 'VFX course'],
      intro:
        'A one-year diploma teaching 2D and 3D animation, modelling, rigging, lighting and rendering after Class 12.',
      crossLink: {
        href: '/courses/animation-ug',
        anchor: 'Animation (UG) course guide',
        note: 'for degree options'
      },
      faqs: [
        {
          question: 'How long is an animation diploma?',
          answer: 'Typically one year; Bharathiar University allows up to two years with re-registration.'
        },
        {
          question: 'What is the eligibility for an animation diploma?',
          answer: 'Class 12; some universities set a minimum such as 50%.'
        },
        {
          question: 'What matters most for animation jobs?',
          answer: 'Your showreel.'
        }
      ]
    },
    'architecture-diploma': {
      h1: 'Diploma in Architecture (Architectural Assistantship): 3-Year Polytechnic Course',
      title: 'Architecture Diploma 2026: 3 Years After 10th, Admission',
      description:
        'Diploma in Architecture / Architectural Assistantship is a 3-year polytechnic course after Class 10. See eligibility, syllabus, jobs and the path to B.Arch.',
      keywords: ['diploma in architecture', 'architectural assistantship', 'architecture diploma after 10th', 'D.Arch polytechnic', 'architecture diploma eligibility', 'architecture diploma jobs', 'polytechnic architecture', 'diploma to B.Arch'],
      intro:
        'A three-year, six-semester polytechnic diploma after Class 10 that trains architectural assistants and draughtspersons.',
      crossLink: {
        href: '/courses/architecture',
        anchor: 'Architecture course guide',
        note: 'to become a registered architect'
      },
      faqs: [
        {
          question: 'How long is the diploma in architecture?',
          answer: 'Three years (six semesters) after Class 10.'
        },
        {
          question: 'What marks are needed?',
          answer: 'It depends on the state; Maharashtra asks for 35% in SSC for 2026-27.'
        },
        {
          question: 'Can a diploma holder become an architect?',
          answer: 'Only after a five-year B.Arch and registration with the Council of Architecture.'
        }
      ]
    },
    'maslp': {
      h1: 'MASLP and M.Sc in Speech-Language Pathology: Eligibility, AIISH Entrance, Careers',
      title: 'MASLP 2026: Eligibility, AIISH Entrance, Seats, Careers',
      description:
        'Master’s in audiology and speech-language pathology: BASLP with 55%, AIISH entrance based on the RCI syllabus, 44 seats each in M.Sc Audiology and SLP.',
      keywords: ['MASLP', 'M.Sc Speech Language Pathology', 'M.Sc Audiology', 'AIISH entrance exam 2026', 'MASLP eligibility', 'BASLP to MASLP', 'speech therapist course', 'RCI audiology'],
      intro:
        'Two-year master’s training in audiology and speech-language pathology for BASLP graduates, regulated by the RCI.',
      crossLink: null,
      faqs: [
        {
          question: 'What is the eligibility for M.Sc SLP at AIISH?',
          answer: 'A BASLP or B.Sc (Speech and Hearing) from an RCI-approved programme with 55% average (5% relaxation for SC/ST/PwD).'
        },
        {
          question: 'How many seats does AIISH have?',
          answer: '44 each in M.Sc Audiology and M.Sc SLP for 2026-27.'
        },
        {
          question: 'What is the AIISH entrance syllabus?',
          answer: 'The RCI B.ASLP syllabus.'
        }
      ]
    },
    'aviation-pg': {
      h1: 'Aviation PG Courses: MBA in Aviation Management and Airport Operations Diplomas',
      title: 'Aviation PG Courses 2026: RGNAU MBA, Eligibility, Careers',
      description:
        'Postgraduate aviation courses: RGNAU’s two-year MBA in Aviation Management (50% graduation, age 25), PG Diploma in Airport Operations, careers.',
      keywords: ['aviation PG course', 'MBA aviation management', 'RGNAU MBA', 'PG diploma airport operations', 'aviation management eligibility', 'airport management course', 'aviation MBA India', 'RGNAU admission 2026'],
      intro:
        'Postgraduate management programmes for airlines, airports and aviation logistics, led by Rajiv Gandhi National Aviation University.',
      crossLink: {
        href: '/courses/aviation',
        anchor: 'Aviation course guide',
        note: 'for undergraduate options'
      },
      faqs: [
        {
          question: 'What is the eligibility for RGNAU’s MBA in Aviation Management?',
          answer: 'A bachelor’s degree with 50% (5% relaxation for SC/ST) and age up to 25 as on 30 June 2026.'
        },
        {
          question: 'How long is the aviation MBA?',
          answer: 'Two years, four semesters.'
        },
        {
          question: 'Does RGNAU accept CAT?',
          answer: 'Its regulations allow CAT or equivalent scores as one selection input.'
        }
      ]
    },
    'blit': {
      h1: 'B.Lit (Bachelor of Literature): Tamil and Language Degrees Explained',
      title: 'B.Lit Course 2026: Tamil Literature Degree, Eligibility, Careers',
      description:
        'B.Lit is a 3-year literature degree, best known in Tamil. See University of Madras B.Lit Tamil eligibility, what you study and careers in teaching and media.',
      keywords: ['B.Lit', 'Bachelor of Literature', 'B.Lit Tamil', 'University of Madras B.Lit', 'B.Lit eligibility', 'B.Lit vs BA', 'Tamil literature degree', 'B.Lit careers'],
      intro:
        'A three-year undergraduate degree focused on one language’s literature, most commonly Tamil.',
      crossLink: {
        href: '/courses/bachelors',
        anchor: 'Bachelor\'s degree guide',
        note: 'for how UG degrees are structured'
      },
      faqs: [
        {
          question: 'How long is B.Lit?',
          answer: 'Three years (six semesters) at the University of Madras.'
        },
        {
          question: 'Who can apply for B.Lit Tamil?',
          answer: 'Anyone who has passed +2 or an equivalent examination accepted by the University.'
        },
        {
          question: 'Is B.Lit equal to BA?',
          answer: 'Both are bachelor’s degrees; B.Lit concentrates more on literature and grammar.'
        }
      ]
    },
    'bmus': {
      h1: 'B.Mus and BA (Hons) Music: Admission, Practical Tests and Careers',
      title: 'B.Mus Course 2026: DU Music Admission, CUET, Practical Test',
      description:
        'Music degrees after Class 12: how Delhi University admits to BA (Hons) Hindustani and Karnatak Music (CUET 50% + practical 50%), what you study, careers.',
      keywords: ['B.Mus', 'Bachelor of Music', 'BA Hons Music DU', 'music degree after 12th', 'CUET music', 'music practical test', 'Hindustani music degree', 'Karnatak music degree'],
      intro:
        'Undergraduate degrees in Indian classical music (vocal and instrumental), with admission that weighs performance as much as marks.',
      crossLink: {
        href: '/courses/bpa',
        anchor: 'BPA course guide',
        note: 'for performing arts degrees'
      },
      faqs: [
        {
          question: 'How does DU admit to BA (Hons) Music?',
          answer: 'Through CUET (UG) and a practical test, with 50% weight each.'
        },
        {
          question: 'Is a practical test compulsory for music degrees?',
          answer: 'At DU, yes; most good music departments test performance.'
        },
        {
          question: 'Can I study instrumental music?',
          answer: 'Yes, where the department offers your instrument.'
        }
      ]
    },
    'bpa': {
      h1: 'BPA (Bachelor of Performing Arts): Dance, Music and Theatre Degrees',
      title: 'BPA Course 2026: Eligibility, Auditions, 3 or 4 Years, Careers',
      description:
        'BPA is a performing arts degree in dance, music or theatre. See real eligibility (40% to 60%), audition rules, 3 vs 4-year options and careers.',
      keywords: ['BPA course', 'Bachelor of Performing Arts', 'BPA dance', 'BPA music', 'BPA theatre', 'BPA eligibility', 'BPA audition', 'performing arts degree India'],
      intro:
        'An undergraduate degree in dance, music or theatre, with admission through auditions and practical training throughout.',
      crossLink: {
        href: '/courses/bmus',
        anchor: 'B.Mus course guide',
        note: 'for music degrees'
      },
      faqs: [
        {
          question: 'Is BPA three or four years?',
          answer: 'It varies; Bharati Vidyapeeth and LPU run four-year BPAs.'
        },
        {
          question: 'Is there an audition for BPA?',
          answer: 'Yes, most institutes audition applicants.'
        },
        {
          question: 'What marks are needed for BPA?',
          answer: 'From 40% (Somaiya) to 60% (LPU) in Class 12, depending on the institute.'
        }
      ]
    },
    'bpmt': {
      h1: 'B.P.M.T (Bachelor of Paramedical Technology): Maharashtra Admission and Careers',
      title: 'BPMT Course 2026: Eligibility, DMER Admission, Internship',
      description:
        'BPMT is a 3-year paramedical technology degree with a 1-year internship at Maharashtra government medical colleges. See eligibility, admission and careers.',
      keywords: ['BPMT', 'B.P.M.T', 'Bachelor of Paramedical Technology', 'BPMT admission Maharashtra', 'DMER paramedical admission', 'BPMT eligibility', 'BPMT internship', 'MUHS paramedical'],
      intro:
        'A three-year paramedical technology degree with a one-year internship, offered at Maharashtra government medical colleges under MUHS.',
      crossLink: null,
      faqs: [
        {
          question: 'How long is BPMT?',
          answer: 'Three years plus a one-year compulsory internship.'
        },
        {
          question: 'What is the eligibility for BPMT?',
          answer: 'HSC with Physics, Chemistry and Biology; Maharashtra domicile for government seats.'
        },
        {
          question: 'Who conducts BPMT admission?',
          answer: 'DMER Maharashtra, on merit.'
        }
      ]
    },
    'bva': {
      h1: 'BVA (Bachelor of Visual Arts): Four-Year Degree, Eligibility and Careers',
      title: 'BVA Course 2026: 4 Years, Eligibility, Aptitude Test, Careers',
      description:
        'BVA is a four-year visual arts degree. See eligibility at real universities (40-45% in 10+2), aptitude tests and portfolios, BVA vs BFA, and careers.',
      keywords: ['BVA course', 'Bachelor of Visual Arts', 'BVA eligibility', 'BVA vs BFA', 'BVA aptitude test', 'visual arts degree', 'BVA applied art', 'BVA careers'],
      intro:
        'A four-year undergraduate degree in painting, applied art, sculpture and related visual arts, entered through an aptitude test.',
      crossLink: {
        href: '/courses/bfa',
        anchor: 'BFA course guide',
        note: 'for the closely related degree'
      },
      faqs: [
        {
          question: 'Is BVA four years?',
          answer: 'Yes, at the universities checked; Mysore’s syllabus runs eight semesters.'
        },
        {
          question: 'What is the difference between BVA and BFA?',
          answer: 'Very little; both are four-year studio degrees leading to MVA or MFA.'
        },
        {
          question: 'Is there an entrance for BVA?',
          answer: 'Most universities hold an aptitude test, sometimes with an interview and portfolio.'
        }
      ]
    },
    'bsw': {
      h1: 'BSW (Bachelor of Social Work): Fieldwork, Eligibility, Fees and Careers',
      title: 'BSW Course 2026: Eligibility, Fieldwork, Fees, Careers',
      description:
        'BSW is a 3-year social work degree with supervised fieldwork. See IGNOU’s 96-credit structure, eligibility, fees at 15 institutes and NGO/CSR careers.',
      keywords: ['BSW course', 'Bachelor of Social Work', 'BSW eligibility', 'BSW fees', 'IGNOU BSW', 'BSW fieldwork', 'social work degree', 'BSW careers'],
      intro:
        'A three-year undergraduate degree in social work that combines classroom learning with supervised fieldwork.',
      crossLink: {
        href: '/courses/msw',
        anchor: 'MSW course guide',
        note: 'for the master’s degree'
      },
      faqs: [
        {
          question: 'How long is BSW?',
          answer: 'Three years; IGNOU allows up to six.'
        },
        {
          question: 'How much fieldwork is in BSW?',
          answer: 'At IGNOU, 24 of 96 credits are fieldwork and practicum.'
        },
        {
          question: 'What is the BSW fee?',
          answer: 'Among 15 institutes publishing annual fees, the middle value is about ₹32,500.'
        }
      ]
    },
    'bachelor-hotel-hospitality-tourism': {
      h1: 'Hotel Management Degree After 12th: NCHM JEE and B.Sc Hospitality',
      title: 'Hotel Management UG 2026: NCHM JEE Pattern, Eligibility',
      description:
        'The main hotel management degree route: NCHM JEE 2026 for the 3-year B.Sc Hospitality and Hotel Administration. Exam pattern (120 MCQs), eligibility, careers.',
      keywords: ['hotel management after 12th', 'NCHM JEE 2026', 'B.Sc Hospitality and Hotel Administration', 'IHM admission', 'NCHM JEE pattern', 'hotel management eligibility', 'hospitality degree', 'IHM counselling'],
      intro:
        'Undergraduate hotel and hospitality degrees, led by the three-year B.Sc HHA at IHMs through NCHM JEE.',
      crossLink: {
        href: '/courses/diploma-culinary-arts-patisserie',
        anchor: 'Culinary and patisserie diploma guide',
        note: 'for shorter kitchen-focused courses'
      },
      faqs: [
        {
          question: 'What is the NCHM JEE exam pattern?',
          answer: '120 MCQs: English 45, Service Sector Aptitude 30, and 15 each in numerical, reasoning and GK; +4 correct, -1 wrong.'
        },
        {
          question: 'Is there an age limit for NCHM JEE?',
          answer: 'No.'
        },
        {
          question: 'How long is the B.Sc HHA?',
          answer: 'Three years, six semesters.'
        }
      ]
    },
    'beauty': {
      h1: 'Beauty and Wellness Courses: NSQF Qualifications, B.Voc and Careers',
      title: 'Beauty Courses 2026: NSQF Beauty Therapist, B.Voc, Careers',
      description:
        'Beauty and wellness training explained: B&WSSC Beauty Therapist (NSQF 4, 510 hours), Cosmetologist (870 hours), the 3-year B.Voc and salon careers.',
      keywords: ['beauty course', 'beauty and wellness course', 'beauty therapist course', 'cosmetology course', 'B.Voc beauty and wellness', 'NSQF beauty', 'B&WSSC', 'salon career'],
      intro:
        'Skill qualifications and degrees in beauty and wellness, from NSQF job-role courses to a three-year B.Voc.',
      crossLink: {
        href: '/courses/certification',
        anchor: 'Certification guide',
        note: 'for how NSQF certificates are verified'
      },
      faqs: [
        {
          question: 'How long is a beauty therapist course?',
          answer: 'The B&WSSC Beauty Therapist qualification is 510 hours (minimum 450).'
        },
        {
          question: 'What NSQF level is a beauty therapist?',
          answer: 'Level 4.'
        },
        {
          question: 'Is there a degree in beauty?',
          answer: 'Yes, a three-year B.Voc in Beauty and Wellness at some colleges.'
        }
      ]
    },
    'dped': {
      h1: 'D.P.Ed (Diploma in Physical Education): NCTE Rules, Admission and Jobs',
      title: 'D.P.Ed Course 2026: NCTE Eligibility 50%, 2 Years, Jobs',
      description:
        'D.P.Ed is a 2-year NCTE-recognised diploma for school PE teachers. See eligibility (50% in Class 12), admission tests, structure and careers.',
      keywords: ['D.P.Ed', 'Diploma in Physical Education', 'D.P.Ed eligibility', 'D.P.Ed admission', 'NCTE D.P.Ed', 'PE teacher course', 'D.P.Ed vs B.P.Ed', 'physical education diploma'],
      intro:
        'A two-year, NCTE-regulated diploma that trains physical education teachers for schools, after Class 12.',
      crossLink: {
        href: '/courses/bped',
        anchor: 'B.P.Ed course guide',
        note: 'for the graduate-level PE qualification'
      },
      faqs: [
        {
          question: 'What is the eligibility for D.P.Ed?',
          answer: 'At least 50% in Class 12, with relaxation for reserved categories as per rules.'
        },
        {
          question: 'How long is D.P.Ed?',
          answer: 'Two academic years (four semesters), to be completed within three years.'
        },
        {
          question: 'Is there an entrance test for D.P.Ed?',
          answer: 'It depends on the State; GJUST uses sports proficiency and fitness tests plus marks.'
        }
      ]
    },
    'diploma-hotel-hospitality': {
      h1: 'International Hotel & Hospitality Diploma: What It Is, How to Check',
      title: 'International Hotel & Hospitality Diploma: Is It Recognised?',
      description:
        'What an \'international\' hotel and hospitality diploma is, who awards it, how to verify it, and how it compares with NCHMCT diplomas and BHM.',
      keywords: ['international diploma in hotel management', 'international diploma in hospitality management', 'is international hotel management diploma valid', 'short term hotel management course', 'hospitality diploma recognition India'],
      intro:
        '“International” hospitality diplomas are short private courses whose value depends on who awards them. Check the awarding body and compare with NCHMCT, NSQF and degree routes before you pay.',
      crossLink: {
        href: '/hotel-management-diploma-colleges',
        anchor: 'Compare hotel management diploma colleges',
        note: 'Want a recognised diploma instead? Browse colleges offering hotel management diplomas and check each one’s NCHMCT affiliation or AICTE approval.'
      },
      faqs: [
        {
          question: 'Is an international diploma in hotel management recognised in India?',
          answer: 'Not automatically. No Indian regulator defines this course name, so its standing depends on the awarding body. NCHMCT diplomas and NCVET-approved NSQF qualifications have national standing; a foreign or in-house certificate needs separate checking.'
        },
        {
          question: 'How do I check if a hospitality diploma is genuine?',
          answer: 'Ask for the awarding body’s legal name and the qualification code, then search the relevant register: NCHMCT’s institute list, AICTE’s approved-institutes dashboard, NCVET’s awarding-bodies list, or the foreign regulator’s register, such as Ofqual’s for England.'
        },
        {
          question: 'Are foreign-university hospitality programmes run through Indian centres valid?',
          answer: 'UGC’s December 2023 notice says foreign institutions need its prior approval to offer programmes in India and that programmes run under franchise arrangements, including EdTech tie-ups, are not recognised by UGC.'
        },
        {
          question: 'How long is an international hotel and hospitality diploma?',
          answer: 'Our course record lists 6 months, but each provider sets its own length. For comparison, NCHMCT trade diplomas take 1½ years including 24 weeks in a hotel.'
        },
        {
          question: 'Is there a recognised short course in hospitality?',
          answer: 'Yes. The Tourism and Hospitality Skill Council, an NCVET-recognised awarding body, offers NSQF qualifications such as Front Office Assistant (300 notional hours) and Food and Beverage Service Assistant (330 hours). NCHMCT also runs a 24-week craft course in F&B Service after Class 10.'
        },
        {
          question: 'Should I choose an international diploma or an IHM diploma?',
          answer: 'An NCHMCT diploma at an IHM is a recognised trade qualification costing ₹58,200–₹78,700 in total for 2026-27 entry. A short private diploma can work if the awarding body checks out and the course includes real hotel training.'
        }
      ]
    },
    'civil-engineering': {
      h1: 'Civil Engineering Course in India: Diploma, B.Tech, M.Tech & GATE CE',
      title: 'Civil Engineering Course: Diploma, B.Tech, M.Tech & GATE',
      description:
        'Civil engineering routes in India: diploma, B.Tech or M.Tech, PCM eligibility, subjects, GATE CE 2026 numbers, fees (B.Tech median ₹86,400) and jobs.',
      keywords: ['civil engineering course', 'civil engineering eligibility', 'diploma in civil engineering', 'btech civil engineering', 'civil engineering subjects', 'gate civil engineering', 'civil engineering government jobs'],
      intro:
        'Civil engineering can be studied as a 3-year diploma after Class 10, a 4-year B.Tech/B.E. after Class 12 with PCM, or a 2-year M.Tech after the degree. Compare eligibility, subjects, GATE CE, fees and career routes.',
      crossLink: {
        href: '/engineering-colleges',
        anchor: 'Compare engineering colleges offering Civil',
        note: 'Ready to shortlist? Browse engineering colleges with recorded fees and accepted exams, and check that the Civil programme itself is AICTE-approved and NBA-accredited.'
      },
      faqs: [
        {
          question: 'What is the eligibility for B.Tech in Civil Engineering?',
          answer: 'Under AICTE rules you need Class 12 with Physics, Chemistry and Mathematics, all compulsory for Civil, and at least 45% in those subjects (40% for reserved categories). IITs, NITs and IIITs also need 75% in Class 12 (65% for SC, ST, PwD) or a top-20-percentile board rank.'
        },
        {
          question: 'Can I do civil engineering after Class 10?',
          answer: 'Yes, through a 3-year diploma in civil engineering at a polytechnic. AICTE\'s minimum is a pass in Class 10, and states run their own admission. With 45% in the diploma you can later join B.Tech/B.E. in the second year.'
        },
        {
          question: 'How long is a civil engineering course?',
          answer: 'A diploma takes 3 years (2 for year-2 entry after 10+2 or ITI), a B.Tech/B.E. 4 years (3 for lateral entry) and an M.Tech/M.E. 2 years. A few universities offer a 5-year dual B.Tech + M.Tech.'
        },
        {
          question: 'Which entrance exams are used for civil engineering?',
          answer: 'Civil has no separate test at degree level. You take JEE Main, JEE Advanced, a state test such as MHT CET, KCET, WBJEE, KEAM or TNEA, or a university test, and choose Civil at counselling. M.Tech admission mainly uses GATE CE.'
        },
        {
          question: 'How many students take GATE Civil Engineering?',
          answer: 'In GATE 2026, 97,486 candidates registered for the CE paper, 76,385 appeared and 13,949 qualified. The qualifying mark was 28.7 out of 100 for General, 25.8 for OBC-NCL/EWS and 19.1 for SC/ST/PwD.'
        },
        {
          question: 'What is the fee for B.Tech Civil Engineering?',
          answer: 'Across 470 annual fee records for B.Tech/B.E. Civil in our database, the median is ₹86,400 a year and half charge ₹58,500–₹1,28,100. The public median is ₹70,000 and the private median ₹87,500. Fee years are not stored.'
        },
        {
          question: 'Which government jobs can civil engineers apply for?',
          answer: 'Diploma holders can apply for Junior Engineer (Civil) posts through SSC JE and state recruitment, subject to each post\'s rules. Degree holders can take UPSC Engineering Services (Category I, Civil) and PSU recruitment that uses GATE CE scores.'
        },
        {
          question: 'Do civil engineers need a licence in India?',
          answer: 'There is no single national exam listed in the sources we checked. The Institution of Engineers (India) offers a voluntary Chartered Engineer (India) title to corporate members, and some city authorities register engineers who sign building plans; check local rules.'
        }
      ]
    },
    pharmacy: {
      h1: 'Pharmacy Courses in India: D.Pharm vs B.Pharm vs Pharm.D vs M.Pharm',
      title: 'Pharmacy Courses in India: D.Pharm vs B.Pharm vs Pharm.D',
      description:
        'Compare the 5 PCI-approved pharmacy courses: duration, eligibility, which ones allow pharmacist registration, Pharm.D rules, fees and how to choose.',
      keywords: ['pharmacy courses in india', 'pharmacy course', 'd pharm vs b pharm', 'pharm d course', 'pharmacy course after 12th', 'pharmacist registration', 'pci approved pharmacy courses'],
      intro:
        'PCI approves five pharmacy courses: D.Pharm, B.Pharm, Pharm.D, B.Pharm (Practice) and M.Pharm. Only D.Pharm, B.Pharm and Pharm.D from a PCI-approved institution lead to pharmacist registration. Compare them and choose by goal.',
      crossLink: {
        href: '/bpharm-colleges',
        anchor: 'Compare B.Pharm colleges by fees & exams',
        note: 'Ready to shortlist? Browse pharmacy colleges with recorded fees and accepted exams, and check each institution\'s PCI approval under section 12 for your admission year.'
      },
      faqs: [
        {
          question: 'Which pharmacy courses are approved by PCI?',
          answer: 'PCI lists five: D.Pharm (2 years after 10+2), B.Pharm (4 years after 10+2), B.Pharm (Practice) (2 years after D.Pharm), Pharm.D (6 years after 10+2) and M.Pharm (2 years after B.Pharm).'
        },
        {
          question: 'Which pharmacy courses let me register as a pharmacist?',
          answer: 'D.Pharm, B.Pharm and Pharm.D from an institution approved by PCI under section 12 of the Pharmacy Act. Registration is done by your State Pharmacy Council, and you must be at least 18. B.Pharm (Honours) and B.Pharm + MBA do not qualify.'
        },
        {
          question: 'Should I choose D.Pharm or B.Pharm after 12th?',
          answer: 'Choose D.Pharm if you want to work as a pharmacist soon; it takes 2 years plus 500 hours of training. Choose B.Pharm for industry, quality or regulatory roles and M.Pharm later. D.Pharm holders can join B.Pharm in the third semester.'
        },
        {
          question: 'What is Pharm.D and how long is it?',
          answer: 'Pharm.D (Doctor of Pharmacy) is a 6-year clinical pharmacy course after 10+2 or D.Pharm: five years of study with hospital postings, then a one-year internship. PCI caps intake at 30 per programme. You must be 17 by 31 December of the admission year.'
        },
        {
          question: 'Can I do Pharm.D after B.Pharm?',
          answer: 'Yes. B.Pharm graduates from a PCI section 12 institution can join Pharm.D (Post Baccalaureate), entering the fourth year and finishing in three years: two years of study and one year of internship. Intake is capped at 10.'
        },
        {
          question: 'Is there an exit exam for D.Pharm?',
          answer: 'PCI notified Diploma in Pharmacy Exit Examination Regulations in 2022. As of 12 October 2026, State Pharmacy Councils are registering D.Pharm passouts under a PCI circular of 20 February 2026. Check your State Council\'s current rules.'
        },
        {
          question: 'What are the fees for pharmacy courses?',
          answer: 'In our records the median annual fee is ₹78,500 for D.Pharm (59 records), ₹95,000 for B.Pharm (157) and ₹1,21,050 for M.Pharm (252). Pharm.D has too few records for a reliable figure. PCI does not regulate fees.'
        },
        {
          question: 'Is B.Pharm (Honours) valid for pharmacist registration?',
          answer: 'No. PCI\'s FAQs list B.Pharm (Honours), integrated B.Pharm + MBA, M.Sc Pharmaceutical Chemistry and M.Sc Quality Assurance as not approved for registration as a pharmacist.'
        }
      ]
    },
    aviation: {
      h1: 'Aviation Courses After 12th: Degrees vs DGCA Pilot and AME Licences',
      title: 'Aviation Course After 12th: Degree vs DGCA Licence',
      description:
        'B.Sc and BBA Aviation vs DGCA CPL and AME licences: eligibility, RGNAU and IGRUA 2026 rules, official fees, medicals and how to choose.',
      keywords: ['aviation course after 12th', 'B.Sc aviation', 'BBA aviation', 'aviation degree vs CPL', 'commercial pilot licence eligibility', 'AME licence CAR-66', 'aviation course fees'],
      intro:
        'An aviation degree and a DGCA licence are different things. See what B.Sc and BBA Aviation offer, what the CPL and AME licence require, and what official 2026 fees look like.',
      crossLink: {
        href: '/aviation-colleges',
        anchor: 'Compare aviation colleges by fees and courses',
        note: 'Shortlisting? Check whether each programme ends in a university degree, a DGCA licence or only a certificate before you apply.'
      },
      faqs: [
        {
          question: 'Does a B.Sc Aviation make me a pilot?',
          answer: 'No. A university awards the degree, but only the DGCA issues the Commercial Pilot Licence, after you meet the age, 10+2 Physics and Maths, medical, exam and 200-hour flying requirements. Some institutes such as IGRUA let cadets take a B.Sc alongside CPL training.'
        },
        {
          question: 'What is the eligibility for B.Sc Aviation after 12th?',
          answer: 'It varies by university. For 2026-27, RGNAU asked for 10+2 with Physics, Chemistry, Mathematics and English, 50% aggregate (45% for SC/ST), a maximum age of 21 on 31 July 2026 and a CUET-UG score.'
        },
        {
          question: 'Can a commerce or arts student become a pilot?',
          answer: 'Under current DGCA rules you need 10+2 with Physics and Mathematics for a CPL, so you would have to pass both subjects through a recognised board. A 2025 proposal would remove this condition, but the DGCA exam portal still listed it on 12 October 2026.'
        },
        {
          question: 'Which medical do I need for pilot training?',
          answer: 'IGRUA asks for a Class 2 medical before joining and a Class 1 medical for the CPL itself. Clear the Class 1 medical at a DGCA-approved centre before paying large training fees.'
        },
        {
          question: 'How much does pilot training cost in India?',
          answer: 'IGRUA\'s 2026 notice lists a CPL training fee of ₹55,00,000 for about 36 months, plus hostel and mess of about ₹15,000 a month. Optional type rating costs ₹17–19 lakh more. Private school fees differ.'
        },
        {
          question: 'What is the difference between an AME licence and an AME degree?',
          answer: 'The DGCA issues the AME licence under CAR-66 after module exams and practical experience. For B1.1 or B2 you need five years of experience, three with a degree in aircraft maintenance or engineering, or two after a DGCA-approved CAR-147 course.'
        },
        {
          question: 'What is the fee for BBA Aviation?',
          answer: 'Across 23 annual fee records for BBA programmes with aviation, airline or airport in the name in our database, the median is ₹1,30,000 a year and the middle half ₹90,000–₹1,46,333. RGNAU\'s B.Sc (Aviation) academic fee is ₹4,47,500 for six semesters.'
        },
        {
          question: 'What jobs can I get after an aviation degree?',
          answer: 'Graduates can apply for airline operations, airport management, cargo, ground services and aviation safety roles, or take an MBA in aviation. Flying and maintenance-certifying jobs need a DGCA licence. No course guarantees a job.'
        }
      ]
    },
    'diploma-aviation': {
      h1: 'Aviation Diploma Courses: AME, Airport Ground Staff and Cabin Crew',
      title: 'Aviation Diploma: AME, Ground Staff & Cabin Crew',
      description:
        'Aviation diplomas compared: DGCA CAR-147 AME courses, airport and ground-handling diplomas, cabin crew rules, course hours and official fees.',
      keywords: ['aviation diploma courses', 'AME course after 12th', 'DGCA approved AME institutes', 'airport ground staff course', 'cabin crew course eligibility', 'diploma in airport management', 'CAR-147 AME course duration'],
      intro:
        'Aviation diplomas range from DGCA-approved AME training to one-year airport and cabin crew courses. See who regulates each, how long they run, what DGCA requires and what official fees look like.',
      crossLink: {
        href: '/courses/aviation',
        anchor: 'Aviation degrees vs DGCA pilot and AME licences',
        note: 'Weighing a diploma against a three-year B.Sc or BBA Aviation, or pilot training? Compare the degree and licence routes first.'
      },
      faqs: [
        {
          question: 'Is an AME course the same as an AME licence?',
          answer: 'No. A DGCA-approved CAR-147 organisation issues a certificate of recognition when you finish the course. The DGCA AME licence under CAR-66 comes later, after you pass the module exams and complete practical experience, which is two years for B1.1 or B2 after a CAR-147 course.'
        },
        {
          question: 'What is the eligibility for an AME course?',
          answer: 'For the DGCA AME licence, CAR-66 requires 10+2 with Physics, Chemistry and Maths or a recognised engineering diploma, and a minimum age of 18. Institutes set their own admission rules; IGRUA\'s 2026 notice asked for Maths and Physics at 50% (45% reserved) and a minimum age of 17 at admission.'
        },
        {
          question: 'How long is an AME course?',
          answer: 'DGCA CAR-147 sets hours, not years: at least 2,400 hours for B1.1, B1.3, B1.4 and B2, 2,000 for B1.2, 1,000 for B3, and 800 or 650 for category A. Organisations spread these hours differently; IGRUA runs its B1.2 course over three years.'
        },
        {
          question: 'How do I check if an AME institute is DGCA approved?',
          answer: 'DGCA publishes a list of approved and accepted CAR-147 training organisations on its website. Check that the institute is on it, that the approval is current and that it covers the licence category you want.'
        },
        {
          question: 'Do I need a diploma to become cabin crew?',
          answer: 'DGCA does not require a private diploma. Its cabin crew rules set minimums of age 18, 10+2 and DGCA medical fitness, and require every cabin crew member to complete the airline\'s DGCA-approved initial training before flying, plus recurrent training every year.'
        },
        {
          question: 'How often do cabin crew need a medical check?',
          answer: 'DGCA\'s cabin crew medical CAR prescribes an examination equivalent to Class 2, repeated every four years up to age 40, every two years up to age 50 and every year after that.'
        },
        {
          question: 'What do airport ground staff courses cover?',
          answer: 'Passenger handling, ramp and baggage, cargo, reservations and airport security awareness. The Aerospace and Aviation Sector Skill Council defines these job roles at NSQF levels 3 and 4 with 300 to 600 training hours. No DGCA licence is needed for these roles.'
        },
        {
          question: 'What is the fee for an AME course?',
          answer: 'IGRUA\'s 2026 notice for its integrated AME and B.Sc programme lists a training fee of ₹6,57,500 for three years, plus boarding and lodging of about ₹10,000 a month. Private institutes set their own fees; get a written schedule before paying.'
        }
      ]
    },
    'travel-tourism-ug': {
      h1: 'Travel and Tourism Degree After 12th: BBA, BA and BTTM Compared',
      title: 'Travel and Tourism Degree: BBA, BA, BTTM Guide',
      description:
        'BBA, BA and BTTM in travel and tourism compared: duration, IITTM 2026-29 admission, course structure, official fees and how to choose.',
      keywords: ['travel and tourism course after 12th', 'BBA tourism and travel', 'BTTM course', 'BA tourism', 'IITTM BBA admission', 'tourism degree fees', 'bachelor of tourism and travel management'],
      intro:
        'Tourism degrees come as BBA, BA or BTTM, usually over three years and sometimes four. Compare what each covers, how IITTM admits BBA students and what official fees look like.',
      crossLink: {
        href: '/courses/diploma-travel',
        anchor: 'Travel and tourism diplomas',
        note: 'Want a shorter, job-focused course instead of a three-year degree? Compare one-year travel and tourism diplomas.'
      },
      faqs: [
        {
          question: 'How many years is a travel and tourism degree?',
          answer: 'Usually three years, and four at some universities. Under the UGC undergraduate framework, a three-year bachelor\'s needs 120 credits and a four-year honours degree 160; leaving after two years earns an undergraduate diploma, not a degree.'
        },
        {
          question: 'What is the difference between BBA, BA and BTTM in tourism?',
          answer: 'A BBA in Tourism and Travel applies management subjects to tourism, a BA treats tourism as an arts subject, and BTTM or Bachelor of Tourism and Travel is a professional title whose content and length vary by university. Compare semester subjects rather than the name.'
        },
        {
          question: 'What is the eligibility for IITTM BBA (Tourism & Travel)?',
          answer: 'The 2026-29 bulletin asks for 10+2 or equivalent in any stream, with Class 12 students allowed to apply if they submit results by 30 September. Admission uses a CUET-UG score or the IITTM Admission Test (70%) plus counselling, group discussion and interview (30%).'
        },
        {
          question: 'How many seats does IITTM have for BBA?',
          answer: 'The 2026-29 bulletin lists 375 seats: 112 at Gwalior, 113 at Noida, 60 each at Bhubaneswar and Nellore, and 30 at the Goa centre. The degree is awarded by JNU.'
        },
        {
          question: 'What is the fee for IITTM BBA (Tourism & Travel)?',
          answer: '₹3,06,500 in academic fees for six semesters in 2026-29, paid semester by semester (₹1,19,100 in the first year). Hostel, mess and programme-related fees are charged separately.'
        },
        {
          question: 'Can I study tourism through distance learning?',
          answer: 'Yes. IGNOU\'s Bachelor of Arts (Tourism Studies) is a 96-credit degree open to anyone with 10+2, taking three to six years. IGNOU lists the fee as ₹4,900 a year plus registration and development fees.'
        },
        {
          question: 'What does a tourism degree cost at private colleges?',
          answer: 'Across 25 annual fee records for tourism bachelor\'s programmes in our database, mostly private, the median is ₹1,05,000 a year and the middle half ₹75,000–₹1,70,000. The fee year is not stored, so confirm with each college.'
        },
        {
          question: 'What can I do after a tourism degree?',
          answer: 'Graduates often look for work with travel agencies, tour operators, airline and ticketing offices, hotels and events firms, or go on to an MBA in tourism. No degree guarantees a job; ask colleges for verified outcomes by year.'
        }
      ]
    },
    'master-of-science': {
      h1: 'Which M.Sc Subject Should You Choose? Subjects Compared',
      title: 'Which M.Sc Subject to Choose: Eligibility, Exams, Seats',
      description:
        'Compare M.Sc subjects: B.Sc rules for each, JAM 2027 IIT seats by paper, CUET PG codes, integrated M.Sc options and the next exam after M.Sc.',
      keywords: ['which msc subject is best', 'msc subjects list', 'msc subject eligibility', 'msc after bsc', 'integrated msc', 'iit jam seats by subject', 'msc entrance exam by subject'],
      intro:
        'Your B.Sc subjects decide which M.Sc you can apply for. Compare subject rules, entrance papers, IIT seats and next-step exams before you choose.',
      crossLink: {
        href: '/msc-colleges',
        anchor: 'Compare M.Sc colleges by fees & exams',
        note: 'Picked a subject? Shortlist M.Sc colleges and check each programme\'s subject rules and entrance test.'
      },
      faqs: [
        {
          question: 'Can I do an M.Sc in a different subject from my B.Sc?',
          answer: 'Yes, in some cases. UGC\'s 2024 PG framework makes you eligible in your B.Sc major or minor, and in any subject whose national or university entrance test you qualify. Each university still sets its own subject rules, so check the programme\'s eligibility.'
        },
        {
          question: 'Which M.Sc subjects have the most IIT seats?',
          answer: 'By our count of the JAM 2027 seat matrix, Physics has about 1,005 IIT seats, Chemistry about 902 and Mathematics about 750. Geology has about 213, Mathematical Statistics about 143, Biotechnology about 115 and Economics about 52.'
        },
        {
          question: 'What does my B.Sc need for an IIT M.Sc in Chemistry or Physics?',
          answer: 'Most IITs ask for Chemistry for three years for M.Sc Chemistry, some with Mathematics for one year. For M.Sc Physics most ask for Physics for two years and Mathematics for one year. Rules differ by IIT; see Annexure II of the JAM 2027 brochure.'
        },
        {
          question: 'Which CUET PG paper code do I need for my M.Sc subject?',
          answer: 'In the 2026 list, Physics was SCQP24, Chemistry SCQP08, Mathematics SCQP19, Statistics SCQP27, Life Science SCQP17, Botany SCQP07, Zoology SCQP28, Geology SCQP14 and Computer Science SCQP09. Each university decides which code a programme accepts.'
        },
        {
          question: 'Is there a separate entrance test for M.Sc Biotechnology?',
          answer: 'Yes. GAT-B, run by NTA, is used for DBT-supported M.Sc Biotechnology and allied programmes. In 2026 it was held on 17 May, and DBT paid admitted M.Sc Biotechnology students a stipend of ₹5,000 a month.'
        },
        {
          question: 'Can I do an integrated M.Sc after Class 12?',
          answer: 'Yes. NEST admits to five-year integrated M.Sc programmes at NISER Bhubaneswar and UM-DAE CEBS Mumbai, and the IISER Aptitude Test admits to IISER BS-MS. Both need at least three of Biology, Chemistry, Mathematics and Physics in Class 12.'
        },
        {
          question: 'Which exam comes after an M.Sc for a PhD or fellowship?',
          answer: 'The Joint CSIR-UGC NET has five science subjects (codes 701 to 705) and needs a master\'s with 55% (50% for reserved categories). GATE has papers in Physics, Chemistry, Mathematics, Statistics, Life Sciences, Biotechnology and Geology.'
        },
        {
          question: 'Is a one-year M.Sc available?',
          answer: 'Only if you finished a four-year honours or honours-with-research degree, and only at universities that offer it. UGC\'s 2024 framework allows a one-year PG of 40 credits but does not require universities to run one.'
        }
      ]
    },
    'finance-and-accounting': {
      h1: 'Master of Finance and Accounting: M.Com (FA) Guide',
      title: 'Master of Finance and Accounting: Eligibility, Syllabus',
      description:
        'Master of Finance and Accounting (M.Com Financial Analysis): eligibility, BCU admission, semester papers and how it compares with M.Com, MBA, CA and CMA.',
      keywords: ['master of finance and accounting', 'mfa finance and accounting', 'm.com financial analysis', 'm.com finance and accounting', 'mfa course eligibility bangalore', 'm.com financial analysis syllabus'],
      intro:
        'MFA here means Master of Finance and Accounting, a two-year commerce PG now run as M.Com (Financial Analysis). Check eligibility, admission steps and papers.',
      crossLink: {
        href: '/mcom-colleges',
        anchor: 'Compare M.Com colleges by fees & admission',
        note: 'Shortlisting? Compare M.Com colleges and confirm each one offers the finance and accounting specialisation.'
      },
      faqs: [
        {
          question: 'What is the full form of MFA in commerce?',
          answer: 'In commerce, MFA stands for Master of Finance and Accounting. Bengaluru City University now runs it as M.Com (Financial Analysis). It is unrelated to the Master of Fine Arts, which is an art degree for BFA graduates.'
        },
        {
          question: 'What is the eligibility for M.Com (Financial Analysis) at BCU?',
          answer: 'A B.Com, BBA or BMS degree with at least 50% aggregate in all years. SC, ST, Category-1 and PwD candidates get a 5% relaxation, so they need 45%.'
        },
        {
          question: 'Is there an entrance exam for M.Com (Financial Analysis) at BCU?',
          answer: 'BCU did not name an entrance test for 2026-27. Admission was merit-cum-reservation under state policy, with applications on the UUCMS portal, separate merit lists and counselling on 25 August 2026.'
        },
        {
          question: 'How long is a master\'s in finance and accounting?',
          answer: 'Two years, in four semesters, at both Bengaluru City University and Bharathiar University. BCU\'s semesters I, III and IV each carry 26 credits; Bharathiar\'s course totals 90 credits.'
        },
        {
          question: 'What subjects are taught in M.Com (Financial Analysis)?',
          answer: 'At BCU: financial statement analysis, corporate finance, corporate tax planning, mergers and acquisitions, forensic accounting and audit, portfolio management, financial analytics, derivatives and risk management, and debt markets, plus a dissertation.'
        },
        {
          question: 'How is M.Com (Finance & Accounting) different from a general M.Com?',
          answer: 'It spends most of the course on finance, accounting and tax instead of a broad commerce mix. Papers differ by university, so compare the course matrix of each programme before you apply.'
        },
        {
          question: 'Should I choose an M.Com in finance and accounting, an MBA, CA or CMA?',
          answer: 'Choose the M.Com for a university degree focused on finance, an MBA for a broader management degree, and CA or CMA for a professional qualification. Graduates enter CA and CMA at Intermediate level.'
        },
        {
          question: 'Can I prepare for CA while doing M.Com (Financial Analysis)?',
          answer: 'Some students do, but check the attendance rules first. BCU requires 75% attendance in each course and its regulations do not allow condonation.'
        }
      ]
    }
  };
  const pack = curated[slug];
  if (pack) return { displayName, ...pack };

  // Light uniqueness for a few other high-traffic slugs when easy
  const highValue: Record<string, Partial<CourseSeoPack>> = {
    mbbs: {
      h1: 'MBBS in India: NEET, Fees, Colleges & Careers',
      title: 'MBBS in India: NEET, Fees, Colleges & Careers',
      description: 'MBBS admission via NEET: eligibility, fees, college types and career pathways in India.' + fees,
      keywords: ['MBBS course', 'NEET for MBBS', 'MBBS fees in India', 'MBBS colleges', 'careers after MBBS']
    }
  };

  const extra = highValue[slug];
  const h1 = extra?.h1 || `${displayName} in India: Fees, Admissions, Placements & Careers`;
  const title = extra?.title || `${displayName} in India: Fees, Admissions, Placements & Careers`;
  const description =
    extra?.description ||
    `Explore ${displayName} in India: fees, eligibility, admission exams, placements, rankings and reviews before you shortlist.` + fees;
  const keywords = extra?.keywords || [
    `${displayName} course`,
    `${displayName} syllabus`,
    `${displayName} fees`,
    `${displayName} admission`,
    `jobs after ${displayName}`
  ];

  return {
    displayName,
    h1,
    title,
    description,
    keywords,
    intro: `Review fees, eligibility, admission routes, placements and student evidence for ${displayName} before making your shortlist.` + examBit,
    crossLink: null
  };
}
