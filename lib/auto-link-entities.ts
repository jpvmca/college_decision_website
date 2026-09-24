/**
 * First-mention internal linking for published+active exams/courses.
 *
 * Safety rules:
 * - Match longer aliases first
 * - Word/token boundaries (prevents CAT⊂MICAT/category, MAT⊂format)
 * - Short aliases (≤3 chars) are case-sensitive
 * - Skip text inside <a>, <script>, <style>, <code>, <pre>, headings
 * - Link each entity at most once per document
 * - Never rewrite existing anchors or change slugs
 */

export type LinkableEntity = {
  type: 'exam' | 'course' | 'college';
  slug: string;
  href: string;
  primaryName: string;
  names: string[];
};

export type AutoLinkOptions = {
  /** Skip linking to these hrefs (usually the current page). */
  excludeHrefs?: string[];
  /** Extra entities provided by the page (e.g. related college names). */
  extraEntities?: LinkableEntity[];
  className?: string;
  /**
   * Optional page-scoped set of already-linked entity keys (`type:slug`).
   * When provided, first-mention tracking is shared across multiple
   * autoLinkTextParts / autoLinkHtml calls on the same page.
   */
  sharedUsedKeys?: Set<string>;
};

type Matcher = {
  key: string;
  href: string;
  alias: string;
  length: number;
  caseSensitive: boolean;
};

