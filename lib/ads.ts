import { cache } from 'react';
import { api } from './api';

/** Ad Manager config (admin → backend /ads/config). Manual slots only; Auto ads are never enabled. */
export type AdUnit = {
  id: number; variant: string; format: string; sizeHint: string | null; codeType: 'adsense_ins' | 'html_script' | 'image_link' | string;
  ins?: Record<string, string> | null; html?: string; imageUrl?: string | null; linkUrl?: string | null; alt?: string | null; device: string; weight: number;
};
export type AdSlotConfig = { key: string; pageType: string; format: string; device: string; minHeight: number; count: number; feedEvery: number | null; active: boolean; units: AdUnit[] };
export type AdConfig = {
  enabled: boolean; testMode: boolean; client: string | null; nonPersonalized: boolean; consentRequired: boolean; skipThinPages: boolean;
  excludedRoutes: string[]; lazyMarginPx: number; slots: Record<string, AdSlotConfig>;
};
/** The settings the client part needs (no slot list). */
export type AdClientSettings = Pick<AdConfig, 'testMode' | 'nonPersonalized' | 'consentRequired' | 'excludedRoutes' | 'lazyMarginPx'>;
/** Everything a client list needs to render in-feed ads itself. */
export type AdFeed = { slot: AdSlotConfig; settings: AdClientSettings };

export const ADS_TAG = 'ads';

export const getAdConfig = cache(async (): Promise<AdConfig | null> => {
  try {
    const result = await api<{ data: AdConfig }>('/ads/config', { next: { revalidate: 120, tags: [ADS_TAG] } });
    return result.data;
  } catch {
    return null;
  }
});

export function clientSettings(config: AdConfig): AdClientSettings {
  return { testMode: config.testMode, nonPersonalized: config.nonPersonalized, consentRequired: config.consentRequired, excludedRoutes: config.excludedRoutes, lazyMarginPx: config.lazyMarginPx };
}

/** Returns the slot when it may render on this page (or in admin test mode), else null. */
export async function getAdSlot(slotKey: string, opts: { thin?: boolean } = {}): Promise<AdFeed | null> {
  const config = await getAdConfig();
  if (!config || (!config.enabled && !config.testMode)) return null;
  const slot = config.slots[slotKey];
  if (!slot) return null;
  // Test mode keeps every slot mounted so `?adtest=1` can show placeholders; normal visitors still see nothing.
  if (slot.count <= 0 && !config.testMode) return null;
  if (opts.thin && config.skipThinPages) return null;
  return { slot, settings: clientSettings(config) };
}

/** AdSense loader client id: DB setting first, then the optional env fallback. Null when no live AdSense unit exists. */
export async function getAdsenseClient(): Promise<string | null> {
  const config = await getAdConfig();
  if (!config?.enabled) return null;
  const hasAdsense = Object.values(config.slots).some((slot) => slot.active && slot.units.some((unit) => unit.codeType === 'adsense_ins'));
  if (!hasAdsense) return null;
  const fromUnits = Object.values(config.slots).flatMap((slot) => slot.units).find((unit) => unit.ins?.['data-ad-client'])?.ins?.['data-ad-client'];
  const client = config.client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || fromUnits || '';
  return /^ca-pub-\d{10,20}$/.test(client) ? client : null;
}

/** Splits guide HTML just before its nth <h2> (used for the exam_mid_2 slot). Null when there are fewer h2s. */
export function splitBeforeNthH2(html: string, n = 3): [string, string] | null {
  const re = /<h2[\s>]/gi;
  let match: RegExpExecArray | null;
  let seen = 0;
  while ((match = re.exec(html))) {
    seen += 1;
    if (seen === n) return [html.slice(0, match.index), html.slice(match.index)];
  }
  return null;
}
