import { getAdsenseClient } from '../../lib/ads';

/**
 * Loads adsbygoogle.js once, only when ads are on and at least one live AdSense unit exists. No page-level / Auto ads config is ever pushed.
 * A plain async <script> (React hoists and de-duplicates it into <head>) instead of next/script, whose data-nscript attribute AdSense warns about.
 */
export default async function AdsenseLoader() {
  const client = await getAdsenseClient();
  if (!client) return null;
  return <script async crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} />;
}
