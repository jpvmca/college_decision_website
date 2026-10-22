import type { ReactNode } from 'react';

export type SuggestItem = { type: 'college' | 'exam' | 'course' | 'listing' | 'article'; id: number | string; title: string; subtitle: string | null; href: string; logo?: string | null };
export type SuggestResult = { q: string; colleges: SuggestItem[]; exams: SuggestItem[]; courses: SuggestItem[]; articles: SuggestItem[]; total: number; fuzzy: boolean; tookMs?: number };
export const SUGGEST_GROUPS = [
  { key: 'colleges', label: 'Colleges' },
  { key: 'exams', label: 'Exams' },
  { key: 'courses', label: 'Courses' },
  { key: 'articles', label: 'Articles' }
] as const;
export const EMPTY_SUGGEST: SuggestResult = { q: '', colleges: [], exams: [], courses: [], articles: [], total: 0, fuzzy: false };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps query-token matches at word starts in <mark>. Safe: works on text, never HTML. */
export function highlight(text: string, query: string): ReactNode {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/i).filter((t) => t.length >= 1).sort((a, b) => b.length - a.length);
  if (!tokens.length) return text;
  const re = new RegExp(`(^|[^a-z0-9])(${tokens.map(esc).join('|')})`, 'gi');
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length;
    if (start > last) out.push(text.slice(last, start));
    out.push(<mark key={start}>{m[2]}</mark>);
    last = start + m[2].length;
    if (m[0].length === 0) re.lastIndex += 1;
  }
  if (!out.length) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}
