import type { Metadata } from 'next';
import ListingRoute, { generateMetadata as listingMetadata } from '../../[listing]/listing-route';

/**
 * Internal target of a proxy.ts rewrite: /{course}-colleges-accepting-{level}-{exam}?percentile=... (a finder
 * search with a query string) renders here per request, so the ISR listing route never reads searchParams.
 * The browser URL stays the public one; a direct /listing-query/* visit is noindex with the public canonical.
 */
export const dynamic = 'force-dynamic';

type Params = Promise<{ listing: string }>;
type SearchParams = Promise<{ page?: string } & Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const metadata = await listingMetadata({ params, searchParams });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default function ListingQueryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return <ListingRoute params={params} searchParams={searchParams} />;
}
