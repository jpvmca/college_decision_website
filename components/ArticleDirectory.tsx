'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import { mediaUrl, type ArticleList } from '../lib/api';

type Article = ArticleList['data'][number];

function getResponsiveImageSources(rawImageUrl: string) {
  // Site-local static assets (e.g. /articles-hero.webp in public/) are served by Next, not the media backend.
  if (rawImageUrl.startsWith('/') && !rawImageUrl.startsWith('/uploads/')) {
    return { src: rawImageUrl, srcSet: undefined, sizes: undefined };
  }
  const imageUrl = mediaUrl(rawImageUrl);
  const widths = [480, 768, 1200, 1600];
  const addQuery = (width: number) => `${imageUrl}?w=${width}&h=${Math.round(width * 0.5625)}&q=78&convert=webp`;
  return {
    src: addQuery(1200),
    srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', '),
    sizes: '(max-width: 760px) 100vw, 50vw'
  };
}

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
    <div className="article-list">
      {items.length ? items.map((article) => (
        <article className={article.imageUrl ? 'article-card article-card-with-image' : 'article-card'} key={article.id}>
          {article.imageUrl && (() => {
            const image = getResponsiveImageSources(article.imageUrl);
            return <img className="article-card-image" src={image.src} srcSet={image.srcSet} sizes="(max-width: 760px) calc(100vw - 40px), min(1080px, calc(100vw - 40px))" alt={article.title} width="1200" height="675" loading="lazy" decoding="async" />;
          })()}
          <div className="article-card-content">
          <div className="article-card-top">
            <span className="pill">{type === 'all'
              ? article.articleType === 'fees'
                ? 'Course fees'
                : article.articleType === 'admission'
                  ? 'Admission & eligibility'
                  : article.articleType === 'gov-avg-package'
                    ? 'Gov · avg package'
                    : article.articleType === 'exam-admission'
                      ? 'MBA · entrance exam'
                    : 'Budget guide'
              : pill}</span>
            <span className="muted">{article.candidateCount || 0} options</span>
          </div>
          <h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2>
          <p className="article-card-excerpt">{article.content || 'Compare fees, eligibility, admission route and outcomes before making a college decision.'}</p>
          <div className="article-facts">
            <span><CheckCircle2 size={15} aria-hidden="true" /> {article.articleType === 'gov-avg-package' ? 'Average package ranked' : article.articleType === 'exam-admission' ? 'Entrance exam matched' : article.articleType === 'admission' ? 'Eligibility checked' : article.articleType === 'fees' ? 'Fee comparison' : 'Budget comparison'}</span>
            <span><CheckCircle2 size={15} aria-hidden="true" /> {article.articleType === 'gov-avg-package' ? 'Government colleges' : 'Admission context'}</span>
            {article.placementCount ? <span><CheckCircle2 size={15} aria-hidden="true" /> {article.placementCount} placement-linked options</span> : null}
            {article.examCount ? <span><CheckCircle2 size={15} aria-hidden="true" /> {article.examCount} entrance routes</span> : null}
          </div>
          </div>
        </article>
      )) : <div className="card"><h2>Guides are being prepared</h2><p>No article passed the current data checks.</p></div>}
    </div>
    {(items.length < total || error) && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>{loading ? 'Loading guides…' : error ? 'Try again' : 'Load more'} <ArrowDown size={16} aria-hidden="true" /></button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
