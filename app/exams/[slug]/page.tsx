import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api, instituteLogoUrl, mediaUrl } from '../../../lib/api';
import { stripEmbeddedFaqs } from '../../../lib/strip-embedded-faqs';
import { autoLinkHtml } from '../../../lib/auto-link-entities';
import { getLinkableEntities } from '../../../lib/linkable-entities';
import AutoLinkedText from '../../../components/AutoLinkedText';
import { articleAnchorTitle, buildExamFaqs, buildExamSeo, rankExamArticles } from '../../../lib/exam-seo';
import ExamLogo from '../../../components/ExamLogo';

type ExamProfile = {
  exam: {
    id: number;
    name: string;
    slug: string;
    fullName?: string | null;
    displayName?: string | null;
    logo?: string | null;
    applyUrl?: string | null;
    mode?: string | null;
    level?: string | null;
    conductedBy?: string | null;
    description?: string | null;
    longDescription?: string | null;
    eligibility?: string | null;
    pattern?: string | null;
    criteria?: string | null;
    applicationFees?: string | null;
    resultLink?: string | null;
    admitCard?: string | null;
    howToPrepare?: string | null;
    htmlContent?: string | null;
    course?: { id: number; name: string | null; slug: string | null; publishedSlug?: string | null } | null;
  };
  programmeCount?: number;
  instituteCount?: number;
  programmes: Array<{ programme_name: string; duration?: string | null; programme_count?: number | string | null }>;
  colleges: Array<{
    id: number;
    name: string;
    slug: string;
    published_slug?: string | null;
    institute_type?: string | null;
    logo?: string | null;
    city?: string | null;
    state?: string | null;
    programme_count?: number | string | null;
  }>;
  fees?: {
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
    average_year_fee?: number | string | null;
    programmes_with_fees?: number;
  } | null;
  articles: Array<{ slug: string; title: string; articleType?: string; imageUrl?: string | null; publishedAt?: string | null }>;
  updatedAt?: string | null;
};

export const revalidate = 300;

async function getExam(slug: string) {
  try {
    const response = await api<{ data: ExamProfile }>(`/exams/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300, tags: [`exam:${slug}`] }
    });
    return response.data;
  } catch {
    return null;
  }
}

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

function text(value: unknown, fallback = 'Not listed') {
  const clean = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function absoluteUrl(value: string, siteUrl: string) {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return `${siteUrl}/exams-hero.webp`;
  }
}

function examSeo(profile: ExamProfile) {
  const pack = buildExamSeo(profile as any);
  return { title: pack.title, description: pack.description, keywords: pack.keywords, h1: pack.h1, intro: pack.intro, label: pack.label, year: pack.year, intent: pack.intent, pack };
}

function profileFaqs(profile: ExamProfile, name: string) {
  const seo = buildExamSeo(profile as any);
  return buildExamFaqs(profile as any, seo, text, money);
}

function decisionNote(profile: ExamProfile, name: string) {
  const institutes = Number(profile.instituteCount || 0);
  const programmes = Number(profile.programmeCount || 0);
  if (institutes && programmes) {
    return `${name} is currently mapped to ${institutes.toLocaleString('en-IN')} colleges and ${programmes.toLocaleString('en-IN')} programmes. Use these links to shortlist, then verify the latest official exam and counselling rules.`;
  }
  if (profile.fees?.min_total_fee) {
    return `${name}-linked programmes show recorded total fees from ${money(profile.fees.min_total_fee)}. Confirm current fee schedules before applying.`;
  }
  return `Use ${name} eligibility, pattern and mapped college records as a shortlist starting point. Confirm current dates and admission rules before applying.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getExam(slug);
  if (!profile) return { title: 'Exam not found', robots: { index: false, follow: false } };
  const name = profile.exam.name;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const imageUrl = absoluteUrl(profile.exam.logo ? mediaUrl(profile.exam.logo) || '/exams-hero.webp' : '/exams-hero.webp', siteUrl);
  const seo = examSeo(profile);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `/exams/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', title: seo.title, description: seo.description, url: `${siteUrl}/exams/${slug}`, siteName: 'College Decision', images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name} exam` }] },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: [imageUrl] },
    other: { 'og:site_name': 'College Decision' }
  };
}

