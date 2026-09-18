import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api, instituteLogoUrl, mediaUrl } from '../../../lib/api';
import { stripEmbeddedFaqs } from '../../../lib/strip-embedded-faqs';
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
  const name = profile.exam.name;
  if (profile.exam.slug === 'jee-main') {
    return {
      title: 'JEE Main 2026: Eligibility, Pattern, Colleges & Fees',
      description: 'Planning JEE Main for B.Tech admission? Check eligibility, exam pattern, application route, mapped colleges, fees range and counselling context for 2026.',
      keywords: ['JEE Main 2026', 'JEE Main eligibility', 'JEE Main exam pattern', 'colleges accepting JEE Main', 'JEE Main admission']
    };
  }
  return {
    title: `${name} 2026: Eligibility, Pattern, Colleges & Fees`,
    description: `Explore ${name} in India: eligibility, exam pattern, application fees, mapped colleges, programme coverage and admission context before you apply.`,
    keywords: [`${name} exam`, `${name} eligibility`, `${name} pattern`, `colleges accepting ${name}`, `${name} admission`]
  };
}

function profileFaqs(profile: ExamProfile, name: string) {
  const faqs: Array<{ question: string; answer: string }> = [];
  const questions = new Set<string>();
  const addFaq = (question: string, answer: string) => {
    if (!questions.has(question)) {
      questions.add(question);
      faqs.push({ question, answer });
    }
  };
  const courseName = profile.exam.course?.name || 'linked programmes';
  addFaq(`What is ${name}?`, `${name} is an entrance exam linked with ${courseName}. Use this profile to compare eligibility, pattern and the colleges mapped to the exam.`);
  if (profile.exam.eligibility) addFaq(`What is the eligibility for ${name}?`, text(profile.exam.eligibility, `Confirm the latest official eligibility notice for ${name}.`));
  else addFaq(`What is the eligibility for ${name}?`, `Eligibility depends on the academic year, category and target institute. Confirm the latest official ${name} notice before applying.`);
  if (profile.exam.pattern) addFaq(`What is the exam pattern for ${name}?`, text(profile.exam.pattern));
  else addFaq(`What is the exam pattern for ${name}?`, `The pattern can change by session. Check the official information bulletin for sections, marking scheme and duration.`);
  if (profile.exam.applicationFees) addFaq(`What is the application fee for ${name}?`, `Recorded application fee information: ${text(profile.exam.applicationFees)}. Confirm the current category-wise fee on the official portal.`);
  if (profile.instituteCount) addFaq(`How many colleges accept ${name}?`, `The database currently maps ${Number(profile.instituteCount).toLocaleString('en-IN')} colleges and ${Number(profile.programmeCount || 0).toLocaleString('en-IN')} programmes to ${name}.`);
  if (profile.fees?.min_total_fee || profile.fees?.max_total_fee) addFaq(`What fees should I expect after ${name}?`, `Across mapped programmes, recorded total fees range from ${money(profile.fees?.min_total_fee)} to ${money(profile.fees?.max_total_fee)}. Confirm hostel, mess and other charges separately.`);
  if (profile.programmes.length) addFaq(`Which programmes are linked with ${name}?`, `Mapped programme examples include ${profile.programmes.slice(0, 4).map((item) => text(item.programme_name)).join(', ')}.`);
  if (profile.colleges.length) addFaq(`Which colleges are linked with ${name}?`, `Sample mapped colleges include ${profile.colleges.slice(0, 4).map((item) => item.name).join(', ')}.`);
  if (profile.exam.conductedBy) addFaq(`Who conducts ${name}?`, `${name} is recorded as conducted by ${text(profile.exam.conductedBy)}.`);
  addFaq(`How does ${name} admission work?`, `Register on the official portal, check eligibility, appear for the exam, then complete counselling or institute-level applications for mapped colleges.`);
  addFaq(`What is the cutoff for ${name}?`, `Cutoffs vary by institute, branch, category and year. Use official counselling data rather than a generic estimate.`);
  addFaq(`How should I use this ${name} profile?`, `Use the mapped colleges, fees range, eligibility and pattern as a research starting point. Confirm current dates and rules on the official exam and institute websites.`);
  return faqs.slice(0, 12);
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
  const guideHtml = stripEmbeddedFaqs(profile.exam.htmlContent);
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
        <h1>{name}</h1>
        <p className="muted">{[profile.exam.course?.name, profile.exam.mode, profile.exam.level].filter(Boolean).join(' · ') || 'Entrance exam'} · India</p>
        <p>Review eligibility, exam pattern, application routes, mapped colleges, programme coverage and fee context for {name} before planning your shortlist.</p>
        {profile.exam.applyUrl ? <p><a href={profile.exam.applyUrl} target="_blank" rel="noreferrer">Open official {name} information</a></p> : null}
      </div>
      <ExamLogo src={profile.exam.logo} examName={name} courseName={profile.exam.course?.name} size={120} />
    </header>
    <section className="college-decision-note"><p className="eyebrow">DECISION NOTE</p><p>{decisionNote(profile, name)}</p></section>

    <section className="college-stats" aria-label="Exam highlights">
      <div><strong>{profile.instituteCount || '—'}</strong><span>Mapped colleges</span></div>
      <div><strong>{profile.programmeCount || '—'}</strong><span>Mapped programmes</span></div>
      <div><strong>{profile.fees?.programmes_with_fees || '—'}</strong><span>Programmes with fees</span></div>
      <div><strong>{profile.exam.course?.name || '—'}</strong><span>Primary course</span></div>
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

    {profile.colleges.length > 0 && <section><h2>Colleges accepting {name}</h2><div className="college-programme-grid">{profile.colleges.map((college) => {
      const href = college.published_slug ? `/colleges/${college.published_slug}` : null;
      const card = <>
        <div className="home-college-heading">
          {college.logo ? <img className="course-college-logo" src={instituteLogoUrl(college.logo)} alt="" width="48" height="48" loading="lazy" /> : null}
          <div>
            <h3>{college.name}</h3>
            <p className="muted">{[college.city, college.state].filter(Boolean).join(', ') || 'India'} · {Number(college.programme_count || 0)} programmes</p>
          </div>
        </div>
      </>;
      return href ? <Link className="card" href={href} key={college.id}>{card}</Link> : <article className="card" key={college.id}>{card}</article>;
    })}</div></section>}

    {profile.exam.course?.publishedSlug && <p className="article-backlink"><Link href={`/courses/${profile.exam.course.publishedSlug}`}>View {profile.exam.course.name} course profile</Link></p>}
    {profile.articles.length > 0 && <section><h2>{name} guides</h2><div className="college-programme-grid">{profile.articles.map((article) => <Link className="card" href={`/articles/${article.slug}`} key={article.slug}><h3>{text(article.title, article.slug)}</h3><p className="muted">Read the published {article.articleType ? article.articleType.replace(/-/g, ' ') : 'exam'} guide</p></Link>)}</div></section>}
    {faqs.length > 0 && <section><h2>Frequently asked questions</h2>{faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</section>}
    <div className="notice"><strong>Data note:</strong> Exam rules, cutoffs, fees and college mappings can change by year and category. Verify the latest official information before applying.</div>
  </div></main>;
}
