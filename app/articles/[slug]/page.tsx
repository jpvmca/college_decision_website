import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { getPageItems } from '../../../lib/pagination';
import CollegeDetailsModal from './CollegeDetailsModal';

type GeneratedArticle = {
  type: string;
  slug: string;
  title: string;
  course: { name: string; slug: string };
  state?: { name: string; slug: string };
  budgetLakh: number | null;
  candidateCount: number;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
  candidates: Array<{
    institute_id: number;
    course_id: number;
    institute_program_id: number;
    institute_name: string;
    institute_type: string;
    city: string | null;
    state: string | null;
    programme_name: string;
    duration: string | null;
    eligibility: string | null;
    min_total_fee?: string;
    max_total_fee?: string;
    fee_record_count?: number;
    admission_routes?: string | null;
    average_package?: number | string | null;
    highest_package?: number | string | null;
    placement_year?: number | string | null;
  }>;
};

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

function isDetailPaginationEnabled() {
  return process.env.NEXT_PUBLIC_ARTICLE_DETAIL_PAGINATION !== 'false';
}

async function getArticle(slug: string, page = 1): Promise<GeneratedArticle | null> {
  try {
    const response = await api<{ data: GeneratedArticle }>(`/articles/${slug}?page=${page}&perPage=20`);
    return response.data;
  } catch {
    return null;
  }
}

async function getPublishedArticleSlugs(): Promise<string[]> {
  try {
    const response = await api<{ data: string[] }>('/articles/published-slugs?limit=45000');
    return response.data;
  } catch {
    return [];
  }
}

function formatFee(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Fee available on request';
}

function formatPackage(value: number | string | null | undefined) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Package not listed';
  return `₹${amount} LPA`;
}

function isGovAvgPackageArticle(type: string) {
  return type.includes('government-state-avg-package') || type.includes('gov-avg-package');
}

function getSeoContext(article: GeneratedArticle) {
  const courseName = article.course.name;
  const cleanCourseName = courseName.replace(/\s*\/\s*/g, ' ').replace(/\s+-\s+/g, ' ').trim();
  if (isGovAvgPackageArticle(article.type)) {
    const stateName = article.state?.name || 'the selected state';
    return {
      primaryKeyword: `${cleanCourseName} government colleges in ${stateName} average package`,
      secondaryKeywords: [`${cleanCourseName} colleges ${stateName} placement`, `government ${cleanCourseName} colleges ${stateName} fees`, `${cleanCourseName} average salary ${stateName}`],
      intro: `This guide compares ${cleanCourseName} government colleges in ${stateName} by recorded average package. Use the placement figures as historical comparison points, then verify the latest fee, eligibility, admission and placement information with each institution.`,
      optionsHeading: `${cleanCourseName} government colleges to compare`
    };
  }
  if (article.type.includes('admission')) {
    return {
      primaryKeyword: `${cleanCourseName} admission and eligibility`,
      secondaryKeywords: [`${cleanCourseName} eligibility criteria`, `${cleanCourseName} entrance exams in India`, `how to get admission in ${cleanCourseName}`],
      intro: `This ${cleanCourseName} admission and eligibility guide brings together programme duration, eligibility wording and listed admission routes. Requirements can vary by institution and academic year, so use the comparison to prepare questions for the current official notice.`,
      optionsHeading: `${cleanCourseName} eligibility and admission options`
    };
  }
  if (article.type.includes('fees') || article.type.includes('budget')) {
    const budgetText = article.budgetLakh ? ` under ₹${article.budgetLakh} lakh` : '';
    return {
      primaryKeyword: `top ${cleanCourseName} colleges in india with fees 2026`,
      secondaryKeywords: article.budgetLakh
        ? [`${cleanCourseName} course fees in India`, `${cleanCourseName} college fees comparison`, `best ${cleanCourseName} colleges under ${article.budgetLakh} lakh`]
        : [`${cleanCourseName} course fees 2026`, `${cleanCourseName} colleges with fees`, `${cleanCourseName} fee comparison`],
      intro: article.budgetLakh
        ? `This guide compares ${cleanCourseName} colleges in India${budgetText} using recorded fee data. Alongside the fee lead, review course duration, eligibility, location and admission context before treating any option as affordable.`
        : `This guide compares top ${cleanCourseName} colleges in India with fees in 2026 using recorded course-fee data. Review fee duration, eligibility and location, then confirm the current total cost and additional charges with each institution.`,
      optionsHeading: article.budgetLakh ? `${cleanCourseName} colleges under ₹${article.budgetLakh} lakh to compare` : `${cleanCourseName} fee options to compare`
    };
  }
  return {
    primaryKeyword: `${cleanCourseName} college guide`,
    secondaryKeywords: [`${cleanCourseName} fees`, `${cleanCourseName} eligibility`, `${cleanCourseName} admission`],
    intro: `Use this ${cleanCourseName} college guide to compare the available course, fee, eligibility and admission information before making a shortlist.`,
    optionsHeading: `${cleanCourseName} options to compare`
  };
}

