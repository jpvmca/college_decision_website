import fs from 'fs';
import path from 'path';

export type ListingContentFaq = { question: string; answer: string };
export type ListingContentSection = { h2: string; paragraphs: string[] };
export type ListingContentOverride = {
  intro: string[];
  sections: ListingContentSection[];
  faqs: ListingContentFaq[];
};

const cache = new Map<string, ListingContentOverride | null>();

function isOverride(value: unknown): value is ListingContentOverride {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<ListingContentOverride>;
  return Array.isArray(row.intro) && Array.isArray(row.sections) && Array.isArray(row.faqs);
}

/**
 * Narrow per-listing body override. Only files in lib/listing-content/{slug}.json
 * are loaded. Missing or invalid files return null so the generic template is used.
 */
export function getListingContentOverride(listingSlug: string | null | undefined): ListingContentOverride | null {
  const slug = (listingSlug || '').trim().toLowerCase();
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (cache.has(slug)) return cache.get(slug) || null;
  const file = path.join(process.cwd(), 'lib', 'listing-content', `${slug}.json`);
  try {
    if (!fs.existsSync(file)) {
      cache.set(slug, null);
      return null;
    }
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
    const value = isOverride(parsed) ? parsed : null;
    cache.set(slug, value);
    return value;
  } catch {
    cache.set(slug, null);
    return null;
  }
}
