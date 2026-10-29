/**
 * Resolves links found inside stored (legacy) rich text to live URLs on this site.
 * Old content links to the previous site structure (https://www.collegedecision.in/university/<x>/admission,
 * /exam/<x>, /<course>-in-india, unpublished /colleges/<x>, removed /articles/<x>). At render time we:
 *  - turn absolute collegedecision.in links into relative paths,
 *  - keep links whose target is live,
 *  - rewrite legacy patterns to the live page when exactly one target matches,
 *  - otherwise return null so the caller unwraps the <a> and keeps its words.
 * Slugs are never changed; nothing in the DB is touched.
 */
import { api } from './api';

type Lists = { colleges: string[]; articles: string[]; exams: string[]; courses: string[] };

const SECTION_ANCHOR: Record<string, string> = {
  admission: '#admission', admissions: '#admission', 'courses-fees': '#fees', courses: '#courses', fees: '#fees',
  placements: '#placements', placement: '#placements', reviews: '#reviews', cutoff: '#cutoffs-exams', cutoffs: '#cutoffs-exams',
  ranking: '#rankings', rankings: '#rankings', faculty: '#faculty', faq: '#faq', faqs: '#faq'
};

/** Exams renamed since the old site (only used when the target exam is live). */
const EXAM_ALIASES: Record<string, string> = {
  cuet: 'cuet-ug', 'jee-mains': 'jee-main', 'cet-karnataka': 'kcet', 'ap-eamcet': 'ap-eapcet', 'ts-eamcet': 'ts-eapcet',
  'neet-(pg)': 'neet-pg', 'neet-ug': 'neet', 'mht-cet': 'mh-cet', 'ipu-cet': 'ggsipu-cet'
};
const EXAM_SUBPAGE = /-(?:application-procedure|important-dates|exam-pattern|syllabus|results?|admit-card|eligibility|cutoff|counselling|exam-centres|study-material|answer-key|registration)$/;

export type LinkResolver = (href: string) => string | null;

async function getJson<T>(path: string): Promise<T | null> {
  try { return await api<T>(path, { next: { revalidate: 3600, tags: ['seo:internal-link-index'] } }); } catch { return null; }
}

async function loadLists(): Promise<Lists> {
  const [colleges, articles, entities] = await Promise.all([
    getJson<{ data?: Array<{ slug: string }> }>('/colleges/published-slugs'),
    getJson<{ data?: Array<{ slug: string }> }>('/articles/published-slugs?limit=50000'),
    getJson<{ data?: { exams?: Array<{ slug: string }>; courses?: Array<{ slug: string }> } }>('/seo/linkable-entities')
  ]);
  return {
    colleges: (colleges?.data || []).map((x) => x.slug),
    articles: (articles?.data || []).map((x) => x.slug),
    exams: (entities?.data?.exams || []).map((x) => x.slug),
    courses: (entities?.data?.courses || []).map((x) => x.slug)
  };
}

/** Old college slugs were "<name>-<city>" or "<name>"; live ones are "<name>-<state>-<city>". Map an old slug to a live one only when unique. */
function buildCollegeAliases(slugs: string[]): Map<string, string | null> {
  const map = new Map<string, string | null>();
  const add = (key: string, slug: string) => {
    if (key.split('-').length < 3) return;
    const cur = map.get(key);
    if (cur === undefined) map.set(key, slug);
    else if (cur !== slug) map.set(key, null); // ambiguous
  };
  for (const slug of slugs) {
    const t = slug.split('-');
    for (let i = 1; i < t.length; i++) for (let n = 1; n <= 3 && i + n <= t.length; n++) add([...t.slice(0, i), ...t.slice(i + n)].join('-'), slug);
  }
  for (const slug of slugs) map.set(slug, slug);
  return map;
}

let cache: { at: number; resolver: LinkResolver } | null = null;

export function makeLinkResolver(lists: Lists): LinkResolver {
  const colleges = buildCollegeAliases(lists.colleges);
  const articles = new Set(lists.articles);
  const exams = new Set(lists.exams);
  const courses = new Set(lists.courses);
  const college = (slug: string, section?: string) => {
    const live = colleges.get(slug);
    return live ? `/colleges/${live}${section && SECTION_ANCHOR[section] ? SECTION_ANCHOR[section] : ''}` : null;
  };
  return (raw: string) => {
    const href = raw.trim();
    const abs = /^(?:https?:)?\/\/(?:www\.)?collegedecision\.in(\/[^\s]*)?$/i.exec(href);
    if (!abs && /collegedecision\.in/i.test(href)) return null; // malformed own-domain link (no scheme, ".collegedecision.in", glued URLs)
    if (!abs && !href.startsWith('/')) return href; // external, mailto, tel, #anchor: leave as is
    let path = abs ? abs[1] || '/' : href;
    if (/\s|https?:/i.test(path.slice(1))) return null; // several URLs glued together
    path = path.replace(/#.*$/, '').replace(/\?.*$/, '');
    const seg = path.split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s).toLowerCase(); } catch { return s.toLowerCase(); } });
    if (!seg.length) return '/';
    const [head, a, b] = seg;
    if (head === 'colleges' || head === 'university' || head === 'college') return a ? college(a, b) : head === 'colleges' ? '/colleges' : null;
    if (head === 'exams' || head === 'exam') {
      if (!a) return '/exams';
      const base = a.replace(EXAM_SUBPAGE, '').replace(/-exams?$/, '');
      for (const c of [a, base, EXAM_ALIASES[base] || '', a.replace(/-exam-\d+$/, ''), a.replace(/-\d+$/, '')]) if (c && exams.has(c)) return `/exams/${c}${head === 'exams' && b === 'cutoff' ? '/cutoff' : ''}`;
      return null;
    }
    if (head === 'articles') return !a ? '/articles' : articles.has(a) ? `/articles/${a}` : null;
    if (head === 'courses') return !a ? '/courses' : courses.has(a) ? `/courses/${a}` : null;
    if (seg.length === 1) {
      const m = /^(.+?)-(?:in-india|colleges-india)$/.exec(head);
      if (m && courses.has(m[1])) return `/courses/${m[1]}`;
      if (['about', 'contact', 'courses', 'exams', 'articles', 'colleges'].includes(head)) return `/${head}`;
    }
    return null;
  };
}

/** Cached per server process for an hour; falls back to "keep everything" if the backend is unavailable. */
export async function getLinkResolver(): Promise<LinkResolver> {
  if (cache && Date.now() - cache.at < 3600_000) return cache.resolver;
  const lists = await loadLists();
  if (!lists.colleges.length) return (h) => h;
  cache = { at: Date.now(), resolver: makeLinkResolver(lists) };
  return cache.resolver;
}
