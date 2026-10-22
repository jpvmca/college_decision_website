'use client';

import { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, ClipboardList, BookOpen, FileText, Loader2, X } from 'lucide-react';
import { EMPTY_SUGGEST, SUGGEST_GROUPS, highlight, type SuggestItem, type SuggestResult } from '../lib/typeahead';

const DEBOUNCE_MS = 200;
const MIN_CHARS = 2;
const ICONS = { colleges: Building2, exams: ClipboardList, courses: BookOpen, articles: FileText } as const;

type Props = { initialQuery?: string; variant?: 'header' | 'page'; autoFocus?: boolean };

/** Site typeahead: grouped colleges / exams / courses / articles, WAI-ARIA combobox with keyboard navigation. */
export default function SearchBox({ initialQuery = '', variant = 'header', autoFocus = false }: Props) {
  const router = useRouter();
  const uid = useId().replace(/:/g, '');
  const listId = `search-list-${uid}`;
  const [keyword, setKeyword] = useState(initialQuery);
  const [data, setData] = useState<SuggestResult>(EMPTY_SUGGEST);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const cache = useRef(new Map<string, SuggestResult>());
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const q = keyword.trim();
  const enough = q.replace(/\s/g, '').length >= MIN_CHARS;

  useEffect(() => {
    if (!enough) { setData(EMPTY_SUGGEST); setLoading(false); setFailed(false); return; }
    const key = q.toLowerCase().replace(/\s+/g, ' ');
    const cached = cache.current.get(key);
    if (cached) { setData(cached); setLoading(false); setFailed(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}&limit=5`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as { data: SuggestResult };
        if (cache.current.size > 200) cache.current.clear();
        cache.current.set(key, json.data);
        setData(json.data);
        setFailed(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    // A newer keystroke cancels both the pending timer and any in-flight request.
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [q, enough]);

  useEffect(() => { setActive(-1); }, [data]);

  // Click/tap outside closes.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const groups = useMemo(() => SUGGEST_GROUPS.map((g) => ({ ...g, items: data[g.key] as SuggestItem[] })).filter((g) => g.items.length), [data]);
  // Flat option list for keyboard navigation; last option is "See all results".
  const flat = useMemo(() => [...groups.flatMap((g) => g.items.map((item) => ({ href: item.href }))), { href: `/search?q=${encodeURIComponent(q)}` }], [groups, q]);
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const showPanel = open && enough;
  const allHref = `/search?q=${encodeURIComponent(q)}`;

  function go(href: string) {
    setOpen(false);
    input.current?.blur();
    router.push(href);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active >= 0 && flat[active]) { go(flat[active].href); return; }
    if (q) go(allHref);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => (i + 1) % flat.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setActive((i) => (i <= 0 ? flat.length - 1 : i - 1)); }
    else if (e.key === 'Escape') { if (open) { e.preventDefault(); setOpen(false); setActive(-1); } else if (keyword) setKeyword(''); }
    else if (e.key === 'Tab') setOpen(false);
  }

  let n = -1;
  return <div className={`site-search${variant === 'page' ? ' site-search-page' : ''}`} ref={root}>
    <form className="search-form" onSubmit={submit} role="search" action="/search">
      <input
        ref={input}
        name="q"
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
        aria-label="Search colleges, exams, courses and guides"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        enterKeyHint="search"
        maxLength={80}
        value={keyword}
        onChange={(event) => { setKeyword(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search colleges, exams, courses…"
      />
      {keyword && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setKeyword(''); input.current?.focus(); }}><X size={16} aria-hidden="true" /></button>}
      <button type="submit"><Search size={17} aria-hidden="true" /> <span>Search</span></button>
    </form>
    {showPanel && <div className="search-suggestions typeahead" id={listId} role="listbox" aria-label={`Suggestions for ${q}`} aria-busy={loading}>
      {loading && !groups.length && <p className="ta-status"><Loader2 size={16} className="ta-spin" aria-hidden="true" /> Searching…</p>}
      {!loading && failed && <p className="ta-status">Search is unavailable right now. Press Enter to try the full results page.</p>}
      {!loading && !failed && !groups.length && <p className="ta-status">No matches for “{q}”. Check the spelling or try a college short name like “IIT” or a course like “MBA”.</p>}
      {data.fuzzy && groups.length > 0 && <p className="ta-hint">Showing close matches for “{q}”</p>}
      {groups.map((g) => {
        const Icon = ICONS[g.key];
        return <div className="ta-group" role="group" aria-labelledby={`${listId}-${g.key}`} key={g.key}>
          <div className="ta-group-label" id={`${listId}-${g.key}`}><Icon size={13} aria-hidden="true" /> {g.label}</div>
          {g.items.map((item) => {
            n += 1;
            const i = n;
            return <a key={`${item.type}-${item.id}`} id={optionId(i)} role="option" aria-selected={active === i} className={`ta-option${active === i ? ' is-active' : ''}`} href={item.href}
              onMouseEnter={() => setActive(i)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); go(item.href); }}>
              <strong>{highlight(item.title, data.fuzzy ? '' : q)}</strong>
              {item.subtitle && <small>{item.type === 'listing' ? 'Listing · ' : ''}{item.subtitle}</small>}
            </a>;
          })}
        </div>;
      })}
      {(groups.length > 0 || !loading) && <a id={optionId(flat.length - 1)} role="option" aria-selected={active === flat.length - 1} className={`ta-all${active === flat.length - 1 ? ' is-active' : ''}`} href={allHref}
        onMouseEnter={() => setActive(flat.length - 1)} onClick={(e) => { e.preventDefault(); go(allHref); }}>See all results for “{q}” →</a>}
      {loading && groups.length > 0 && <span className="ta-loading-bar" aria-hidden="true" />}
    </div>}
  </div>;
}
