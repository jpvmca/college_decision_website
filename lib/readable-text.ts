import { sentenceBreaks } from './readable-html';

/**
 * Plain-text helpers for short database text fields (programme eligibility, notes, descriptions).
 * Only markup, entity encoding, whitespace and duplicated punctuation are changed — never the words.
 */

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', sbquo: '‚', bdquo: '„', prime: '′', Prime: '″',
  ndash: '–', mdash: '—', hellip: '…', bull: '•', middot: '·', deg: '°', times: '×', divide: '÷',
  rarr: '→', larr: '←', ge: '≥', le: '≤', plusmn: '±', frac12: '½', frac14: '¼', frac34: '¾',
  copy: '©', reg: '®', trade: '™', sect: '§', para: '¶', laquo: '«', raquo: '»', rupee: '₹', inr: '₹', euro: '€', pound: '£',
  shy: '', zwnj: '', zwj: '', lrm: '', rlm: '',
};

function decodeOnce(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]{1,8});/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      if (!Number.isFinite(n) || n <= 0 || n > 0x10ffff) return m;
      if (n === 160) return ' ';
      return String.fromCodePoint(n);
    }
    const v = NAMED[code] ?? NAMED[code.toLowerCase()];
    return v === undefined ? m : v;
  });
}

/** Decode HTML entities, repeating for double/triple-encoded text (&amp;rsquo; → ’). */
export function decodeEntities(value: string): string {
  let s = value;
  for (let i = 0; i < 4; i += 1) {
    const next = decodeOnce(s);
    if (next === s) break;
    s = next;
  }
  return s;
}

function tidy(line: string): string {
  return line
    .replace(/[\u00a0\u200b\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])(?=\s|$)/g, '$1')
    .replace(/(^|[^.])\.\.(?!\.)/g, '$1.')
    .replace(/([,;])\1+/g, '$1')
    .trim();
}

/** HTML or entity-encoded text → plain text lines (one per block: paragraph, list item, table row, <br>). */
export function plainTextLines(value: unknown): string[] {
  let s = String(value ?? '');
  if (!s.trim()) return [];
  // decode first so &lt;p&gt; style encoded markup is handled as markup
  if (/&lt;\/?[a-z]/i.test(s)) s = decodeEntities(s);
  s = s
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(td|th)>/gi, ' | ')
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h[1-6]|ul|ol|table|figure|blockquote)>|<(p|div|li|tr|h[1-6]|ul|ol|table)(\s[^>]*)?>/gi, '\n')
    .replace(/<\/?[a-z][^>]*>/gi, ' ');
  s = decodeEntities(s);
  return s
    .split(/\n|\r/)
    .map((line) => tidy(line.replace(/(\s*\|\s*)+$/, '').replace(/^(\s*\|\s*)+/, '')))
    .filter((line) => line && !/^[|.\s·•\-–]+$/.test(line));
}

/** One-line plain text (markup removed, entities decoded, spacing tidied). */
export function plainText(value: unknown, fallback = ''): string {
  return plainTextLines(value).join(' ').trim() || fallback;
}

function cutAt(line: string, positions: number[]): string[] {
  const parts: string[] = [];
  let start = 0;
  for (const p of [...new Set(positions)].sort((a, b) => a - b)) {
    if (p <= start || p >= line.length) continue;
    parts.push(line.slice(start, p).trim());
    start = p;
  }
  parts.push(line.slice(start).trim());
  return parts.filter(Boolean);
}

const SHORT_LINE = 220;
const DEGREE = String.raw`(?:Master|Bachelor|Doctor|Diploma|Post Graduate|PG Diploma|Integrated)[A-Za-z’'.&\s]{2,60}?\([^()]{2,80}\)`;
/** A programme heading mid-text, after the end of the previous programme's eligibility. */
const PROGRAMME_HEADING_MID = new RegExp(String.raw`(?<=(?:[.;]|%|[Aa]ggregate|marks|equivalent|University|Board|Institute|subject)\s+)(?:${DEGREE}(?=\s+[A-Z])|(?:M\.Sc|B\.Sc|M\.A|M\.Tech|B\.Tech|M\.Com|B\.Com)\.?\s+(?=[A-Z][a-z]+\s+[A-Z]))`, 'g');
/** Programme heading at the start of an item, rendered in bold. */
export const PROGRAMME_HEADING_START = new RegExp(String.raw`^(${DEGREE})\s+(?=[A-Z])`);
/** Pure column header left over from a flattened table. */
const TABLE_HEADER = /(?:^|\s)(?:[A-Z][A-Za-z.]{0,8}\s+)?(?:Specialization|Specialisation)s?\s+Eligibility(?:\s+Criteria)?\s+/g;

function splitLine(line: string): string[] {
  const escaped = line.replace(/</g, '‹'); // sentenceBreaks treats "<x" as markup
  let parts = cutAt(line, sentenceBreaks(escaped));
  // flattened multi-programme tables: new item at each "Master of Arts (English)" style heading
  parts = parts.flatMap((part) => cutAt(part, [...part.matchAll(PROGRAMME_HEADING_MID)].map((m) => m.index!)));
  // enumerations like (i) (a) 1) — "OR" alternatives deliberately stay inside their sentence
  parts = parts.flatMap((part) => {
    const pos: number[] = [];
    const re = /\s(?=\((?:[ivx]{1,4}|[a-h]|\d{1,2})\)\s)|[;,.:]\s+(?=(?:[ivx]{1,4}|[a-h]|\d{1,2})\)\s)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(part))) pos.push(m.index + (/[;,.:]/.test(m[0][0]) ? 1 : 0));
    return cutAt(part, pos);
  });
  // flattened bullets: " – " / " • " inside a still-long line
  parts = parts.flatMap((part) => (part.length > SHORT_LINE ? cutAt(part, [...part.matchAll(/\s[–•]\s(?=[A-Z0-9(])/g)].map((m) => m.index! + 1)) : [part]));
  // never leave tiny fragments on their own line
  const merged: string[] = [];
  for (const part of parts) {
    if (merged.length && (part.length < 18 || merged[merged.length - 1].length < 12)) merged[merged.length - 1] += ` ${part}`;
    else merged.push(part);
  }
  return merged.map((p) => p.replace(/^[–•]\s+/, '').trim()).filter(Boolean);
}

/** Readable short lines for list-style rendering: block structure kept, long blocks split at sentence ends and at OR / (i) alternatives. */
export function readableLines(value: unknown): string[] {
  return plainTextLines(value).flatMap((line) => line.replace(TABLE_HEADER, '\n').split('\n')).map((line) => line.trim()).filter(Boolean).flatMap(splitLine);
}

/** True when the text is short enough to stay inline (one short sentence). */
export function isShortText(lines: string[]): boolean {
  return lines.length <= 1 && (lines[0]?.length || 0) <= SHORT_LINE;
}

/** Append a full stop only when the text does not already end in sentence punctuation. */
export function withFullStop(value: string): string {
  const v = value.trim();
  return !v || /[.!?:)…]$/.test(v) || /[.!?]["”’]$/.test(v) ? v : `${v}.`;
}
