import type { Metadata } from 'next';
import ListingRoute, { generateMetadata as listingMetadata } from './listing-route';

/**
 * Course / state / city listings and percentile/rank finder landing pages, served as ISR (cached HTML,
 * refreshed every 15 min or on demand via the backend's listings tags and /api/admin/cache/clear).
 * This route never reads searchParams: finder searches with a query string are rewritten by proxy.ts to
 * /listing-query/[listing] (dynamic, noindex), and ?page= is 301'd away, so the cached copy is the clean URL.
 */
export const revalidate = 900;

export async function generateStaticParams() {
  return [];
}

type Params = Promise<{ listing: string }>;
const noQuery = () => Promise.resolve({});

export function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return listingMetadata({ params, searchParams: noQuery() });
}

export default function CourseCollegesPage({ params }: { params: Params }) {
  return <ListingRoute params={params} searchParams={noQuery()} />;
}
