import InterestCourseHighlight from '../../../components/InterestCourseHighlight';
import CollegeApply from '../../../components/CollegeApply';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftRight, BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, Globe2, HelpCircle, IndianRupee, Mail, MapPin, Phone, Star, Target, Trophy, Users, type LucideIcon } from 'lucide-react';
import { api, instituteLogoUrl } from '../../../lib/api';
import { toAbsoluteExternalUrl } from '../../../lib/external-url';
import { getLinkableEntities, findPublishedHref, findPublishedHrefByName } from '../../../lib/linkable-entities';
import { CollegeCutoffs, type CollegeCutoffResponse } from '../../../components/Cutoffs';
import { formatLpa } from '../../../lib/packages';
import ReadableHtml from '../../../components/ReadableHtml';
import { readableBlocks, splitLead } from '../../../lib/readable-html';

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
    min_year_fee?: number | string | null;
    max_year_fee?: number | string | null;
    year_fees?: Array<{ year: number; fee: number }>;
  }>;
  fees?: {
    min_total_fee?: number | string | null;
    max_total_fee?: number | string | null;
    min_year_fee?: number | string | null;
    max_year_fee?: number | string | null;
    average_year_fee?: number | string | null;
  } | null;
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
  placementRepeats?: Array<{ year: number; highest: number; programmes: number }>;
  comparisonGuides: Array<{ slug: string; title: string; h1?: string | null; course_name?: string | null; other_college_name?: string | null; image_url?: string | null }>;
  updatedAt?: string | null;
};

// Default cutoff table only (server-rendered for SEO). Filters run client-side via /api/college-cutoffs;
// the page URL never carries filter params.
async function getCollegeCutoffs(slug: string) {
  try {
    return await api<CollegeCutoffResponse>(`/colleges/${encodeURIComponent(slug)}/cutoffs?perPage=25`, { cache: 'no-store' });
  } catch {
    return null;
  }
}

async function getCollege(slug: string) {
  try {
    const response = await api<{ data: CollegeProfile }>(`/colleges/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    return response.data;
  } catch {
    return null;
  }
}


// ---------- Rankings ----------
const RANKING_BODY_LABELS: Record<string, string> = {
  nirf: 'NIRF', itoday: 'India Today', outlook: 'Outlook', times: 'Times Ranking', times_b: 'Times Ranking', qs: 'QS', the: 'Times Higher Education'
};
const HIDDEN_RANKING_BODIES = new Set(['cs', '']);

function rankingBodyLabel(body: string) {
  const key = String(body || '').trim().toLowerCase();
  if (RANKING_BODY_LABELS[key]) return RANKING_BODY_LABELS[key];
  const pretty = key.replace(/[_-]+/g, ' ').trim();
  return pretty.length <= 4 ? pretty.toUpperCase() : pretty.replace(/\b\w/g, (c) => c.toUpperCase());
}

type CleanRanking = { body: string; label: string; year: number; rank: number; outOf: number; course: string };

function cleanRankings(rankings: CollegeProfile['rankings']) {
  const seen = new Set<string>();
  const rows: CleanRanking[] = [];
  rankings.forEach((ranking) => {
    const body = String(ranking.ranking_body || '').trim().toLowerCase();
    const rank = Number(ranking.rank) || 0;
    if (HIDDEN_RANKING_BODIES.has(body) || rank <= 0) return;
    const year = Number(ranking.year) || 0;
    const course = text(ranking.course_name, '');
    const key = `${rankingBodyLabel(body)}|${year}|${rank}|${course.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ body, label: rankingBodyLabel(body), year, rank, outOf: Number(ranking.out_of) || 0, course });
  });
  rows.sort((a, b) => b.year - a.year || a.rank - b.rank);
  const groups = new Map<string, { label: string; rows: CleanRanking[] }>();
  rows.forEach((row) => {
    const group = groups.get(row.label) || { label: row.label, rows: [] };
    group.rows.push(row);
    groups.set(row.label, group);
  });
  // Bodies ordered by their latest year (rows are already latest-first).
  return { rows, groups: Array.from(groups.values()) };
}

// ---------- Placements ----------
type PlacementLine = { course: string; year: number; highest: number; average: number; lowest: number };

