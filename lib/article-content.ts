import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Optional hand-written, researched copy for one generated list article.
 * File: lib/article-content/{slug}.json. When missing, ArticleGuide falls back to data-built copy.
 * Every string is one short paragraph (about two lines). Strings may use {{tokens}} from lib/article-seo.ts.
 */
export type ArticleContentSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { caption?: string; columns: string[]; rows: string[][] };
};

export type ArticleContent = {
  slug: string;
  updatedOn?: string;
  /** Optional per-article <title> and meta description (H1 is unchanged). */
  metaTitle?: string;
  metaDescription?: string;
  intro?: string[];
  listLead?: string;
  snapshot?: string[];
  firstCollegesLead?: string[];
  sections?: ArticleContentSection[];
  compare?: { heading?: string; paragraphs?: string[]; bullets?: string[] };
  faqs?: Array<{ question: string; answer: string }>;
  links?: Array<{ label: string; href: string }>;
  sources?: Array<{ label: string; url: string }>;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getArticleContent(slug: string): Promise<ArticleContent | null> {
  if (!SLUG_RE.test(slug)) return null;
  const file = path.join(process.cwd(), 'lib', 'article-content', `${slug}.json`);
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as ArticleContent;
    if (!parsed || parsed.slug !== slug) return null;
    return parsed;
  } catch {
    return null;
  }
}
