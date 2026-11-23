import { formatLastUpdatedIst, TEAM_BYLINE } from '../lib/page-byline';

/**
 * Visible author + last-updated line for college, listing, article, course and exam pages.
 *
 * Props:
 * - updatedAt: a real record timestamp only (ISO string or Date). Never pass Date.now() or today.
 * - authorName: a real person name from the DB (e.g. CMS article created_by / admin name).
 *   If omitted or empty, the byline is "CollegeDecision Editorial Team". Never invent a person.
 * - className: optional extra class on the wrapping <p>.
 *
 * Renders:
 *   By {author} · <time dateTime="YYYY-MM-DD">Last updated: D MMM YYYY</time>
 * The date is formatted in Asia/Calcutta. If there is no usable date, the <time> is omitted
 * and only the author byline is shown. If there is no author and no date, nothing is rendered.
 */
export default function LastUpdatedByline({
  updatedAt,
  authorName,
  className
}: {
  updatedAt?: string | Date | null;
  authorName?: string | null;
  className?: string;
}) {
  const formatted = formatLastUpdatedIst(updatedAt);
  const by = authorName?.trim() || TEAM_BYLINE;
  if (!formatted && !by) return null;
  return (
    <p className={['page-byline', className].filter(Boolean).join(' ')}>
      <span>By {by}</span>
      {formatted ? (
        <>
          <span className="page-byline-sep" aria-hidden="true">·</span>
          <time dateTime={formatted.dateTime}>Last updated: {formatted.label}</time>
        </>
      ) : null}
    </p>
  );
}
