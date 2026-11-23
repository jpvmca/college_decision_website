import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, BadgeCheck, BookOpen, Building2, ChevronDown, ClipboardCheck, GraduationCap, IndianRupee, Lightbulb, Star, TriangleAlert } from 'lucide-react';
import { api, isNotFoundError, imageSrcSet, imageUrl as sizedImageUrl, mediaUrl } from '../../../lib/api';
import { courseDisplayName, courseSeo as buildCourseSeo } from '../../../lib/course-seo';
import { autoLinkHtml } from '../../../lib/auto-link-entities';
import { getLinkableEntities } from '../../../lib/linkable-entities';
import { stripEmbeddedFaqs } from '../../../lib/strip-embedded-faqs';
import AutoLinkedText from '../../../components/AutoLinkedText';
import { formatLpa } from '../../../lib/packages';
import CourseGeoLinks from '../../../components/CourseGeoLinks';
import AdSlot from '../../../components/ads/AdSlot';
import { splitLongParagraphs } from '../../../lib/readable-html';
import { plainText } from '../../../lib/readable-text';
import { courseListingHref, getCourseFacets } from '../../../lib/listings';
import LastUpdatedByline from '../../../components/LastUpdatedByline';
import { jsonLdAuthor } from '../../../lib/page-byline';

