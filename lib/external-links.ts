/**
 * Detects external website links and domain-like text in partner-submitted content.
 * Used to stop spam / backlinks in college-panel editors (About, Admissions and other text fields).
 *
 * Keep this file in sync with:
 *   college_decision_website/lib/external-links.ts
 *   college_decision_admin/src/external-links.ts
 *
 * Allowed: collegedecision.in (and subdomains), relative paths, #anchors, mailto:, tel:.
 * Official website / email / phone Contact fields are not passed through this helper.
 * Emails written as text (user@domain) are not treated as website links.
 * Academic abbreviations (B.Tech, M.Sc., Ph.D, e.g., Rs.5.5, Pvt. Ltd.) are ignored.
 */

const OUR_HOST = /(?:^|\.)collegedecision\.in$/i;

/** gTLDs + common ccTLDs. The registrable label must be at least 2 characters, so M.Sc / B.Tech / e.g. do not match. */
const TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'xyz', 'online', 'site', 'website', 'store', 'shop',
  'club', 'pro', 'tech', 'digital', 'agency', 'media', 'live', 'news', 'blog', 'space', 'fun', 'top', 'click', 'link',
  'work', 'cloud', 'page', 'today', 'world', 'life', 'company', 'services', 'solutions', 'group', 'email', 'host',
  'network', 'systems', 'software', 'app', 'dev', 'io', 'ai', 'co', 'me', 'tv', 'cc', 'us', 'uk', 'in', 'au', 'ca',
  'de', 'fr', 'nl', 'ru', 'cn', 'jp', 'kr', 'br', 'za', 'nz', 'pk', 'bd', 'lk', 'np', 'ae', 'sa', 'sg', 'my', 'id',
  'ph', 'hk', 'tw', 'vn', 'th', 'ng', 'ke', 'ie', 'es', 'it', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'at', 'be',
  'pt', 'gr', 'tr', 'il', 'mx', 'ar', 'cl', 'pe', 'eg', 'ma', 'tz', 'ug', 'gh', 'zw', 'mm', 'np',
  'edu', 'ac',
  // ccTLDs sometimes used in spam; 2-char SLD rule keeps degree abbreviations safe
  'sc', 'st', 'rs', 'ms', 'ps', 'to', 'fm', 'am', 'pm', 'ly', 'gd', 'gl', 'la', 'so', 'pw', 'ws', 'vc', 'vu', 'tk',
  'ml', 'ga', 'cf', 'gq', 'cm', 'cn', 'su', 'nu', 'sh', 'gg', 'im', 'je', 'cx', 'gs', 'ki', 'tl', 'mz'
].filter((v, i, a) => a.indexOf(v) === i);

const TLD_GROUP = TLDS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

/** Known abbreviations / degree names to mask before domain detection (flexible spaces and dots). */
const ABBREVIATION_RE = /\b(?:[BM]\s*\.\s*Tech|[BM]\s*\.\s*E(?:\b|\.)|[BM]\s*\.\s*Sc|[BM]\s*\.\s*Com|[BM]\s*\.\s*A(?:\b|\.)|[BM]\s*\.\s*Ed|[BM]\s*\.\s*Arch|[BM]\s*\.\s*Pharm|[BM]\s*\.\s*Des|[BM]\s*\.\s*Voc|[BM]\s*\.\s*BA|[BM]\s*\.\s*Lib|[BM]\s*\.\s*P\s*\.\s*T|Ph\s*\.\s*D|M\s*\.\s*Phil|M\s*\.\s*D(?:\b|\.)|M\s*\.\s*S(?:\b|\.)|LL\s*\.\s*[BM]|D\s*\.\s*Pharm|Pharm\s*\.\s*D|B\s*\.\s*P\s*\.\s*T|e\s*\.\s*g|i\s*\.\s*e|etc|vs|Pvt|Ltd|Inc|Llc|Dr|Mr|Mrs|Ms|Prof|Rs|No|Nos|Govt|Dept|Univ|Est|Estd|approx|Fig|Vol|Ref|Sr|Jr|Smt|Shri|St)\.?\b/gi;

