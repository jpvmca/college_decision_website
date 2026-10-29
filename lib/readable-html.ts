/**
 * Readable HTML: sanitises stored (often scraped) rich text and turns long walls
 * of text into short paragraphs. Only markup changes; words are never rewritten.
 * Server-side only, no dependencies.
 */

type Node = { tag: string; attrs: Record<string, string>; children: Array<Node | string> };

const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'noscript', 'object', 'embed', 'svg', 'video', 'audio', 'canvas', 'template', 'form', 'button', 'select', 'textarea', 'head', 'title']);
const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'base', 'param', 'track']);
const BLOCK_ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption']);
const INLINE_ALLOWED = new Set(['strong', 'em', 'b', 'i', 'a', 'br', 'sub', 'sup']);
const BLOCK_CONTAINERS = new Set(['div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'blockquote', 'figure', 'figcaption', 'center', 'body', 'html', 'dl', 'dt', 'dd', 'pre', 'address', 'nav']);
const HEADING_MAP: Record<string, string> = { h1: 'h2', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h4', h6: 'h4' };

/** Words that end with a dot but do not end a sentence. Compared lower-case without the trailing dot. */
const ABBREVIATIONS = new Set([
  'rs', 'no', 'nos', 'vs', 'v', 'dr', 'mr', 'mrs', 'ms', 'prof', 'hons', 'e.g', 'i.e', 'eg', 'ie', 'etc', 'approx', 'appx',
  'b.tech', 'm.tech', 'b.sc', 'm.sc', 'b.e', 'm.e', 'b.com', 'm.com', 'b.a', 'm.a', 'm.b.a', 'b.b.a', 'b.ed', 'm.ed', 'b.arch', 'm.arch',
  'b.pharm', 'm.pharm', 'd.pharm', 'pharm.d', 'ph.d', 'm.phil', 'b.des', 'm.des', 'b.voc', 'm.d', 'm.s', 'b.p.t', 'b.lib', 'll.b', 'll.m',
  'pvt', 'ltd', 'univ', 'st', 'sr', 'jr', 'govt', 'dept', 'inst', 'est', 'estd', 'sq', 'ft', 'km', 'max', 'min', 'yr', 'yrs', 'sec',
  'ref', 'fig', 'vol', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec', 'inc', 'co', 'corp', 'smt', 'shri', 'sh', 'u.s', 'u.k', 'mt'
]);

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

function parse(html: string): Node {
  const root: Node = { tag: '#root', attrs: {}, children: [] };
  const stack: Node[] = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\?[^>]*>|<\/\s*([a-zA-Z][a-zA-Z0-9]*)\s*>|<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)\s*(\/?)>|[^<]+|</g;
  let m: RegExpExecArray | null;
  let dropUntil: string | null = null;
  while ((m = re.exec(html))) {
    const token = m[0];
    if (dropUntil) {
      if (m[1] && m[1].toLowerCase() === dropUntil) dropUntil = null;
      continue;
    }
    if (token.startsWith('<!') || token.startsWith('<?')) continue;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const idx = stack.map((n) => n.tag).lastIndexOf(tag);
      if (idx > 0) stack.length = idx;
      continue;
    }
    if (m[2]) {
      const tag = m[2].toLowerCase();
      if (DROP_WITH_CONTENT.has(tag)) { if (!m[4]) dropUntil = tag; continue; }
      const node: Node = { tag, attrs: parseAttrs(m[3] || ''), children: [] };
      // Implicitly close an open <p>/<li>/cell when a new sibling opens.
      const top = stack[stack.length - 1];
      if (tag === 'p' && top.tag === 'p') stack.pop();
      if (tag === 'li') { const i = stack.map((n) => n.tag).lastIndexOf('li'); const l = Math.max(stack.map((n) => n.tag).lastIndexOf('ul'), stack.map((n) => n.tag).lastIndexOf('ol')); if (i > l && i > 0) stack.length = i; }
      if (tag === 'td' || tag === 'th') { const i = Math.max(stack.map((n) => n.tag).lastIndexOf('td'), stack.map((n) => n.tag).lastIndexOf('th')); const t = stack.map((n) => n.tag).lastIndexOf('tr'); if (i > t && i > 0) stack.length = i; }
      if (tag === 'tr') { const i = stack.map((n) => n.tag).lastIndexOf('tr'); const t = stack.map((n) => n.tag).lastIndexOf('table'); if (i > t && i > 0) stack.length = i; }
      stack[stack.length - 1].children.push(node);
      if (!VOID.has(tag) && !m[4]) stack.push(node);
      continue;
    }
    if (token === '<') {
      // Unterminated / broken tag (e.g. a truncated inline base64 <img>): drop it up to the next '>' or the end.
      if (/[a-zA-Z\/!]/.test(html.charAt(re.lastIndex))) {
        const close = html.indexOf('>', re.lastIndex);
        re.lastIndex = close === -1 ? html.length : close + 1;
        continue;
      }
      stack[stack.length - 1].children.push('&lt;');
      continue;
    }
    // Drop escaped junk tags that scrapers stored as text, e.g. "&lt;error/&gt;" runs.
    // Also drop pathological repeated-character runs (e.g. 5,900 "o"s from a broken font export).
    const textToken = token.replace(/&lt;\/?[a-zA-Z][a-zA-Z0-9]*\s*\/?&gt;/g, '').replace(REPEATED_RUN, '').replace(/>/g, '&gt;');
    if (textToken) stack[stack.length - 1].children.push(textToken);
  }
  return root;
}

/** 30+ copies of the same non-space character (or 15+ of the same entity) is never real text. */
const REPEATED_RUN = /([^\s&])\1{29,}|(&[a-zA-Z0-9#]+;)\2{14,}/g;

const plain = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();

function escapeAttr(v: string) {
  return v.replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function safeHref(href: string): string | null {
  const h = href.trim().replace(/&amp;/g, '&');
  if (/^(https?:)?\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h) || /^\/(?!\/)/.test(h) || /^#[\w-]+$/.test(h)) return h;
  return null;
}

/** Returns the href to use, or null to drop the link and keep its words. */
export type LinkResolver = (href: string) => string | null;

type Opts = { headingShift: number; resolveLink?: LinkResolver };

/** Serialise inline content (text + allowed inline tags). Block tags inside inline context are flattened to text. */
function inlineHtml(nodes: Array<Node | string>, opts: Opts): string {
  let out = '';
  for (const n of nodes) {
    if (typeof n === 'string') { out += n; continue; }
    if (n.tag === 'br') { out += '<br>'; continue; }
    if (n.tag === 'img' || VOID.has(n.tag)) { out += ' '; continue; }
    const inner = inlineHtml(n.children, opts);
    if (n.tag === 'a') {
      let href = safeHref(n.attrs.href || '');
      if (href && opts.resolveLink) href = opts.resolveLink(href);
      if (!href || !plain(inner)) { out += inner; continue; }
      const external = /^(https?:)?\/\//i.test(href);
      out += external ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<a href="${escapeAttr(href)}">${inner}</a>`;
      continue;
    }
    if (INLINE_ALLOWED.has(n.tag)) { out += plain(inner) ? `<${n.tag}>${inner}</${n.tag}>` : inner; continue; }
    if (BLOCK_ALLOWED.has(n.tag) || BLOCK_CONTAINERS.has(n.tag) || n.tag in HEADING_MAP) { out += ` ${inner} `; continue; }
    out += inner;
  }
  return out;
}

const isBlockish = (n: Node | string) => typeof n !== 'string' && (BLOCK_ALLOWED.has(n.tag) || BLOCK_CONTAINERS.has(n.tag) || n.tag in HEADING_MAP);

/** Trim leading/trailing whitespace and <br>s of an inline run. */
function trimInline(s: string) {
  return s.replace(/^(?:\s|&nbsp;|&#160;|<br>)+/i, '').replace(/(?:\s|&nbsp;|&#160;|<br>)+$/i, '').replace(/\s+/g, ' ');
}

/** Wrap an inline run into paragraphs: blank-line / double <br> starts a new paragraph. */
function runToParagraphs(run: string): string[] {
  return run.split(/(?:\s*<br>\s*){2,}|\n\s*\n/).map(trimInline).filter((p) => plain(p)).map((p) => `<p>${p}</p>`);
}

function cell(n: Node, opts: Opts): string {
  const attrs: string[] = [];
  for (const a of ['colspan', 'rowspan']) if (/^\d{1,2}$/.test(n.attrs[a] || '')) attrs.push(` ${a}="${n.attrs[a]}"`);
  return `<${n.tag}${attrs.join('')}>${trimInline(inlineHtml(n.children, opts))}</${n.tag}>`;
}

function table(n: Node, opts: Opts): string {
  const rows: string[] = [];
  const walk = (node: Node, section: string) => {
    for (const c of node.children) {
      if (typeof c === 'string') continue;
      if (c.tag === 'thead' || c.tag === 'tbody' || c.tag === 'tfoot') walk(c, c.tag);
      else if (c.tag === 'tr') {
        const cells = c.children.filter((x): x is Node => typeof x !== 'string' && (x.tag === 'td' || x.tag === 'th')).map((x) => cell(x, opts));
        if (cells.some((x) => plain(x))) rows.push(`${section}|<tr>${cells.join('')}</tr>`);
      } else if (c.tag === 'td' || c.tag === 'th') rows.push(`${section}|<tr>${cell(c, opts)}</tr>`);
      else walk(c, section);
    }
  };
  walk(n, 'tbody');
  if (!rows.length) return '';
  const head = rows.filter((r) => r.startsWith('thead|')).map((r) => r.slice(6));
  const body = rows.filter((r) => !r.startsWith('thead|')).map((r) => r.slice(r.indexOf('|') + 1));
  const caption = n.children.find((c): c is Node => typeof c !== 'string' && c.tag === 'caption');
  return `<div class="table-wrap"><table>${caption ? `<caption>${trimInline(inlineHtml(caption.children, opts))}</caption>` : ''}${head.length ? `<thead>${head.join('')}</thead>` : ''}<tbody>${body.join('')}</tbody></table></div>`;
}

function list(n: Node, opts: Opts): string {
  const items: string[] = [];
  let loose = '';
  const flush = () => { if (plain(loose)) items.push(`<li>${trimInline(loose)}</li>`); loose = ''; };
  for (const c of n.children) {
    if (typeof c !== 'string' && c.tag === 'li') {
      flush();
      const nested = c.children.filter((x): x is Node => typeof x !== 'string' && (x.tag === 'ul' || x.tag === 'ol'));
      const inline = trimInline(inlineHtml(c.children.filter((x) => typeof x === 'string' || (x.tag !== 'ul' && x.tag !== 'ol')), opts));
      const sub = nested.map((x) => list(x, opts)).join('');
      if (plain(inline) || sub) items.push(`<li>${inline}${sub}</li>`);
    } else if (typeof c !== 'string' && (c.tag === 'ul' || c.tag === 'ol')) { flush(); const s = list(c, opts); if (s) items.push(`<li>${s}</li>`); }
    else loose += inlineHtml([c], opts);
  }
  flush();
  return items.length ? `<${n.tag}>${items.join('')}</${n.tag}>` : '';
}

function blocks(nodes: Array<Node | string>, opts: Opts, out: string[]) {
  let run = '';
  const flush = () => { if (run) out.push(...runToParagraphs(run)); run = ''; };
  for (const n of nodes) {
    if (!isBlockish(n)) { run += inlineHtml([n], opts); continue; }
    flush();
    const node = n as Node;
    if (node.tag in HEADING_MAP) {
      const level = Math.min(4, Math.max(2, Number(HEADING_MAP[node.tag][1]) + opts.headingShift));
      const inner = trimInline(inlineHtml(node.children, opts)).replace(/<br>/g, ' ');
      if (plain(inner)) out.push(`<h${level}>${inner}</h${level}>`);
    } else if (node.tag === 'p') {
      // A <p> may wrongly contain blocks (scraped markup); recurse when it does.
      if (node.children.some(isBlockish)) blocks(node.children, opts, out);
      else out.push(...runToParagraphs(inlineHtml(node.children, opts)));
    } else if (node.tag === 'ul' || node.tag === 'ol') { const l = list(node, opts); if (l) out.push(l); }
    else if (node.tag === 'table') { const t = table(node, opts); if (t) out.push(t); }
    else if (node.tag === 'li') { const l = list({ tag: 'ul', attrs: {}, children: [node] }, opts); if (l) out.push(l); }
    else if (['tr', 'td', 'th', 'thead', 'tbody', 'tfoot'].includes(node.tag)) { const t = table({ tag: 'table', attrs: {}, children: [node] }, opts); if (t) out.push(t); }
    else blocks(node.children, opts, out);
  }
  flush();
}

/** Find sentence ends in an inline HTML string, only outside tags and outside open inline elements. */
export function sentenceBreaks(html: string): number[] {
  const breaks: number[] = [];
  let depth = 0;
  const re = /<\/?([a-z0-9]+)[^>]*>|([.?!])(["”’)]?)(\s+)(?=(?:<(?:strong|b|em|i)>)?["“(]?[A-Z0-9])/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[1]) {
      const tag = m[1].toLowerCase();
      if (tag === 'br') continue;
      depth += m[0][1] === '/' ? -1 : 1;
      if (depth < 0) depth = 0;
      continue;
    }
    if (depth > 0) continue;
    const end = m.index + 1 + m[3].length;
    if (m[2] === '.') {
      const before = html.slice(Math.max(0, m.index - 30), m.index);
      const word = (before.match(/([A-Za-z0-9.&;]+)$/) || ['', ''])[1];
      const w = word.toLowerCase().replace(/^\.+/, '');
      if (!w) continue;
      if (ABBREVIATIONS.has(w)) continue;
      if (/^[a-z]$/i.test(w)) continue; // single initial: "A. P.", "J. K."
      if (/^(?:[a-z]\.)+[a-z]$/i.test(w)) continue; // dotted acronyms: U.P, B.Tech style
      if (/\d$/.test(w) && /^\d/.test(html.slice(end).trimStart())) continue; // "5. 5" style numbering fragments
    }
    breaks.push(end + m[4].length);
  }
  return breaks;
}

const TARGET = 320;
const LONG = 450;
const VERY_LONG = 700;
const MIN_PART = 150;

/**
 * Secondary break points for paragraphs that are still overlong because they are one huge sentence.
 * Tiers, best first: "; " / missing-space sentence ends ("text.Next") / ": Capital"; then spaced dashes; then
 * ", and|while|which|but|whereas|where". Only outside tags/inline elements. Positions are after the punctuation.
 */
function secondaryBreaks(html: string): number[][] {
  const tiers: number[][] = [[], [], []];
  let depth = 0;
  const re = /<\/?([a-z0-9]+)[^>]*>|(;\s+)|([a-z]{3}[.?!])(?=["“(]?[A-Z][a-z])|(:\s+)(?=["“(]?[A-Z0-9])|(\s[–—-]\s+)|(,\s+)(?=(?:and|while|which|but|whereas|where|with|including)\s)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[1]) {
      if (m[1].toLowerCase() === 'br') continue;
      depth += m[0][1] === '/' ? -1 : 1;
      if (depth < 0) depth = 0;
      continue;
    }
    if (depth > 0) continue;
    const end = m.index + m[0].length;
    if (m[2] || m[3] || m[4]) tiers[0].push(end);
    else if (m[5]) tiers[1].push(end);
    else if (m[6]) tiers[2].push(end);
  }
  return tiers;
}

/** Split an overlong single-sentence chunk near its middle at the best available secondary boundary. */
function splitVeryLong(inner: string): string[] {
  if (plain(inner).length <= VERY_LONG) return [inner];
  const total = plain(inner).length;
  for (const tier of secondaryBreaks(inner)) {
    let best = -1;
    let bestScore = Infinity;
    for (const pos of tier) {
      const left = plain(inner.slice(0, pos)).length;
      if (left < MIN_PART || total - left < MIN_PART) continue;
      const score = Math.abs(left - total / 2);
      if (score < bestScore) { bestScore = score; best = pos; }
    }
    if (best > 0) return [...splitVeryLong(inner.slice(0, best).trim()), ...splitVeryLong(inner.slice(best).trim())];
  }
  return [inner];
}

/** Split one paragraph's inner HTML into groups of 2–4 sentences. Text is unchanged; only paragraph boundaries are added. */
export function splitParagraphInner(inner: string): string[] {
  if (plain(inner).length <= LONG) return [inner];
  const cuts = sentenceBreaks(inner);
  if (!cuts.length) return splitVeryLong(inner);
  const sentences: string[] = [];
  let start = 0;
  for (const c of cuts) { sentences.push(inner.slice(start, c)); start = c; }
  sentences.push(inner.slice(start));
  const groups: string[] = [];
  let cur = '';
  let count = 0;
  for (const s of sentences) {
    cur += s;
    count += 1;
    const len = plain(cur).length;
    if ((count >= 2 && len >= TARGET) || count >= 4 || len >= 600) { groups.push(cur); cur = ''; count = 0; }
  }
  if (cur) {
    if (groups.length && plain(cur).length < 120) groups[groups.length - 1] += cur;
    else groups.push(cur);
  }
  return groups.map((g) => g.trim()).filter((g) => plain(g)).flatMap(splitVeryLong);
}

/** Safety net for already-structured HTML: split only overlong plain <p> elements; leaves every other tag untouched. */
export function splitLongParagraphs(html: string): string {
  if (!html) return html;
  return html.replace(/<p(\s[^>]*)?>((?:(?!<\/?p[\s>])[\s\S])*?)<\/p>/gi, (whole, attrs = '', inner: string) => {
    if (/<(?:div|table|ul|ol|h[1-6]|figure|img|section|blockquote|script)\b/i.test(inner)) return whole;
    if (plain(inner).length <= LONG) return whole;
    const parts = splitParagraphInner(inner);
    return parts.length > 1 ? parts.map((p) => `<p${attrs}>${p}</p>`).join('') : whole;
  });
}

const BULLET = /^(?:[•·▪●◦■□►▸✓✔*]|&bull;|&#8226;)(?:\s|&nbsp;|&#160;)*/i;

/**
 * Turn one overlong paragraph into readable blocks. Line breaks are real boundaries in scraped text:
 * "<br>• item" lines become a list, other <br>-separated lines are grouped into short paragraphs,
 * and anything still long is split by sentence. Words are kept; only bullet glyphs become list markup.
 */
function paragraphBlocks(inner: string): string[] {
  const asParas = (x: string) => splitParagraphInner(x).map((p) => `<p>${p}</p>`);
  if (plain(inner).length <= LONG || !/<br>/.test(inner) || /<(?:strong|b|em|i|a|sub|sup)\b[^>]*>(?:(?!<\/(?:strong|b|em|i|a|sub|sup)>)[\s\S])*<br>/i.test(inner)) return asParas(inner);
  const lines = inner.split(/\s*<br>\s*/).map(trimInline).filter((l) => plain(l));
  const out: string[] = [];
  let group = '';
  let items: string[] = [];
  const flushGroup = () => { if (plain(group)) out.push(...asParas(group)); group = ''; };
  const flushItems = () => { if (items.length) out.push(`<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`); items = []; };
  for (const line of lines) {
    if (BULLET.test(line)) { flushGroup(); items.push(line.replace(BULLET, '')); continue; }
    flushItems();
    group = group ? `${group}<br>${line}` : line;
    if (plain(group).length >= TARGET) flushGroup();
  }
  flushItems();
  flushGroup();
  return out;
}

const VIDEO_LEFTOVER = /\b(watch|see|check) the (following |given )?video\b|\bvideo (given|shown) below\b/i;

/** Sanitise + restructure stored HTML into readable top-level blocks. */
export function readableBlocks(html: unknown, options: { headingShift?: number; resolveLink?: LinkResolver } = {}): string[] {
  const source = String(html || '');
  if (!source.trim()) return [];
  const out: string[] = [];
  blocks(parse(source).children, { headingShift: options.headingShift ?? 0, resolveLink: options.resolveLink }, out);
  const result: string[] = [];
  for (const b of out) {
    const text = plain(b);
    if (!text || /^[\s\u200b\u00a0]*$/.test(text)) continue;
    if (VIDEO_LEFTOVER.test(text) && text.length < 200 && b.startsWith('<p')) continue;
    if (b.startsWith('<p>')) result.push(...paragraphBlocks(b.slice(3, -4)));
    else result.push(b);
  }
  return result;
}

export function readableHtml(html: unknown, options: { headingShift?: number; resolveLink?: LinkResolver } = {}): string {
  return readableBlocks(html, options).join('');
}

/** Split readable blocks into an always-visible lead and a collapsible rest, cutting only at block boundaries. */
export function splitLead(blocksList: string[], { min = 600, max = 900, collapseOver = 900 } = {}): { lead: string; rest: string } {
  const total = blocksList.reduce((n, b) => n + plain(b).length, 0);
  if (total <= collapseOver || blocksList.length < 2) return { lead: blocksList.join(''), rest: '' };
  let len = 0;
  let i = 0;
  for (; i < blocksList.length; i++) {
    const b = blocksList[i];
    const isPara = b.startsWith('<p');
    if (i > 0 && len >= min) break;
    if (i > 0 && !isPara && len >= 250) break; // stop before a heading/table/list once there is a real lead
    if (i > 0 && len + plain(b).length > max && len >= 250) break;
    len += plain(b).length;
  }
  // Never leave a trailing heading in the lead.
  while (i > 1 && /^<h[2-4]/.test(blocksList[i - 1])) i -= 1;
  const rest = blocksList.slice(i);
  if (plain(rest.join('')).length < 120) return { lead: blocksList.join(''), rest: '' };
  return { lead: blocksList.slice(0, i).join(''), rest: rest.join('') };
}