function cleanPlacements(profile: CollegeProfile) {
  const valid = profile.placements.filter((item) => Number(item.year) > 0 && (Number(item.highest_package) > 0 || Number(item.average_package) > 0 || Number(item.lowest_package) > 0));
  if (!valid.length) return { lines: [] as PlacementLine[], wide: [] as Array<{ year: number; highest: number; programmes: number }>, years: [] as number[], chart: [] as Array<{ year: number; highest: number; average: number }> };
  const latest = Math.max(...valid.map((item) => Number(item.year)));
  const recent = valid.filter((item) => Number(item.year) >= latest - 2);
  const grouped = new Map<string, PlacementLine>();
  recent.forEach((item) => {
    const course = text(item.course_name, 'Programme group');
    const year = Number(item.year);
    const key = `${course}:${year}`;
    const existing = grouped.get(key) || { course, year, highest: 0, average: 0, lowest: 0 };
    existing.highest = Math.max(existing.highest, Number(item.highest_package) || 0);
    existing.average = Math.max(existing.average, Number(item.average_package) || 0);
    existing.lowest = Math.max(existing.lowest, Number(item.lowest_package) || 0);
    grouped.set(key, existing);
  });
  const lines = Array.from(grouped.values());
  // A highest package copied onto 5+ programmes in the same year is an institution-wide figure
  // (counted per programme in the backend): show it once per year, not on every programme line.
  const wide: Array<{ year: number; highest: number; programmes: number }> = [];
  const shownYears = new Set(lines.map((line) => line.year));
  (profile.placementRepeats || []).filter((item) => shownYears.has(item.year)).forEach((item) => {
    const current = wide.find((entry) => entry.year === item.year);
    if (!current) wide.push({ ...item });
    else if (item.programmes > current.programmes || (item.programmes === current.programmes && item.highest > current.highest)) Object.assign(current, item);
  });
  wide.forEach((item) => lines.forEach((line) => { if (line.year === item.year && line.highest === item.highest) line.highest = 0; }));
  wide.sort((a, b) => b.year - a.year);
  const kept = lines.filter((line) => line.highest || line.average || line.lowest).sort((a, b) => b.year - a.year || a.course.localeCompare(b.course));
  const years = Array.from(new Set(recent.map((item) => Number(item.year)))).sort((a, b) => b - a);
  const chart = years.slice().sort((a, b) => a - b).map((year) => {
    const rows = recent.filter((item) => Number(item.year) === year);
    return { year, highest: Math.max(...rows.map((item) => Number(item.highest_package) || 0)), average: Math.max(...rows.map((item) => Number(item.average_package) || 0)) };
  }).filter((row) => row.highest > 0 || row.average > 0);
  return { lines: kept, wide, years, chart };
}

function placementLineText(line: PlacementLine) {
  return [
    line.highest ? `Highest ${packageValue(line.highest)}` : '',
    line.average ? `Average ${packageValue(line.average)}` : '',
    line.lowest ? `Lowest ${packageValue(line.lowest)}` : ''
  ].filter(Boolean).join(', ');
}

// ---------- Fees ----------
type ProgrammeFee = { kind: 'yearwise' | 'annual' | 'total'; years: Array<{ year: number; fee: number }>; annualMin: number; annualMax: number; total: number };

function programmeFee(programme: CollegeProfile['programmes'][number]): ProgrammeFee | null {
  // One fee per year of study (duplicate year rows collapse to the higher value) so totals are not inflated.
  const byYear = new Map<number, number>();
  (programme.year_fees || []).forEach((item) => {
    const year = Number(item.year) || 0;
    const fee = Number(item.fee) || 0;
    if (year > 0 && year <= 10 && fee > 0) byYear.set(year, Math.max(byYear.get(year) || 0, fee));
  });
  const years = Array.from(byYear, ([year, fee]) => ({ year, fee })).sort((a, b) => a.year - b.year);
  if (years.length >= 2) {
    const fees = years.map((item) => item.fee);
    return { kind: 'yearwise', years, annualMin: Math.min(...fees), annualMax: Math.max(...fees), total: fees.reduce((sum, fee) => sum + fee, 0) };
  }
  const yearMin = Number(programme.min_year_fee) || 0;
  const yearMax = Number(programme.max_year_fee) || yearMin;
  if (years.length === 1 || yearMin) {
    const fee = years[0]?.fee || yearMin;
    return { kind: 'annual', years, annualMin: Math.min(fee, yearMin || fee), annualMax: Math.max(fee, yearMax), total: 0 };
  }
  const total = Number(programme.max_total_fee) || Number(programme.min_total_fee) || 0;
  return total ? { kind: 'total', years: [], annualMin: 0, annualMax: 0, total } : null;
}

