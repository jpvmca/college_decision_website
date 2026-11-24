/**
 * Tunable in-feed ad density for course listing pages only
 * (/{course}-colleges, /{course}-colleges-in-{state}, /{course}-colleges-in-{city}-{state}).
 * Side rails, listing_top/bottom, and ads on other page types are unchanged.
 */
export const COURSE_LISTING_ADS = {
  /** In-list ads: first after this many cards, then at this interval, capped per page. */
  inline: {
    firstAfter: 10,
    every: 10,
    max: 3
  }
} as const;

export type CourseListingInlineAds = typeof COURSE_LISTING_ADS.inline;
