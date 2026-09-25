/**
 * Shared schema.org JSON-LD helpers. Every block is rendered server-side as its own
 * <script type="application/ld+json"> so crawlers and validators see it in the raw HTML.
 */

export const SITE_NAME = 'College Decision';
export const SITE_ALTERNATE_NAME = 'CollegeDecision.in';

export function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

export function organizationId(siteUrl = siteBaseUrl()) {
  return `${siteUrl}/#organization`;
}

/** Site-wide Organization node (output once, from the root layout). */
export function organizationJsonLd(siteUrl = siteBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(siteUrl),
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.svg`
    }
  };
}

export type BreadcrumbItem = { name: string; url: string };

/** Standalone BreadcrumbList with absolute URLs and positions starting at 1. */
export function breadcrumbJsonLd(items: BreadcrumbItem[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/** JSON for a <script type="application/ld+json"> body; escapes "<" so content can never close the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
