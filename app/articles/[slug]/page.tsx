import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '../../../lib/api';
import ArticleCollegeList from '../../../components/ArticleCollegeList';
import CollegeComparisonArticle from '../../../components/articles/CollegeComparisonArticle';

export const revalidate = 300;

type GeneratedArticle = {
  type: string;
  slug: string;
  title: string;
  publishedAt?: string | null;
  publicationUpdatedAt?: string | null;
  imageUrl?: string | null;
  course: { name: string; slug: string };
  exam?: { id: number; name: string; slug: string; applyUrl?: string | null };
  state?: { name: string; slug: string };
  locationType?: 'india' | 'state' | 'city';
  location?: { name: string; slug: string };
  budgetLakh: number | null;
  packageThresholdLakh?: number | null;
  candidateCount: number;
  h1?: string;
  decisionScore?: { collegeA: number; collegeB: number };
  collegeA?: Record<string, unknown>;
  collegeB?: Record<string, unknown>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
  candidates: Array<{
    institute_id: number;
    course_id: number;
    institute_program_id: number;
    institute_name: string;
    logo?: string | null;
    institute_type: string;
    city: string | null;
    state: string | null;
    programme_name: string;
    duration: string | null;
    eligibility: string | null;
    min_total_fee?: string;
    max_total_fee?: string;
    fee_record_count?: number;
    qualifying_programme_count?: number;
    average_year_fee?: number | string | null;
    average_package?: number | string | null;
    nirf_rank?: number | string | null;
    nirf_out_of?: number | string | null;
    admission_routes?: string | null;
    highest_package?: number | string | null;
    placement_year?: number | string | null;
  }>;
};

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

function getResponsiveImageSources(imageUrl: string, preserveAspectRatio = false) {
  const widths = [480, 768, 1200, 1600];
  const quality = preserveAspectRatio ? 89 : 78;
  const addQuery = (width: number) => `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}w=${width}${preserveAspectRatio ? '' : `&h=${Math.round(width * 0.5625)}`}&q=${quality}&convert=webp`;
  return {
    src: addQuery(1200),
    srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', '),
    sizes: '(max-width: 760px) calc(100vw - 40px), min(1080px, calc(100vw - 40px))'
  };
}


async function getArticle(slug: string, page = 1): Promise<GeneratedArticle | null> {
  try {
    const response = await api<{ data: GeneratedArticle }>(`/articles/${slug}?page=${page}&perPage=20`, { next: { revalidate: 300 } });
    return response.data;
  } catch {
    return null;
  }
}

async function getPublishedArticleSlugs(): Promise<string[]> {
  try {
    const response = await api<{ data: Array<string | { slug: string }> }>('/articles/published-slugs?limit=45000');
    return response.data.map((item) => typeof item === 'string' ? item : item.slug).filter(Boolean);
  } catch {
    return [];
  }
}


function isGovAvgPackageArticle(type: string) {
  return type.includes('government-state-avg-package') || type.includes('gov-avg-package');
}

function isHighestPackageArticle(type: string) {
  return type.includes('highest-package-threshold');
}

function isAveragePackageExceedsFeesArticle(type: string) {
  return type.includes('average-package-exceeds-fees');
}

function isExamAdmissionArticle(type: string) {
  return type.includes('exam-admission');
}

