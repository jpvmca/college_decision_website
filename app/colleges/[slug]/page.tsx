import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftRight, BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, Globe2, HelpCircle, IndianRupee, Mail, MapPin, Phone, Star, Target, Trophy, Users, type LucideIcon } from 'lucide-react';
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
    description?: string | null;
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
  }>;
  fees?: { min_total_fee?: number | string | null; max_total_fee?: number | string | null; average_year_fee?: number | string | null } | null;
  exams: Array<{ id: number; name: string; slug: string }>;
  cutoffs: Array<{
    course_name?: string | null;
    program_name?: string | null;
    exam_name?: string | null;
    round?: string | number | null;
    year?: number | null;
    category?: string | null;
    sub_category?: string | null;
    opening_rank?: number | string | null;
    closing_rank?: number | string | null;
    cutoff_score?: number | string | null;
    cutoff_percentile?: number | string | null;
  }>;
  placements: Array<{ course_name?: string | null; year?: number | null; average_package?: number | string | null; highest_package?: number | string | null; lowest_package?: number | string | null }>;
  rankings: Array<{ course_name?: string | null; rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; organization?: string | null; industry?: string | null }>;
  about?: string | null;
  faculty: Array<{ name: string; position?: string | null; education?: string | null; speciality?: string | null }>;
  reviews: Array<{ id: number; course_name?: string | null; overall_rating?: number | null; overall_review?: string | null; created_at?: string | null }>;
  reviewSummary: {
    count: number;
    averageRating: number | null;
    averageFaculty?: number | null;
    averagePlacement?: number | null;
    averageAdmission?: number | null;
    averageCourse?: number | null;
    averageInfrastructure?: number | null;
    averageHostel?: number | null;
    averageClub?: number | null;
    ratingBreakdown: Array<{ rating: number; count: number }>;
  };
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
  return profile.institute.officialName || profile.institute.name;
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

