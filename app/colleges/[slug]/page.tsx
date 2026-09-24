import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api, instituteLogoUrl } from '../../../lib/api';
import { toAbsoluteExternalUrl } from '../../../lib/external-url';
import { getLinkableEntities, findPublishedHref, findPublishedHrefByName } from '../../../lib/linkable-entities';

type CollegeProfile = {
  institute: {
    id: number;
    name: string;
    officialName: string;
    instituteType: string;
    logo?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    location: { city: string; state: string; addressLabel: string };
    establishmentYear?: number | null;
    isUniversity?: number | boolean;
  };
  programmes: Array<{
    programme_id: number;
    programme_name: string;
    course_id: number;
    course_name: string;
    duration?: string | null;
    total_seats?: number | null;
    eligibility?: string | null;
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
  }>;
  fees?: { min_total_fee?: number | string | null; max_total_fee?: number | string | null; average_year_fee?: number | string | null } | null;
  exams: Array<{ id: number; name: string; slug: string }>;
  placements: Array<{ year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ course_name?: string | null; rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; organization?: string | null; industry?: string | null }>;
  reviews: Array<{ id: number; course_name?: string | null; overall_rating?: number | null; created_at?: string | null }>;
  reviewSummary: { count: number; averageRating: number | null; ratingBreakdown: Array<{ rating: number; count: number }> };
  comparisonGuides: Array<{ slug: string; title: string; h1?: string | null; course_name?: string | null; other_college_name?: string | null; image_url?: string | null }>;
  updatedAt?: string | null;
};

