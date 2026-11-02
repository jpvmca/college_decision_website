import { cache } from 'react';
import { api } from './api';

/** Three global responsive AdSense codes; Auto ads and per-slot code are not used. */
export type AdUnit = {
  id: number;
  variant: string;
  format: string;
  sizeHint: string | null;
  codeType: 'adsense_ins' | 'html_script' | 'image_link';
  ins?: Record<string, string> | null;
  html?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  alt?: string | null;
  device: 'all';
  weight: number;
};
export type AdSlotConfig = { key: string; pageType: string; format: string; device: 'all'; minHeight: number; count: number; feedEvery: number | null; active: boolean; units: AdUnit[] };
export type AdConfig = {
  enabled: boolean;
  client: string | null;
  nonPersonalized: boolean;
  consentRequired: boolean;
  codes: Record<'horizontal' | 'vertical' | 'square', Record<string, string> | null>;
};
export type AdClientSettings = Pick<AdConfig, 'nonPersonalized' | 'consentRequired'> & {
  testMode: false;
  excludedRoutes: string[];
  lazyMarginPx: number;
};
export type AdFeed = { slot: AdSlotConfig; settings: AdClientSettings };

export const ADS_TAG = 'ads';
const EXCLUDED_ROUTES = ['/search', '/contact', '/about', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/compare-colleges', '/seo-timeline'];
const GLOBAL_MARGIN = 300;

export const getAdConfig = cache(async (): Promise<AdConfig | null> => {
  if (process.env.ADS_ENABLED !== 'true') return null;
  try {
    const result = await api<{ data: AdConfig }>('/ads/config', { next: { revalidate: 120, tags: [ADS_TAG] } });
    return result.data.enabled ? result.data : null;
  } catch {
    return null;
  }
});

function codeTypeForSlot(slotKey: string): 'horizontal' | 'vertical' | 'square' {
  if (slotKey.includes('side') || slotKey.includes('rail') || slotKey.includes('vertical')) return 'vertical';
  if (slotKey.includes('end') || slotKey.includes('feed') || slotKey.includes('square')) return 'square';
  return 'horizontal';
}

function heightFor(type: 'horizontal' | 'vertical' | 'square') {
  return type === 'vertical' ? 600 : type === 'square' ? 280 : 120;
}

export function clientSettings(config: AdConfig): AdClientSettings {
  return { testMode: false, nonPersonalized: config.nonPersonalized, consentRequired: config.consentRequired, excludedRoutes: EXCLUDED_ROUTES, lazyMarginPx: GLOBAL_MARGIN };
}

/** Maps existing page placement keys to one of the three global responsive codes. */
export async function getAdSlot(slotKey: string, opts: { thin?: boolean } = {}): Promise<AdFeed | null> {
  const config = await getAdConfig();
  if (!config || opts.thin) return null;
  const type = codeTypeForSlot(slotKey);
  const ins = config.codes?.[type];
  if (!ins) return null;
  const slot: AdSlotConfig = {
    key: slotKey, pageType: 'global', format: type, device: 'all',
    minHeight: heightFor(type), count: 1, feedEvery: null, active: true,
    units: [{ id: 0, variant: 'global', format: type, sizeHint: null, codeType: 'adsense_ins', ins, device: 'all', weight: 1 }]
  };
  return { slot, settings: clientSettings(config) };
}

export async function getAdsenseClient(): Promise<string | null> {
  const config = await getAdConfig();
  if (!config) return null;
  const fromUnits = Object.values(config.codes || {}).find((code) => code?.['data-ad-client'])?.['data-ad-client'];
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