function getSeoContext(article: GeneratedArticle) {
  const courseName = article.course.name;
  const cleanCourseName = courseName.replace(/\s*\/\s*/g, ' ').replace(/\s+-\s+/g, ' ').trim();
  if (article.type === 'college-comparison') {
    const collegeAName = (article.collegeA as { name?: string } | undefined)?.name || 'College A';
    const collegeBName = (article.collegeB as { name?: string } | undefined)?.name || 'College B';
    const compactAName = collegeAName.split(',')[0].trim();
    const compactBName = collegeBName.split(',')[0].trim();
    const comparisonCourse = /B\.? ?Tech|B\.?E\.?/i.test(cleanCourseName) ? 'B.Tech' : cleanCourseName;
    const primaryTopic = `${compactAName} vs ${compactBName} for ${comparisonCourse}`;
    return {
      primaryKeyword: primaryTopic,
      secondaryKeywords: [`${compactAName} vs ${compactBName} fees`, `${compactAName} vs ${compactBName} placements`, `${compactAName} vs ${compactBName} admission`, `${compactAName} vs ${compactBName} eligibility`, `${compactAName} vs ${compactBName} B.E. comparison`],
      intro: `Compare ${compactAName} and ${compactBName} for ${comparisonCourse} and B.E. branches, matched fees, eligibility, JEE Main admission, placements and campus location.`,
      metaDescription: `Compare ${compactAName} and ${compactBName} for ${comparisonCourse} and B.E. branches, matched fees, eligibility, JEE Main admission, placements and campus location.`,
      optionsHeading: `${primaryTopic}: quick comparison`
    };
  }
  if (isAveragePackageExceedsFeesArticle(article.type)) {
    const locationName = article.location?.name || 'India';
    return {
      primaryKeyword: `${cleanCourseName} colleges in ${locationName} where average package exceeds fees 2026`,
      secondaryKeywords: [`${cleanCourseName} fees and average package ${locationName}`, `${cleanCourseName} colleges ${locationName} placement value`, `${cleanCourseName} admission ${locationName}`],
      intro: `This guide compares ${cleanCourseName} colleges in ${locationName} where the recorded average placement package is higher than the recorded total programme fee. Treat this as a transparent database comparison, not a guaranteed salary or return.`,
      optionsHeading: `${cleanCourseName} colleges in ${locationName} with package above recorded fees`
    };
  }
  if (isHighestPackageArticle(article.type)) {
    const stateName = article.state?.name || 'the selected state';
    const threshold = article.packageThresholdLakh || 15;
    return {
      primaryKeyword: `${cleanCourseName} colleges in ${stateName} with ${threshold} lakh highest package`,
      secondaryKeywords: [`${cleanCourseName} placement ${stateName}`, `${cleanCourseName} colleges ${stateName} highest package`, `${cleanCourseName} admission ${stateName}`],
      intro: `This guide compares ${cleanCourseName} colleges in ${stateName} with recorded highest placement packages of at least ₹${threshold} lakh. Use the figures as historical evidence, then verify the latest placement report, fees and admission requirements with each college.`,
      optionsHeading: `${cleanCourseName} colleges in ${stateName} with ₹${threshold} lakh highest package`
    };
  }
  if (isGovAvgPackageArticle(article.type)) {
    const stateName = article.state?.name || 'the selected state';
    return {
      primaryKeyword: `${cleanCourseName} government colleges in ${stateName} average package`,
      secondaryKeywords: [`${cleanCourseName} colleges ${stateName} placement`, `government ${cleanCourseName} colleges ${stateName} fees`, `${cleanCourseName} average salary ${stateName}`],
      intro: `This guide compares ${cleanCourseName} government colleges in ${stateName} by recorded average package. Use the placement figures as historical comparison points, then verify the latest fee, eligibility, admission and placement information with each institution.`,
      optionsHeading: `${cleanCourseName} government colleges to compare`
    };
  }
  if (isExamAdmissionArticle(article.type)) {
    const examName = article.exam?.name || 'the selected entrance exam';
    return {
      primaryKeyword: `MBA colleges accepting ${examName} 2026`,
      secondaryKeywords: [`${examName} MBA colleges`, `${examName} eligibility`, `${examName} MBA admission process`],
      intro: `This guide compares MBA programmes at colleges linked to ${examName}. Review the listed course eligibility and admission routes, then confirm the current exam notice, institution requirements, dates and application process before applying.`,
      optionsHeading: `MBA colleges accepting ${examName}`
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


const relatedGuides = [
  { slug: 'animation-ug-fees-in-india', title: 'Animation UG fees in India', description: 'Compare recorded fees, duration and eligibility.' },
  { slug: 'architecture-admission-eligibility', title: 'B.Arch admission and eligibility', description: 'Review duration, eligibility and listed admission routes.' },
  { slug: 'bams-government-colleges-in-haryana-by-average-package', title: 'B.A.M.S government colleges in Haryana by average package', description: 'Explore recorded placement package data.' },
  { slug: 'top-colleges-in-india-2026-animation-ug-under-1-lakh-fees', title: 'Top Animation UG colleges under ₹1 lakh fees', description: 'Find options matching the ₹1 lakh fee filter.' }
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug, 1);
  if (!article) return { title: 'Article not found', robots: { index: false, follow: false } };
  const seo = getSeoContext(article);
  const pageTitle = article.title.replace(/\s*\|\s*College Decision\s*$/i, '').trim();
  const canonical = `${getSiteUrl()}/articles/${article.slug}`;
  return {
    title: pageTitle,
    description: 'metaDescription' in seo ? seo.metaDescription : `${pageTitle}: ${seo.intro}`,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      title: pageTitle,
      description: seo.intro,
      url: canonical,
      images: [{ url: article.imageUrl || '/og/default.png', width: 1200, height: 630, alt: article.imageUrl ? pageTitle : 'College Decision' }]
    },
    twitter: { card: 'summary_large_image', title: pageTitle }
  };
}

export default async function ArticleDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  if (query.page) permanentRedirect(`/articles/${slug}`);
  const article = await getArticle(slug, 1);
  if (!article) notFound();
  if (article.type === 'college-comparison' && article.collegeA && article.collegeB) {
    if (article.slug !== slug) redirect(`/articles/${article.slug}`);
    const breadcrumbTitle = article.title.replace(/\s*\|\s*College Decision\s*$/, '');
    const comparisonJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: article.h1 || article.title, mainEntityOfPage: `${getSiteUrl()}/articles/${article.slug}`, about: { '@type': 'Course', name: article.course.name } },
        { '@type': 'ItemList', name: `${article.course.name} college comparison`, itemListElement: [article.collegeA, article.collegeB].map((college, index) => ({ '@type': 'ListItem', position: index + 1, name: String((college as { name?: string })?.name || 'College') })) },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() }, { '@type': 'ListItem', position: 2, name: 'Articles', item: `${getSiteUrl()}/articles` }, { '@type': 'ListItem', position: 3, name: article.title, item: `${getSiteUrl()}/articles/${article.slug}` }] }
      ]
    };
    return <main className="section"><div className="wrap prose">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }} />
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/articles">Articles</Link><span aria-hidden="true">›</span><span aria-current="page">{breadcrumbTitle}</span></nav>
      <h1>{article.h1 || article.title}</h1>
      {article.imageUrl && (() => {
        const image = getResponsiveImageSources(article.imageUrl, true);
        return <img className="article-detail-image" src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={article.h1 || article.title} width="1200" height="800" fetchPriority="high" loading="eager" decoding="async" />;
      })()}
      <CollegeComparisonArticle article={article as unknown as Parameters<typeof CollegeComparisonArticle>[0]['article']} />
    </div></main>;
  }
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
        datePublished: article.publishedAt || undefined,
        dateModified: article.publicationUpdatedAt || article.publishedAt || undefined,
        author: {
          '@type': 'Organization',
          name: 'College Decision',
          url: siteUrl
        },
        publisher: {
          '@type': 'Organization',
          name: 'College Decision',
          logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` }
        },
        image: article.imageUrl || `${siteUrl}/og/default.png`
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
  const summaryLabel = isAveragePackageExceedsFeesArticle(article.type) ? `Recorded average package exceeds recorded fees in ${article.location?.name || 'India'}` : isHighestPackageArticle(article.type) ? `Colleges in ${article.state?.name || 'selected state'} with at least ₹${article.packageThresholdLakh || 15} lakh highest package` : isGovAvgPackageArticle(article.type) ? `Government colleges in ${article.state?.name || 'selected state'} ranked by average package` : isExamAdmissionArticle(article.type) ? `MBA colleges accepting ${article.exam?.name || 'the selected entrance exam'}` : article.budgetLakh ? `Budget guide: up to ₹${article.budgetLakh} lakh` : article.type.includes('admission') ? 'Course admission and eligibility guide' : 'Course fee guide';
  return <main className="section"><div className="wrap prose">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/articles">Articles</Link><span aria-hidden="true">›</span><span aria-current="page">{article.title}</span></nav>
    <h1>{article.title}</h1>
    {article.imageUrl && (() => {
      const image = getResponsiveImageSources(article.imageUrl);
      return <img className="article-detail-image" src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt={article.title} width="1200" height="675" fetchPriority="high" loading="eager" decoding="async" />;
    })()}
    <p className="article-backlink"><Link href="/articles">← Back to all Student Decision Guides</Link></p>
    <p><Link className="button primary" href="/compare-colleges-2026">Compare colleges side by side <ArrowRight size={16} aria-hidden="true" /></Link></p>
    <div className="notice"><strong>Before you apply:</strong> {isAveragePackageExceedsFeesArticle(article.type) || isHighestPackageArticle(article.type) || isGovAvgPackageArticle(article.type) ? 'placement packages are historical leads and can change by batch, role and recruiter mix. Confirm the latest official fee and placement report before deciding.' : isExamAdmissionArticle(article.type) ? `exam routes and college requirements can change. Confirm the current ${article.exam?.name || 'entrance exam'} notice and each institution's official admission process before applying.` : article.type.includes('admission') ? 'eligibility and admission routes can change by institution and academic year. Confirm the latest official notice before applying.' : 'treat these figures as fee leads, not final quotes. Confirm the academic year, currency, duration, hostel, mess, deposits and current admission rules with the institution.'}</div>
    <p className="article-intro">{seo.intro}</p>
    {isExamAdmissionArticle(article.type) && article.exam?.applyUrl && <p className="article-backlink"><a href={article.exam.applyUrl} target="_blank" rel="noreferrer">Open official {article.exam.name} information</a></p>}
    <h2>{seo.optionsHeading}</h2>
    <ArticleCollegeList
      slug={article.slug}
      articleType={article.type}
      initialCandidates={article.candidates}
      candidateCount={article.candidateCount}
      initialPage={article.pagination.page}
      totalPages={article.pagination.totalPages}
      summaryLabel={summaryLabel}
    />
    <h2>How to use this guide</h2>
    <p>{isAveragePackageExceedsFeesArticle(article.type) ? 'Use the package-above-fees result as a shortlist signal, then compare programme quality, fee coverage, eligibility, admission route and the latest official placement report.' : isHighestPackageArticle(article.type) ? 'Start with colleges that meet the package threshold, then compare programme quality, fees, eligibility, admission route and the latest official placement report before applying.' : isGovAvgPackageArticle(article.type) ? 'Start with the government colleges that report stronger average packages in your chosen state. Then compare eligibility, fees, admission route, facilities and the latest official placement report before applying.' : 'Start with the colleges that match your preferred location and admission route. Then compare the complete programme cost, duration, eligibility, entrance exam, facilities, learning resources, and recent placement information. A low displayed fee is useful only when it is current and complete.'}</p>
    {relatedVisible.length > 0 && <section className="related-guides" aria-labelledby="related-guides-heading">
      <h2 id="related-guides-heading">Related Student Decision Guides</h2>
      <div className="related-guide-list">{relatedVisible.map((guide) => <Link className="related-guide" href={`/articles/${guide.slug}`} key={guide.slug}><strong>{guide.title}</strong><span>{guide.description}</span></Link>)}</div>
    </section>}
  </div></main>;
}