function getCandidateNote(candidate: GeneratedArticle['candidates'][number]) {
  if (!candidate.eligibility) {
    return `Eligibility is not listed for this option. Confirm the latest admission notice before applying.`;
  }
  if (candidate.institute_type === 'public') {
    return `${candidate.fee_record_count || 0} fee entries found. Public fees may vary by category, year and required charges.`;
  }
  return `${candidate.fee_record_count || 0} fee entries found. Private colleges may add development, hostel and other charges.`;
}

function getCandidateHeading(candidate: GeneratedArticle['candidates'][number]) {
  return candidate.programme_name
    ? `${candidate.institute_name} — ${candidate.programme_name}`
    : candidate.institute_name;
}

function getCourseContext(candidate: GeneratedArticle['candidates'][number]) {
  const location = [candidate.city, candidate.state].filter(Boolean).join(', ');
  const institute = candidate.institute_name || 'this institute';
  return `${candidate.programme_name || 'Programme'} at ${institute}${location ? `, ${location}` : ''}`;
}

const relatedGuides = [
  { slug: 'animation-ug-fees-in-india', title: 'Animation UG fees in India', description: 'Compare recorded fees, duration and eligibility.' },
  { slug: 'architecture-admission-eligibility', title: 'B.Arch admission and eligibility', description: 'Review duration, eligibility and listed admission routes.' },
  { slug: 'bams-government-colleges-in-haryana-by-average-package', title: 'B.A.M.S government colleges in Haryana by average package', description: 'Explore recorded placement package data.' },
  { slug: 'top-colleges-in-india-2026-animation-ug-under-1-lakh-fees', title: 'Top Animation UG colleges under ₹1 lakh fees', description: 'Find options matching the ₹1 lakh fee filter.' }
];

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const page = isDetailPaginationEnabled() ? Math.max(1, Number(query.page || 1)) : 1;
  const article = await getArticle(slug, page);
  if (!article) return { title: 'Article not found', robots: { index: false, follow: false } };
  const seo = getSeoContext(article);
  const pageTitle = page > 1 ? `${article.title} — Page ${page}` : article.title;
  const canonicalPath = page > 1 ? `/articles/${article.slug}?page=${page}` : `/articles/${article.slug}`;
  const canonical = `${getSiteUrl()}${canonicalPath}`;
  return {
    title: pageTitle,
    description: `${pageTitle}: ${seo.intro}`,
    keywords: [seo.primaryKeyword, ...seo.secondaryKeywords, `page ${page}`],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      title: pageTitle,
      description: seo.intro,
      url: canonical,
      images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'College Decision' }]
    },
    twitter: { card: 'summary_large_image', title: pageTitle }
  };
}