const SCHEME_RE = /(?:^|[^A-Za-z0-9])((?:hxxps?|https?):\/\/[^\s<>"'））]+)(?![A-Za-z0-9-])/gi;
const WWW_RE = /(?:^|[^A-Za-z0-9/@._-])((?:www\.)[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9](?:\/[^\s<>"']*)?)/gi;
const BARE_SCHEME_RE = /(?:^|[^A-Za-z0-9])((?:hxxps?|https?):\/\/)(?![^\s<>"']*[A-Za-z0-9])/gi;
const BARE_WWW_RE = /(?:^|[^A-Za-z0-9/@._-])(www\.)(?![A-Za-z0-9])/gi;
const BARE_RE = new RegExp(
  // SLD (the label right before the TLD) must be at least 2 characters so "M.Sc", "B.Tech", "e.g." never match.
  String.raw`(?:^|[^A-Za-z0-9/@._-])((?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*` +
    String.raw`[A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9]\.(?:` + TLD_GROUP + String.raw`)(?::\d{2,5})?(?:\/[^\s<>"']*)?)(?![A-Za-z0-9-])`,
  'gi'
);

const ATTR_RE = /\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const EMBED_RE = /<\s*(iframe|embed|object|video|source|script)\b/gi;

export function isOurHost(hostname: string): boolean {
  return OUR_HOST.test(String(hostname || '').trim().replace(/\.$/, '').toLowerCase());
}

function hostnameOf(raw: string): string | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  try {
    if (/^(https?:)?\/\//i.test(value)) return new URL(value.startsWith('//') ? `https:${value}` : value).hostname;
    if (/^https?:/i.test(value)) return new URL(value).hostname;
  } catch {
    return null;
  }
  return null;
}

/** True for collegedecision.in, relative paths, in-page anchors, mailto: and tel:. */
export function isAllowedHref(href: string): boolean {
  const h = String(href || '').trim();
  if (!h || h === '#') return true;
  const lower = h.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return false;
  if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('sms:')) return true;
  if (h.startsWith('#') || (h.startsWith('/') && !h.startsWith('//'))) return true;
  const host = hostnameOf(h);
  if (host) return isOurHost(host);
  // Bare host in href without a scheme: only allow our domain.
  const bare = h.split('/')[0].split('?')[0].split(':')[0];
  return isOurHost(bare);
}

/** Our S3 / CloudFront / site hosts, or a site-relative path, may appear as image src. */
export function isAllowedSrc(src: string): boolean {
  const h = String(src || '').trim();
  if (!h) return false;
  if (h.startsWith('/') && !h.startsWith('//')) return true;
  if (h.startsWith('data:')) return false;
  const host = hostnameOf(h.startsWith('//') ? `https:${h}` : h);
  if (!host) return false;
  if (isOurHost(host)) return true;
  return /(?:^|\.)(?:amazonaws\.com|cloudfront\.net)$/i.test(host);
}

function deobfuscate(input: string): string {
  return String(input || '')
    .replace(/[\u3002\uff0e]/g, '.')
    .replace(/\[(?:\s*dot\s*|\s*\.\s*)\]|\((?:\s*dot\s*|\s*\.\s*)\)|\{(?:\s*dot\s*|\s*\.\s*)\}/gi, '.')
    .replace(/hxxps?:\/\//gi, (m) => (m.toLowerCase().startsWith('hxxps') ? 'https://' : 'http://'))
    .replace(/([A-Za-z0-9-])\s+dot\s+([A-Za-z0-9-])/gi, '$1.$2')
    .replace(/([A-Za-z0-9-])\s+\.\s+([A-Za-z0-9-])/g, '$1.$2');
}

function maskSafe(input: string): string {
  // Mask emails so user@college.edu.in is not treated as a website. Contact fields handle real emails.
  let s = input.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, ' §EMAIL§ ');
  s = s.replace(ABBREVIATION_RE, ' §ABBR§ ');
  return s;
}

function tidyHit(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\/?$/i.test(s) && s.toLowerCase() !== 'www.') s = s.replace(/[),.;:!?]+$/g, '');
  try {
    if (/^https?:\/\//i.test(s) || s.startsWith('//')) {
      const u = new URL(s.startsWith('//') ? `https:${s}` : s);
      s = u.hostname.replace(/^www\./i, '') + (u.pathname && u.pathname !== '/' ? u.pathname : '');
    }
  } catch { /* keep raw */ }
  if (s.toLowerCase() !== 'www.') s = s.replace(/^www\./i, '');
  return s.slice(0, 80);
}

function pushHit(out: string[], raw: string) {
  const hit = tidyHit(raw);
  if (!hit) return;
  const host = hostnameOf(/^https?:\/\//i.test(raw) || raw.startsWith('//') ? raw : `https://${raw}`) || hit.split('/')[0];
  if (host && isOurHost(host.replace(/^www\./i, '')) || isOurHost(host)) return;
  if (!out.includes(hit)) out.push(hit);
}

function collectFromText(text: string, out: string[]) {
  const prepared = maskSafe(deobfuscate(text));
  for (const re of [SCHEME_RE, WWW_RE, BARE_RE, BARE_SCHEME_RE, BARE_WWW_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(prepared))) {
      const raw = (m[1] || m[0] || '').replace(/^[^A-Za-z0-9]+/, '');
      if (!raw || raw.includes('§')) continue;
      // BARE_RE captures only the labels before the TLD; restore the TLD from the full match.
      const full = m[0].replace(/^[^A-Za-z0-9]+/, '');
      pushHit(out, re === BARE_RE ? full : raw);
    }
  }
}

function collectFromHtml(html: string, out: string[]) {
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(html))) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    if (!raw) continue;
    const attr = m[0].toLowerCase();
    const isSrc = /\ssrc\s*=|\sposter\s*=/.test(attr);
    if (isSrc) {
      if (!isAllowedSrc(raw)) pushHit(out, raw);
      continue;
    }
    if (!isAllowedHref(raw)) pushHit(out, raw);
  }
  EMBED_RE.lastIndex = 0;
  if (EMBED_RE.test(html)) {
    if (!out.includes('embedded media')) out.push('embedded media');
  }
}

/**
 * Unique, human-readable hits (hosts / paths) found in HTML or plain text.
 * Empty means the value is clean (or only contains allowed CollegeDecision / mailto / tel / relative links).
 */
export function findExternalLinks(value: unknown): string[] {
  const raw = String(value ?? '');
  if (!raw.trim()) return [];
  const out: string[] = [];
  if (/<[a-z][\s\S]*>/i.test(raw)) collectFromHtml(raw, out);
  collectFromText(raw, out);
  return out;
}

export function externalLinksMessage(fieldLabel: string, hits: string[]): string {
  const shown = hits.filter(Boolean).slice(0, 5);
  return `Links to other websites are not allowed in ${fieldLabel}. Please remove: ${shown.join(', ')}`;
}

/** Error message or null. Use this in both the API (throw 400) and the panel (inline warning). */
export function externalLinkError(value: unknown, fieldLabel: string): string | null {
  const hits = findExternalLinks(value);
  return hits.length ? externalLinksMessage(fieldLabel, hits) : null;
}

/** Keys that commonly hold our own file URLs (S3 / uploads) and must not be scanned as partner text. */
const SKIP_KEYS = new Set([
  'url', 'path', 'file_name', 'fileName', 'src', 'logo', 'proofFiles', 'proof_files', 'proofFileIds',
  'attachment', 'attachment_s3_key', 'preview'
]);

/**
 * Walk a change-request value and return any external-link hits, skipping the official website field
 * and storage/url keys. Used by the admin review flag.
 */
export function findExternalLinksInValue(value: unknown, fieldName?: string, depth = 0): string[] {
  if (depth > 8 || value == null) return [];
  if (fieldName === 'website') return [];
  if (typeof value === 'string') return findExternalLinks(value);
  if (Array.isArray(value)) return value.flatMap((v) => findExternalLinksInValue(v, fieldName, depth + 1));
  if (typeof value === 'object') {
    const out: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k) || k === 'website') continue;
      for (const hit of findExternalLinksInValue(v, k, depth + 1)) if (!out.includes(hit)) out.push(hit);
    }
    return out;
  }
  return [];
}
