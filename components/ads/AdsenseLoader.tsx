import Script from 'next/script';
import { getAdsenseClient } from '../../lib/ads';

/** Loads adsbygoogle.js once, only when ads are on and at least one live AdSense unit exists. No page-level / Auto ads config is ever pushed. */
export default async function AdsenseLoader() {
  const client = await getAdsenseClient();
  if (!client) return null;
  return <Script id="adsbygoogle-loader" async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} />;
}
