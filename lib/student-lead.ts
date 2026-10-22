/** Client-side helpers for the student registration popup (no server imports). */
export type FormCourse = { id: number; label: string; key: string; slug: string };
export type FormState = { id: number; name: string; slug: string };
export type FormCity = { id: number; name: string; slug: string };
export type FormOptions = { indiaCountryId: number | null; courses: FormCourse[]; states: FormState[] };
export type GeoInfo = {
  countryId: number | null; countryCode: string | null; countryName: string | null; phoneCode: string | null; isIndia: boolean;
  stateId: number | null; stateName: string | null; cityId: number | null; cityName: string | null;
};

/** What we remember on this device (localStorage) so the IP is looked up once and interest follows the student. */
export type LeadPrefs = {
  courseId?: number | null;
  countryId?: number | null;
  countryCode?: string | null;
  phoneCode?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  cityId?: number | null;
  cityName?: string | null;
  geoAt?: number;
  submittedAt?: number;
  dismissedUntil?: number;
};

export const LEAD_PREFS_KEY = 'cd_lead_prefs_v1';
export const LEAD_UTM_KEY = 'cd_lead_utm_v1';
export const LEAD_PREFS_EVENT = 'cd-lead-prefs';
const GEO_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function readPrefs(): LeadPrefs {
  try {
    return JSON.parse(window.localStorage.getItem(LEAD_PREFS_KEY) || '{}') as LeadPrefs;
  } catch {
    return {};
  }
}

export function writePrefs(patch: LeadPrefs) {
  try {
    const next = { ...readPrefs(), ...patch };
    window.localStorage.setItem(LEAD_PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(LEAD_PREFS_EVENT));
    return next;
  } catch {
    return patch;
  }
}

export const geoIsFresh = (prefs: LeadPrefs) => Boolean(prefs.countryId && prefs.geoAt && Date.now() - prefs.geoAt < GEO_TTL_MS);

export type PageContext = {
  pageType: string;
  courseKey?: string;
  courseSlug?: string;
  locationSlug?: string;
  collegeSlug?: string;
};

/** Page type + what the URL says about course / location / college. Mirrors the website's route patterns. */
export function pageContext(pathname: string): PageContext {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (!parts.length) return { pageType: 'home' };
  const [first, second, third] = parts;
  if (first === 'colleges') {
    if (!second) return { pageType: 'colleges_listing' };
    return { pageType: third === 'cutoff' ? 'college_cutoff' : 'college_profile', collegeSlug: second };
  }
  if (first === 'courses') return second ? { pageType: 'course_detail', courseSlug: second } : { pageType: 'courses_listing' };
  if (first === 'exams') return { pageType: !second ? 'exams_listing' : third === 'cutoff' ? (parts[3] ? 'exam_cutoff_year' : 'exam_cutoff') : 'exam_detail' };
  if (first === 'articles') return { pageType: second ? 'article_detail' : 'articles_listing' };
  if (first === 'search') return { pageType: 'search' };
  if (first.startsWith('compare-colleges')) return { pageType: 'compare' };
  if (parts.length === 1) {
    const percentile = /^([a-z0-9-]+?)-colleges-accepting-\d{1,3}-percentile-[a-z0-9-]+$/.exec(first);
    if (percentile) return { pageType: 'percentile_listing', courseKey: percentile[1] };
    const rank = /^([a-z0-9-]+?)-colleges-accepting-\d{1,7}-rank-in-[a-z0-9-]+$/.exec(first);
    if (rank) return { pageType: 'rank_listing', courseKey: rank[1] };
    const located = /^([a-z0-9-]+?)-colleges-in-([a-z0-9-]+)$/.exec(first);
    if (located) return { pageType: 'course_location_listing', courseKey: located[1], locationSlug: located[2] };
    const course = /^([a-z0-9-]+)-colleges$/.exec(first);
    if (course) return { pageType: 'course_listing', courseKey: course[1] };
  }
  return { pageType: first.replace(/[^a-z0-9]+/g, '_').slice(0, 40) || 'other' };
}

export function courseFromContext(ctx: PageContext, courses: FormCourse[]) {
  if (ctx.courseKey) return courses.find((c) => c.key === ctx.courseKey) || null;
  if (ctx.courseSlug) return courses.find((c) => c.slug === ctx.courseSlug) || null;
  return null;
}

/** "maharashtra" -> state; "pune-maharashtra" -> state + city slug "pune". */
export function locationFromSlug(slug: string, states: FormState[]) {
  const exact = states.find((s) => s.slug === slug);
  if (exact) return { state: exact, citySlug: null as string | null };
  const state = [...states].sort((a, b) => b.slug.length - a.slug.length).find((s) => slug.endsWith(`-${s.slug}`));
  return state ? { state, citySlug: slug.slice(0, -(state.slug.length + 1)) } : null;
}

export const slugify = (value: string) => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

let optionsPromise: Promise<FormOptions | null> | null = null;
export function loadFormOptions() {
  optionsPromise ||= fetch('/api/students/form-options')
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => (j?.data as FormOptions) || null)
    .catch(() => {
      optionsPromise = null;
      return null;
    });
  return optionsPromise;
}

const cityCache = new Map<number, Promise<FormCity[]>>();
export function loadCities(stateId: number) {
  if (!cityCache.has(stateId)) {
    cityCache.set(stateId, fetch(`/api/students/cities?stateId=${stateId}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => (j.data as FormCity[]) || [])
      .catch(() => {
        cityCache.delete(stateId);
        return [];
      }));
  }
  return cityCache.get(stateId) as Promise<FormCity[]>;
}
