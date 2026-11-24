/**
 * Copy for the listing-page "How we rank" section. Keep this aligned with
 * the real order in backend listing-order.service.ts:
 * a current NIRF rank (latest two NIRF editions) in this course's official NIRF category first; then editorial pins among the rest
 * that have fee or placement data; then placement, fee present, name and id.
 * Pinned colleges with no NIRF, no published fee and no placement sit below
 * colleges that have data. Do not mention student reviews or paid placements.
 */
export const HOW_WE_RANK_SHORT =
  'Colleges with a current NIRF rank (from the latest two NIRF editions) in this course\'s NIRF category appear first, ordered by that rank (better, lower ranks first). Courses with no NIRF category have no NIRF step. Among the rest, our editorial ranking for this list — checked against official data and public sources — comes next, but only for colleges that have a published fee or placement. A pinned college with no NIRF, no published fee and no placement sits below colleges that have data. We then use published average placement, then whether a published total-fee figure is on record, then the college name and our record id so the order stays stable.';

export const HOW_WE_RANK_FULL =
  'On this page, colleges with a current NIRF rank for this course\'s official NIRF category (from the latest two NIRF editions) are shown first, ordered by that rank — the better (lower) rank appears higher. A NIRF rank from a different category, or an older edition, is not used. Courses that NIRF does not rank as a category (for example BCom, BBA or BA) have no NIRF step. After those colleges, our editorial ranking for this list applies to the rest. That ranking was checked against official data and public sources; it is our ordering, not an official league table. Editorial pins are used only for colleges that have a published total-fee figure or a published placement. A pinned college with no NIRF, no published fee and no placement sits below colleges that have that data. We then use the latest published average placement for this course, then whether a published total-fee figure is on record. If those are the same, we use the college name and our record id so the order does not jump around. We do not use student reviews or paid placements.';
