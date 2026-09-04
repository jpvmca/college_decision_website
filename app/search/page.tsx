import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '../../lib/api';
import CollegeDecisionCard, { CollegeDecisionResult } from '../../components/CollegeDecisionCard';
import CollegeDecisionFilter from '../../components/CollegeDecisionFilter';

type SearchResult = { title: string; slug: string; type: string; description: string };
type DecisionResponse = { data: CollegeDecisionResult[]; pagination: { page: number; perPage: number; total: number; totalPages: number } };

export const metadata: Metadata = {
  title: 'Search college guides',
  description: 'Search course, fee, admission and college decision guides.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true }
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const keyword = (query.q || '').trim();
  const hasDecisionFilters = Boolean(query.course);
  let results: SearchResult[] = [];
  let decisionResults: DecisionResponse = { data: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } };
  if (keyword) {
    try {
      const response = await api<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(keyword)}`);
      results = response.data;
    } catch {
      results = [];
    }
  }
  if (hasDecisionFilters) {
    try {
      const params = new URLSearchParams({ course: query.course || '', page: query.page || '1', perPage: '10' });
      for (const key of ['state', 'city', 'budgetMax', 'instituteType', 'branch', 'exam']) {
        if (query[key]) params.set(key, query[key] as string);
      }
      decisionResults = await api<DecisionResponse>(`/decision/recommendations?${params.toString()}`);
    } catch {
      decisionResults = { data: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } };
    }
  }
  if (hasDecisionFilters) {
    const page = decisionResults.pagination.page;
    const buildPageUrl = (nextPage: number) => {
      const params = new URLSearchParams();
      for (const key of ['course', 'state', 'city', 'budgetMax', 'instituteType', 'branch', 'exam']) {
        if (query[key]) params.set(key, query[key] as string);
      }
      params.set('page', String(nextPage));
      return `/search?${params.toString()}`;
    };
    return <main className="section"><div className="wrap">
      <CollegeDecisionFilter collapsible initialFilters={{ course: query.course, state: query.state, city: query.city, budgetMax: query.budgetMax, instituteType: query.instituteType, branch: query.branch, exam: query.exam }} />
      <div className="hero-inline"><p className="eyebrow">COLLEGE DECISION RESULTS</p><h1>{decisionResults.pagination.total.toLocaleString('en-IN')} colleges match your preferences</h1><p>Compare programme, location, fee and admission context before deciding.</p></div>
      {decisionResults.data.length ? <div className="decision-results-list">{decisionResults.data.map((item) => <CollegeDecisionCard key={item.programmeId} item={item} showCompare={decisionResults.pagination.total > 1} />)}</div> : <div className="card no-results"><h2>No colleges found</h2><p>Try selecting a wider budget or removing a branch, city, or exam filter.</p></div>}
      {decisionResults.pagination.totalPages > 1 && <nav className="decision-pagination" aria-label="College result pages"><Link className="page-arrow" href={buildPageUrl(Math.max(1, page - 1))} aria-disabled={page <= 1}>Previous</Link><span>Page {page} of {decisionResults.pagination.totalPages}</span><Link className="page-arrow" href={buildPageUrl(Math.min(decisionResults.pagination.totalPages, page + 1))} aria-disabled={page >= decisionResults.pagination.totalPages}>Next</Link></nav>}
    </div></main>;
  }
  return <main className="section"><div className="wrap">
    <div className="hero-inline"><p className="eyebrow">ARTICLE SEARCH</p><h1>{keyword ? `Search results for “${keyword}”` : 'Find a college decision guide'}</h1><p>Search by course name, such as B.Tech, MBA, architecture or pharmacy. Results are grouped by article type so you can choose the right intent.</p></div>
    {keyword && results.length ? <div className="article-list">{results.map((result) => <article className="article-card search-result-card" key={result.slug}><div className="article-card-top"><span className="pill">{result.type === 'budget' ? 'Budget guide' : result.type === 'fees' ? 'Fees guide' : result.type === 'admission' ? 'Admission guide' : result.type === 'exam-admission' ? 'MBA entrance guide' : 'Placement guide'}</span><span className="muted">Article</span></div><h2><Link href={`/articles/${result.slug}`}>{result.title}</Link></h2><p>{result.description}</p><Link className="button primary" href={`/articles/${result.slug}`}>Open guide</Link></article>)}</div> : <div className="card no-results"><h2>{keyword ? `No guides found for “${keyword}”` : 'Start with a course keyword'}</h2><p>Try a broader course name or browse the published guides:</p><p className="muted">You can also browse all available article types from the <Link href="/articles">article listing</Link>.</p></div>}
  </div></main>;
}
