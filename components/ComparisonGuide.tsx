import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import JsonLd from './JsonLd';
import CollapsibleContent from './CollapsibleContent';
import { faqJsonLd } from '../lib/cutoffs';
import type { ArticleContent } from '../lib/article-content';

function fill(text: string, tokens: Record<string, string>) {
  return text.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key: string) => tokens[key] ?? `{{${key}}}`);
}

/**
 * Researched comparison guide, same Show more treatment as listing ArticleGuide.
 * Intro is rendered in the page hero; this block holds sections, FAQs and sources.
 * Full HTML is always present (CSS-collapsed) so crawlers see every word.
 */
export default function ComparisonGuide({
  content,
  tokens = {}
}: {
  content: ArticleContent;
  tokens?: Record<string, string>;
}) {
  const t = (value: string) => fill(value, tokens);
  const sections = content.sections || [];
  const faqs = content.faqs || [];
  if (!sections.length && !faqs.length) return null;
  const faqLd = faqs.length ? faqJsonLd(faqs.map((faq) => ({ question: t(faq.question), answer: t(faq.answer) }))) : null;

  return (
    <section className="cutoff-section listing-guide article-guide is-compact">
      {faqLd ? <JsonLd data={faqLd} /> : null}
      <CollapsibleContent collapsedHeight={150}>
        {sections.map((section) => (
          <div key={section.heading}>
            <h2>{t(section.heading)}</h2>
            {(section.paragraphs || []).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
            {section.bullets?.length ? <ul>{section.bullets.map((item) => <li key={item}>{t(item)}</li>)}</ul> : null}
            {section.table ? <div className="detail-table-wrap"><table className="detail-table">
              {section.table.caption ? <caption className="muted">{t(section.table.caption)}</caption> : null}
              <thead><tr>{section.table.columns.map((column) => <th scope="col" key={column}>{t(column)}</th>)}</tr></thead>
              <tbody>{section.table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{t(cell)}</td>)}</tr>)}</tbody>
            </table></div> : null}
          </div>
        ))}

        {content.compare && (content.compare.heading || content.compare.paragraphs?.length || content.compare.bullets?.length) ? <>
          {content.compare.heading ? <h2>{t(content.compare.heading)}</h2> : null}
          {(content.compare.paragraphs || []).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
          {content.compare.bullets?.length ? <ul>{content.compare.bullets.map((item) => <li key={item}>{t(item)}</li>)}</ul> : null}
        </> : null}

        {content.links?.length ? <p>Related: {content.links.map((link, i) => <span key={link.href}>{i ? ' · ' : ''}<Link prefetch={false} href={link.href}>{t(link.label)}</Link></span>)}</p> : null}

        {faqs.length ? <>
          <h2>FAQs</h2>
          <div className="cp-faq">{faqs.map((faq) => <details className="cp-faq-item" key={faq.question}><summary><h3>{t(faq.question)}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{t(faq.answer)}</p></details>)}</div>
        </> : null}

        {content.sources?.length ? <p className="muted article-guide-sources">Sources checked{content.updatedOn ? ` (${content.updatedOn})` : ''}: {content.sources.map((source, i) => <span key={source.url}>{i ? ' · ' : ''}<a href={source.url} target="_blank" rel="noopener noreferrer nofollow">{source.label}</a></span>)}</p> : null}
      </CollapsibleContent>
    </section>
  );
}