function feeFacts(profile: CollegeProfile) {
  const fees = profile.programmes.map(programmeFee).filter((fee): fee is ProgrammeFee => Boolean(fee));
  if (!fees.length) {
    const yearMin = Number(profile.fees?.min_year_fee) || 0;
    const totalMin = Number(profile.fees?.min_total_fee) || 0;
    return { yearMin, yearMax: Number(profile.fees?.max_year_fee) || yearMin, totalMin, totalMax: Number(profile.fees?.max_total_fee) || totalMin };
  }
  const annual = fees.filter((fee) => fee.annualMin > 0);
  const totals = fees.map((fee) => fee.total).filter((value) => value > 0);
  return {
    yearMin: annual.length ? Math.min(...annual.map((fee) => fee.annualMin)) : 0,
    yearMax: annual.length ? Math.max(...annual.map((fee) => fee.annualMax)) : 0,
    totalMin: totals.length ? Math.min(...totals) : 0,
    totalMax: totals.length ? Math.max(...totals) : 0
  };
}

function stripSiteSuffix(value: string) {
  return value.replace(/\s*[|–—-]\s*College\s*Decision(\.in)?\s*$/i, '').trim();
}

const PROGRAMMES_VISIBLE = 10;

/** Title suffix and description list only the sections that actually have data, so snippets never over-promise. */
function profileSeo(profile: CollegeProfile, name: string, city: string, currentYear: number) {
  const placements = cleanPlacements(profile);
  const hasPlacements = placements.lines.length > 0 || placements.wide.length > 0;
  const hasFees = feeFacts(profile).yearMin > 0 || feeFacts(profile).totalMin > 0;
  const titleParts = [hasFees ? 'Fees' : '', profile.programmes.length ? 'Courses' : '', 'Admission', hasPlacements ? 'Placements' : ''].filter(Boolean);
  const titleTail = titleParts.length > 1 ? `${titleParts.slice(0, -1).join(', ')} & ${titleParts[titleParts.length - 1]}` : titleParts[0];
  const title = `${name}${city ? `, ${city}` : ''} ${currentYear} – ${titleTail}`;
  const covered = [
    profile.programmes.length ? 'courses' : '', hasFees ? 'fees' : '', 'admission process',
    profile.exams.length ? 'entrance exams' : '', profile.cutoffs.length ? 'cutoffs' : '', hasPlacements ? 'placements' : '',
    cleanRankings(profile.rankings).rows.length ? 'rankings' : '', profile.reviewSummary.count ? `${profile.reviewSummary.count} student reviews` : '',
    profile.recruiters.length ? 'recruiters' : ''
  ].filter(Boolean);
  const list = covered.length > 1 ? `${covered.slice(0, -1).join(', ')} and ${covered[covered.length - 1]}` : covered[0];
  const description = `${name}${city ? ` ${city}` : ''}: ${list}${profile.programmes.length ? ` for ${profile.programmes.length} programme${profile.programmes.length > 1 ? 's' : ''}` : ''}. Check the details before you shortlist.`;
  return { title, description };
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

// Fee ranges come only from programme-level rows (Total Fees / Tuition Fees). Annual rows and
// programme totals are kept apart so each range carries an accurate label.
function moneyRange(min: number, max: number) {
  return max > min ? `${money(min)} to ${money(max)}` : money(min);
}

function feeSentences(profile: CollegeProfile) {
  const { yearMin, yearMax, totalMin, totalMax } = feeFacts(profile);
  const parts: string[] = [];
  if (yearMin) parts.push(`recorded fees ${yearMax > yearMin ? 'range from' : 'are'} ${moneyRange(yearMin, yearMax)} per year of study`);
  if (totalMin) parts.push(`full-programme totals ${totalMax > totalMin ? 'range from' : 'are'} ${moneyRange(totalMin, totalMax)}`);
  return parts;
}

function packageValue(value: number | string | null | undefined) {
  const amount = Number(value);
  return formatLpa(amount);
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
  const feeParts = feeSentences(profile);
  if (feeParts.length) {
    const answer = feeParts.join('; ');
    faqs.push({ question: `What are the fees at ${name}?`, answer: `${answer.charAt(0).toUpperCase()}${answer.slice(1)}. Hostel, deposits and one-time charges are extra; confirm current category and additional charges with the institution.` });
  }
  if (profile.exams.length) faqs.push({ question: `Which entrance exams are accepted by ${name}?`, answer: `The active programme mappings list ${profile.exams.slice(0, 6).map((exam) => exam.name).join(', ')}.` });
  if (profile.cutoffs.length) faqs.push({ question: `What are the cutoffs for ${name}?`, answer: `Latest-year, final-round cutoffs are recorded for ${profile.cutoffs.length} programme, category and quota combination(s)${profile.cutoffs[0]?.exam_name ? ` (${String(profile.cutoffs[0].exam_name).replace(/\s+/g, ' ')}${profile.cutoffs[0].year ? ` ${profile.cutoffs[0].year}` : ''})` : ''}. Use the cutoff filters on this page to check your programme, category, quota and round.` });
  const placements = cleanPlacements(profile);
  if (placements.lines.length || placements.wide.length) faqs.push({ question: `How are placements at ${name}?`, answer: `Placement records are available for ${placements.years.join(', ')}${placements.wide[0] ? `, with a highest package of ${packageValue(placements.wide[0].highest)} reported in ${placements.wide[0].year}` : ''}. Values vary by programme and year.` });
  const withAverage = placements.lines.find((item) => item.average > 0);
  if (withAverage) faqs.push({ question: `What is the average package at ${name}?`, answer: `The latest placement records include an average package of ${packageValue(withAverage.average)} for ${withAverage.course} (${withAverage.year}). Values can vary by year and programme.` });
  const rankings = cleanRankings(profile.rankings).rows;
  if (rankings.length) faqs.push({ question: `What is the ranking of ${name}?`, answer: `${name} is ranked ${rankings.slice(0, 2).map((item) => `${item.rank}${item.course ? ` (${item.course})` : ''} by ${item.label}${item.year ? ` ${item.year}` : ''}`).join(' and ')}.` });
  if (profile.reviewSummary.count && profile.reviewSummary.averageRating) faqs.push({ question: `What is the student rating of ${name}?`, answer: `${name} has an average rating of ${profile.reviewSummary.averageRating.toFixed(1)} out of 5 from ${profile.reviewSummary.count} active review(s).` });
  if (profile.recruiters.length) faqs.push({ question: `Which recruiters are associated with ${name}?`, answer: `The available records include recruiters such as ${profile.recruiters.slice(0, 6).map((item) => item.name).join(', ')}.` });
  if (profile.institute.instituteType) faqs.push({ question: `Is ${name} government or private?`, answer: `${name} is recorded as a ${profile.institute.instituteType.toLowerCase()} in the current profile data.` });
  if (location) faqs.push({ question: `Where is ${name} located?`, answer: `${name} is listed in ${location}.` });
  if (profile.institute.website) faqs.push({ question: `Where can I verify ${name} admission details?`, answer: `Use the official ${name} website for current admission dates, eligibility, fees and application instructions.` });
  return faqs.slice(0, 8);
}

function decisionNote(profile: CollegeProfile, name: string) {
  const facts = feeFacts(profile);
  const feeText = facts.yearMin ? `fees from ${money(facts.yearMin)} per year of study` : facts.totalMin ? `total programme fees from ${money(facts.totalMin)}` : '';
  const placements = cleanPlacements(profile);
  const averagePackage = Math.max(...placements.lines.map((item) => item.average), 0);
  if (feeText && averagePackage) return `${name} has recorded ${feeText} and placement records with average packages up to ${packageValue(averagePackage)}. Use these figures to shortlist, then verify the same programme, year, category and placement report before deciding.`;
  if (placements.lines.length || placements.wide.length) return `${name} has active placement records, but fee and package values can vary by programme and year. Compare the exact course and latest official placement report before applying.`;
  if (profile.reviewSummary.averageRating) return `${name} has a ${profile.reviewSummary.averageRating.toFixed(1)}/5 aggregate student rating, but current placement and fee evidence is limited. Prioritise official course, fee and outcome information for your decision.`;
  return `Use ${name}'s programme, eligibility and fee records as a shortlist starting point. Confirm current admission dates, total cost and outcomes with the institution before applying.`;
}

function PlacementChart({ rows }: { rows: Array<{ year: number; highest: number; average: number }> }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.flatMap((item) => [item.average, item.highest]), 1);
  return <div className="profile-chart" aria-label="Placement package trend chart">{rows.map((item) => <div className="profile-chart-row" key={item.year}><span>{item.year}</span><div className="profile-chart-bars"><i className="profile-bar average" style={{ width: `${(item.average / max) * 100}%` }} title={item.average ? `Average ${packageValue(item.average)}` : undefined} /><i className="profile-bar highest" style={{ width: `${(item.highest / max) * 100}%` }} title={item.highest ? `Highest ${packageValue(item.highest)}` : undefined} /></div><small>{packageValue(item.highest || item.average)}</small></div>)}</div>;
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
    const items = group.programmes.map((programme) => ({ programme, fee: programmeFee(programme) })).filter((item): item is { programme: typeof item.programme; fee: ProgrammeFee } => Boolean(item.fee));
    const annual = items.filter((item) => item.fee.annualMin > 0);
    const totals = items.map((item) => item.fee.total).filter((value) => value > 0);
    const maxYears = Math.max(0, ...items.map((item) => item.fee.years.length));
    return {
      ...group,
      items,
      yearwise: items.some((item) => item.fee.kind === 'yearwise'),
      maxYears,
      annualMin: annual.length ? Math.min(...annual.map((item) => item.fee.annualMin)) : 0,
      annualMax: annual.length ? Math.max(...annual.map((item) => item.fee.annualMax)) : 0,
      totalMin: totals.length ? Math.min(...totals) : 0,
      totalMax: totals.length ? Math.max(...totals) : 0
    };
  }).filter((group) => group.items.length > 0);
}

