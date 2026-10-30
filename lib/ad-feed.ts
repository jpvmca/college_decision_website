import type { AdFeed } from './ads';

/** In-feed positions: after card `first`, then every `every` cards, up to `count` ads. Returns 1-based card counts. */
export function feedPositions(feed: AdFeed | null | undefined, total: number, first = 6): Set<number> {
  const positions = new Set<number>();
  if (!feed) return positions;
  const every = Math.max(2, feed.slot.feedEvery || 6);
  for (let k = 0, at = first; k < feed.slot.count && at < total; k += 1, at += every) positions.add(at);
  return positions;
}
