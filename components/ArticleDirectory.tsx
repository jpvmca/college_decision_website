'use client';

import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import GuideCard from './GuideCard';
import type { ArticleList } from '../lib/api';

type Article = ArticleList['data'][number];

/** /articles list: first batch server-rendered; "Load more" fetches the next batch of the same filter without ?page=. */
export default function ArticleDirectory({ initial, total, perPage, type, budget, pill }: { initial: Article[]; total: number; perPage: number; type: string; budget: number; pill: string }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function loadMore() {
    if (loading || items.length >= total) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/articles?page=${page + 1}&perPage=${perPage}&type=${encodeURIComponent(type)}&budget=${budget}`);
      if (!response.ok) throw new Error('failed');
      const payload = await response.json() as { data?: Article[] };
      setItems((current) => { const seen = new Set(current.map((a) => a.id)); return [...current, ...(payload.data || []).filter((a) => !seen.has(a.id))]; });
      setPage((p) => p + 1);
    } catch { setError('Unable to load more guides. Please try again.'); } finally { setLoading(false); }
  }
  return <>
    {items.length ? <div className="ls-courses">{items.map((article) => (
      <GuideCard key={article.id} article={article} pill={type === 'all' ? undefined : pill} />
    ))}</div> : <div className="ls-empty"><h2>Guides are being prepared</h2><p>No article passed the current data checks.</p></div>}
    {(items.length < total || error) && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>{loading ? 'Loading guides…' : error ? 'Try again' : 'Load more'} <ArrowDown size={16} aria-hidden="true" /></button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
