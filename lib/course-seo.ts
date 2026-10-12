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