export default async function ExamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getExam(slug);
  if (!profile) notFound();

  const name = profile.exam.name;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/exams/${slug}`;
  const imageUrl = absoluteUrl(profile.exam.logo ? mediaUrl(profile.exam.logo) || '/exams-hero.webp' : '/exams-hero.webp', siteUrl);
  const seo = examSeo(profile);
  const faqs = profileFaqs(profile, name);
  const linkableEntities = await getLinkableEntities();
  const guideHtml = autoLinkHtml(stripEmbeddedFaqs(profile.exam.htmlContent), linkableEntities, {
    excludeHrefs: [`/exams/${slug}`]
  });
  const aboutText = text(profile.exam.longDescription || profile.exam.description, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOccupationalCredential',
        '@id': `${pageUrl}#exam`,
        name,
        url: pageUrl,
        description: seo.description,
        recognizedBy: profile.exam.conductedBy ? { '@type': 'Organization', name: profile.exam.conductedBy } : undefined
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Exams', item: `${siteUrl}/exams` },
          { '@type': 'ListItem', position: 3, name, item: pageUrl }
        ]
      },
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: seo.title,
        description: seo.description,
        mainEntityOfPage: pageUrl,
        author: { '@type': 'Organization', name: 'College Decision', url: siteUrl },
        publisher: { '@type': 'Organization', name: 'College Decision', url: siteUrl, logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.svg', siteUrl) } },
        dateModified: profile.updatedAt || undefined
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

  return <main className="section college-profile-page"><div className="wrap prose">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/exams">Exams</Link><span aria-hidden="true">›</span><span aria-current="page">{name}</span></nav>
    <header className="college-profile-header">
      <div>
        <p className="eyebrow">EXAM PROFILE</p>
        <h1>{seo.h1}</h1>
        <p className="muted">{[profile.exam.course?.name, profile.exam.mode, profile.exam.level].filter(Boolean).join(' · ') || 'Entrance exam'} · India</p>
        <p><AutoLinkedText text={seo.intro} entities={linkableEntities} options={{ excludeHrefs: [`/exams/${slug}`] }} /></p>
        {profile.exam.applyUrl ? <p><a href={profile.exam.applyUrl} target="_blank" rel="noreferrer">Open official {name} information</a></p> : null}
      </div>
      <ExamLogo src={profile.exam.logo} examName={name} courseName={profile.exam.course?.name} size={120} />
    </header>
    <section className="college-decision-note"><p className="eyebrow">DECISION NOTE</p><p>{decisionNote(profile, name)}</p></section>

    <section className="college-stats" aria-label="Exam highlights">
      <div><strong>{profile.instituteCount || '—'}</strong><span>Mapped colleges</span></div>
      <div><strong>{profile.programmeCount || '—'}</strong><span>Mapped programmes</span></div>
      <div><strong>{profile.fees?.programmes_with_fees || '—'}</strong><span>Programmes with fees</span></div>
      <div><strong>{(() => {
        const courseHref = profile.exam.course?.publishedSlug
          ? `/courses/${profile.exam.course.publishedSlug}`
          : null;
        const safeHref = courseHref && linkableEntities.some((entity) => entity.href === courseHref) ? courseHref : null;
        return safeHref && profile.exam.course?.name
          ? <a href={safeHref}>{profile.exam.course.name}</a>
          : (profile.exam.course?.name || '—');
      })()}</strong><span>Primary course</span></div>
    </section>

    {guideHtml ? <section className="course-html-content" aria-label={`${name} exam guide`} dangerouslySetInnerHTML={{ __html: guideHtml }} /> : null}

    {!guideHtml && aboutText && <section><h2>About {name}</h2><p>{aboutText}</p></section>}
    {!guideHtml && !aboutText && <section><h2>About {name}</h2><p>{name} is listed as an entrance exam route in India. Use the mapped college and programme evidence below as a research starting point and confirm the latest official notice before applying.</p></section>}

    {!guideHtml && (profile.exam.eligibility || profile.exam.pattern) && <section className="college-profile-columns">
      {profile.exam.eligibility && <div><h2>Eligibility</h2><p>{text(profile.exam.eligibility)}</p></div>}
      {profile.exam.pattern && <div><h2>Exam pattern</h2><p>{text(profile.exam.pattern)}</p></div>}
    </section>}

    {!guideHtml && (profile.exam.criteria || profile.exam.applicationFees || profile.exam.howToPrepare) && <section className="college-profile-columns">
      {profile.exam.criteria && <div><h2>Selection criteria</h2><p>{text(profile.exam.criteria)}</p></div>}
      {profile.exam.applicationFees && <div><h2>Application fees</h2><p>{text(profile.exam.applicationFees)}</p></div>}
      {profile.exam.howToPrepare && <div><h2>How to prepare</h2><p>{text(profile.exam.howToPrepare)}</p></div>}
    </section>}

    {!guideHtml && (profile.fees?.min_total_fee || profile.fees?.max_total_fee) && <section><h2>Fees for programmes accepting {name}</h2><p>Recorded total fees across mapped programmes range from <strong>{money(profile.fees?.min_total_fee)}</strong> to <strong>{money(profile.fees?.max_total_fee)}</strong>. Confirm the academic year, category, hostel, mess and other charges with each institute.</p></section>}

    {!guideHtml && profile.programmes.length > 0 && <section><h2>Programmes linked with {name}</h2><div className="profile-chips">{profile.programmes.slice(0, 40).map((item) => <span key={`${item.programme_name}-${item.duration}`}>{text(item.programme_name)}</span>)}</div></section>}

    {profile.colleges.length > 0 && <section><h2>Colleges accepting {seo.label}: {profile.colleges.length} listed</h2><p className="muted">Browse published college profiles mapped to {seo.label}. Prefer institutes with fees and placement evidence when shortlisting.</p><div className="college-programme-grid">{profile.colleges.map((college) => {
      const href = college.published_slug ? `/colleges/${college.published_slug}` : null;
      const card = <>
        <div className="home-college-heading">
          {college.logo ? <img className="course-college-logo" src={instituteLogoUrl(college.logo)} alt={`${college.name} logo`} width="48" height="48" loading="lazy" /> : null}
          <div>
            <h3>{college.name}</h3>
            <p className="muted">{[college.city, college.state].filter(Boolean).join(', ') || 'India'} · {Number(college.programme_count || 0)} programmes</p>
          </div>
        </div>
      </>;
      return href ? <Link className="card" href={href} key={college.id}>{card}</Link> : <article className="card" key={college.id}>{card}</article>;
    })}</div></section>}

    {profile.exam.course?.publishedSlug && <p className="article-backlink"><Link href={`/courses/${profile.exam.course.publishedSlug}`}>{seo.label} for {profile.exam.course.name}: course fees, exams & careers</Link></p>}
    {(() => {
      const ranked = rankExamArticles(profile.articles.map((a) => ({ ...a, articleType: a.articleType })), profile.exam.slug);
      const list = ranked.length ? ranked : profile.articles;
      if (!list.length) return null;
      return <section><h2>{seo.label} accepting-colleges & related guides</h2><div className="college-programme-grid">{list.map((article) => <Link className="card" href={`/articles/${article.slug}`} key={article.slug}><h3>{articleAnchorTitle(article, seo.label)}</h3><p className="muted">{(article.articleType || 'exam').replace(/-/g, ' ')} guide for {seo.label}</p></Link>)}</div></section>;
    })()}
    {faqs.length > 0 && <section><h2>Frequently asked questions</h2>{faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</section>}
    <div className="notice"><strong>Data note:</strong> Exam rules, cutoffs, fees and college mappings can change by year and category. Verify the latest official information before applying.</div>
  </div></main>;
}
