export type PageItem = number | 'ellipsis';

export function getPageItems(totalPages: number, currentPage: number, maxBoxes = 10): PageItem[] {
  if (totalPages <= maxBoxes) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) [2, 3, 4, 5, 6].forEach((page) => pages.add(page));
  if (currentPage >= totalPages - 2) [totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2].forEach((page) => pages.add(page));

  const validPages = [...pages].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b);
  const result: PageItem[] = [];
  validPages.forEach((page, index) => {
    if (index > 0 && page - validPages[index - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}
