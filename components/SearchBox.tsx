'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Result = { title: string; slug: string; type: string; description: string };

export default function SearchBox() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, Result[]>());

  useEffect(() => {
    const value = keyword.trim();
    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const cached = cache.current.get(value.toLowerCase());
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search request failed');
        const payload = await response.json() as { data: Result[] };
        const nextResults = payload.data.slice(0, 6);
        cache.current.set(value.toLowerCase(), nextResults);
        setResults(nextResults);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = keyword.trim();
    if (value) window.location.assign(`/search?q=${encodeURIComponent(value)}`);
  }

  return <div className="site-search">
    <form className="search-form" onSubmit={submit} role="search">
      <input value={keyword} onChange={(event) => { setKeyword(event.target.value); setFocused(true); }} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 150)} aria-label="Search courses and college guides" placeholder="Search B.Tech, MBA, architecture…" />
      <button type="submit">Search</button>
    </form>
    {focused && keyword.trim().length >= 2 && <div className="search-suggestions">
      {loading ? <p>Searching…</p> : results.length ? results.map((result) => <Link key={result.slug} href={`/articles/${result.slug}`}><span className="search-type">{result.type}</span><strong>{result.title}</strong><small>{result.description}</small></Link>) : <p>No results found for “{keyword.trim()}”. Try another course or college name.</p>}
    </div>}
  </div>;
}