function keywordText(value: unknown) {
  return text(value, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

function courseFamilyKeyword(courseName: string) {
  const value = courseName.toLowerCase();
  if (value.includes('b.tech') || value.includes('b.e.')) return 'btech';
  if (value.includes('m.tech') || value.includes('m.e.')) return 'mtech';
  if (value.includes('mba') || value.includes('pgdm')) return 'mba';
  if (value.includes('mca') || value.includes('mcm')) return 'mca';
  if (value.includes('msc') || value === 'ms') return 'msc';
  if (value.includes('b.pharm')) return 'bpharm';
  if (value.includes('m.pharm')) return 'mpharm';
  return keywordText(courseName).replace(/\s+/g, '') || 'courses';
}

function courseFamilyHeading(courseName: string) {
  const value = courseName.toLowerCase();
  if (value.includes('b.tech') || value.includes('b.e.')) return 'B.Tech / B.E. Programmes';
  if (value.includes('m.tech') || value.includes('m.e.')) return 'M.Tech / M.E. Programmes';
  if (value.includes('mba') || value.includes('pgdm')) return 'MBA / PGDM Programmes';
  if (value.includes('mca') || value.includes('mcm')) return 'MCA Programmes';
  if (value.includes('msc')) return 'MSc Programmes';
  if (value.includes('b.pharm') || value.includes('m.pharm')) return 'B.Pharm and M.Pharm Programmes';
  return `${courseName} Programmes`;
}

function courseFamilies(profile: CollegeProfile) {
  const groups = new Map<string, { name: string; keyword: string; keywords: string[]; heading: string; courseNames: string[] }>();
  profile.programmes.forEach((programme) => {
    const isPharmacy = programme.course_name.toLowerCase().includes('pharm');
    const key = isPharmacy ? 'pharmacy' : programme.course_name;
    const existing = groups.get(key);
    if (existing) {
      existing.courseNames.push(programme.course_name);
      const keyword = courseFamilyKeyword(programme.course_name);
      if (!existing.keywords.includes(keyword)) existing.keywords.push(keyword);
      return;
    }
    const keyword = courseFamilyKeyword(programme.course_name);
    groups.set(key, {
      name: isPharmacy ? 'B.Pharm and M.Pharm' : programme.course_name,
      keyword,
      keywords: [keyword],
      heading: isPharmacy ? 'B.Pharm and M.Pharm Programmes' : courseFamilyHeading(programme.course_name),
      courseNames: [programme.course_name]
    });
  });
  return Array.from(groups.values());
}

function seoKeywords(profile: CollegeProfile, city: string, state: string) {
  const official = keywordText(profile.institute.officialName || profile.institute.name);
  const shortMatch = profile.institute.officialName.match(/^(.*?)\s*\(([^)]+)\)/);
  const college = keywordText(shortMatch?.[1] || profile.institute.officialName || profile.institute.name);
  const collegeShort = keywordText(shortMatch?.[2] || profile.institute.officialName || profile.institute.name);
  const cityKeyword = keywordText(city);
  const stateKeyword = keywordText(state);
  const families = courseFamilies(profile);
  const values = [
    college, collegeShort, official, `${college} ${cityKeyword}`, `${college} ${stateKeyword}`,
    `${cityKeyword} ${college}`, `${stateKeyword} ${college}`,
    ...families.flatMap((family) => family.keywords.flatMap((keyword) => [`${keyword} colleges in ${cityKeyword}`, `${keyword} colleges in ${stateKeyword}`, `${keyword} at ${college}`, `${college} ${keyword}`])),
    `${college} fees`, `${college} admission`, `${college} eligibility`, `${college} entrance exam`,
    `${college} cutoff`, `${college} placements`, `${college} average package`, `${college} recruiters`,
    `${college} reviews`, `${college} rating`, `${college} ranking`, `${college} nirf`, `${college} courses`
  ];
  return Array.from(new Set(values.filter(Boolean)));
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
  if (profile.programmes.length) {
    faqs.push({ question: `What is ${name} known for?`, answer: `${name} offers ${courseFamilies(profile).map((family) => family.name).join(', ')} across ${profile.programmes.length} active programme records.` });
    faqs.push({ question: `What are the main courses at ${name}?`, answer: `${name} lists ${profile.programmes.slice(0, 5).map((item) => text(item.programme_name, item.course_name)).join(', ')}${profile.programmes.length > 5 ? ', and other programmes' : ''}.` });
  }
  if (profile.fees?.min_total_fee || profile.fees?.max_total_fee) faqs.push({ question: `What are the fees at ${name}?`, answer: `Recorded total fees range from ${money(profile.fees?.min_total_fee)} to ${money(profile.fees?.max_total_fee)}. Confirm current category and additional charges with the institution.` });
  if (profile.exams.length) faqs.push({ question: `Which entrance exams are accepted by ${name}?`, answer: `The active programme mappings list ${profile.exams.slice(0, 6).map((exam) => exam.name).join(', ')}.` });
  if (profile.cutoffs.length) faqs.push({ question: `What are the cutoffs for ${name}?`, answer: `The profile contains ${profile.cutoffs.length} cutoff record(s). Check the programme, category and year before using any cutoff for planning.` });
  if (profile.placements.length) faqs.push({ question: `How are placements at ${name}?`, answer: `Placement records are available for ${profile.placements.filter((item) => item.year).length || profile.placements.length} programme-year record(s), including average and highest package values where reported.` });
  if (profile.placements.some((item) => Number(item.average_package) > 0)) faqs.push({ question: `What is the average package at ${name}?`, answer: `The available placement records include average package values such as ${packageValue(profile.placements.find((item) => Number(item.average_package) > 0)?.average_package)}. Values can vary by year and programme.` });
  if (profile.rankings.length) faqs.push({ question: `What is the ranking of ${name}?`, answer: `The profile contains ${profile.rankings.length} active ranking record(s), including ${profile.rankings.slice(0, 2).map((item) => `${item.ranking_body} rank ${item.rank}`).join(' and ')}.` });
  if (profile.reviewSummary.count && profile.reviewSummary.averageRating) faqs.push({ question: `What is the student rating of ${name}?`, answer: `${name} has an average rating of ${profile.reviewSummary.averageRating.toFixed(1)} out of 5 from ${profile.reviewSummary.count} active review(s).` });
  if (profile.recruiters.length) faqs.push({ question: `Which recruiters are associated with ${name}?`, answer: `The available records include recruiters such as ${profile.recruiters.slice(0, 6).map((item) => item.name).join(', ')}.` });
  if (profile.institute.instituteType) faqs.push({ question: `Is ${name} government or private?`, answer: `${name} is recorded as a ${profile.institute.instituteType.toLowerCase()} in the current profile data.` });
  if (location) faqs.push({ question: `Where is ${name} located?`, answer: `${name} is listed in ${location}.` });
  if (profile.institute.website) faqs.push({ question: `Where can I verify ${name} admission details?`, answer: `Use the official ${name} website for current admission dates, eligibility, fees and application instructions.` });
  return faqs.slice(0, 8);
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

function RatingDimensionChart({ summary }: { summary: CollegeProfile['reviewSummary'] }) {
  const rows = [
    ['Overall', summary.averageRating],
    ['Infrastructure', summary.averageInfrastructure],
    ['Hostel', summary.averageHostel],
    ['Clubs / Activities', summary.averageClub],
    ['Faculty', summary.averageFaculty],
    ['Admission', summary.averageAdmission]
  ].filter((row): row is [string, number] => typeof row[1] === 'number' && row[1] > 0);
  if (!rows.length) return null;
  return <div className="profile-rating-dimension-chart" aria-label="Average student ratings by category">
    {rows.map(([label, value]) => <div className="profile-rating-dimension-row" key={label}>
      <span>{label}</span>
      <div className="profile-rating-dimension-track"><i style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} /></div>
      <strong>{value.toFixed(1)}/5</strong>
    </div>)}
  </div>;
}

function groupedProgrammes(profile: CollegeProfile) {
  return courseFamilies(profile).map((family) => ({
    ...family,
    programmes: profile.programmes.filter((programme) => family.courseNames.includes(programme.course_name))
  }));
}

function feeGroups(profile: CollegeProfile) {
  return groupedProgrammes(profile).map((group) => {
    const fees = group.programmes
      .flatMap((programme) => [Number(programme.min_total_fee) || 0, Number(programme.max_total_fee) || 0])
      .filter((fee) => fee > 0);
    return { ...group, min: fees.length ? Math.min(...fees) : 0, max: fees.length ? Math.max(...fees) : 0 };
  }).filter((group) => group.min > 0 || group.max > 0);
}

function placementGroups(profile: CollegeProfile) {
  return profile.placements.reduce<Array<{ course: string; year: number | null; highest: number; average: number; lowest: number }>>((groups, placement) => {
    const course = text(placement.course_name, 'Programme group');
    const key = `${course}:${placement.year || 'unknown'}`;
    const existing = groups.find((item) => `${item.course}:${item.year || 'unknown'}` === key);
    if (existing) {
      existing.highest = Math.max(existing.highest, Number(placement.highest_package) || 0);
      existing.average = Math.max(existing.average, Number(placement.average_package) || 0);
      existing.lowest = Math.max(existing.lowest, Number(placement.lowest_package) || 0);
    } else {
      groups.push({
        course,
        year: placement.year || null,
        highest: Number(placement.highest_package) || 0,
        average: Number(placement.average_package) || 0,
        lowest: Number(placement.lowest_package) || 0
      });
    }
    return groups;
  }, []).sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
}

function ratingValue(value: number | null | undefined) {
  return value ? `${value.toFixed(1)}/5` : 'Not recorded';
}

function affiliationText(profile: CollegeProfile) {
  const about = text(profile.about, '');
  const match = about.match(/((?:constituent college of|affiliated with|affiliated to)\s+[^.;]+)/i);
  return match?.[1] ? `${match[1].charAt(0).toUpperCase()}${match[1].slice(1)}.` : null;
}

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <h2><Icon size={19} strokeWidth={2} aria-hidden="true" /><span>{children}</span></h2>;
}

