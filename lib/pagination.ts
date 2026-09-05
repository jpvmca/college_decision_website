export type PageItem = number | 'ellipsis';

/** Compact page window so nav never overflows (matches /colleges behaviour on mobile). */
export function getPageItems(totalPages: number, currentPage: number, siblingCount = 1): PageItem[] {
  const total = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, currentPage), total);
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current]);
  for (let offset = 1; offset <= siblingCount; offset += 1) {
    pages.add(current - offset);
    pages.add(current + offset);
  }
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  const validPages = [...pages].filter((page) => page > 0 && page <= total).sort((a, b) => a - b);
  const result: PageItem[] = [];
  validPages.forEach((page, index) => {
    if (index > 0 && page - validPages[index - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}