function feeRange(min: number, max: number) {
  return `${money(min)}${max > min ? ` – ${money(max)}` : ''}`;
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
  const { title, description } = profileSeo(profile, name, city, currentYear);
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
  const [profile, cutoffs] = await Promise.all([getCollege(slug), getCollegeCutoffs(slug)]);
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
  // Courses offered here (unique by course), used by the Apply buttons.
  const applyCourses = [...new Map(profile.programmes.filter((p) => p.course_id).map((p) => [Number(p.course_id), { id: Number(p.course_id), name: text(p.course_name, p.programme_name) }])).values()];
  const recordedFeeGroups = feeGroups(profile);
  const placements = cleanPlacements(profile);
  const rankings = cleanRankings(profile.rankings);
  const hasCutoffs = Boolean(cutoffs?.facets?.exams?.length);
  const ratingRows = ([
    ['Average overall rating', profile.reviewSummary.averageRating],
    ['Infrastructure', profile.reviewSummary.averageInfrastructure],
    ['Hostel', profile.reviewSummary.averageHostel],
    ['Clubs / Activities', profile.reviewSummary.averageClub],
    ['Faculty', profile.reviewSummary.averageFaculty],
    ['Placements', profile.reviewSummary.averagePlacement],
    ['Admission', profile.reviewSummary.averageAdmission]
  ] as Array<[string, number | null | undefined]>).filter((row): row is [string, number] => typeof row[1] === 'number' && row[1] > 0);
  const examLinks = (separator = ', ') => profile.exams.map((exam, index) => {
    const href = findPublishedHref(linkableEntities, 'exam', exam.slug);
    return <span key={exam.id}>{index ? separator : ''}{href ? <Link href={href}>{exam.name}</Link> : exam.name}</span>;
  });
  const toc = [
    { id: 'about', label: 'About', show: Boolean(profile.about || location || profile.institute.establishmentYear || officialWebsite) },
    { id: 'courses', label: 'Courses', show: profile.programmes.length > 0 },
    { id: 'fees', label: 'Fees', show: recordedFeeGroups.length > 0 },
    { id: 'admission', label: 'Admission', show: profile.programmes.some((programme) => programme.eligibility) || profile.exams.length > 0 },
    { id: 'cutoffs-exams', label: hasCutoffs ? 'Cutoffs' : 'Entrance exams', show: hasCutoffs || profile.exams.length > 0 },
    { id: 'placements', label: 'Placements', show: placements.lines.length > 0 || placements.wide.length > 0 || profile.recruiters.length > 0 },
    { id: 'reviews', label: 'Reviews', show: profile.reviewSummary.count > 0 },
    { id: 'faculty', label: 'Faculty', show: profile.faculty.length > 0 },
    { id: 'rankings', label: 'Rankings', show: rankings.rows.length > 0 },
    { id: 'compare', label: 'Compare', show: profile.comparisonGuides.length > 0 },
    { id: 'faq', label: 'FAQs', show: faqs.length > 0 }
  ].filter((item) => item.show);
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
      ...profile.programmes.slice(0, 20).map((programme) => ({
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
        headline: profileSeo(profile, name, city, currentYear).title,
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
        <CollegeApply collegeSlug={slug} collegeName={name} courses={applyCourses} label={`Apply to ${name.length > 28 ? 'this college' : name}`} />{' '}
        {officialWebsite && <a className="button" href={officialWebsite} target="_blank" rel="noopener noreferrer"><Globe2 size={16} aria-hidden="true" /> Visit official website</a>}
        {cutoffs?.data?.length ? <Link className="button" href={`/colleges/${slug}/cutoff`}>Cutoff</Link> : null}
      </div>
      <img className="college-profile-logo" src={profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : '/logo.svg'} alt={profile.institute.logo ? `${name} college logo` : 'College Decision logo'} width="160" height="160" />
    </header>
    <section className="college-decision-note"><p className="eyebrow">DECISION NOTE</p><p>{decisionNote(profile, name)}</p></section>

    <section className="college-stats" aria-label="College highlights">
      <div><strong>{profile.programmes.length}</strong><span>Active programmes</span></div>
      {profile.reviewSummary.count > 0 && <div><strong>{profile.reviewSummary.count}</strong><span>Student reviews</span></div>}
      {rating ? <div><strong>{rating.toFixed(1)}</strong><span>Average rating</span></div> : null}
      {placements.years.length > 0 && <div><strong>{placements.years[0]}</strong><span>Latest placement year</span></div>}
    </section>
    {toc.length > 2 && <nav className="college-profile-toc" aria-label="On this page"><strong>On this page:</strong>{toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>}

    {(profile.about || location || profile.institute.establishmentYear || officialWebsite) && <section id="about">
      <SectionHeading icon={Building2}>About {name}</SectionHeading>
      {profile.about && (() => {
        const { lead, rest } = splitLead(readableBlocks(profile.about, { headingShift: 1 }));
        if (!lead) return null;
        return <><h3>History and Background</h3><ReadableHtml html={lead} preSanitized />{rest ? <details className="profile-more"><summary>Read more about {name}</summary><ReadableHtml html={rest} preSanitized /></details> : null}</>;
      })()}
      {(location || profile.institute.establishmentYear) && <><h3>Campus and Location</h3><p>{profile.institute.establishmentYear ? `Established in ${profile.institute.establishmentYear}. ` : ''}{location ? `Located in ${location}.` : ''} {profile.institute.location.addressLabel || ''}</p></>}
      {affiliation && <><h3>Affiliation and Recognition</h3><p>{affiliation}</p></>}
      {(officialWebsite || profile.institute.email || profile.institute.phone) && <div className="profile-contact-list">
        {officialWebsite && <ContactItem icon={Globe2}><a href={officialWebsite} target="_blank" rel="noopener noreferrer">Official website</a></ContactItem>}
        {profile.institute.email && <ContactItem icon={Mail}><a href={`mailto:${profile.institute.email}`}>{profile.institute.email}</a></ContactItem>}
        {profile.institute.phone && <ContactItem icon={Phone}><a href={`tel:${profile.institute.phone.replace(/[^\d+]/g, '')}`}>{profile.institute.phone}</a></ContactItem>}
        {location && <ContactItem icon={MapPin}>{location}</ContactItem>}
      </div>}
    </section>}

    {profile.programmes.length > 0 && <section id="courses">
      <SectionHeading icon={BookOpen}>Courses and Programmes Offered</SectionHeading>
      <div className="programme-groups" id="programme-groups">{programmeGroups.map((group, groupIndex) => <div key={group.name} className="programme-group" data-course-ids={[...new Set(group.programmes.map((programme) => programme.course_id))].join(',')}><h3>{group.heading}<CollegeApply compact collegeSlug={slug} collegeName={name} courses={applyCourses} courseIds={[...new Set(group.programmes.map((programme) => Number(programme.course_id)))]} label="Apply" /></h3><div className="profile-list">
        {(() => {
          const groupEligibility = text(group.programmes.find((item) => item.eligibility)?.eligibility, '');
          const renderProgramme = (programme: CollegeProfile['programmes'][number]) => <p key={programme.programme_id}><strong>{text(programme.programme_name, programme.course_name)}</strong>{programme.duration ? ` – ${programme.duration} years` : ''}{programme.eligibility && text(programme.eligibility, '') !== groupEligibility ? ` – ${text(programme.eligibility)}` : ''}{(() => { const href = findPublishedHrefByName(linkableEntities, 'course', programme.course_name); const label = text(programme.course_name); if (!href || linkedCourseHrefs.has(href)) return null; linkedCourseHrefs.add(href); return <> · <Link href={href}>{label} profile</Link></>; })()}</p>;
          // Large colleges: the first 8 course groups show up to 10 programmes; later groups start collapsed.
          const visibleCount = groupIndex < 8 ? PROGRAMMES_VISIBLE : 0;
          const visible = group.programmes.slice(0, visibleCount);
          const rest = group.programmes.slice(visibleCount);
          return <>{visible.map(renderProgramme)}{rest.length > 0 && <details className="profile-more"><summary>{visibleCount ? `Show all ${group.programmes.length} programmes` : `Show ${group.programmes.length} programme${group.programmes.length > 1 ? 's' : ''}`}</summary>{rest.map(renderProgramme)}</details>}</>;
        })()}
      </div></div>)}</div>
      <InterestCourseHighlight containerId="programme-groups" />
    </section>}

    {recordedFeeGroups.length > 0 && <section id="fees">
      <SectionHeading icon={IndianRupee}>Course Fees at {name}</SectionHeading>
      {(() => { const renderFeeGroup = (group: (typeof recordedFeeGroups)[number]) => <div key={group.name}><h3>{group.heading.replace(' Programmes', '')} Fees</h3>
        {group.annualMin > 0 && <p>{group.yearwise ? 'Year-wise fee' : 'Annual fee'}: <strong>{feeRange(group.annualMin, group.annualMax)} per year</strong>{group.yearwise && group.maxYears > 1 ? ` (recorded for each year of study, up to Year ${group.maxYears})` : ''}.</p>}
        {group.totalMin > 0 && <p>{group.yearwise ? 'Full-programme total (sum of the year-wise fees)' : 'Total programme fee'}: <strong>{feeRange(group.totalMin, group.totalMax)}</strong>.</p>}
        {group.yearwise && group.items.length <= 3 && <div className="profile-list">{group.items.filter((item) => item.fee.kind === 'yearwise').map((item) => <p key={item.programme.programme_id}><strong>{text(item.programme.programme_name, item.programme.course_name)}:</strong> {item.fee.years.map((year) => `Year ${year.year}: ${money(year.fee)}`).join(' · ')} · Total {money(item.fee.total)}</p>)}</div>}
      </div>;
        const rest = recordedFeeGroups.slice(8);
        return <>{recordedFeeGroups.slice(0, 8).map(renderFeeGroup)}{rest.length > 0 && <details className="profile-more"><summary>Show fees for {rest.length} more courses</summary>{rest.map(renderFeeGroup)}</details>}</>;
      })()}
      <p className="muted">Hostel, mess and other charges are additional and not included.</p>
    </section>}

    {(profile.programmes.some((programme) => programme.eligibility) || profile.exams.length > 0) && <section id="admission">
      <SectionHeading icon={ClipboardCheck}>Admission Process and Eligibility</SectionHeading>
      {profile.programmes.some((programme) => programme.eligibility) && <><h3>Eligibility Criteria by Course</h3><div className="profile-list">{programmeGroups.map((group) => {
        const eligibility = group.programmes.find((programme) => programme.eligibility)?.eligibility;
        return eligibility ? <p key={group.name}><strong>{group.name}:</strong> {text(eligibility)}.</p> : null;
      })}</div></>}
      {profile.exams.length > 0 && <><h3>Entrance Exams Accepted</h3><div className="profile-chips">{profile.exams.map((exam) => {
        const href = findPublishedHref(linkableEntities, 'exam', exam.slug);
        return href ? <Link key={exam.id} href={href}>{exam.name}</Link> : <span key={exam.id}>{exam.name}</span>;
      })}</div></>}
      <h3>How to Apply</h3><p>Check the relevant programme eligibility, follow the mapped entrance-exam or university counselling route, and confirm dates, documents and fees on the official admission notice.</p>
    </section>}

    {hasCutoffs ? <section id="cutoffs-exams">
      <SectionHeading icon={Target}>Cutoffs and Entrance Exams</SectionHeading>
      {profile.exams.length > 0 && <><h3>Entrance Exams for {name}</h3><p>Admission is through: {examLinks()}.</p></>}
      <CollegeCutoffs slug={slug} collegeName={name} cutoffs={cutoffs} examHref={(examSlug) => findPublishedHref(linkableEntities, 'exam', examSlug)} />
    </section> : profile.exams.length > 0 ? <section id="cutoffs-exams">
      <SectionHeading icon={Target}>How Admission Works</SectionHeading>
      <p>Admission to {name} is based on {examLinks()}{profile.exams.length > 1 ? ', depending on the programme' : ''}. Qualify in the relevant exam, then take part in the college or counselling process announced on the official admission notice.</p>
    </section> : null}

    {(placements.lines.length > 0 || placements.wide.length > 0 || profile.recruiters.length > 0) && <section id="placements">
      <SectionHeading icon={BriefcaseBusiness}>Placements and Recruiters</SectionHeading>
      {(placements.lines.length > 0 || placements.wide.length > 0) && <><h3>Placement Highlights{placements.years.length ? ` (${placements.years.length > 1 ? `${placements.years[placements.years.length - 1]}–${placements.years[0]}` : placements.years[0]})` : ''}</h3><PlacementChart rows={placements.chart} />
        {placements.wide.length > 0 && <div className="profile-list">{placements.wide.map((item) => <p key={`wide-${item.year}`}><strong>{profile.institute.isUniversity ? 'University' : 'Institute'}-wide highest package ({item.year}):</strong> {packageValue(item.highest)}, the same figure listed for {item.programmes} programmes, so it is shown once here.</p>)}</div>}
        {placements.lines.length > 0 && <div className="profile-list">{placements.lines.map((line) => <p key={`${line.course}-${line.year}`}><strong>{line.course} ({line.year}):</strong> {placementLineText(line)}.</p>)}</div>}</>}
      {profile.recruiters.length > 0 && <><h3>Top Recruiters</h3><p>{profile.recruiters.slice(0, 50).map((recruiter) => recruiter.name).join(', ')}{profile.recruiters.length > 50 ? ` and ${profile.recruiters.length - 50} more` : ''}.</p></>}
      {(placements.lines.length > 0 || placements.wide.length > 0) && <><h3>Placement Data Disclaimer</h3><p>Package units, currency and placement percentages are not fully specified in the source. Treat these figures as indicative and verify the latest official placement report.</p></>}
    </section>}

    {profile.reviewSummary.count > 0 && <section id="reviews">
      <SectionHeading icon={Star}>Student Reviews and Ratings</SectionHeading>
      <h3>Overall Student Ratings</h3><div className="profile-list">
        <p>Total student reviews: {profile.reviewSummary.count}</p>
        {!ratingRows.length && <p>Ratings are not available for these reviews yet.</p>}
      </div>
      <RatingDimensionChart summary={profile.reviewSummary} />
    </section>}

    {profile.faculty.length > 0 && <section id="faculty">
      <SectionHeading icon={Users}>Faculty and Departments</SectionHeading>
      <h3>Key Faculty Members</h3><div className="profile-list">{(() => {
        const renderMember = (member: CollegeProfile['faculty'][number], index: number) => <p key={`${member.name}-${member.position}-${index}`}><strong>{member.name}</strong>{member.position ? ` – ${member.position}` : ''}{member.education ? ` (${member.education})` : ''}</p>;
        const rest = profile.faculty.slice(PROGRAMMES_VISIBLE);
        return <>{profile.faculty.slice(0, PROGRAMMES_VISIBLE).map(renderMember)}{rest.length > 0 && <details className="profile-more"><summary>Show all {profile.faculty.length} faculty members</summary>{rest.map((member, index) => renderMember(member, index + PROGRAMMES_VISIBLE))}</details>}</>;
      })()}</div>
    </section>}

    {rankings.rows.length > 0 && <section id="rankings">
      <SectionHeading icon={Trophy}>Rankings and Recognition</SectionHeading>
      {rankings.groups.map((group) => <div key={group.label}><h3>{group.label} Rankings</h3><div className="profile-list">{group.rows.slice(0, 12).map((row) => <p key={`${row.year}-${row.rank}-${row.course}`}><strong>{row.year ? `${group.label} ${row.year}` : group.label}{row.course ? ` · ${row.course}` : ''}:</strong> Rank {row.rank}{row.outOf ? ` out of ${row.outOf}` : ''}</p>)}</div></div>)}
    </section>}
    {profile.comparisonGuides.length > 0 && <section id="compare"><SectionHeading icon={ArrowLeftRight}>Compare {name}</SectionHeading><div className="college-programme-grid">{profile.comparisonGuides.map((guide) => <Link className="card" href={`/articles/${guide.slug}`} key={guide.slug}><h3>{stripSiteSuffix(text(guide.title, guide.h1 || 'College comparison guide'))}</h3><p className="muted">{guide.other_college_name ? `Compare ${name} with ${guide.other_college_name}` : 'Read the published comparison guide'}</p></Link>)}</div></section>}
    {faqs.length > 0 && <section id="faq"><SectionHeading icon={HelpCircle}>Frequently asked questions</SectionHeading>{faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</section>}
    <div className="notice"><strong>Data note:</strong> Fees, placements, rankings and reviews are recorded evidence and may change by batch, category, role, recruiter mix or academic year. Verify the latest official information before applying.</div>
  </div></main>;
}
