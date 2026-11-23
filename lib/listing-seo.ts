/**
 * SEO meta helpers for published course × college listing pages
 * (/{course}-colleges, /{course}-colleges-in-{state}, /{course}-colleges-in-{city}-{state}).
 * Titles, descriptions, keywords and focus keyword only — canonicals and page body are untouched.
 *
 * Year is fixed at 2026 unless NEXT_PUBLIC_LISTING_SEO_YEAR is set.
 */

export const LISTING_SEO_YEAR = Number(process.env.NEXT_PUBLIC_LISTING_SEO_YEAR || 2026) || 2026;

export type ListingSeoScope = 'national' | 'state' | 'city';

export type ListingSeoFees = { n: number; min: number; max: number; median: number | null } | null;

export type ListingSeoInput = {
  courseKey: string;
  courseLabel: string;
  scope: ListingSeoScope;
  cityName?: string;
  stateName?: string;
  collegeCount: number;
  cityNames?: string[];
  stateNames?: string[];
  publicCount?: number | null;
  privateCount?: number | null;
  fees?: ListingSeoFees;
};

export type CourseListingSeo = {
  courseName: string;
  place: string;
  year: number;
  title: string;
  description: string;
  focusKeyword: string;
  keywords: string[];
};

export function listingSeoCourseName(courseKey: string, fallbackLabel: string) {
  if (courseKey === 'engineering') return 'Engineering / B.Tech';
  if (courseKey === 'mba') return 'MBA / PGDM';
  return fallbackLabel;
}