async function getCollege(slug: string) {
  try {
    const response = await api<{ data: CollegeProfile }>(`/colleges/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    return response.data;
  } catch {
    return null;
  }
}

function displayName(profile: CollegeProfile) {
  return profile.institute.name || profile.institute.officialName;
}

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

function packageValue(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `₹${amount} LPA` : 'Not listed';
}

function text(value: unknown, fallback = 'Not listed') {
  const clean = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function absoluteUrl(value: string, siteUrl: string) {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return `${siteUrl}/logo.svg`;
  }
}

function isoDuration(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return `P${numeric}Y`;
  const years = raw.match(/^(\d+(?:\.\d+)?)\s*years?$/i);
  if (years) return `P${years[1]}Y`;
  const months = raw.match(/^(\d+)\s*months?$/i);
  if (months) return `P${months[1]}M`;
  return /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?$/i.test(raw) ? raw : undefined;
}

function profileFaqs(profile: CollegeProfile, name: string, location: string) {
  const faqs: Array<{ question: string; answer: string }> = [];
  if (profile.programmes.length) faqs.push({ question: `What courses are available at ${name}?`, answer: `${name} has ${profile.programmes.length} active programme records, including ${profile.programmes.slice(0, 3).map((item) => text(item.programme_name, item.course_name)).join(', ')}.` });
  if (profile.fees?.min_total_fee || profile.fees?.max_total_fee) faqs.push({ question: `What are the fees at ${name}?`, answer: `Recorded total fees range from ${money(profile.fees?.min_total_fee)} to ${money(profile.fees?.max_total_fee)}. Confirm current category and additional charges with the institution.` });
  if (profile.exams.length) faqs.push({ question: `Which entrance exams are accepted by ${name}?`, answer: `The active programme mappings list ${profile.exams.slice(0, 6).map((exam) => exam.name).join(', ')}.` });
  if (profile.placements.length) faqs.push({ question: `Does ${name} have placement records?`, answer: `Placement data is available for ${profile.placements.filter((item) => item.year).length || profile.placements.length} recorded year(s), including average and highest package values where reported.` });
  if (profile.placements.some((item) => Number(item.average_package) > 0)) faqs.push({ question: `What is the average package at ${name}?`, answer: `The available placement records include average package values such as ${packageValue(profile.placements.find((item) => Number(item.average_package) > 0)?.average_package)}. Values can vary by year and programme.` });
  if (profile.rankings.length) faqs.push({ question: `Is ${name} ranked?`, answer: `The profile contains ${profile.rankings.length} active ranking record(s), including ${profile.rankings.slice(0, 2).map((item) => `${item.ranking_body} rank ${item.rank}`).join(' and ')}.` });
  if (profile.reviewSummary.count && profile.reviewSummary.averageRating) faqs.push({ question: `What is the student rating of ${name}?`, answer: `${name} has an average rating of ${profile.reviewSummary.averageRating.toFixed(1)} out of 5 from ${profile.reviewSummary.count} active review(s).` });
  if (profile.recruiters.length) faqs.push({ question: `Which recruiters are associated with ${name}?`, answer: `The available records include recruiters such as ${profile.recruiters.slice(0, 6).map((item) => item.name).join(', ')}.` });
  if (location) faqs.push({ question: `Where is ${name} located?`, answer: `${name} is listed in ${location}.` });
  if (profile.institute.website) faqs.push({ question: `Where can I verify ${name} admission details?`, answer: `Use the official ${name} website for current admission dates, eligibility, fees and application instructions.` });
  return faqs.slice(0, 12);
}

function decisionNote(profile: CollegeProfile, name: string) {
  const fee = Number(profile.fees?.min_total_fee || 0);
  const averagePackage = Math.max(...profile.placements.map((item) => Number(item.average_package) || 0), 0);
  if (fee && averagePackage) return `${name} has recorded total fees from ${money(fee)} and placement records with average packages up to ${packageValue(averagePackage)}. Use these figures to shortlist, then verify the same programme, year, category and placement report before deciding.`;
  if (profile.placements.length) return `${name} has active placement records, but fee and package values can vary by programme and year. Compare the exact course and latest official placement report before applying.`;
  if (profile.reviewSummary.averageRating) return `${name} has a ${profile.reviewSummary.averageRating.toFixed(1)}/5 aggregate student rating, but current placement and fee evidence is limited. Prioritise official course, fee and outcome information for your decision.`;
  return `Use ${name}'s programme, eligibility and fee records as a shortlist starting point. Confirm current admission dates, total cost and outcomes with the institution before applying.`;
}

function PlacementChart({ placements }: { placements: CollegeProfile['placements'] }) {
  const rows = placements.filter((item) => item.year && (Number(item.average_package) > 0 || Number(item.highest_package) > 0)).sort((a, b) => Number(a.year) - Number(b.year));
  if (!rows.length) return null;
  const max = Math.max(...rows.flatMap((item) => [Number(item.average_package) || 0, Number(item.highest_package) || 0]), 1);
  return <div className="profile-chart" aria-label="Placement package trend chart">{rows.map((item) => <div className="profile-chart-row" key={item.year}><span>{item.year}</span><div className="profile-chart-bars"><i className="profile-bar average" style={{ width: `${(Number(item.average_package || 0) / max) * 100}%` }} title={`Average ${packageValue(item.average_package)}`} /><i className="profile-bar highest" style={{ width: `${(Number(item.highest_package || 0) / max) * 100}%` }} title={`Highest ${packageValue(item.highest_package)}`} /></div><small>{packageValue(item.highest_package)}</small></div>)}</div>;
}

function RatingChart({ breakdown }: { breakdown: CollegeProfile['reviewSummary']['ratingBreakdown'] }) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0);
  if (!total) return null;
  return <div className="profile-rating-chart" aria-label="Student rating breakdown chart">{breakdown.map((item) => <div className="profile-rating-row" key={item.rating}><span>{item.rating}★</span><div><i style={{ width: `${(item.count / total) * 100}%` }} /></div><small>{item.count}</small></div>)}</div>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getCollege(slug);
  if (!profile) return { title: 'College not found', robots: { index: false, follow: false } };
  const name = displayName(profile);
  const location = [profile.institute.location?.city, profile.institute.location?.state].filter(Boolean).join(', ');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const imageUrl = absoluteUrl(profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : '/logo.svg', siteUrl);
  const title = `${name} ${location ? `in ${location} ` : ''}2026: Courses, Fees, Placements & Admission`;
  const description = `Explore ${name}${location ? ` in ${location}` : ''}: courses, fees, eligibility, admission exams, placements, rankings and reviews before you apply.`;
  return {
    title,
    description,
    alternates: { canonical: `/colleges/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', title, description, url: `${siteUrl}/colleges/${slug}`, siteName: 'College Decision', images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name} logo` }] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    other: { 'og:site_name': 'College Decision' }
  };
}

