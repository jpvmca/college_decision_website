import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '../../lib/api';

type SearchResult = { title: string; slug: string; type: string; description: string };

export const metadata: Metadata = {
  title: 'Search college guides',
  description: 'Search course, fee, admission and college decision guides.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true }
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams;
  const keyword = (query.q || '').trim();
  let results: SearchResult[] = [];
  if (keyword) {
    try {
      const response = await api<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(keyword)}`);
      results = response.data;
    } catch {
      results = [];
    }
  }
  return <main className="section"><div className="wrap">
    <div className="hero-inline"><p className="eyebrow">ARTICLE SEARCH</p><h1>{keyword ? `Search results for “${keyword}”` : 'Find a college decision guide'}</h1><p>Search by course name, such as B.Tech, MBA, architecture or pharmacy. Results are grouped by article type so you can choose the right intent.</p></div>
    {keyword && results.length ? <div className="article-list">{results.map((result) => <article className="article-card search-result-card" key={result.slug}><div className="article-card-top"><span className="pill">{result.type === 'budget' ? 'Budget guide' : result.type === 'fees' ? 'Fees guide' : result.type === 'admission' ? 'Admission guide' : 'Placement guide'}</span><span className="muted">Article</span></div><h2><Link href={`/articles/${result.slug}`}>{result.title}</Link></h2><p>{result.description}</p><Link className="button primary" href={`/articles/${result.slug}`}>Open guide</Link></article>)}</div> : <div className="card no-results"><h2>{keyword ? `No guides found for “${keyword}”` : 'Start with a course keyword'}</h2><p>Try a broader course name or one of these popular searches:</p><div className="search-ideas">{['engineering colleges', 'B.Tech', 'architecture colleges', 'MBA colleges', 'B.Pharm colleges'].map((idea) => <Link className="budget-tab" key={idea} href={`/search?q=${encodeURIComponent(idea)}`}>{idea}</Link>)}</div><p className="muted">You can also browse all available article types from the <Link href="/articles">article listing</Link>.</p></div>}
  </div></main>;
}
