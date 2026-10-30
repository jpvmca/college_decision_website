import { getAdSlot } from '../../lib/ads';
import AdSlotClient from './AdSlotClient';

/**
 * Server part of a manual ad position. Renders nothing when ads are off, the slot is off or has no live unit,
 * the page is thin (no About and no programmes) or the per-page limit is used up.
 */
export default async function AdSlot({ slotKey, thin = false, className }: { slotKey: string; thin?: boolean; className?: string }) {
  const feed = await getAdSlot(slotKey, { thin });
  if (!feed) return null;
  return <AdSlotClient slot={feed.slot} settings={feed.settings} className={className} />;
}