function ContactItem({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <span className="profile-contact-item"><Icon size={16} strokeWidth={2} aria-hidden="true" /><span>{children}</span></span>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getCollege(slug);
  if (!profile) return { title: 'College not found', robots: { index: false, follow: false } };
  const name = displayName(profile);
  const city = profile.institute.location?.city || '';
  const state = profile.institute.location?.state || '';
  const location = [city, state].filter(Boolean).join(', ');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const imageUrl = absoluteUrl(profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : '/logo.svg', siteUrl);
  const currentYear = new Date().getFullYear();
  const title = `${name}${city ? `, ${city}` : ''} ${currentYear} – Fees, Courses, Admission & Placements`;
  const description = `Get ${name}${city ? ` ${city}` : ''} details: courses, fees, admission process, cutoffs, placements, rankings, reviews and recruiters. Updated for ${currentYear} admissions.`;
  return {
    title,
    description,
    keywords: seoKeywords(profile, city, state),
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
  const city = profile.institute.location.city || '';
  const state = profile.institute.location.state || '';
  const location = [city, state].filter(Boolean).join(', ');
  const linkableEntities = await getLinkableEntities();
  const linkedCourseHrefs = new Set<string>();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/colleges/${slug}`;
  const officialWebsite = toAbsoluteExternalUrl(profile.institute.website);
  const officialUrl = officialWebsite || pageUrl;
  const rating = profile.reviewSummary.averageRating;
  const faqs = profileFaqs(profile, name, location);
  const currentYear = new Date().getFullYear();
  const programmeGroups = groupedProgrammes(profile);
  const recordedFeeGroups = feeGroups(profile);
  const recordedPlacements = placementGroups(profile);
  const affiliation = affiliationText(profile);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollegeOrUniversity', 'EducationalOrganization', 'Organization'],
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
        headline: `${name}${city ? `, ${city}` : ''} ${currentYear} – Fees, Courses, Admission & Placements`,
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
        <h1>{name}{city ? `, ${city}` : ''} – {currentYear} Overview</h1>
        <p className="muted">{profile.institute.instituteType || 'College'} · {location || 'India'}{profile.institute.isUniversity ? ' · University' : ''}</p>
        <p>Review courses, fees, eligibility, admission routes, placements, rankings and student reviews for {name} before making your shortlist.</p>
        {officialWebsite && <a className="button primary" href={officialWebsite} target="_blank" rel="noopener noreferrer"><Globe2 size={16} aria-hidden="true" /> Visit official website</a>}
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

    {(profile.about || location || profile.institute.establishmentYear || officialWebsite) && <section>
      <SectionHeading icon={Building2}>About {name}</SectionHeading>
      {profile.about && <><h3>History and Background</h3><p>{text(profile.about)}</p></>}
      {(location || profile.institute.establishmentYear) && <><h3>Campus and Location</h3><p>{profile.institute.establishmentYear ? `Established in ${profile.institute.establishmentYear}. ` : ''}{location ? `Located in ${location}.` : ''} {profile.institute.location.addressLabel || ''}</p></>}
      {affiliation && <><h3>Affiliation and Recognition</h3><p>{affiliation}</p></>}
      {(officialWebsite || profile.institute.email || profile.institute.phone) && <div className="profile-contact-list">
        {officialWebsite && <ContactItem icon={Globe2}><a href={officialWebsite} target="_blank" rel="noopener noreferrer">Official website</a></ContactItem>}
        {profile.institute.email && <ContactItem icon={Mail}><a href={`mailto:${profile.institute.email}`}>{profile.institute.email}</a></ContactItem>}
        {profile.institute.phone && <ContactItem icon={Phone}><a href={`tel:${profile.institute.phone.replace(/[^\d+]/g, '')}`}>{profile.institute.phone}</a></ContactItem>}
        {location && <ContactItem icon={MapPin}>{location}</ContactItem>}
      </div>}
    </section>}

    {profile.programmes.length > 0 && <section>
      <SectionHeading icon={BookOpen}>Courses and Programmes Offered</SectionHeading>
      {programmeGroups.map((group) => <div key={group.name}><h3>{group.heading}</h3><div className="profile-list">
        {group.programmes.map((programme) => <p key={programme.programme_id}>- <strong>{text(programme.programme_name, programme.course_name)}</strong>{programme.duration ? ` – ${programme.duration} years` : ''}{programme.eligibility ? ` – ${text(programme.eligibility)}` : ''}{(() => { const href = findPublishedHrefByName(linkableEntities, 'course', programme.course_name); const label = text(programme.course_name); if (!href || linkedCourseHrefs.has(href)) return null; linkedCourseHrefs.add(href); return <> · <Link href={href}>{label} profile</Link></>; })()}</p>)}
      </div></div>)}
    </section>}

    {recordedFeeGroups.length > 0 && <section>
      <SectionHeading icon={IndianRupee}>Course Fees at {name}</SectionHeading>
      {recordedFeeGroups.map((group) => <div key={group.name}><h3>{group.heading.replace(' Programmes', '')} Fees</h3><p>Recorded annual fee for most {group.name}: <strong>{money(group.min)}{group.max !== group.min ? ` – ${money(group.max)}` : ''} per year</strong>.</p><p className="muted">Hostel, mess and other charges are additional and not included.</p></div>)}
    </section>}

    {(profile.programmes.some((programme) => programme.eligibility) || profile.exams.length > 0) && <section>
      <SectionHeading icon={ClipboardCheck}>Admission Process and Eligibility</SectionHeading>
      {profile.programmes.some((programme) => programme.eligibility) && <><h3>Eligibility Criteria by Programme</h3><div className="profile-list">{programmeGroups.map((group) => {
        const eligibility = group.programmes.find((programme) => programme.eligibility)?.eligibility;
        return eligibility ? <p key={group.name}>- <strong>{group.name}:</strong> {text(eligibility)}.</p> : null;
      })}</div></>}
      {profile.exams.length > 0 && <><h3>Entrance Exams Accepted</h3><div className="profile-chips">{profile.exams.map((exam) => {
        const href = findPublishedHref(linkableEntities, 'exam', exam.slug);
        return href ? <Link key={exam.id} href={href}>{exam.name}</Link> : <span key={exam.id}>{exam.name}</span>;
      })}</div></>}
      <h3>How to Apply</h3><p>Check the relevant programme eligibility, follow the mapped entrance-exam or university counselling route, and confirm dates, documents and fees on the official admission notice.</p>
    </section>}

    {(profile.exams.length > 0 || profile.cutoffs.length > 0) && <section>
      <SectionHeading icon={Target}>Cutoffs and Entrance Exams</SectionHeading>
      {profile.exams.length > 0 && <><h3>Entrance Exams for {name}</h3><p>Key entrance exams and routes recorded in the database: {profile.exams.map((exam) => exam.name).join(', ')}.</p></>}
      <h3>Cutoff Trends</h3>
      {profile.cutoffs.length > 0 ? <div className="profile-list">{profile.cutoffs.slice(0, 30).map((cutoff, index) => <p key={`${cutoff.course_name}-${cutoff.year}-${index}`}><strong>{cutoff.course_name || 'Programme'}</strong>{cutoff.exam_name ? ` · ${cutoff.exam_name}` : ''}{cutoff.year ? ` · ${cutoff.year}` : ''}: {cutoff.closing_rank || cutoff.cutoff_score || cutoff.cutoff_percentile || 'Recorded cutoff'}</p>)}</div> : <p>Branch-wise and category-wise cutoffs are not published in the current dataset. Check the official university or counselling website for the latest cutoffs.</p>}
    </section>}

    {(recordedPlacements.length > 0 || profile.recruiters.length > 0) && <section>
      <SectionHeading icon={BriefcaseBusiness}>Placements and Recruiters</SectionHeading>
      {recordedPlacements.length > 0 && <><h3>Placement Highlights by Programme</h3><PlacementChart placements={profile.placements} /><div className="profile-list">{recordedPlacements.map((placement, index) => <p key={`${placement.course}-${placement.year}-${index}`}><strong>{placement.course}{placement.year ? ` (${placement.year})` : ''}:</strong> {placement.highest ? `Highest ${packageValue(placement.highest)}, ` : ''}{placement.average ? `Average ${packageValue(placement.average)}` : ''}{placement.lowest ? `, Lowest ${packageValue(placement.lowest)}` : ''}.</p>)}</div></>}
      {profile.recruiters.length > 0 && <><h3>Top Recruiters</h3><p>{profile.recruiters.slice(0, 50).map((recruiter) => recruiter.name).join(', ')} and others ({profile.recruiters.length} recruiters in database).</p></>}
      <h3>Placement Data Disclaimer</h3><p>Package units, currency and placement percentages are not fully specified in the source. Treat these figures as indicative and verify the latest official placement report.</p>
    </section>}

    {profile.reviewSummary.count > 0 && <section>
      <SectionHeading icon={Star}>Student Reviews and Ratings</SectionHeading>
      <h3>Overall Student Ratings</h3><div className="profile-list">
        <p>- Total active reviews: {profile.reviewSummary.count}</p>
        <p>- Average overall rating: {ratingValue(profile.reviewSummary.averageRating)}</p>
        <p>- Infrastructure: {ratingValue(profile.reviewSummary.averageInfrastructure)}</p>
        <p>- Hostel: {ratingValue(profile.reviewSummary.averageHostel)}</p>
        <p>- Clubs/Activities: {ratingValue(profile.reviewSummary.averageClub)}</p>
        <p>- Faculty: {ratingValue(profile.reviewSummary.averageFaculty)}</p>
        <p>- Admission: {ratingValue(profile.reviewSummary.averageAdmission)}</p>
      </div>
      <RatingDimensionChart summary={profile.reviewSummary} />
    </section>}

    {profile.faculty.length > 0 && <section>
      <SectionHeading icon={Users}>Faculty and Departments</SectionHeading>
      <h3>Key Faculty Members</h3><div className="profile-list">{profile.faculty.map((member) => <p key={`${member.name}-${member.position}`}>- <strong>{member.name}</strong>{member.position ? ` – ${member.position}` : ''}{member.education ? ` (${member.education})` : ''}</p>)}</div>
    </section>}

    {profile.rankings.length > 0 && <section>
      <SectionHeading icon={Trophy}>Rankings and Recognition</SectionHeading>
      <h3>NIRF and Other Rankings</h3><div className="profile-list">{profile.rankings.slice(0, 30).map((ranking, index) => <p key={`${ranking.ranking_body}-${ranking.year}-${index}`}>- {ranking.ranking_body} {ranking.year || ''}: Rank {ranking.rank}{ranking.out_of ? ` out of ${ranking.out_of}` : ''}.</p>)}</div>
    </section>}
    {profile.comparisonGuides.length > 0 && <section><SectionHeading icon={ArrowLeftRight}>Compare {name}</SectionHeading><div className="college-programme-grid">{profile.comparisonGuides.map((guide) => <Link className="card" href={`/articles/${guide.slug}`} key={guide.slug}><h3>{text(guide.title, guide.h1 || 'College comparison guide')}</h3><p className="muted">{guide.other_college_name ? `Compare ${name} with ${guide.other_college_name}` : 'Read the published comparison guide'}</p></Link>)}</div></section>}
    {faqs.length > 0 && <section><SectionHeading icon={HelpCircle}>Frequently asked questions</SectionHeading>{faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</section>}
    <div className="notice"><strong>Data note:</strong> Fees, placements, rankings and reviews are recorded evidence and may change by batch, category, role, recruiter mix or academic year. Verify the latest official information before applying.</div>
  </div></main>;
}