const SKIP_TAGS = new Set([
  'a',
  'script',
  'style',
  'code',
  'pre',
  'kbd',
  'samp',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'textarea',
  'noscript'
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isWordChar(ch: string | undefined) {
  return Boolean(ch && /[A-Za-z0-9_]/.test(ch));
}

function buildMatchers(entities: LinkableEntity[], excludeHrefs: Set<string>): Matcher[] {
  const claimed = new Map<string, Matcher>();
  const ambiguous = new Set<string>();

  const sorted = [...entities].sort((a, b) => {
    if (a.type !== b.type) {
      if (a.type === 'exam') return -1;
      if (b.type === 'exam') return 1;
    }
    return b.primaryName.length - a.primaryName.length;
  });

  for (const entity of sorted) {
    if (!entity.href || excludeHrefs.has(entity.href)) continue;
    const aliases = [...entity.names, entity.primaryName]
      .map((name) => String(name || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    for (const alias of aliases) {
      if (alias.length < 2) continue;
      const key = alias.toLowerCase();
      if (ambiguous.has(key)) continue;
      const next: Matcher = {
        key: `${entity.type}:${entity.slug}`,
        href: entity.href,
        alias,
        length: alias.length,
        caseSensitive: alias.length <= 3
      };
      const existing = claimed.get(key);
      if (!existing) {
        claimed.set(key, next);
        continue;
      }
      if (existing.href === next.href) continue;
      const existingPrimary = existing.alias.toLowerCase() === key;
      const nextPrimary = next.alias.toLowerCase() === key;
      if (nextPrimary && !existingPrimary) {
        claimed.set(key, next);
      } else if (!existingPrimary && !nextPrimary) {
        claimed.delete(key);
        ambiguous.add(key);
      }
    }
  }

  return Array.from(claimed.values()).sort((a, b) => b.length - a.length || a.alias.localeCompare(b.alias));
}

function findMatch(text: string, from: number, matchers: Matcher[], usedKeys: Set<string>): { matcher: Matcher; index: number } | null {
  let best: { matcher: Matcher; index: number } | null = null;
  for (const matcher of matchers) {
    if (usedKeys.has(matcher.key)) continue;
    const flags = matcher.caseSensitive ? 'g' : 'gi';
    const pattern = new RegExp(escapeRegExp(matcher.alias), flags);
    pattern.lastIndex = from;
    const match = pattern.exec(text);
    if (!match || match.index < from) continue;
    const start = match.index;
    const end = start + match[0].length;
    if (isWordChar(text[start - 1]) || isWordChar(text[end])) continue;
    if (!best || start < best.index || (start === best.index && matcher.length > best.matcher.length)) {
      best = { matcher, index: start };
    }
  }
  return best;
}

function linkPlainSegment(text: string, matchers: Matcher[], usedKeys: Set<string>, className: string): string {
  if (!text || !matchers.length) return text;
  let cursor = 0;
  let output = '';
  while (cursor < text.length) {
    const found = findMatch(text, cursor, matchers, usedKeys);
    if (!found) {
      output += text.slice(cursor);
      break;
    }
    const { matcher, index } = found;
    const end = index + matcher.alias.length;
    const matchedText = text.slice(index, end);
    output += text.slice(cursor, index);
    const cls = className ? ` class="${className}"` : '';
    output += `<a href="${matcher.href}"${cls}>${matchedText}</a>`;
    usedKeys.add(matcher.key);
    cursor = end;
  }
  return output;
}

function updateSkipDepth(tagChunk: string, depth: number): number {
  const match = /^<\/?([A-Za-z][A-Za-z0-9]*)\b/.exec(tagChunk);
  if (!match) return depth;
  const name = match[1].toLowerCase();
  if (!SKIP_TAGS.has(name)) return depth;
  if (tagChunk.startsWith('</')) return Math.max(0, depth - 1);
  if (/\/>$/.test(tagChunk)) return depth;
  return depth + 1;
}

/** Auto-link first mentions inside an HTML string. */
export function autoLinkHtml(html: string | null | undefined, entities: LinkableEntity[], options: AutoLinkOptions = {}): string {
  if (!html) return '';
  const exclude = new Set(options.excludeHrefs || []);
  const matchers = buildMatchers([...(options.extraEntities || []), ...entities], exclude);
  if (!matchers.length) return html;

  const className = options.className || 'auto-entity-link';
  const usedKeys = options.sharedUsedKeys || new Set<string>();
  const parts = html.split(/(<[^>]+>)/g);
  let skipDepth = 0;
  let output = '';

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('<')) {
      skipDepth = updateSkipDepth(part, skipDepth);
      output += part;
      continue;
    }
    if (skipDepth > 0) {
      output += part;
      continue;
    }
    output += linkPlainSegment(part, matchers, usedKeys, className);
  }
  return output;
}

export type TextPart = { type: 'text'; value: string } | { type: 'link'; href: string; value: string };

/** Split plain text into first-mention link parts for React rendering. */
export function autoLinkTextParts(text: string | null | undefined, entities: LinkableEntity[], options: AutoLinkOptions = {}): TextPart[] {
  const value = String(text || '');
  if (!value) return [];
  const exclude = new Set(options.excludeHrefs || []);
  const matchers = buildMatchers([...(options.extraEntities || []), ...entities], exclude);
  if (!matchers.length) return [{ type: 'text', value }];

  const usedKeys = options.sharedUsedKeys || new Set<string>();
  const parts: TextPart[] = [];
  let cursor = 0;
  while (cursor < value.length) {
    const found = findMatch(value, cursor, matchers, usedKeys);
    if (!found) {
      parts.push({ type: 'text', value: value.slice(cursor) });
      break;
    }
    const { matcher, index } = found;
    const end = index + matcher.alias.length;
    if (index > cursor) parts.push({ type: 'text', value: value.slice(cursor, index) });
    parts.push({ type: 'link', href: matcher.href, value: value.slice(index, end) });
    usedKeys.add(matcher.key);
    cursor = end;
  }
  return parts.length ? parts : [{ type: 'text', value }];
}

export function flattenLinkableEntities(payload: {
  exams?: LinkableEntity[];
  courses?: LinkableEntity[];
  colleges?: LinkableEntity[];
} | null | undefined): LinkableEntity[] {
  if (!payload) return [];
  return [...(payload.exams || []), ...(payload.courses || []), ...(payload.colleges || [])];
}

export function findPublishedHref(
  entities: LinkableEntity[],
  type: LinkableEntity['type'],
  slug: string | null | undefined
): string | null {
  if (!slug) return null;
  const href = type === 'exam' ? `/exams/${slug}` : type === 'course' ? `/courses/${slug}` : `/colleges/${slug}`;
  return entities.some((entity) => entity.type === type && entity.slug === slug && entity.href === href) ? href : null;
}

export function findPublishedHrefByName(
  entities: LinkableEntity[],
  type: LinkableEntity['type'],
  name: string | null | undefined
): string | null {
  const needle = String(name || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!needle) return null;
  const match = entities.find(
    (entity) =>
      entity.type === type &&
      (entity.primaryName.toLowerCase() === needle || entity.names.some((alias) => alias.toLowerCase() === needle))
  );
  return match?.href || null;
}


export type DelimitedLinkOptions = {
  /** Skip linking these entity slugs (e.g. the article's primary exam). */
  excludeSlugs?: string[];
  /** Restrict to these entity types. Defaults to exams only. */
  types?: Array<LinkableEntity['type']>;
  /** Link every matching token (default true). Set false for first-match-only. */
  linkEvery?: boolean;
};

type AliasMatcher = {
  slug: string;
  href: string;
  alias: string;
  length: number;
  caseSensitive: boolean;
  type: LinkableEntity['type'];
};

function buildDelimitedMatchers(entities: LinkableEntity[], options: DelimitedLinkOptions = {}): AliasMatcher[] {
  const exclude = new Set((options.excludeSlugs || []).map((slug) => slug.toLowerCase()));
  const types = new Set(options.types || ['exam']);
  const claimed = new Map<string, AliasMatcher>();
  const ambiguous = new Set<string>();

  for (const entity of entities) {
    if (!types.has(entity.type)) continue;
    if (!entity.href || !entity.slug) continue;
    if (exclude.has(entity.slug.toLowerCase())) continue;
    const aliases = [...entity.names, entity.primaryName]
      .map((name) => String(name || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    for (const alias of aliases) {
      if (alias.length < 2) continue;
      const key = alias.toLowerCase();
      if (ambiguous.has(key)) continue;
      const next: AliasMatcher = {
        slug: entity.slug,
        href: entity.href,
        alias,
        length: alias.length,
        caseSensitive: alias.length <= 3,
        type: entity.type
      };
      const existing = claimed.get(key);
      if (!existing) {
        claimed.set(key, next);
        continue;
      }
      if (existing.href === next.href) continue;
      claimed.delete(key);
      ambiguous.add(key);
    }
  }

  return Array.from(claimed.values()).sort((a, b) => b.length - a.length || a.alias.localeCompare(b.alias));
}

function matchToken(token: string, matchers: AliasMatcher[]): AliasMatcher | null {
  const trimmed = token.replace(/\s+/g, ' ').trim();
  if (!trimmed) return null;
  for (const matcher of matchers) {
    if (matcher.caseSensitive) {
      if (trimmed === matcher.alias) return matcher;
    } else if (trimmed.toLowerCase() === matcher.alias.toLowerCase()) {
      return matcher;
    }
  }
  return null;
}

/**
 * Split a delimited label string (e.g. "GATE, UK SEE") and link tokens that map
 * to published entities. Preserves original separators and spacing.
 */
export function linkDelimitedEntityParts(
  text: string | null | undefined,
  entities: LinkableEntity[],
  options: DelimitedLinkOptions = {}
): TextPart[] {
  const value = String(text || '');
  if (!value) return [];
  const matchers = buildDelimitedMatchers(entities, options);
  if (!matchers.length) return [{ type: 'text', value }];

  const linkEvery = options.linkEvery !== false;
  const used = new Set<string>();
  const parts: TextPart[] = [];
  const pattern = /([^,;|/]+)|([,;|/]+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) {
    const token = match[1];
    const sep = match[2];
    if (sep) {
      parts.push({ type: 'text', value: sep });
      continue;
    }
    const leading = token.match(/^\s*/)?.[0] || '';
    const trailing = token.match(/\s*$/)?.[0] || '';
    const core = token.slice(leading.length, token.length - trailing.length);
    const hit = matchToken(core, matchers);
    if (leading) parts.push({ type: 'text', value: leading });
    if (hit && (linkEvery || !used.has(hit.href))) {
      parts.push({ type: 'link', href: hit.href, value: core });
      used.add(hit.href);
    } else {
      parts.push({ type: 'text', value: core });
    }
    if (trailing) parts.push({ type: 'text', value: trailing });
  }
  return parts.length ? parts : [{ type: 'text', value }];
}

/** Convenience wrapper for admission-route strings. */
export function linkAdmissionRouteParts(
  text: string | null | undefined,
  entities: LinkableEntity[],
  options: Omit<DelimitedLinkOptions, 'types'> = {}
): TextPart[] {
  return linkDelimitedEntityParts(text, entities, { ...options, types: ['exam'] });
}

/** Infer primary exam slug from accepting-* article slug/title context. */
export function detectPrimaryExamSlugFromArticle(input: {
  examSlug?: string | null;
  articleSlug?: string | null;
  title?: string | null;
}): string | null {
  if (input.examSlug) return input.examSlug;
  const slug = String(input.articleSlug || '').toLowerCase();
  const accepting = slug.match(/accepting-([a-z0-9-]+?)(?:-20\d{2})?(?:-admission|$)/);
  if (accepting?.[1]) return accepting[1].replace(/-admission.*$/, '');
  return null;
}
