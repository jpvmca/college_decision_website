/**
 * Contextual related links for course listing pages.
 * Every href is taken from live listing keys (facets + state/city pages) or
 * published article slugs — never from a hardcoded list of places.
 */
import { api } from './api';
import { listingFetchOptions, type CourseFacet } from './listings';
import { cityLandingHref, stateLandingHref } from './geo-pages';
import { listingSeoCourseName } from './listing-seo';
import type { CityPageOption, StatePageOption } from '../components/CourseFilterPanel';

export type RelatedLink = { href: string; label: string };
export type RelatedLinkGroup = { title: string; links: RelatedLink[] };

export type ListingRelatedInput = {
  course: CourseFacet;
  facets: CourseFacet[];
  statePages: StatePageOption[];
  cityPages: CityPageOption[];
  placeKind: 'city' | 'state' | 'india';
  currentHref: string;
  stateSlug?: string | null;
  stateName?: string | null;
  citySlug?: string | null;
  cityName?: string | null;
  exams?: Array<{ name: string; slug: string; count?: number }>;
  articleSlugs: Iterable<string>;
};

const CITY_LIMIT = 8;
const STATE_LIMIT = 8;
const COURSE_LIMIT = 8;
const ARTICLE_LIMIT = 6;

const EXAM_ACRONYMS = new Set([
  'ap', 'atma', 'cat', 'cet', 'cmat', 'gmat', 'ibsat', 'icet', 'jemat',
  'mah', 'mat', 'mba', 'met', 'micat', 'nmat', 'pgcet', 'snap', 'tancet',
  'tsicet', 'xat'
]);

