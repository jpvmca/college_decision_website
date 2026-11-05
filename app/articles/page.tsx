import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { api, ArticleList } from '../../lib/api';
import { getPageItems } from '../../lib/pagination';
import ArticleFilters from '../../components/ArticleFilters';
import GuideCard from '../../components/GuideCard';
import AdSlot from '../../components/ads/AdSlot';
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, FileText } from 'lucide-react';

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

/** Pagination URLs carry only ?page= (never type/budget); page 1 is the clean /articles. */
function articlesHref(page: number, _type?: ArticleType, _budget?: number) {
  return page > 1 ? `/articles?page=${page}` : '/articles';
}

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

// Only ?page= is a real URL here; every other parameter (type, budget, ...) is 301'd away in proxy.ts and filters work client-side.
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const query = await searchParams;
  const page = pageNumber(query.page);
  const type: ArticleType = 'all';
  const budget = 5;
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

  if (type === 'all') {
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

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = pageNumber(params.page);
  const visibleTypes = getVisibleArticleTypes();
  const budget = 5;
  const type = resolveType(undefined, visibleTypes);
  let result: ArticleList = { data: [], pagination: { page, perPage: 20, total: 0, totalPages: 0 }, budgetLakh: budget };
  try {
    result = await api<ArticleList>(`/articles?page=${page}&perPage=20&budget=${budget}&type=${type}`);
  } catch {
    // The empty state keeps the website renderable while the backend is unavailable.
  }
  if (page > 1 && result.pagination.totalPages > 0 && page > result.pagination.totalPages) notFound();
  if (page > 1 && result.pagination.totalPages === 0) notFound();

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
  const stats = [
    result.pagination.total ? { icon: FileText, value: result.pagination.total, label: 'Guides listed' } : null,
    visibleTypes.length ? { icon: BookOpen, value: visibleTypes.length, label: 'Guide topics' } : null,
    result.pagination.totalPages > 1 ? { icon: BookOpen, value: result.pagination.totalPages, label: 'Pages' } : null
  ].filter((item): item is { icon: typeof FileText; value: number; label: string } => Boolean(item));
  return <main className="section ls-page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Articles</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> Student decision guides</span>
          <h1>Compare colleges with a clearer plan</h1>
          <p>Explore course-by-course guides that bring fees, admission routes, eligibility and outcomes into one practical comparison.</p>
          <div className="ls-hero-actions">
            <Link className="button ls-btn-primary" href="/compare-colleges-2026">Compare colleges directly <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="button ls-btn-ghost" href="/colleges">Browse colleges</Link>
          </div>
        </div>
        <div className="ls-hero-visual">
          <img src="/articles-hero.webp" alt="Students comparing college decision guides" width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />
        </div>
      </div>
      {stats.length > 0 && <dl className="ls-stats">{stats.map((item) => <div key={item.label}>
        <span className="ls-stat-icon"><item.icon size={18} aria-hidden="true" /></span>
        <dt>{item.label}</dt>
        <dd>{formatCount(item.value)}{item.value >= 20 ? '+' : ''}</dd>
      </div>)}</dl>}
    </section>
    <AdSlot slotKey="articles_top" className="listing-ad" />
    <div className="ls-head">
      <p className="ls-eyebrow"><FileText size={14} aria-hidden="true" /> Directory</p>
      <h2>Browse decision guides</h2>
    </div>
    <p className="ls-count">Twenty guides appear on each page. Open a guide to see the matching course options and the questions you should verify before applying.</p>
    <ArticleFilters visibleTypes={visibleTypes}>
    {result.data.length ? <div className="ls-courses">
      {result.data.map((article, index) => (
        <Fragment key={article.id}>
          <GuideCard article={article} index={index} />
          {(index + 1) % 5 === 0 ? <AdSlot slotKey="article_feed" className="ad-in-list" /> : null}
        </Fragment>
      ))}
    </div> : <div className="ls-empty"><h2>Guides are being prepared</h2><p>No article passed the current data checks.</p></div>}
    {result.pagination.totalPages > 1 && <Pagination page={page} totalPages={result.pagination.totalPages} budget={budget} type={type} />}
    </ArticleFilters>
    <AdSlot slotKey="articles_bottom" className="listing-ad" />
  </div></main>;
}

function Pagination({ page, totalPages, budget, type }: { page: number; totalPages: number; budget: number; type: ArticleType }) {
  return <nav className="pagination" aria-label="Article pages">
    {page > 1 && <Link className="page-arrow" href={articlesHref(page - 1, type, budget)}><ArrowLeft size={15} aria-hidden="true" /> Previous</Link>}
    <div className="page-numbers">{getPageItems(totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <Link className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={articlesHref(item, type, budget)}>{item}</Link>)}</div>
    {page < totalPages && <Link className="page-arrow" href={articlesHref(page + 1, type, budget)}>Next <ArrowRight size={15} aria-hidden="true" /></Link>}
  </nav>;
}
