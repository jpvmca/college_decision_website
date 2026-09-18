/**
 * Remove FAQ blocks embedded in profile HTML so the page-owned FAQ section
 * (and FAQPage schema) stay the single source of truth.
 *
 * Handles:
 * 1. Explicit FAQ headings
 * 2. Trailing Q&A runs of <h3>…?</h3><p>…</p> (question text only; no nested tags)
 */
export function stripEmbeddedFaqs(html: string | null | undefined): string {
  if (!html) return '';

  let out = html.replace(
    /<h[23][^>]*>\s*Frequently asked questions\s*<\/h[23]>[\s\S]*$/i,
    ''
  );

  // Trailing run of at least 2 question-style headings. Restrict h3 text to [^<]*
  // so content headings earlier in the article are never consumed.
  const trailingQa = out.match(
    /(?:(?:\s*)<h3[^>]*>[^<]*\?[^<]*<\/h3>\s*<p>[\s\S]*?<\/p>){2,}[\s]*$/i
  );
  if (trailingQa) {
    out = out.slice(0, trailingQa.index).trimEnd();
  }

  return out.replace(/\n{3,}/g, '\n\n').trim();
}
