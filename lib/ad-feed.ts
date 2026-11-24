import type { AdFeed } from './ads';

export type FeedPlacement = {
  first?: number;
  every?: number;
  max?: number;
  /** When true, an ad may sit after the last card if it lands on the cadence. */
  includeLast?: boolean;
};

/** In-feed positions: after card `first`, then every `every` cards, up to `count` ads. Returns 1-based card counts. */
export function feedPositions(feed: AdFeed | null | undefined, total: number, first = 5, placement?: FeedPlacement): Set<number> {
  const positions = new Set<number>();
  if (!feed) return positions;
  const start = placement?.first ?? first;
  const every = Math.max(2, placement?.every ?? feed.slot.feedEvery ?? 6);
  const max = placement?.max ?? feed.slot.count;
  const canPlace = (at: number) => (placement?.includeLast ? at <= total : at < total);
  for (let k = 0, at = start; k < max && at >= 1 && canPlace(at); k += 1, at += every) positions.add(at);
  return positions;
}