function countOf(value: number | string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function facetFor(facets: CourseFacet[], courseSlug: string) {
  return facets.find((facet) => facet.courseSlug === courseSlug) || null;
}

/** Short name for anchors such as "BBA colleges in Lucknow". */
export function listingRelatedCourseName(courseKey: string, label: string) {
  if (courseKey === 'engineering') return 'B.Tech';
  if (courseKey === 'mba') return 'MBA';
  if (courseKey === 'online-mba') return 'Online MBA';
  if (courseKey === 'bcom') return 'B.Com';
  return listingSeoCourseName(courseKey, label);
}

function courseTokens(course: CourseFacet) {
  return Array.from(new Set([course.key, course.courseSlug].filter(Boolean)));
}

function humanizeExamToken(token: string) {
  return token
    .split('-')
    .map((part) => (EXAM_ACRONYMS.has(part) || part.length <= 4 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

function examBelongsOnPage(examToken: string, stateSlug: string | null | undefined, stateSlugs: string[], exams: Array<{ slug: string }>) {
  const localStates = stateSlugs.filter((slug) => (
    slug.length >= 5
    && (examToken === slug || examToken.endsWith(`-${slug}`) || examToken.startsWith(`${slug}-`) || examToken.includes(`-${slug}-`))
  ));
  if (localStates.length) return Boolean(stateSlug && localStates.includes(stateSlug));
  if (!exams.length) return true;
  return exams.some((exam) => String(exam.slug || '').toLowerCase() === examToken);
}

function uniqueLinks(links: RelatedLink[], currentHref: string) {
  const seen = new Set<string>();
  const out: RelatedLink[] = [];
  for (const link of links) {
    if (!link.href || link.href === currentHref || seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

function articleGroupsFor(input: ListingRelatedInput): { exams: RelatedLink[]; fees: RelatedLink[] } {
  const published = new Set(input.articleSlugs);
  const courseName = listingRelatedCourseName(input.course.key, input.course.label);
  const tokens = courseTokens(input.course);
  const places = [input.citySlug, input.stateSlug].filter((value): value is string => Boolean(value));
  const exams = input.exams || [];
  const stateSlugs = Array.from(new Set(input.statePages.map((page) => page.stateSlug).filter((slug) => slug && slug.length >= 5)));
  const examRanked: Array<{ href: string; label: string; rank: number }> = [];
  const feeRanked: Array<{ href: string; label: string; rank: number }> = [];

  for (const slug of published) {
    for (const token of tokens) {
      const examMatch = new RegExp(`^${token}-colleges-accepting-([a-z0-9-]+)-\\d{4}-admission-process$`).exec(slug);
      if (examMatch) {
        const examToken = examMatch[1];
        if (!examBelongsOnPage(examToken, input.stateSlug, stateSlugs, exams)) continue;
        const examName = exams.find((exam) => exam.slug === examToken)?.name || humanizeExamToken(examToken);
        examRanked.push({
          href: `/articles/${slug}`,
          label: `${courseName} colleges accepting ${examName}`,
          rank: exams.find((exam) => exam.slug === examToken)?.count || 0
        });
        continue;
      }

      if (slug === `top-${token}-colleges-in-india-with-fees-2026`) {
        feeRanked.push({ href: `/articles/${slug}`, label: `${courseName} colleges in India with fees`, rank: 400 });
        continue;
      }

      for (const place of places) {
        if (slug === `${token}-colleges-in-${place}-where-average-package-exceeds-fees-2026`) {
          const placeName = place === input.citySlug ? input.cityName : input.stateName;
          feeRanked.push({
            href: `/articles/${slug}`,
            label: `${courseName} colleges in ${placeName} where average package exceeds fees`,
            rank: place === input.citySlug ? 900 : 800
          });
        }
      }
    }
  }

  examRanked.sort((a, b) => b.rank - a.rank);
  feeRanked.sort((a, b) => b.rank - a.rank);
  return {
    exams: uniqueLinks(examRanked, input.currentHref).slice(0, ARTICLE_LIMIT),
    fees: uniqueLinks(feeRanked, input.currentHref).slice(0, ARTICLE_LIMIT)
  };
}

export function buildListingRelatedLinks(input: ListingRelatedInput): RelatedLinkGroup[] {
  const courseName = listingRelatedCourseName(input.course.key, input.course.label);
  const currentHref = input.currentHref;
  const groups: RelatedLinkGroup[] = [];

  const sameCourseStates = input.statePages
    .filter((page) => page.courseSlug === input.course.courseSlug)
    .map((page) => ({
      href: stateLandingHref(input.course.key, page.stateSlug),
      label: `${courseName} colleges in ${page.stateName}`,
      count: countOf(page.count),
      stateSlug: page.stateSlug
    }))
    .sort((a, b) => b.count - a.count);

  const sameCourseCities = input.cityPages
    .filter((page) => page.courseSlug === input.course.courseSlug)
    .map((page) => ({
      href: cityLandingHref(input.course.key, page.citySlug, page.stateSlug),
      label: `${courseName} colleges in ${page.cityName}`,
      count: countOf(page.count),
      citySlug: page.citySlug,
      stateSlug: page.stateSlug,
      cityName: page.cityName,
      stateName: page.stateName
    }))
    .sort((a, b) => b.count - a.count);

  const otherCoursesInCity = input.citySlug && input.stateSlug
    ? input.cityPages
      .filter((page) => page.citySlug === input.citySlug && page.stateSlug === input.stateSlug && page.courseSlug !== input.course.courseSlug)
      .map((page) => {
        const facet = facetFor(input.facets, page.courseSlug);
        if (!facet) return null;
        const name = listingRelatedCourseName(facet.key, facet.label);
        return {
          href: cityLandingHref(facet.key, page.citySlug, page.stateSlug),
          label: `${name} colleges in ${page.cityName}`,
          count: countOf(page.count)
        };
      })
      .filter((link): link is { href: string; label: string; count: number } => Boolean(link))
      .sort((a, b) => b.count - a.count)
    : [];

  const otherCoursesInState = input.stateSlug
    ? input.statePages
      .filter((page) => page.stateSlug === input.stateSlug && page.courseSlug !== input.course.courseSlug)
      .map((page) => {
        const facet = facetFor(input.facets, page.courseSlug);
        if (!facet) return null;
        const name = listingRelatedCourseName(facet.key, facet.label);
        return {
          href: stateLandingHref(facet.key, page.stateSlug),
          label: `${name} colleges in ${page.stateName}`,
          count: countOf(page.count)
        };
      })
      .filter((link): link is { href: string; label: string; count: number } => Boolean(link))
      .sort((a, b) => b.count - a.count)
    : [];

  if (input.placeKind === 'city') {
    const parentState = sameCourseStates.find((page) => page.stateSlug === input.stateSlug);
    if (parentState && input.stateName) {
      groups.push({ title: `${courseName} colleges in ${input.stateName}`, links: uniqueLinks([parentState], currentHref) });
    }
    const otherCities = uniqueLinks(
      sameCourseCities.filter((page) => page.stateSlug === input.stateSlug && page.citySlug !== input.citySlug),
      currentHref
    ).slice(0, CITY_LIMIT);
    if (otherCities.length) {
      groups.push({ title: `${courseName} colleges in other cities of ${input.stateName}`, links: otherCities });
    }
    const otherCourses = uniqueLinks(otherCoursesInCity, currentHref).slice(0, COURSE_LIMIT);
    if (otherCourses.length && input.cityName) {
      groups.push({ title: `Other college lists in ${input.cityName}`, links: otherCourses });
    }
  } else if (input.placeKind === 'state') {
    const cities = uniqueLinks(
      sameCourseCities.filter((page) => page.stateSlug === input.stateSlug),
      currentHref
    ).slice(0, CITY_LIMIT);
    if (cities.length && input.stateName) {
      groups.push({ title: `${courseName} colleges in cities of ${input.stateName}`, links: cities });
    }
    const otherCourses = uniqueLinks(otherCoursesInState, currentHref).slice(0, COURSE_LIMIT);
    if (otherCourses.length && input.stateName) {
      groups.push({ title: `Other college lists in ${input.stateName}`, links: otherCourses });
    }
  } else {
    const topStates = uniqueLinks(sameCourseStates, currentHref).slice(0, STATE_LIMIT);
    if (topStates.length) groups.push({ title: `${courseName} colleges in top states`, links: topStates });
    const topCities = uniqueLinks(sameCourseCities, currentHref).slice(0, CITY_LIMIT);
    if (topCities.length) groups.push({ title: `${courseName} colleges in top cities`, links: topCities });
  }

  const articles = articleGroupsFor(input);
  if (articles.exams.length) groups.push({ title: 'Exam lists', links: articles.exams });
  if (articles.fees.length) groups.push({ title: 'Fee lists', links: articles.fees });

  return groups.filter((group) => group.links.length > 0);
}

export async function getPublishedListingArticleSlugs(): Promise<string[]> {
  try {
    const result = await api<{ data?: Array<{ slug: string }> }>('/articles/published-slugs?limit=50000', listingFetchOptions(['listings:related-articles']));
    return (result.data || []).map((row) => row.slug).filter(Boolean);
  } catch {
    return [];
  }
}
