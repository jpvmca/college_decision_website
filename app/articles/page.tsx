import type { Metadata } from 'next';
import Link from 'next/link';
import { api, ArticleList } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';

type ArticleType = 'all' | 'budget' | 'fees' | 'admission' | 'gov-avg-package';
const ALL_ARTICLE_TYPES: ArticleType[] = ['budget', 'fees', 'admission', 'gov-avg-package'];

function getVisibleArticleTypes() {
  const configured = process.env.NEXT_PUBLIC_ARTICLE_TYPES;
  if (configured == null) return ALL_ARTICLE_TYPES;
  return configured.split(',').map((value) => value.trim()).filter((value): value is ArticleType => ALL_ARTICLE_TYPES.includes(value as ArticleType));
}

function resolveType(value: string | undefined, visibleTypes: ArticleType[]): ArticleType {
  if (value && visibleTypes.includes(value as ArticleType)) return value as ArticleType;
  return 'all';
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ budget?: string; type?: string }> }): Promise<Metadata> {
  const query = await searchParams;
  const visibleTypes = getVisibleArticleTypes();
  if (!query.type && !query.budget) {
    return { title: 'Published college decision guides', description: 'Browse the latest published college guides covering fees, admission, eligibility and outcomes.', alternates: { canonical: '/articles' } };
  }
  if (query.type === 'admission' && visibleTypes.includes('admission')) return { title: 'Course admission and eligibility guides', description: 'Compare course eligibility, duration and admission routes using active programme data.', alternates: { canonical: '/articles' } };
  if (query.type === 'fees' && visibleTypes.includes('fees')) return { title: 'Top course colleges in India with fees 2026', description: 'Compare top course colleges in India with fees in 2026 using active fee records.', alternates: { canonical: '/articles' } };
  if (query.type === 'gov-avg-package' && visibleTypes.includes('gov-avg-package')) {
    return {
      title: 'Government colleges by average package',
      description: 'Compare government colleges by course and state using recorded average package data.',
      alternates: { canonical: '/articles' }
    };
  }
  const budget = [1, 3, 5, 10].includes(Number(query.budget)) ? Number(query.budget) : 5;
  return {
    title: `Top colleges in India 2026 under ₹${budget} lakh fees`,
    description: `Compare top course colleges in India in 2026 under ₹${budget} lakh fees, with eligibility and admission options.`,
    alternates: { canonical: '/articles' }
  };
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string; budget?: string; type?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const visibleTypes = getVisibleArticleTypes();
  const budget = [1, 3, 5, 10].includes(Number(params.budget)) ? Number(params.budget) : 5;
  const type = resolveType(params.type, visibleTypes);
  let result: ArticleList = { data: [], pagination: { page, perPage: 20, total: 0, totalPages: 0 }, budgetLakh: budget };
  try {
    result = await api<ArticleList>(`/articles?page=${page}&perPage=20&budget=${budget}&type=${type}`);
  } catch {
    // The empty state keeps the website renderable while the backend is unavailable.
  }
  const pill =
    type === 'admission'
      ? 'Admission & eligibility'
      : type === 'fees'
        ? 'Course fees'
        : type === 'gov-avg-package'
          ? 'Gov · avg package'
          : type === 'all'
            ? 'Published guide'
          : `Up to ₹${budget} lakh`;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/articles` }
        ]
      },
      {
        '@type': 'ItemList',
        name: 'Published college decision guides',
        description: 'Published college guides covering fees, admission, eligibility and outcomes.',
        numberOfItems: result.data.length,
        itemListElement: result.data.map((article, index) => ({
          '@type': 'ListItem',
          position: (page - 1) * result.pagination.perPage + index + 1,
          name: article.title,
          url: `${siteUrl}/articles/${article.slug}`
        }))
      }
    ]
  };
  return <main className="section"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Articles</span></nav>
    <div className="hero-inline"><p className="eyebrow">STUDENT DECISION GUIDES</p><h1>Compare colleges with a clearer plan</h1><p>Explore course-by-course guides that bring fees, admission routes, eligibility and outcomes into one practical comparison.</p></div>
    <p className="muted">Twenty guides appear on each page. Open a guide to see the matching course options and the questions you should verify before applying.</p>
    <div className="budget-tabs" aria-label="Article filters">
      {visibleTypes.includes('fees') && <Link className={type === 'fees' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=fees">Course fees</Link>}
      {visibleTypes.includes('admission') && <Link className={type === 'admission' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=admission">Admission & eligibility</Link>}
      {visibleTypes.includes('gov-avg-package') && <Link className={type === 'gov-avg-package' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=gov-avg-package">Gov by avg package</Link>}
      {visibleTypes.includes('budget') && [1, 3, 5, 10].map((value) => (
        <Link className={type === 'budget' && value === budget ? 'budget-tab active' : 'budget-tab'} key={value} href={`/articles?budget=${value}`}>
          Top colleges 2026 · Under ₹{value} lakh fees
        </Link>
      ))}
    </div>
    <div className="article-list">
      {result.data.length ? result.data.map((article) => (
        <article className="article-card" key={article.id}>
          <div className="article-card-top">
            <span className="pill">{type === 'all'
              ? article.articleType === 'fees'
                ? 'Course fees'
                : article.articleType === 'admission'
                  ? 'Admission & eligibility'
                  : article.articleType === 'gov-avg-package'
                    ? 'Gov · avg package'
                    : 'Budget guide'
              : pill}</span>
            <span className="muted">{article.candidateCount || 0} options</span>
          </div>
          <h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2>
          <p>{article.content || 'Compare fees, eligibility, admission route and outcomes before making a college decision.'}</p>
          <div className="article-facts">
            <span>✓ {article.articleType === 'gov-avg-package' ? 'Average package ranked' : article.articleType === 'admission' ? 'Eligibility checked' : article.articleType === 'fees' ? 'Fee comparison' : 'Budget comparison'}</span>
            <span>✓ {article.articleType === 'gov-avg-package' ? 'Government colleges' : 'Admission context'}</span>
            {article.placementCount ? <span>✓ {article.placementCount} placement-linked options</span> : null}
            {article.examCount ? <span>✓ {article.examCount} entrance routes</span> : null}
          </div>
        </article>
      )) : <div className="card"><h2>Guides are being prepared</h2><p>No article passed the current data checks.</p></div>}
    </div>
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} budget={budget} type={type} />}
  </div></main>;
}

function Pagination({ page, totalPages, budget, type }: { page: number; totalPages: number; budget: number; type: string }) {
  const query = `&budget=${budget}${type !== 'budget' ? `&type=${type}` : ''}`;
  return <nav className="pagination" aria-label="Article pages">
    {page > 1 && <Link className="page-arrow" href={`/articles?page=${page - 1}${query}`}>← Previous</Link>}
    <div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={`/articles?page=${item}${query}`}>{item}</Link>)}</div>
    {page < totalPages && <Link className="page-arrow" href={`/articles?page=${page + 1}${query}`}>Next →</Link>}
  </nav>;
}
