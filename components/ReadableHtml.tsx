import { readableHtml } from '../lib/readable-html';

/** Server component: renders stored rich text as sanitised, readable HTML (short paragraphs, headings, scrollable tables). */
export default function ReadableHtml({ html, className = 'readable', headingShift = 0, preSanitized = false }: { html: unknown; className?: string; headingShift?: number; preSanitized?: boolean }) {
  const clean = preSanitized ? String(html || '') : readableHtml(html, { headingShift });
  if (!clean) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
