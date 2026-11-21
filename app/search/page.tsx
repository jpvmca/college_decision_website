import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Search } from 'lucide-react';
import { api } from '../../lib/api';
import CollegeDecisionCard, { CollegeDecisionResult } from '../../components/CollegeDecisionCard';
import CollegeDecisionFilter from '../../components/CollegeDecisionFilter';
import SearchBox from '../../components/SearchBox';
import SearchResultGroups from '../../components/SearchResultGroups';
import HeroPhoto from '../../components/HeroPhoto';
import HeroStats from '../../components/HeroStats';
import { EMPTY_SUGGEST, SUGGEST_GROUPS, type SuggestResult } from '../../lib/typeahead';

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
  let results: SuggestResult = EMPTY_SUGGEST;
  let decisionResults: DecisionResponse = { data: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } };
  if (keyword) {
    try {
      const response = await api<{ data: SuggestResult }>(`/search/suggest?q=${encodeURIComponent(keyword.slice(0, 80))}&limit=20`, { cache: 'no-store' });
      results = response.data;
    } catch {
      results = EMPTY_SUGGEST;
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
    return <main className="section ls-page"><div className="wrap">
      <CollegeDecisionFilter collapsible initialFilters={{ course: query.course, state: query.state, city: query.city, budgetMax: query.budgetMax, instituteType: query.instituteType, branch: query.branch, exam: query.exam }} />
      <section className="ls-hero">
        <div className="ls-hero-inner">
          <div className="ls-hero-copy">
            <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> College decision results</span>
            <h1>{decisionResults.pagination.total.toLocaleString('en-IN')} colleges match your preferences</h1>
            <p>Compare programme, location, fee and admission context before deciding.</p>
            <div className="ls-hero-actions">
              <Link className="button ls-btn-primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link className="button ls-btn-ghost" href="/colleges">Browse all colleges</Link>
            </div>
          </div>
          <div className="ls-hero-visual"><HeroPhoto src="/colleges-hero.webp" alt="Students comparing colleges that match their preferences" /></div>
        </div>
        <HeroStats prefix="ls" stats={[{ icon: Search, value: decisionResults.pagination.total.toLocaleString('en-IN'), label: 'Matching colleges' }]} />
      </section>
      {decisionResults.data.length ? <div className="decision-results-list">{decisionResults.data.map((item) => <CollegeDecisionCard key={item.programmeId} item={item} showCompare={decisionResults.pagination.total > 1} />)}</div> : <div className="card no-results"><h2>No colleges found</h2><p>Try selecting a wider budget or removing a branch, city, or exam filter.</p></div>}
      {decisionResults.pagination.totalPages > 1 && <nav className="decision-pagination" aria-label="College result pages"><Link className="page-arrow" href={buildPageUrl(Math.max(1, page - 1))} aria-disabled={page <= 1}>Previous</Link><span>Page {page} of {decisionResults.pagination.totalPages}</span><Link className="page-arrow" href={buildPageUrl(Math.min(decisionResults.pagination.totalPages, page + 1))} aria-disabled={page >= decisionResults.pagination.totalPages}>Next</Link></nav>}
    </div></main>;
  }
  const groups = SUGGEST_GROUPS.map((g) => ({ ...g, items: results[g.key] })).filter((g) => g.items.length);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return <main className="section ls-page"><div className="wrap">
    <section className="ls-hero">
      <div className="ls-hero-inner">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><Search size={15} aria-hidden="true" /> Search</span>
          <h1>{keyword ? `Search results for “${keyword}”` : 'Search colleges, exams, courses and guides'}</h1>
          <p>{keyword ? `${total} match${total === 1 ? '' : 'es'}${results.fuzzy ? ' (close matches — check the spelling)' : ''}. Published colleges open their profile; others can be opened with View.` : 'Type a college name or short name (IIT, NMIMS), an entrance exam (CAT, JEE) or a course (MBA, B.Tech).'}</p>
        </div>
        <div className="ls-hero-visual"><HeroPhoto src="/colleges-hero.webp" alt="Search colleges, exams, courses and decision guides" /></div>
      </div>
    </section>
    <div className="ls-search-box"><SearchBox variant="page" initialQuery={keyword} autoFocus={!keyword} /></div>
    {keyword && groups.length ? <SearchResultGroups results={results} keyword={keyword} /> : <div className="card no-results"><h2>{keyword ? `No results for “${keyword}”` : 'Start typing to search'}</h2><p>Try a shorter name, a college abbreviation, or browse <Link href="/colleges">colleges</Link>, <Link href="/exams">exams</Link>, <Link href="/courses">courses</Link> and <Link href="/articles">guides</Link>.</p></div>}
  </div></main>;
}
