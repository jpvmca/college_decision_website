/**
 * Parse public CD URLs into page entities for journey tracking.
 * Keep in sync with college_decision_backend/src/utils/parse-page-entities.ts
 */

export type PageType =
  | 'home'
  | 'exam_listing'
  | 'exam_detail'
  | 'course_listing'
  | 'course_detail'
  | 'college_listing'
  | 'college_detail'
  | 'article_listing'
  | 'article_detail'
  | 'course_listing_national'
  | 'course_state_listing'
  | 'course_city_listing'
  | 'compare_tool'
  | 'search'
  | 'other';

export type PageEntities = {
  page_type: PageType;
  course_slug: string | null;
  college_slug: string | null;
  exam_slug: string | null;
  city: string | null;
  state: string | null;
  article_type: string | null;
};

/** Known state slugs used to split city-state listing suffixes. */
export const STATE_SLUGS = [
  'andaman-and-nicobar-islands',
  'andhra-pradesh',
  'arunachal-pradesh',
  'assam',
  'bihar',
  'chandigarh',
  'chhattisgarh',
  'dadra-and-nagar-haveli-and-daman-and-diu',
  'delhi-ncr',
  'delhi',
  'goa',
  'gujarat',
  'haryana',
  'himachal-pradesh',
  'jammu-and-kashmir',
  'jharkhand',
  'karnataka',
  'kerala',
  'ladakh',
  'lakshadweep',
  'madhya-pradesh',
  'maharashtra',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'odisha',
  'puducherry',
  'punjab',
  'rajasthan',
  'sikkim',
  'tamil-nadu',
  'telangana',
  'tripura',
  'uttar-pradesh',
  'uttarakhand',
  'west-bengal'
] as const;

const STATE_SET = new Set<string>(STATE_SLUGS);

function empty(): PageEntities {
  return {
    page_type: 'other',
    course_slug: null,
    college_slug: null,
    exam_slug: null,
    city: null,
    state: null,
    article_type: null
  };
}

function cleanPath(input: string): string {
  try {
    if (input.includes('://')) {
      const u = new URL(input);
      input = u.pathname;
    }
  } catch {
    // treat as path
  }
  const path = String(input || '').split('?')[0].split('#')[0].trim();
  if (!path) return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function splitCityState(suffix: string): { city: string | null; state: string | null } {
  const sorted = [...STATE_SLUGS].sort((a, b) => b.length - a.length);
  for (const state of sorted) {
    if (suffix === state) return { city: null, state };
    if (suffix.endsWith(`-${state}`)) {
      const city = suffix.slice(0, -(state.length + 1));
      if (city) return { city, state };
    }
  }
  return { city: null, state: suffix || null };
}

/** Parse a path or full URL into journey page entities. */
export function parsePageEntities(input: string): PageEntities {
  const path = cleanPath(input);
  const base = empty();
  if (path === '/') return { ...base, page_type: 'home' };

  if (path === '/exams') return { ...base, page_type: 'exam_listing' };
  {
    const m = /^\/exams\/([a-z0-9-]+)(?:\/.*)?$/.exec(path);
    if (m) return { ...base, page_type: 'exam_detail', exam_slug: m[1] };
  }

  if (path === '/courses') return { ...base, page_type: 'course_listing' };
  {
    const m = /^\/courses\/([a-z0-9-]+)(?:\/.*)?$/.exec(path);
    if (m) return { ...base, page_type: 'course_detail', course_slug: m[1] };
  }

  if (path === '/colleges') return { ...base, page_type: 'college_listing' };
  {
    const m = /^\/colleges\/([a-z0-9-]+)(?:\/.*)?$/.exec(path);
    if (m) return { ...base, page_type: 'college_detail', college_slug: m[1] };
  }

  if (path === '/articles') return { ...base, page_type: 'article_listing' };
  {
    const m = /^\/articles\/([a-z0-9-]+)$/.exec(path);
    if (m) {
      const slug = m[1];
      let article_type: string | null = 'guide';
      if (slug.includes('-or-') || slug.includes('-vs-')) article_type = 'college-comparison';
      else if (/under-\d+-lakh/.test(slug)) article_type = 'budget';
      else if (/with-fees/.test(slug)) article_type = 'fees';
      else if (/admission-and-eligibility/.test(slug)) article_type = 'admission';
      else if (/accepting-/.test(slug)) article_type = 'exam-admission';
      else if (/average-package/.test(slug)) article_type = 'gov-avg-package';
      return { ...base, page_type: 'article_detail', article_type, course_slug: null };
    }
  }

  if (path === '/compare-colleges-2026' || path.startsWith('/compare-colleges')) {
    return { ...base, page_type: 'compare_tool' };
  }

  if (path === '/search') return { ...base, page_type: 'search' };

  if (path.includes('-colleges-accepting-')) return { ...base, page_type: 'other' };

  {
    const national = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)-colleges$/.exec(path);
    if (national) {
      return { ...base, page_type: 'course_listing_national', course_slug: national[1] };
    }
  }

  {
    const geo = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)-colleges-in-([a-z0-9-]+)$/.exec(path);
    if (geo) {
      const course_slug = geo[1];
      const { city, state } = splitCityState(geo[2]);
      if (city) {
        return { ...base, page_type: 'course_city_listing', course_slug, city, state };
      }
      return { ...base, page_type: 'course_state_listing', course_slug, city: null, state: state || geo[2] };
    }
  }

  return base;
}

export function isKnownStateSlug(slug: string) {
  return STATE_SET.has(String(slug || '').toLowerCase());
}