export default async function ArticleDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const page = isDetailPaginationEnabled() ? Math.max(1, Number(query.page || 1)) : 1;
  const article = await getArticle(slug, page);
  if (!article) notFound();
  const publishedArticleSlugs = await getPublishedArticleSlugs();
  const siteUrl = getSiteUrl();
  const seo = getSeoContext(article);
  const relatedVisible = relatedGuides
    .filter((guide) => guide.slug !== article.slug && publishedArticleSlugs.includes(guide.slug))
    .slice(0, 3);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: seo.intro,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/articles/${article.slug}` },
        about: { '@type': 'Course', name: article.course.name, keywords: seo.secondaryKeywords },
        author: { '@type': 'Organization', name: 'College Decision' },
        publisher: {
          '@type': 'Organization',
          name: 'College Decision',
          logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` }
        },
        image: `${siteUrl}/og/default.png`
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/articles` },
          { '@type': 'ListItem', position: 3, name: article.title, item: `${siteUrl}/articles/${article.slug}` }
        ]
      }
    ]
  };
  return <main className="section"><div className="wrap prose">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/articles">Articles</Link><span aria-hidden="true">›</span><span aria-current="page">{article.title}</span></nav>
    <h1>{article.title}</h1>
    <p className="article-backlink"><Link href="/articles">← Back to all Student Decision Guides</Link></p>
    <p className="muted">Showing page {article.pagination.page} of {article.pagination.totalPages} · {article.candidateCount} course options found · {isGovAvgPackageArticle(article.type) ? `Government colleges in ${article.state?.name || 'selected state'} ranked by average package` : article.budgetLakh ? `Budget guide: up to ₹${article.budgetLakh} lakh` : article.type.includes('admission') ? 'Course admission and eligibility guide' : 'Course fee guide'}</p>
    <div className="notice"><strong>Before you apply:</strong> {isGovAvgPackageArticle(article.type) ? 'placement packages are historical leads and can change by batch, role and recruiter mix. Confirm the latest official placement report before deciding.' : article.type.includes('admission') ? 'eligibility and admission routes can change by institution and academic year. Confirm the latest official notice before applying.' : 'treat these figures as fee leads, not final quotes. Confirm the academic year, currency, duration, hostel, mess, deposits and current admission rules with the institution.'}</div>
    <p className="article-intro">{seo.intro}</p>
    <h2>{seo.optionsHeading}</h2>
    {article.candidates.map((candidate, index) => <article className="card" key={`${candidate.institute_name}-${candidate.programme_name}-${index}`}><h3>{index + 1}. {getCandidateHeading(candidate)}</h3><p className="muted">{candidate.institute_type === 'public' ? 'Government or public institution' : 'Private institution'} · {candidate.city || 'Location not listed'}, {candidate.state || 'India'}</p><p className="course-context"><strong>Course:</strong> {getCourseContext(candidate)}</p><p><strong>Duration:</strong> {candidate.duration || 'Check the current programme duration.'}</p><p><strong>Eligibility:</strong> {candidate.eligibility || 'Check the latest college admission notice.'}</p>{isGovAvgPackageArticle(article.type) ? <><p className="price">{formatPackage(candidate.average_package)} average package{candidate.placement_year ? ` · ${candidate.placement_year}` : ''}</p>{candidate.highest_package ? <p><strong>Highest package:</strong> {formatPackage(candidate.highest_package)}</p> : null}</> : article.type.includes('admission') ? <p><strong>Admission route:</strong> {candidate.admission_routes || 'Check the latest official admission notice.'}</p> : <p className="price">{formatFee(candidate.min_total_fee || '')} lowest recorded fee</p>}<div className="card-actions"><small>{isGovAvgPackageArticle(article.type) ? 'Average package ranking uses active placement records for government or public institutes. Verify the latest official report before applying.' : article.type.includes('admission') ? 'Eligibility, duration and admission route are present in the active programme records. Verify the current official notice before applying.' : getCandidateNote(candidate)}</small><CollegeDetailsModal instituteId={candidate.institute_id} courseId={candidate.course_id} courseName={candidate.programme_name} /></div></article>)}
    <h2>How to use this guide</h2>
    <p>{isGovAvgPackageArticle(article.type) ? 'Start with the government colleges that report stronger average packages in your chosen state. Then compare eligibility, fees, admission route, facilities and the latest official placement report before applying.' : 'Start with the colleges that match your preferred location and admission route. Then compare the complete programme cost, duration, eligibility, entrance exam, facilities, learning resources, and recent placement information. A low displayed fee is useful only when it is current and complete.'}</p>
    {relatedVisible.length > 0 && <section className="related-guides" aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading">Related Student Decision Guides</h2>
      <div className="related-guide-list">{relatedVisible.map((guide) => <Link className="related-guide" href={`/articles/${guide.slug}`} key={guide.slug}><strong>{guide.title}</strong><span>{guide.description}</span></Link>)}</div>
    </section>}
    {isDetailPaginationEnabled() && article.pagination.totalPages > 1 && <nav className="pagination" aria-label="Article result pages">{page > 1 && <a className="page-arrow" href={`/articles/${article.slug}?page=${page - 1}`}>← Previous</a>}<div className="page-numbers">{getPageItems(article.pagination.totalPages, page).map((item, index) => item === 'ellipsis' ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <a className={item === page ? 'page-number current' : 'page-number'} aria-current={item === page ? 'page' : undefined} key={item} href={`/articles/${article.slug}?page=${item}`}>{item}</a>)}</div>{page < article.pagination.totalPages && <a className="page-arrow" href={`/articles/${article.slug}?page=${page + 1}`}>Next →</a>}</nav>}
  </div></main>;
}
