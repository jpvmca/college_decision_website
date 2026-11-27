// SEO <title> length control (target 40–60 characters incl. spaces).
// The root layout appends " | College Decision" through title.template; that pushes most
// profile/article titles past 60. fitSeoTitle() keeps the brand only when the whole title
// still fits, otherwise drops it, and as a last resort applies safe phrase shortenings
// (one at a time, only while still too long). It returns { absolute } so the template is skipped.

export const SEO_TITLE_MAX = 60;
const BRAND = ' | College Decision';

const decode = (value: string) => value
  .replace(/&amp;/g, '&').replace(/&rsquo;/g, '’').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();

export function stripBrand(value: string | null | undefined): string {
  return decode(String(value || '')).replace(/\s*\|\s*College\s?Decision\s*$/i, '').trim();
}

// Ordered, applied one by one only while the title is longer than SEO_TITLE_MAX.
const SHORTENINGS: Array<[RegExp, string]> = [
  [/\bMBA \/ PGDM\b/g, 'MBA'],
  [/\bB\.Tech \/ B\.E\./g, 'B.Tech'],
  [/\bM\.Tech \/ M\.E\./g, 'M.Tech'],
  [/\bBBA \/ BBM \/ BBS\b/g, 'BBA'],
  [/\bMCA \/ MCM\b/g, 'MCA'],
  [/: Courses, Eligibility and Admission Process$/, ': Eligibility & Admission'],
  [/\bMaharashtra MBA Common Entrance Test\b/, 'MAH MBA CET'],
  [/ Where Average Package Exceeds Fees (20\d\d)$/, ' $1: Avg Package Above Fees'],
  [/ with (\d+) Lakh Highest Package (20\d\d)$/, ' $2: ₹$1L+ Highest Package'],
  [/ by Average Package$/, ' by Avg Package'],
  [/ Under ₹(\d+) Lakh Fees$/, ' Under ₹$1L Fees'],
  [/: Eligibility & Admission$/, ': Admission']
];

// "A or B for Course? Fees, Branches & Placements" (generated comparison guide titles).
const COMPARISON = /^(.+?) or (.+) for (.+?)\? Fees, Branches & Placements$/;

// Common short forms for long course names, used only when the comparison title is too long.
const COURSE_SHORT: Array<[RegExp, string]> = [
  [/^Bachelor of Physiotherapy \(BPT\)$/i, 'BPT'],
  [/^Bachelor Of Design$/i, 'B.Des'],
  [/^Master Of Design$/i, 'M.Des'],
  [/^Master Of Social Work$/i, 'MSW'],
  [/^Bachelor of Library Science\s*\(\s*B\.Lib\)$/i, 'B.Lib'],
  [/^Master Of Library Science$/i, 'M.Lib'],
  [/^Bachelor of Fine Arts \(B\.F\.A\)$/i, 'BFA'],
  [/^Mass Communication \(PG\)$/i, 'Mass Comm PG'],
  [/^Mass-Communication$/i, 'Mass Comm'],
  [/^Polytechnic Course$/i, 'Polytechnic'],
  [/^Hotel Management - Diploma$/i, 'Hotel Mgmt Diploma'],
  [/^Hotel Management - PG$/i, 'Hotel Mgmt PG'],
  [/^Healthcare - (PG|UG)$/i, 'Healthcare $1'],
  [/^Diploma in (Design|Fashion)$/i, '$1 Diploma'],
  [/^Media - Diploma$/i, 'Media Diploma']
];

function shortCourse(course: string): string {
  for (const [pattern, replacement] of COURSE_SHORT) if (pattern.test(course)) return course.replace(pattern, replacement);
  return course;
}

function comparisonCandidates(title: string): string[] {
  const match = title.match(COMPARISON);
  if (!match) return [];
  const [, a, b, fullCourse] = match;
  const course = fullCourse;
  const short = shortCourse(fullCourse);
  return [
    `${a} or ${b} for ${course}? Fees & Placements`,
    `${a} vs ${b} for ${course}: Fees & Placements`,
    `${a} vs ${b} for ${course}: Fees, Placements`,
    `${a} vs ${b}: ${course} Fees & Placements`,
    `${a} vs ${b} for ${course}: Fees`,
    `${a} vs ${b} for ${course}`,
    `${a} vs ${b} for ${short}: Fees & Placements`,
    `${a} vs ${b} for ${short}: Fees`,
    `${a} vs ${b} for ${short}`,
    `${a} vs ${b}: ${short}`
  ];
}

export function shortSeoTitle(raw: string | null | undefined): string {
  let title = stripBrand(raw);
  if (!title) return title;
  if (title.length + BRAND.length <= SEO_TITLE_MAX) return `${title}${BRAND}`;
  if (title.length <= SEO_TITLE_MAX) return title;
  const comparison = comparisonCandidates(title).find((candidate) => candidate.length <= SEO_TITLE_MAX);
  if (comparison) return comparison;
  for (const [pattern, replacement] of SHORTENINGS) {
    if (title.length <= SEO_TITLE_MAX) break;
    title = title.replace(pattern, replacement);
  }
  return title.length + BRAND.length <= SEO_TITLE_MAX ? `${title}${BRAND}` : title;
}

export function fitSeoTitle(raw: string | null | undefined): { absolute: string } {
  return { absolute: shortSeoTitle(raw) };
}
