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
  if (slug === 'btech') return 'B.Tech (Bachelor of Technology)';
  if (slug === 'engineering') return 'B.Tech / B.E. (Engineering Degrees)';
  if (slug === 'mba') return dbName || 'MBA / PGDM';
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
      h1: 'MBA After Graduation: Fees, Exams & Careers',
      title: 'MBA After Graduation: Fees, Exams & Careers 2026',
      description:
        'Planning an MBA after graduation? Compare CAT and other exams, fees, cutoff, admission steps, specializations and career options in India for 2026.' +
        fees,
      keywords: [
        'MBA after graduation',
        'MBA entrance exams',
        'CAT cutoff for MBA',
        'MBA fees in India',
        'jobs after MBA',
        'MBA specializations'
      ],
      intro:
        'Compare MBA/PGDM fees, entrance exams, placements and specialisations before you shortlist institutes in India.' +
        examBit,
      crossLink: null
    };
  }

  if (slug === 'engineering') {
    return {
      displayName,
      h1: 'B.Tech / B.E. Engineering Degrees in India: Branches, Exams & Fees',
      title: 'B.Tech / B.E. Engineering in India: Branches, Exams, Fees & Careers',
      description:
        'Explore engineering degrees in India (B.Tech and B.E.): branches, state counselling vs national exams, fees, placements and how to shortlist colleges.' +
        fees,
      keywords: [
        'engineering courses in India',
        'B.Tech vs B.E.',
        'engineering entrance exams',
        'engineering college fees',
        'B.Tech branches',
        'engineering counselling'
      ],
      intro:
        'This umbrella guide covers B.Tech and B.E. engineering pathways in India — branches, admission exams/counselling, fees and placements — so you can compare options before picking a degree focus.' +
        examBit,
      crossLink: {
        href: '/courses/btech',
        anchor: 'B.Tech (Bachelor of Technology) degree guide',
        note: 'Looking for Bachelor of Technology programme details specifically? See the focused B.Tech degree guide.'
      }
    };
  }

  if (slug === 'btech') {
    return {
      displayName,
      h1: 'B.Tech (Bachelor of Technology): Fees, Eligibility, Exams & Careers',
      title: 'B.Tech Course in India: Fees, Eligibility, Exams & Careers',
      description:
        'Bachelor of Technology (B.Tech) course details in India: eligibility, entrance exams, fees, specialisations, placements and careers.' +
        fees,
      keywords: [
        'B.Tech course',
        'Bachelor of Technology',
        'B.Tech fees in India',
        'B.Tech eligibility',
        'B.Tech entrance exams',
        'jobs after B.Tech'
      ],
      intro:
        'Focus on the Bachelor of Technology (B.Tech) degree: eligibility, entrance routes, fees, specialisations and career outcomes for programme-level decisions.' +
        examBit,
      crossLink: {
        href: '/courses/engineering',
        anchor: 'B.Tech / B.E. engineering degrees overview',
        note: 'Comparing B.Tech with B.E. or broader engineering counselling context? See the umbrella engineering degrees guide.'
      }
    };
  }

  // Light uniqueness for a few other high-traffic slugs when easy
  const highValue: Record<string, Partial<CourseSeoPack>> = {
    mtech: {
      h1: 'M.Tech / M.E. in India: GATE, Fees & Specialisations',
      title: 'M.Tech / M.E. in India: GATE, Fees, Specialisations & Careers',
      description: 'Compare M.Tech and M.E. programmes in India: GATE and other routes, fees, specialisations and placements.' + fees,
      keywords: ['M.Tech course', 'M.E. course', 'GATE for M.Tech', 'M.Tech fees', 'M.Tech specialisations']
    },
    mbbs: {
      h1: 'MBBS in India: NEET, Fees, Colleges & Careers',
      title: 'MBBS in India: NEET, Fees, Colleges & Careers',
      description: 'MBBS admission via NEET: eligibility, fees, college types and career pathways in India.' + fees,
      keywords: ['MBBS course', 'NEET for MBBS', 'MBBS fees in India', 'MBBS colleges', 'careers after MBBS']
    },
    bba: {
      h1: 'BBA in India: Fees, Entrance Exams & Careers',
      title: 'BBA in India: Fees, Entrance Exams, Colleges & Careers',
      description: 'Bachelor of Business Administration (BBA): fees, entrance routes, specialisations and career options.' + fees,
      keywords: ['BBA course', 'BBA fees', 'BBA entrance exams', 'BBA colleges', 'jobs after BBA']
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
