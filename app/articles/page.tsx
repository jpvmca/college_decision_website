import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ArticleList } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';
import { ArrowLeft, ArrowRight, CheckCircle2, Filter } from 'lucide-react';

type ArticleType = 'all' | 'budget' | 'fees' | 'admission' | 'gov-avg-package' | 'exam-admission';
const ALL_ARTICLE_TYPES: ArticleType[] = ['budget', 'fees', 'admission', 'gov-avg-package', 'exam-admission'];

function getVisibleArticleTypes() {
  const configured = process.env.NEXT_PUBLIC_ARTICLE_TYPES;
  if (configured == null) return ALL_ARTICLE_TYPES;
  return configured.split(',').map((value) => value.trim()).filter((value): value is ArticleType => ALL_ARTICLE_TYPES.includes(value as ArticleType));
}

function resolveType(value: string | undefined, visibleTypes: ArticleType[]): ArticleType {
  if (value && visibleTypes.includes(value as ArticleType)) return value as ArticleType;
  return 'all';
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function articlesHref(page: number, type: ArticleType, budget: number) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (type === 'budget') params.set('budget', String(budget));
  else if (type !== 'all') params.set('type', type);
  const query = params.toString();
  return query ? `/articles?${query}` : '/articles';
}

function getResponsiveImageSources(imageUrl: string) {
  const widths = [480, 768, 1200, 1600];
  const addQuery = (width: number) => `${imageUrl}?w=${width}&h=${Math.round(width * 0.5625)}&q=78&convert=webp`;
  return {
    src: addQuery(1200),
    srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', '),
    sizes: '(max-width: 760px) 100vw, 50vw'
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; budget?: string; type?: string }> }): Promise<Metadata> {
  const query = await searchParams;
  const page = pageNumber(query.page);
  const visibleTypes = getVisibleArticleTypes();
  const type = resolveType(query.type, visibleTypes);
  const budget = [1, 3, 5, 10].includes(Number(query.budget)) ? Number(query.budget) : 5;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const openGraphBase = { images: [{ url: `${siteUrl}/articles-hero.webp`, width: 1024, height: 576, alt: 'Students comparing college decision guides' }] };

  let result: ArticleList = { data: [], pagination: { page, perPage: 20, total: 0, totalPages: 0 }, budgetLakh: budget };
  try {
    result = await api<ArticleList>(`/articles?page=${page}&perPage=20&budget=${budget}&type=${type}`);
  } catch {
    /* keep metadata renderable */
  }

  if (page > 1 && result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
    return { title: 'Published college decision guides', robots: { index: false, follow: false } };
  }

  const canonical = page === 1 ? '/articles' : `/articles?page=${page}`;
  const pageSuffix = page > 1 ? ` - Page ${page}` : '';

  if (type === 'all' || (!query.type && !query.budget)) {
    const title = `Published college decision guides${pageSuffix}`;
    const description = page > 1
      ? `Browse published college guides covering fees, admission, eligibility and outcomes — page ${page}.`
      : 'Browse the latest published college guides covering fees, admission, eligibility and outcomes.';
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, ...openGraphBase },
      twitter: { card: 'summary_large_image', title, description },
      robots: page > result.pagination.totalPages && page > 1 ? { index: false, follow: false } : { index: true, follow: true }
    };
  }

  if (type === 'admission') {
    const title = `Course admission and eligibility guides${pageSuffix}`;
    const description = 'Compare course eligibility, duration and admission routes using active programme data.';
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, ...openGraphBase }, twitter: { card: 'summary_large_image', title, description } };
  }
  if (type === 'fees') {
    const title = `Top course colleges in India with fees 2026${pageSuffix}`;
    const description = 'Compare top course colleges in India with fees in 2026 using active fee records.';
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, ...openGraphBase }, twitter: { card: 'summary_large_image', title, description } };
  }
  if (type === 'gov-avg-package') {
    const title = `Government colleges by average package${pageSuffix}`;
    const description = 'Compare government colleges by course and state using recorded average package data.';
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, ...openGraphBase }, twitter: { card: 'summary_large_image', title, description } };
  }
  if (type === 'exam-admission') {
    const title = `MBA colleges accepting entrance exams${pageSuffix}`;
    const description = 'Compare MBA courses, eligibility and admission routes for colleges accepting listed entrance exams.';
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, ...openGraphBase }, twitter: { card: 'summary_large_image', title, description } };
  }

  const title = `Top colleges in India 2026 under ₹${budget} lakh fees${pageSuffix}`;
  const description = `Compare top course colleges in India in 2026 under ₹${budget} lakh fees, with eligibility and admission options.`;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, ...openGraphBase }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string; budget?: string; type?: string }> }) {
  const params = await searchParams;
  const page = pageNumber(params.page);
  const visibleTypes = getVisibleArticleTypes();
  const budget = [1, 3, 5, 10].includes(Number(params.budget)) ? Number(params.budget) : 5;
  const type = resolveType(params.type, visibleTypes);
  let result: ArticleList = { data: [], pagination: { page, perPage: 20, total: 0, totalPages: 0 }, budgetLakh: budget };
  try {
    result = await api<ArticleList>(`/articles?page=${page}&perPage=20&budget=${budget}&type=${type}`);
  } catch {
    // The empty state keeps the website renderable while the backend is unavailable.
  }
  if (page > 1 && result.pagination.totalPages > 0 && page > result.pagination.totalPages) notFound();
  if (page > 1 && result.pagination.totalPages === 0) notFound();

  const pill =
    type === 'admission'
      ? 'Admission & eligibility'
      : type === 'fees'
        ? 'Course fees'
        : type === 'gov-avg-package'
          ? 'Gov · avg package'
          : type === 'exam-admission'
            ? 'MBA · entrance exam'
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
    <section className="articles-hero"><div className="articles-hero-copy"><p className="eyebrow">STUDENT DECISION GUIDES</p><h1>Compare colleges with a clearer plan</h1><p>Explore course-by-course guides that bring fees, admission routes, eligibility and outcomes into one practical comparison.</p><p><Link className="button primary" href="/compare-colleges-2026">Compare colleges directly <ArrowRight size={16} aria-hidden="true" /></Link></p></div>{(() => { const image = getResponsiveImageSources('/articles-hero.webp'); return <img src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt="Students comparing college decision guides" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />; })()}</section>
    <p className="muted">Twenty guides appear on each page. Open a guide to see the matching course options and the questions you should verify before applying.</p>
    <div className="budget-tabs" aria-label="Article filters"><span className="filter-label"><Filter size={16} aria-hidden="true" /> Filter guides</span>
      {visibleTypes.includes('fees') && <Link className={type === 'fees' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=fees">Course fees</Link>}
      {visibleTypes.includes('admission') && <Link className={type === 'admission' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=admission">Admission & eligibility</Link>}
      {visibleTypes.includes('gov-avg-package') && <Link className={type === 'gov-avg-package' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=gov-avg-package">Gov by avg package</Link>}
      {visibleTypes.includes('exam-admission') && <Link className={type === 'exam-admission' ? 'budget-tab active' : 'budget-tab'} href="/articles?type=exam-admission">MBA by entrance exam</Link>}
      {visibleTypes.includes('budget') && [1, 3, 5, 10].map((value) => (
        <Link className={type === 'budget' && value === budget ? 'budget-tab active' : 'budget-tab'} key={value} href={`/articles?budget=${value}`}>
          Top colleges 2026 · Under ₹{value} lakh fees
        </Link>
      ))}
    </div>
    <div className="article-list">
      {result.data.length ? result.data.map((article) => (
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
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} budget={budget} type={type} />}
  </div></main>;
}

function Pagination({ page, totalPages, budget, type }: { page: number; totalPages: number; budget: number; type: ArticleType }) {
  return <nav className="pagination" aria-label="Article pages">
    {page > 1 && <Link className="page-arrow" href={articlesHref(page - 1, type, budget)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}
    <div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={articlesHref(item, type, budget)}>{item}</Link>)}</div>
    {page < totalPages && <Link className="page-arrow" href={articlesHref(page + 1, type, budget)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}
  </nav>;
}