function SectionHead({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  return <div className="cp-section-head"><span className="cp-section-icon"><Icon size={20} strokeWidth={2} aria-hidden="true" /></span><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></div>;
}

type CourseProfile = {
  course: {
    id: number;
    name: string;
    slug: string;
    mode?: string | null;
    image?: string | null;
    htmlContent?: string | null;
  };
  programmes: Array<{
    programme_name: string;
    duration?: string | null;
    programme_count?: number | string | null;
  }>;
  programmeCount?: number;
  fees?: {
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
    average_year_fee?: number | string | null;
    programmes_with_fees?: number;
  } | null;
  exams: Array<{ id: number; name: string; slug: string }>;
  placements: Array<{ year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; organization?: string | null; industry?: string | null }>;
  articles: Array<{ slug: string; title: string; articleType?: string; imageUrl?: string | null; publishedAt?: string | null }>;
  reviewSummary: { count: number; averageRating: number | null; ratingBreakdown: Array<{ rating: number; count: number }> };
  updatedAt?: string | null;
  authorName?: string | null;
};

export const revalidate = 900;

// ISR: render each path on first visit, then serve cached HTML (time-based + on-demand revalidation).
export async function generateStaticParams() {
  return [];
}

async function getCourse(slug: string) {
  try {
    const response = await api<{ data: CourseProfile }>(`/courses/${encodeURIComponent(slug)}`, {
      next: { revalidate: 900, tags: ['courses', `course:${slug}`] }
    });
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

function courseSeo(profile: CourseProfile) {
  const pack = buildCourseSeo({
    course: profile.course,
    programmeCount: profile.programmeCount,
    fees: profile.fees,
    exams: profile.exams
  });
  return pack;
}

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

function packageValue(value: number | string | null | undefined) {
  const amount = Number(value);
  return formatLpa(amount);
}

function text(value: unknown, fallback = 'Not listed') {
  const clean = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function absoluteUrl(value: string, siteUrl: string) {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return `${siteUrl}/courses-hero.webp`;
  }
}

function uniqueProgrammeNames(programmes: CourseProfile['programmes'], fallback: string) {
  const names = Array.from(new Set(programmes.map((item) => text(item.programme_name, '')).filter(Boolean)));
  return names.length ? names : [fallback];
}

function profileFaqs(profile: CourseProfile, name: string, curated?: Array<{ question: string; answer: string }>) {
  if (curated?.length) return curated.slice(0, 12);
  const faqs: Array<{ question: string; answer: string }> = [];
  const questions = new Set<string>();
  const addFaq = (question: string, answer: string) => {
    if (!questions.has(question)) {
      questions.add(question);
      faqs.push({ question, answer });
    }
  };
  const programmeNames = uniqueProgrammeNames(profile.programmes, name);
  addFaq(`What does ${name} cover?`, `${name} programme records include ${programmeNames.slice(0, 4).join(', ')}.`);
  if (profile.fees?.min_total_fee || profile.fees?.max_total_fee) addFaq(`What are the fees for ${name}?`, `Recorded total fees for ${name} range from ${money(profile.fees?.min_total_fee)} to ${money(profile.fees?.max_total_fee)}. Confirm current category and additional charges before applying.`);
  if (profile.exams.length) addFaq(`Which entrance exams are accepted for ${name}?`, `The active mappings list ${profile.exams.slice(0, 6).map((exam) => exam.name).join(', ')}.`);
  if (profile.placements.length) addFaq(`Does ${name} have placement records?`, `Placement data is available for ${profile.placements.filter((item) => item.year).length || profile.placements.length} recorded year(s), including average and highest package values where reported.`);
  if (profile.placements.some((item) => Number(item.average_package) > 0)) addFaq(`What is the average package after ${name}?`, `The available placement records include average package values such as ${packageValue(profile.placements.find((item) => Number(item.average_package) > 0)?.average_package)}. Values can vary by year and specialisation.`);
  if (profile.rankings.length) addFaq(`Is ${name} ranked?`, `The profile contains ${profile.rankings.length} active ranking record(s), including ${profile.rankings.slice(0, 2).map((item) => `${item.ranking_body} rank ${item.rank}`).join(' and ')}.`);
  if (profile.reviewSummary.count && profile.reviewSummary.averageRating) addFaq(`What is the student rating for ${name}?`, `${name} has an average rating of ${profile.reviewSummary.averageRating.toFixed(1)} out of 5 from ${profile.reviewSummary.count} active review(s).`);
  if (profile.recruiters.length) addFaq(`Which recruiters hire ${name} graduates?`, `The available records include recruiters such as ${profile.recruiters.slice(0, 6).map((item) => plainText(item.name)).join(', ')}.`);
  addFaq(`What is the syllabus for ${name}?`, `The syllabus usually combines foundation subjects, practical learning, projects and course-specific electives. Check the target institute's latest semester-wise syllabus.`);
  addFaq(`How does ${name} admission work?`, `Check eligibility, accepted merit or entrance routes, application deadlines, selection stages and the final fee schedule with the target institute.`);
  addFaq(`What is the cutoff for ${name}?`, `Cutoffs vary by institute, exam, category, course format and admission year. Use the latest official notification rather than an old general estimate.`);
  addFaq(`What jobs can I pursue after ${name}?`, `Career options depend on specialisation, skills, internships and the hiring market. Compare role quality, placement participation and verified outcomes before enrolling.`);
  addFaq(`How should I compare ${name} institutes?`, `Compare recognition, syllabus, duration, total cost, location, internships, placement participation and student support instead of relying on the course name alone.`);
  addFaq(`Is ${name} available online or offline?`, `The available mode and delivery options can differ by institute. Confirm recognition, contact requirements, assessment rules and learner support for the exact programme.`);
  addFaq(`How should I use this ${name} profile?`, `Use the fees, exams, placement records and reviews as a research starting point. Confirm current admission dates, total cost and outcomes before applying.`);
  return faqs.slice(0, 12);
}

function decisionNote(profile: CourseProfile, name: string) {
  // A "from" total fee is only representative when enough programmes list a whole-course total;
  // otherwise use the average recorded annual fee (avoids a single outlier reading as the minimum).
  const totalFeeProgrammes = Number(profile.fees?.programmes_with_fees || 0);
  const minTotal = totalFeeProgrammes >= 5 ? Number(profile.fees?.min_total_fee || 0) : 0;
  const yearFee = Number(profile.fees?.average_year_fee || 0);
  const feeText = minTotal ? `recorded total fees from ${money(minTotal)}` : yearFee ? `an average recorded annual fee of about ${money(Math.round(yearFee / 1000) * 1000)}` : '';
  const averagePackage = Math.max(...profile.placements.map((item) => Number(item.average_package) || 0), 0);
  if (feeText && averagePackage) return `${name} has ${feeText} and placement records with year-wise average packages up to ${packageValue(averagePackage)}. Use these figures to shortlist, then verify the same programme, year and category before deciding.`;
  if (profile.placements.length) return `${name} has active placement records. Fee and package values can vary by year and specialisation, so compare the latest official report before applying.`;
  if (profile.reviewSummary.averageRating) return `${name} has a ${profile.reviewSummary.averageRating.toFixed(1)}/5 aggregate student rating. Prioritise official fee, admission and outcome information for your decision.`;
  return `Use ${name}'s eligibility, fee and admission records as a shortlist starting point. Confirm current dates, total cost and outcomes before applying.`;
}

function PlacementChart({ placements }: { placements: CourseProfile['placements'] }) {
  const rows = placements.filter((item) => item.year && (Number(item.average_package) > 0 || Number(item.highest_package) > 0)).sort((a, b) => Number(a.year) - Number(b.year));
  if (!rows.length) return null;
  const max = Math.max(...rows.flatMap((item) => [Number(item.average_package) || 0, Number(item.highest_package) || 0]), 1);
  return <div className="profile-chart" aria-label="Placement package trend chart">{rows.map((item) => <div className="profile-chart-row" key={item.year}><span>{item.year}</span><div className="profile-chart-bars"><i className="profile-bar average" style={{ width: `${(Number(item.average_package || 0) / max) * 100}%` }} title={`Average ${packageValue(item.average_package)}`} /><i className="profile-bar highest" style={{ width: `${(Number(item.highest_package || 0) / max) * 100}%` }} title={`Highest ${packageValue(item.highest_package)}`} /></div><small>{packageValue(item.highest_package)}</small></div>)}</div>;
}

function RatingChart({ breakdown }: { breakdown: CourseProfile['reviewSummary']['ratingBreakdown'] }) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0);
  if (!total) return null;
  return <div className="profile-rating-chart" aria-label="Student rating breakdown chart">{breakdown.map((item) => <div className="profile-rating-row" key={item.rating}><span>{item.rating}★</span><div><i style={{ width: `${(item.count / total) * 100}%` }} /></div><small>{item.count}</small></div>)}</div>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getCourse(slug);
  if (!profile) return { title: 'Course not found', robots: { index: false, follow: false } };
  const name = profile.course.name;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const imageUrl = absoluteUrl(profile.course.image ? mediaUrl(profile.course.image) || '/courses-hero.webp' : '/courses-hero.webp', siteUrl);
  const seo = courseSeo(profile);
  const title = seo.title;
  const description = seo.description;
  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: { canonical: `/courses/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', title, description, url: `${siteUrl}/courses/${slug}`, siteName: 'College Decision', images: [{ url: imageUrl, width: 1200, height: 630, alt: `${seo.displayName} course` }] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    other: { 'og:site_name': 'College Decision' }
  };
}

export default async function CourseProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCourse(slug);
  if (!profile) notFound();

  const name = profile.course.name;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/courses/${slug}`;
  const imageUrl = absoluteUrl(profile.course.image ? mediaUrl(profile.course.image) || '/courses-hero.webp' : '/courses-hero.webp', siteUrl);
  const seo = courseSeo(profile);
  const [linkableEntities, facets] = await Promise.all([getLinkableEntities(), getCourseFacets()]);
  const listing = facets.data.find((facet) => facet.courseSlug === profile.course.slug);
  const listingHref = listing ? courseListingHref(listing.key) : null;
  const currentYear = new Date().getFullYear();
  const linkedHtmlContent = autoLinkHtml(seo.faqs?.length ? stripEmbeddedFaqs(profile.course.htmlContent) : profile.course.htmlContent, linkableEntities, {
    excludeHrefs: [`/courses/${slug}`]
  }).replace(/(<img\b[^>]*\bsrc=")(\/uploads\/[^"]+)"/gi, (_, prefix: string, src: string) => `${prefix}${mediaUrl(src)}"`);
  const rating = profile.reviewSummary.averageRating;
  const faqs = profileFaqs(profile, seo.displayName, seo.faqs);
  const programmeNames = uniqueProgrammeNames(profile.programmes, name);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${pageUrl}#course`,
        name: seo.displayName,
        url: pageUrl,
        image: imageUrl,
        description: `Evidence-based ${seo.displayName} profile covering fees, admissions, placements and reviews in India.`,
        educationalCredentialAwarded: seo.displayName,
        about: profile.course.mode || undefined,
        provider: { '@type': 'Organization', name: 'College Decision', url: siteUrl },
        aggregateRating: rating && profile.reviewSummary.count ? {
          '@type': 'AggregateRating',
          ratingValue: Number(rating.toFixed(2)),
          reviewCount: profile.reviewSummary.count,
          bestRating: 5,
          worstRating: 1
        } : undefined
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
          { '@type': 'ListItem', position: 3, name: seo.displayName, item: pageUrl }
        ]
      },
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: seo.title,
        description: seo.description,
        mainEntityOfPage: pageUrl,
        author: jsonLdAuthor(profile.authorName),
        publisher: { '@type': 'Organization', name: 'College Decision', url: siteUrl, logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.svg', siteUrl) } },
        dateModified: profile.updatedAt || undefined
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'College Decision',
        publisher: { '@type': 'Organization', name: 'College Decision' }
      },
      ...(faqs.length ? [{
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
      }] : [])
    ]
  };

  return <main className="section college-profile-page cp-page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb cp-breadcrumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><Link prefetch={false} href="/courses">Courses</Link><span aria-hidden="true">›</span><span aria-current="page">{seo.displayName}</span></nav>
    <AdSlot slotKey="course_top" />
    <header className="cp-hero">
      <div className="cp-hero-top">
        <div className="cp-hero-media"><img src={profile.course.image ? sizedImageUrl(profile.course.image, 480) || imageUrl : imageUrl} srcSet={profile.course.image ? imageSrcSet(profile.course.image, [480, 768]) : undefined} sizes="(max-width: 760px) 100vw, 280px" alt={`${seo.displayName} course`} width="280" height="158" /></div>
        <div className="cp-hero-copy">
          <p className="cp-eyebrow">Course profile · {currentYear}</p>
          <h1>{seo.h1}</h1>
          <LastUpdatedByline updatedAt={profile.updatedAt} authorName={profile.authorName} />
          <div className="cp-hero-meta"><span><GraduationCap size={15} aria-hidden="true" /> {profile.course.mode || 'Course'} · India</span></div>
        </div>
      </div>
      <p className="cp-hero-lead"><AutoLinkedText text={seo.intro} entities={linkableEntities} options={{ excludeHrefs: [`/courses/${slug}`] }} /></p>
      <div className="cp-hero-badges"><span className="cp-pill is-verified"><BadgeCheck size={15} aria-hidden="true" /> Evidence-backed profile</span></div>
      <div className="cp-hero-actions">
        <Link prefetch={false} className="button ls-btn-primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={16} aria-hidden="true" /></Link>
        {listing && listingHref ? <Link prefetch={false} className="button cp-btn-ghost" href={listingHref}>{listing.label} colleges</Link> : <Link prefetch={false} className="button cp-btn-ghost" href="/colleges">Browse colleges</Link>}
      </div>
    </header>
    <section className="cp-glance" aria-labelledby="course-highlights-heading">
      <h2 id="course-highlights-heading" className="cp-sr-only">Course highlights</h2>
      <div className="cp-glance-grid">
        <div className="cp-glance-item"><span className="cp-glance-icon"><BookOpen size={18} aria-hidden="true" /></span><strong>{profile.programmeCount || profile.programmes.length || '—'}</strong><span>Active programmes</span></div>
        <div className="cp-glance-item"><span className="cp-glance-icon"><ClipboardCheck size={18} aria-hidden="true" /></span><strong>{profile.exams.length || '—'}</strong><span>Admission exams</span></div>
        <div className="cp-glance-item"><span className="cp-glance-icon"><Star size={18} aria-hidden="true" /></span><strong>{rating ? rating.toFixed(1) : '—'}</strong><span>Average rating</span></div>
        <div className="cp-glance-item"><span className="cp-glance-icon"><Building2 size={18} aria-hidden="true" /></span><strong>{profile.reviewSummary.count || '—'}</strong><span>Student reviews</span></div>
      </div>
    </section>
    <section className="cp-insight">
      <span className="cp-insight-icon"><Lightbulb size={20} aria-hidden="true" /></span>
      <div><p className="cp-insight-title">Decision note</p><p>{decisionNote(profile, seo.displayName)}</p></div>
    </section>

    {profile.course.htmlContent && <section className="course-html-content" aria-label={`${seo.displayName} course guide`} dangerouslySetInnerHTML={{ __html: splitLongParagraphs(linkedHtmlContent) }} />}

    {!profile.course.htmlContent && programmeNames.length > 0 && <section className="cp-card"><SectionHead icon={BookOpen} title={`${name} programme variants`} /><div className="profile-chips">{programmeNames.slice(0, 40).map((item) => <span key={item}>{item}</span>)}</div></section>}

    {!profile.course.htmlContent && (profile.fees?.min_total_fee || profile.fees?.max_total_fee || profile.exams.length > 0) && <section className="cp-card college-profile-columns">
      {(profile.fees?.min_total_fee || profile.fees?.max_total_fee) && <div><SectionHead icon={IndianRupee} title="Fees" /><p>Recorded total fees for {name} range from <strong>{money(profile.fees?.min_total_fee)}</strong> to <strong>{money(profile.fees?.max_total_fee)}</strong>. Confirm the current academic year, category, hostel, mess, deposits and other charges before applying.</p></div>}
      {profile.exams.length > 0 && <div><SectionHead icon={ClipboardCheck} title="Admission exams and routes" /><div className="profile-chips">{profile.exams.map((exam) => <Link prefetch={false} key={exam.id} href={`/exams/${exam.slug}`}>{exam.name}</Link>)}</div></div>}
    </section>}

    {!profile.course.htmlContent && (profile.placements.length > 0 || profile.reviewSummary.count > 0) && <section className="cp-card college-profile-columns">
      {profile.placements.length > 0 && <div><h2>Placements and packages</h2><PlacementChart placements={profile.placements} /><div className="profile-list">{profile.placements.map((placement, index) => <p key={`${placement.year}-${index}`}><strong>{placement.year || 'Year not listed'}:</strong> Average {packageValue(placement.average_package)} · Highest {packageValue(placement.highest_package)}</p>)}</div></div>}
      {profile.reviewSummary.count > 0 && <div><h2>Student ratings</h2><p><strong>{rating?.toFixed(1)} / 5</strong> aggregate rating from {profile.reviewSummary.count} active review{profile.reviewSummary.count === 1 ? '' : 's'}.</p><RatingChart breakdown={profile.reviewSummary.ratingBreakdown} /><p className="muted">Individual review text is omitted; use the rating distribution alongside the fee and placement evidence above.</p></div>}
    </section>}

    {!profile.course.htmlContent && (profile.rankings.length > 0 || profile.recruiters.length > 0) && <section className="cp-card college-profile-columns">
      {profile.rankings.length > 0 && <div><h2>Rankings</h2><div className="profile-list">{profile.rankings.slice(0, 30).map((ranking, index) => <p key={`${ranking.ranking_body}-${ranking.year}-${index}`}><strong>{ranking.ranking_body}</strong>: Rank {ranking.rank}{ranking.out_of ? ` / ${ranking.out_of}` : ''}{ranking.year ? ` · ${ranking.year}` : ''}</p>)}</div></div>}
      {profile.recruiters.length > 0 && <div><h2>Recruiters and industry connections</h2><div className="profile-chips">{profile.recruiters.slice(0, 50).map((recruiter) => <span key={recruiter.id}>{recruiter.name}</span>)}</div></div>}
    </section>}

    {!profile.course.htmlContent && <section className="cp-card"><SectionHead icon={GraduationCap} title={`About ${seo.displayName}`} /><p>{seo.displayName} is listed as a study path in India. Use this page as a research starting point and confirm current course fees, eligibility, admission dates and placement outcomes before applying.</p></section>}
    
    <AdSlot slotKey="course_mid_1" />
    {(seo.crossLink || profile.exams.length > 0) && <section className="cp-card college-profile-columns" aria-label="Related pathways">
      {seo.crossLink ? <div><h2>Related course guide</h2><p>{seo.crossLink.note} <Link prefetch={false} href={seo.crossLink.href}>{seo.crossLink.anchor}</Link></p></div> : null}
      {profile.exams.length > 0 ? <div><h2>Entrance exams for {seo.displayName}</h2><div className="profile-chips">{profile.exams.map((exam) => <Link prefetch={false} key={`link-${exam.id}`} href={`/exams/${exam.slug}`}>{exam.name} exam guide</Link>)}</div></div> : null}
    </section>}

    {profile.articles.length > 0 && <section className="cp-card"><SectionHead icon={BookOpen} title={`${seo.displayName} guides`} />{(() => {
      const feeArticles = profile.articles.filter((article) => {
        const type = (article.articleType || '').toLowerCase();
        const articleSlug = article.slug || '';
        return type === 'budget' || type.includes('fee') || type.includes('package') || articleSlug.includes('fee') || articleSlug.includes('package') || articleSlug.includes('under-');
      });
      const otherArticles = profile.articles.filter((article) => !feeArticles.includes(article));
      return <>
        {feeArticles.length > 0 && <div className="college-programme-grid" style={{ marginBottom: '1rem' }}>{feeArticles.map((article) => <Link prefetch={false} className="card" href={`/articles/${article.slug}`} key={article.slug}><h3>{text(article.title, article.slug)}</h3><p className="muted">Fee / package guide for {seo.displayName}</p></Link>)}</div>}
        {otherArticles.length > 0 && <div className="college-programme-grid">{otherArticles.map((article) => <Link prefetch={false} className="card" href={`/articles/${article.slug}`} key={article.slug}><h3>{text(article.title, article.slug)}</h3><p className="muted">Read the published {article.articleType ? article.articleType.replace(/-/g, ' ') : 'course'} guide</p></Link>)}</div>}
      </>;
    })()}</section>}
    <AdSlot slotKey="course_end" />
    {faqs.length > 0 && <section className="cp-card"><SectionHead icon={ClipboardCheck} title="Frequently asked questions" /><div className="cp-faq">{faqs.map((faq) => <details className="cp-faq-item" key={faq.question}><summary><h3>{faq.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></section>}
    <CourseGeoLinks courseSlug={profile.course.slug} />
    <div className="cp-data-note"><TriangleAlert size={18} aria-hidden="true" /><p><strong>Data note:</strong> Fees, placements, rankings and reviews are recorded evidence and may change by batch, category, role, recruiter mix or academic year. Verify the latest official information before applying.</p></div>
  </div></main>;
}