export default async function CollegeProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCollege(slug);
  if (!profile) notFound();

  const name = displayName(profile);
  const location = [profile.institute.location.city, profile.institute.location.state].filter(Boolean).join(', ');
  const linkableEntities = await getLinkableEntities();
  const linkedCourseHrefs = new Set<string>();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/colleges/${slug}`;
  const officialWebsite = toAbsoluteExternalUrl(profile.institute.website);
  const officialUrl = officialWebsite || pageUrl;
  const rating = profile.reviewSummary.averageRating;
  const faqs = profileFaqs(profile, name, location);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollegeOrUniversity',
        '@id': `${pageUrl}#organization`,
        name,
        legalName: profile.institute.officialName,
        url: officialUrl,
        logo: profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : undefined,
        email: profile.institute.email || undefined,
        telephone: profile.institute.phone || undefined,
        sameAs: officialWebsite ? [officialWebsite] : undefined,
        address: profile.institute.location.addressLabel || location || undefined,
        foundingDate: profile.institute.establishmentYear ? String(profile.institute.establishmentYear) : undefined,
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
          { '@type': 'ListItem', position: 2, name: 'Colleges', item: `${siteUrl}/colleges` },
          { '@type': 'ListItem', position: 3, name, item: pageUrl }
        ]
      },
      ...profile.programmes.slice(0, 50).map((programme) => ({
        '@type': 'Course',
        name: programme.programme_name || programme.course_name,
        description: text(programme.eligibility, `${programme.course_name} programme at ${name}`),
        provider: {
          '@type': 'CollegeOrUniversity',
          '@id': `${pageUrl}#organization`,
          name,
          url: officialUrl
        },
        timeRequired: isoDuration(programme.duration)
      })),
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: `${name} ${location ? `in ${location} ` : ''}2026: Courses, Fees, Placements & Admission`,
        description: `Evidence-based college profile covering courses, fees, admissions, placements and reviews for ${name}.`,
        mainEntityOfPage: pageUrl,
        author: { '@type': 'Organization', name: 'College Decision', url: siteUrl },
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

  return <main className="section college-profile-page"><div className="wrap prose">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">{name}</span></nav>
    <header className="college-profile-header">
      <div>
        <p className="eyebrow">COLLEGE PROFILE</p>
        <h1>{name}</h1>
        <p className="muted">{profile.institute.instituteType || 'College'} · {location || 'India'}{profile.institute.isUniversity ? ' · University' : ''}</p>
        <p>Review courses, fees, eligibility, admission routes, placements, rankings and student reviews for {name} before making your shortlist.</p>
        {officialWebsite && <a className="button primary" href={officialWebsite} target="_blank" rel="noreferrer">Visit official website</a>}
      </div>
      <img className="college-profile-logo" src={profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : '/logo.svg'} alt={profile.institute.logo ? `${name} college logo` : 'College Decision logo'} width="160" height="160" />
    </header>
    <section className="college-decision-note"><p className="eyebrow">DECISION NOTE</p><p>{decisionNote(profile, name)}</p></section>

    <section className="college-stats" aria-label="College highlights">
      <div><strong>{profile.programmes.length}</strong><span>Active programmes</span></div>
      <div><strong>{profile.reviewSummary.count || '—'}</strong><span>Student reviews</span></div>
      <div><strong>{rating ? rating.toFixed(1) : '—'}</strong><span>Average rating</span></div>
      <div><strong>{profile.placements.length || '—'}</strong><span>Placement years</span></div>
    </section>

    {profile.programmes.length > 0 && <section><h2>{name} courses and programmes</h2><div className="college-programme-grid">
      {profile.programmes.slice(0, 60).map((programme) => <article className="card" key={programme.programme_id}>
        <h3>{text(programme.programme_name, programme.course_name)}</h3>
        <p className="muted">{(() => { const href = findPublishedHrefByName(linkableEntities, 'course', programme.course_name); const label = text(programme.course_name); if (!href || linkedCourseHrefs.has(href)) return label; linkedCourseHrefs.add(href); return <Link href={href}>{label}</Link>; })()}{programme.duration ? ` · ${programme.duration}` : ''}</p>
        <p><strong>Eligibility:</strong> {text(programme.eligibility, 'Check the latest official admission notice.')}</p>
        <p><strong>Fees:</strong> {programme.min_total_fee ? `${money(programme.min_total_fee)}${programme.max_total_fee && Number(programme.max_total_fee) !== Number(programme.min_total_fee) ? ` – ${money(programme.max_total_fee)}` : ''}` : 'Not listed'}</p>
      </article>)}
    </div></section>}

    {(profile.fees?.min_total_fee || profile.fees?.max_total_fee || profile.exams.length > 0) && <section className="college-profile-columns">
      {(profile.fees?.min_total_fee || profile.fees?.max_total_fee) && <div><h2>Fees</h2><p>Recorded total fees range from <strong>{money(profile.fees?.min_total_fee)}</strong> to <strong>{money(profile.fees?.max_total_fee)}</strong>. Confirm the current academic year, category, hostel, mess, deposits and other charges with the college.</p></div>}
      {profile.exams.length > 0 && <div><h2>Admission exams and routes</h2><div className="profile-chips">{profile.exams.map((exam) => {
        const href = findPublishedHref(linkableEntities, 'exam', exam.slug);
        return href ? <Link key={exam.id} href={href}>{exam.name}</Link> : <span key={exam.id}>{exam.name}</span>;
      })}</div></div>}
    </section>}

    {(profile.placements.length > 0 || profile.reviewSummary.count > 0) && <section className="college-profile-columns">
      {profile.placements.length > 0 && <div><h2>Placements and packages</h2><PlacementChart placements={profile.placements} /><div className="profile-list">{profile.placements.map((placement, index) => <p key={`${placement.year}-${index}`}><strong>{placement.year || 'Year not listed'}:</strong> Average {packageValue(placement.average_package)} · Highest {packageValue(placement.highest_package)}</p>)}</div></div>}
      {profile.reviewSummary.count > 0 && <div><h2>Student ratings</h2><p><strong>{rating?.toFixed(1)} / 5</strong> aggregate rating from {profile.reviewSummary.count} active review{profile.reviewSummary.count === 1 ? '' : 's'}.</p><RatingChart breakdown={profile.reviewSummary.ratingBreakdown} /><p className="muted">Individual review text is omitted; use the rating distribution alongside the programme, fee and placement evidence above.</p></div>}
    </section>}

    {(profile.rankings.length > 0 || profile.recruiters.length > 0) && <section className="college-profile-columns">
      {profile.rankings.length > 0 && <div><h2>Rankings</h2><div className="profile-list">{profile.rankings.slice(0, 30).map((ranking, index) => <p key={`${ranking.ranking_body}-${ranking.year}-${index}`}><strong>{ranking.ranking_body}</strong>: Rank {ranking.rank}{ranking.out_of ? ` / ${ranking.out_of}` : ''}{ranking.year ? ` · ${ranking.year}` : ''}{ranking.course_name ? ` · ${ranking.course_name}` : ''}</p>)}</div></div>}
      {profile.recruiters.length > 0 && <div><h2>Recruiters and industry connections</h2><div className="profile-chips">{profile.recruiters.slice(0, 50).map((recruiter) => <span key={recruiter.id}>{recruiter.name}</span>)}</div></div>}
    </section>}

    <section><h2>About {name}</h2><p>{name} is a {profile.institute.instituteType || 'higher education institution'} in {location || 'India'}. Use this page as a research starting point and confirm current course fees, eligibility, admission dates and placement outcomes with the official institution.</p></section>
    {profile.comparisonGuides.length > 0 && <section><h2>Compare {name}</h2><div className="college-programme-grid">{profile.comparisonGuides.map((guide) => <Link className="card" href={`/articles/${guide.slug}`} key={guide.slug}><h3>{text(guide.title, guide.h1 || 'College comparison guide')}</h3><p className="muted">{guide.other_college_name ? `Compare ${name} with ${guide.other_college_name}` : 'Read the published comparison guide'}</p></Link>)}</div></section>}
    {faqs.length > 0 && <section><h2>Frequently asked questions</h2>{faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</section>}
    <div className="notice"><strong>Data note:</strong> Fees, placements, rankings and reviews are recorded evidence and may change by batch, category, role, recruiter mix or academic year. Verify the latest official information before applying.</div>
  </div></main>;
}