export function listingSeoPlace(scope: ListingSeoScope, cityName?: string, stateName?: string) {
  if (scope === 'city') return (cityName || '').trim();
  if (scope === 'state') return (stateName || '').trim();
  return 'India';
}

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function joinNames(names: string[], limit = 3) {
  const items = names.map((name) => name.trim()).filter(Boolean).slice(0, limit);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items[0]}, ${items[1]} and ${items[2]}`;
}

export function listingFocusKeyword(courseName: string, place: string) {
  return `best ${courseName} colleges in ${place}`;
}

export function listingSeoTitle(courseName: string, place: string, year = LISTING_SEO_YEAR) {
  return `Best ${courseName} Colleges in ${place} ${year}`;
}

export function listingSeoKeywords(courseKey: string, courseName: string, place: string, year = LISTING_SEO_YEAR) {
  const focus = listingFocusKeyword(courseName, place);
  const keywords = [
    focus,
    `${focus} ${year}`,
    `top ${courseName} colleges in ${place} ${year}`,
    `${courseName} colleges in ${place}`,
    `${courseName} fees in ${place}`,
    `${courseName} placements in ${place}`
  ];
  if (courseKey === 'engineering') {
    keywords.push(
      `best B.Tech colleges in ${place} ${year}`,
      `top B.Tech colleges in ${place} ${year}`,
      `best BE colleges in ${place} ${year}`,
      `best Engineering colleges in ${place} ${year}`
    );
  }
  if (courseKey === 'mba') {
    keywords.push(
      `best MBA colleges in ${place} ${year}`,
      `top MBA colleges in ${place} ${year}`,
      `best PGDM colleges in ${place} ${year}`,
      `top PGDM colleges in ${place} ${year}`
    );
  }
  if (courseKey === 'online-mba') {
    keywords.push(
      `best Online MBA colleges in ${place} ${year}`,
      `UGC DEB Online MBA colleges in ${place}`,
      `Online MBA vs Online PGDM in ${place}`,
      `Online MBA eligibility in ${place}`
    );
  }
  return keywords;
}

function feeClause(fees: ListingSeoFees) {
  if (!fees || !fees.n || !(fees.min > 0) || !(fees.max > 0)) return '';
  if (fees.min === fees.max) return ` Recorded annual fees on this list are ${money(fees.min)}.`;
  return ` Recorded annual fees on this list run from ${money(fees.min)} to ${money(fees.max)}.`;
}

function countVerb(n: number, singular: string, plural: string) {
  return n === 1 ? `1 ${singular}` : `${formatCount(n)} ${plural}`;
}

function typeClause(publicCount?: number | null, privateCount?: number | null) {
  const pub = Number(publicCount || 0);
  const priv = Number(privateCount || 0);
  if (pub > 0 && priv > 0) return ` ${countVerb(pub, 'is public', 'are public')} and ${countVerb(priv, 'is private', 'are private')}.`;
  if (pub > 0) return ` ${countVerb(pub, 'is public', 'are public')}.`;
  if (priv > 0) return ` ${countVerb(priv, 'is private', 'are private')}.`;
  return '';
}

/**
 * Meta description: human-sounding, real data only, naturally includes the focus keyword
 * and the "top {course} colleges in {place} {year}" variant. One paragraph (line breaks are for Step 4 body copy).
 */
export function listingSeoDescription(input: ListingSeoInput, courseName: string, place: string, year = LISTING_SEO_YEAR) {
  const count = formatCount(input.collegeCount);
  const types = typeClause(input.publicCount, input.privateCount);
  const fees = feeClause(input.fees || null);
  const topPhrase = `top ${courseName} colleges in ${place} ${year}`;
  const focus = listingFocusKeyword(courseName, place);

  if (input.courseKey === 'online-mba' && input.scope === 'national') {
    const types = typeClause(input.publicCount, input.privateCount);
    return `${count} published Online MBA colleges are listed here for India.${types} If you are comparing the ${focus}, check UGC-DEB entitlement on the official list (we do not store a DEB flag yet), whether the award is an Online MBA or an Online PGDM, and eligibility, then use the list to scan ${topPhrase}. Only three profiles currently have a published total fee, and those are Online PGDM records, so we are not quoting a typical Online MBA fee range.`;
  }

  if (input.scope === 'city') {
    return `${count} published ${courseName} colleges in ${place} are on this list.${types} Compare fees, admission routes and placements at the ${focus}, then look through ${topPhrase} to see which campuses fit your budget.${fees}`;
  }

  if (input.scope === 'state') {
    const cities = joinNames(input.cityNames || []);
    const cityBit = cities ? ` Campuses on the list include ${cities}.` : '';
    return `${count} published ${courseName} colleges in ${place} are on this list.${types}${cityBit} Compare fees and placements at the ${focus}. It is a practical way to scan ${topPhrase}.${fees}`;
  }

  const states = joinNames(input.stateNames || []);
  const stateBit = states ? ` A sizeable share are in ${states}.` : '';
  return `${count} published ${courseName} colleges are listed here for India.${types}${stateBit} Compare fees and placements at the ${focus}, then use the list to scan ${topPhrase}.${fees}`;
}

export function buildCourseListingSeo(input: ListingSeoInput): CourseListingSeo {
  const year = LISTING_SEO_YEAR;
  const courseName = listingSeoCourseName(input.courseKey, input.courseLabel);
  const place = listingSeoPlace(input.scope, input.cityName, input.stateName) || 'India';
  return {
    courseName,
    place,
    year,
    title: listingSeoTitle(courseName, place, year),
    description: listingSeoDescription(input, courseName, place, year),
    focusKeyword: listingFocusKeyword(courseName, place),
    keywords: listingSeoKeywords(input.courseKey, courseName, place, year)
  };
}

export type ListingContentHeadings = {
  list: string;
  snapshot: string;
  choose: string;
  faqs: string;
};

/** H2s for the college list and ListingGuide. Wording varies by national / state / city. */
export function listingContentHeadings(
  courseName: string,
  place: string,
  scope: ListingSeoScope,
  year = LISTING_SEO_YEAR,
  courseKey?: string
): ListingContentHeadings {
  const list = `Top ${courseName} Colleges in ${place} ${year}`;
  if (courseKey === 'online-mba' && scope === 'national') {
    return {
      list,
      snapshot: `Online MBA colleges in India: what this list actually shows`,
      choose: `What to check at the best Online MBA colleges in India`,
      faqs: `Questions about Online MBA colleges in India`
    };
  }
  if (scope === 'city') {
    return {
      list,
      snapshot: `${courseName} colleges in ${place}: a closer look`,
      choose: `What to check at the best ${courseName} colleges in ${place}`,
      faqs: `Questions about ${courseName} colleges in ${place}`
    };
  }
  if (scope === 'state') {
    return {
      list,
      snapshot: `A snapshot of ${courseName} colleges in ${place}`,
      choose: `How to shortlist the best ${courseName} colleges in ${place}`,
      faqs: `FAQs on ${courseName} colleges in ${place}`
    };
  }
  return {
    list,
    snapshot: `${courseName} colleges in India: the numbers behind this list`,
    choose: `How to compare the best ${courseName} colleges in India`,
    faqs: `Common questions about ${courseName} colleges in India`
  };
}

/**
 * Hero intro paragraphs for the listing page body.
 * Short paragraphs (about two sentences each), real data only, one use of the
 * focus keyword and one use of the "top {course} colleges in {place} {year}" variant.
 * National, state and city templates are worded differently on purpose.
 */
export function listingHeroIntro(input: ListingSeoInput): string[] {
  const year = LISTING_SEO_YEAR;
  const courseName = listingSeoCourseName(input.courseKey, input.courseLabel);
  const place = listingSeoPlace(input.scope, input.cityName, input.stateName) || 'India';
  const count = formatCount(input.collegeCount);
  const types = typeClause(input.publicCount, input.privateCount).trim();
  const fees = feeClause(input.fees || null).trim();
  const focus = listingFocusKeyword(courseName, place);
  const topPhrase = `top ${courseName} colleges in ${place} ${year}`;
  const cities = joinNames(input.cityNames || []);
  const states = joinNames(input.stateNames || []);
  const paras: string[] = [];

  if (input.courseKey === 'online-mba' && input.scope === 'national') {
    paras.push(`This page lists ${count} published Online MBA colleges in India.${types ? ` ${types}` : ''}`);
    paras.push(`The programmes are online or blended, so the city next to a name is usually the university's registered office, not a campus you have to move to.`);
    paras.push(`If you are comparing the ${focus}, start with UGC-DEB entitlement on the official UGC-DEB list, the exact award (Online MBA or Online PGDM), and who is eligible. We do not store a DEB approval flag in this database yet.`);
    paras.push(`Further down is a view of ${topPhrase}, followed by the other published programmes on this list. Only three colleges here currently have a published total fee, all of them Online PGDM records (MDI Gurgaon, Great Lakes Gurgaon and IMI Bhubaneswar), so we are not quoting a typical Online MBA fee range.`);
    return paras;
  }

  if (input.scope === 'city') {
    paras.push(`There are ${count} published ${courseName} colleges in ${place} on this page.${types ? ` ${types}` : ''}`);
    paras.push(`Use the profiles to compare the ${focus} on fees, admission routes and placements, and keep a note of what still needs a check on the official website.`);
    paras.push(`Further down you will find ${topPhrase}, followed by the other published campuses in the city.${fees ? ` ${fees}` : ''}`);
    return paras;
  }

  if (input.scope === 'state') {
    paras.push(`${count} published ${courseName} colleges in ${place} are on this list.${types ? ` ${types}` : ''}`);
    if (cities) paras.push(`Campuses are spread across ${cities}, among other cities in the state.`);
    paras.push(`It is a practical place to weigh the ${focus} on cost, entrance routes and placements, without treating any figure as final until the college confirms it.`);
    paras.push(`The list below is where to scan ${topPhrase}, then the remaining published options in the state.${fees ? ` ${fees}` : ''}`);
    return paras;
  }

  paras.push(`This page lists ${count} published ${courseName} colleges in India.${types ? ` ${types}` : ''}`);
  if (states) paras.push(`The largest groups in our records are in ${states}. That spread helps if you are still deciding where to study, not only which campus.`);
  paras.push(`If you are comparing the ${focus}, start with fees, how admissions work, and placements where those are published — then confirm the same details on the official site.`);
  paras.push(`Scroll to the list for a view of ${topPhrase}, then keep going through the rest of the published campuses.${fees ? ` ${fees}` : ''}`);
  return paras;
}

export function listingSeoInputFromPage(input: ListingSeoInput): CourseListingSeo & { intro: string[]; headings: ListingContentHeadings } {
  const seo = buildCourseListingSeo(input);
  return {
    ...seo,
    intro: listingHeroIntro(input),
    headings: listingContentHeadings(seo.courseName, seo.place, input.scope, seo.year, input.courseKey)
  };
}
