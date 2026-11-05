import InterestCourseHighlight from '../../../components/InterestCourseHighlight';
import CollegeApply from '../../../components/CollegeApply';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftRight, ArrowUpRight, BadgeCheck, BookOpen, BriefcaseBusiness, Building2, CalendarDays, ChevronDown, ClipboardCheck, Clock, Globe2, GraduationCap, HelpCircle, IndianRupee, Landmark, Lightbulb, Mail, MapPin, Phone, ShieldCheck, Star, Target, TrendingUp, Trophy, Users, type LucideIcon } from 'lucide-react';
import ProfileSectionNav from '../../../components/ProfileSectionNav';
import { api, instituteLogoUrl } from '../../../lib/api';
import { toAbsoluteExternalUrl } from '../../../lib/external-url';
import { getLinkableEntities, findPublishedHref, findPublishedHrefByName } from '../../../lib/linkable-entities';
import { CollegeCutoffs, type CollegeCutoffResponse } from '../../../components/Cutoffs';
import { formatLpa } from '../../../lib/packages';
import ReadableHtml from '../../../components/ReadableHtml';
import AdSlot from '../../../components/ads/AdSlot';
import { readableBlocks, splitLead } from '../../../lib/readable-html';
import { getLinkResolver } from '../../../lib/internal-link-index';
import { formatProgrammeDuration, isoProgrammeDuration } from '../../../lib/duration';
import { plainText, readableLines, PROGRAMME_HEADING_START, isShortText, withFullStop } from '../../../lib/readable-text';

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
  // A whole-course entry (fee duration 'total', e.g. a Total Fees row) is never a yearly fee:
  // keep it as the full-programme total even when a single annual row also exists.
  const total = Number(programme.max_total_fee) || Number(programme.min_total_fee) || 0;
  if (years.length === 1 || yearMin) {
    const fee = years[0]?.fee || yearMin;
    return { kind: 'annual', years, annualMin: Math.min(fee, yearMin || fee), annualMax: Math.max(fee, yearMax), total };
  }
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

const PROGRAMMES_VISIBLE = 6;

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
  return plainText(value, fallback);
}

/** Eligibility row for a course group: prefer a regular programme over a lateral-entry one. */
function groupEligibilitySource<T extends { eligibility?: string | null; programme_name?: string | null }>(programmes: T[]) {
  const withText = programmes.filter((item) => text(item.eligibility, ''));
  return withText.find((item) => !/lateral/i.test(String(item.programme_name || ''))) || withText[0];
}

function EligibilityText({ value, label }: { value: unknown; label?: string }) {
  const lines = readableLines(value);
  if (!lines.length) return null;
  if (isShortText(lines)) return <>{label ? <>{label} </> : null}{withFullStop(lines[0])}</>;
  return <span className="eligibility-block">{label && <span className="eligibility-label">{label}</span>}<ul className="eligibility-lines">{lines.map((line, index) => { const head = line.match(PROGRAMME_HEADING_START); return <li key={index}>{head ? <><strong className="eligibility-programme">{head[1]}</strong><br />{line.slice(head[0].length)}</> : line}</li>; })}</ul></span>;
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
  if (profile.recruiters.length) faqs.push({ question: `Which recruiters are associated with ${name}?`, answer: `The available records include recruiters such as ${profile.recruiters.slice(0, 6).map((item) => plainText(item.name)).join(', ')}.` });
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
  return <div className="cp-chart" aria-label="Placement package trend chart">
    <div className="cp-chart-legend"><span><i className="is-average" />Best average package</span><span><i className="is-highest" />Highest package</span></div>
    {rows.map((item) => <div className="cp-chart-row" key={item.year}>
      <span className="cp-chart-year">{item.year}</span>
      <div className="cp-chart-bars">
        {item.average > 0 && <div className="cp-chart-bar is-average"><i style={{ width: `${Math.max(2, (item.average / max) * 100)}%` }} /><small>{packageValue(item.average)}</small></div>}
        {item.highest > 0 && <div className="cp-chart-bar is-highest"><i style={{ width: `${Math.max(2, (item.highest / max) * 100)}%` }} /><small>{packageValue(item.highest)}</small></div>}
      </div>
    </div>)}
  </div>;
}

function RatingChart({ breakdown }: { breakdown: CollegeProfile['reviewSummary']['ratingBreakdown'] }) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0);
  if (!total) return null;
  return <div className="cp-rating-bars" aria-label="Student rating breakdown chart">{breakdown.map((item) => <div className="cp-rating-bar" key={item.rating}><span>{item.rating} <Star size={12} aria-hidden="true" /></span><div><i style={{ width: `${(item.count / total) * 100}%` }} /></div><small>{item.count}</small></div>)}</div>;
}

function Stars({ value }: { value: number }) {
  return <span className="cp-stars" aria-hidden="true"><span className="cp-stars-fill" style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}>★★★★★</span>★★★★★</span>;
}

function initials(name: string) {
  const words = plainText(name, '').replace(/[^A-Za-z\s.]/g, ' ').split(/[\s.]+/).filter((word) => word && !/^(prof|dr|mr|mrs|ms|er|shri|smt)$/i.test(word));
  return ((words[0]?.[0] || '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() || '•';
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
  return <div className="cp-dimensions" aria-label="Average student ratings by category">
    {rows.map(([label, value]) => <div className={`cp-dimension${value >= 4 ? ' is-high' : value < 3.5 ? ' is-low' : ''}`} key={label}>
      <div className="cp-dimension-head"><span>{label}</span><strong>{value.toFixed(1)}<small>/5</small></strong></div>
      <div className="cp-dimension-track"><i style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} /></div>
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

function SectionHeading({ icon: Icon, children, subtitle }: { icon: LucideIcon; children: ReactNode; subtitle?: ReactNode }) {
  return <div className="cp-section-head"><span className="cp-section-icon"><Icon size={20} strokeWidth={2} aria-hidden="true" /></span><div><h2>{children}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></div>;
}

function ContactItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return <div className="cp-contact"><span className="cp-contact-icon"><Icon size={16} strokeWidth={2} aria-hidden="true" /></span><div><small>{label}</small><span>{children}</span></div></div>;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
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
  const legacyLinkResolver = await getLinkResolver();
  const selfPath = `/colleges/${slug}`;
  // Old About HTML links to the previous site structure; send them to live pages, unwrap dead ones, and make self-links in-page anchors.
  const resolveAboutLink = (href: string) => {
    const resolved = legacyLinkResolver(href);
    if (resolved && (resolved === selfPath || resolved.startsWith(`${selfPath}#`))) return resolved.slice(selfPath.length) || null;
    return resolved;
  };
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
  const fees = feeFacts(profile);
  const topPackage = [...placements.wide.map((item) => ({ value: item.highest, year: item.year })), ...placements.lines.map((line) => ({ value: line.highest, year: line.year }))]
    .filter((item) => item.value > 0).sort((a, b) => b.value - a.value || b.year - a.year)[0];
  const topAverage = placements.lines.filter((line) => line.average > 0).sort((a, b) => b.average - a.average || b.year - a.year)[0];
  const latestRankYear = rankings.rows[0]?.year || 0;
  const bestRank = rankings.rows.filter((row) => row.year === latestRankYear).sort((a, b) => a.rank - b.rank)[0];
  const glance = [
    { icon: BookOpen, value: String(profile.programmes.length), label: 'Active programmes', note: `${courseFamilies(profile).length} course groups` },
    fees.yearMin ? { icon: IndianRupee, value: money(fees.yearMin), label: 'Annual fees from', note: fees.yearMax > fees.yearMin ? `up to ${money(fees.yearMax)}` : 'per year of study' } : null,
    topPackage ? { icon: TrendingUp, value: packageValue(topPackage.value), label: 'Highest package', note: `Reported ${topPackage.year}` } : null,
    topAverage ? { icon: BriefcaseBusiness, value: packageValue(topAverage.average), label: 'Best average package', note: `${topAverage.course} (${topAverage.year})` } : null,
    bestRank ? { icon: Trophy, value: `#${bestRank.rank}`, label: `${bestRank.label}${bestRank.year ? ` ${bestRank.year}` : ''} rank`, note: bestRank.course || (bestRank.outOf ? `out of ${bestRank.outOf}` : 'Ranking record') } : null,
    rating && profile.reviewSummary.count ? { icon: Star, value: `${rating.toFixed(1)}/5`, label: 'Student rating', note: plural(profile.reviewSummary.count, 'rating') } : null,
    profile.exams.length ? { icon: GraduationCap, value: String(profile.exams.length), label: 'Entrance exams', note: profile.exams.slice(0, 3).map((exam) => exam.name).join(', ') } : null
  ].filter((item): item is { icon: LucideIcon; value: string; label: string; note: string } => Boolean(item)).slice(0, 6);
  const recruiterNames = Array.from(new Map(profile.recruiters.map((recruiter) => plainText(recruiter.name, '')).filter(Boolean).map((recruiter) => [recruiter.toLowerCase(), recruiter])).values());
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
        timeRequired: isoProgrammeDuration(programme.duration, programme.programme_name, programme.course_name)
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

  const visibleFeeGroups = recordedFeeGroups.slice(0, 8);
  const moreFeeGroups = recordedFeeGroups.slice(8);
  const eligibilityGroups = programmeGroups.map((group) => ({ name: group.name, eligibility: groupEligibilitySource(group.programmes)?.eligibility })).filter((group) => group.eligibility);
  const hasPlacementData = placements.lines.length > 0 || placements.wide.length > 0;
  const placementYears = placements.years.length > 1 ? `${placements.years[placements.years.length - 1]}–${placements.years[0]}` : String(placements.years[0] || '');
  const renderFeeTable = (groups: typeof recordedFeeGroups) => <div className="cp-table-wrap"><table className="cp-table cp-fee-table">
    <thead><tr><th scope="col">Course</th><th scope="col">Fee per year</th><th scope="col">Full programme</th></tr></thead>
    <tbody>{groups.map((group) => {
      const yearwise = group.yearwise && group.items.length <= 3 ? group.items.filter((item) => item.fee.kind === 'yearwise') : [];
      return <tr key={group.name}>
        <th scope="row">
          <strong>{group.heading.replace(' Programmes', '')} Fees</strong>
          <small>{plural(group.items.length, 'programme')}{group.yearwise && group.maxYears > 1 ? ` · year-wise, up to Year ${group.maxYears}` : ''}</small>
          {yearwise.length > 0 && <details className="cp-fee-years"><summary>Year-wise breakdown</summary>{yearwise.map((item) => <div key={item.programme.programme_id}><strong>{text(item.programme.programme_name, item.programme.course_name)}</strong><ul>{item.fee.years.map((year) => <li key={year.year}><span>Year {year.year}</span><span>{money(year.fee)}</span></li>)}<li className="is-total"><span>Total</span><span>{money(item.fee.total)}</span></li></ul></div>)}</details>}
        </th>
        <td data-label="Fee per year">{group.annualMin > 0 ? <><strong>{feeRange(group.annualMin, group.annualMax)}</strong><small>per year</small></> : <span className="muted">Not listed</span>}</td>
        <td data-label="Full programme">{group.totalMin > 0 ? <><strong>{feeRange(group.totalMin, group.totalMax)}</strong><small>{group.yearwise ? 'sum of year-wise fees' : 'full course'}</small></> : <span className="muted">Not listed</span>}</td>
      </tr>;
    })}</tbody>
  </table></div>;
  const renderMember = (member: CollegeProfile['faculty'][number], index: number) => <div className="cp-person" key={`${member.name}-${member.position}-${index}`}>
    <span className="cp-avatar" aria-hidden="true">{initials(member.name)}</span>
    <div><strong>{plainText(member.name)}</strong>{member.position ? <span>{plainText(member.position)}</span> : null}{member.education ? <small>{plainText(member.education)}</small> : null}</div>
  </div>;

  // Thin profile (no About and no programmes): never show ads.
  const adThin = !String(profile.about || '').trim() && profile.programmes.length === 0;
  return <main className="section college-profile-page cp-page"><div className="wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav className="breadcrumb cp-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">{name}</span></nav>
    <AdSlot slotKey="college_top" thin={adThin} />

    <header className="cp-hero">
      <div className="cp-hero-top">
        <div className="cp-hero-logo"><img src={profile.institute.logo ? instituteLogoUrl(profile.institute.logo) : '/logo.svg'} alt={profile.institute.logo ? `${name} college logo` : 'College Decision logo'} width="112" height="112" /></div>
        <div className="cp-hero-copy">
          <p className="cp-eyebrow">College profile · {currentYear}</p>
          <h1>{name}{city ? `, ${city}` : ''}</h1>
          <div className="cp-hero-meta">
            <span><MapPin size={15} aria-hidden="true" /> {location || 'India'}</span>
            <span><Landmark size={15} aria-hidden="true" /> <span className="cp-capitalize">{profile.institute.instituteType || 'College'}</span>{profile.institute.isUniversity ? ' · University' : ''}</span>
            {profile.institute.establishmentYear ? <span><CalendarDays size={15} aria-hidden="true" /> Est. {profile.institute.establishmentYear}</span> : null}
          </div>
        </div>
      </div>
      <p className="cp-hero-lead">Explore recorded courses, fees, entrance routes, placements, rankings and aggregate student ratings before making your shortlist.</p>
      <div className="cp-hero-badges">
        <span className="cp-pill is-verified"><BadgeCheck size={15} aria-hidden="true" /> Evidence-backed profile</span>
        {rating && profile.reviewSummary.count > 0 ? <span className="cp-pill is-rating"><Stars value={rating} /><strong>{rating.toFixed(1)}/5</strong> from {profile.reviewSummary.count} student ratings</span> : null}
        {bestRank ? <span className="cp-pill is-rank"><Trophy size={14} aria-hidden="true" /> {bestRank.label}{bestRank.year ? ` ${bestRank.year}` : ''} <strong>#{bestRank.rank}</strong>{bestRank.course ? ` · ${bestRank.course}` : ''}</span> : null}
      </div>
      <div className="cp-hero-actions">
        <CollegeApply collegeSlug={slug} collegeName={name} courses={applyCourses} label={`Apply to ${name.length > 28 ? 'this college' : name}`} />
        <Link className="button cp-btn-ghost" href="#courses">Explore courses</Link>
        <Link className="button cp-btn-ghost" href="/compare-colleges-2026"><ArrowLeftRight size={15} aria-hidden="true" /> Compare colleges</Link>
        {officialWebsite && <a className="button cp-btn-ghost" href={officialWebsite} target="_blank" rel="noopener noreferrer"><Globe2 size={15} aria-hidden="true" /> Official website</a>}
        {cutoffs?.data?.length ? <Link className="button cp-btn-ghost" href={`/colleges/${slug}/cutoff`}><Target size={15} aria-hidden="true" /> View cutoff</Link> : null}
      </div>
    </header>

    {glance.length > 0 && <section className="cp-glance" aria-labelledby="college-highlights-heading">
      <h2 id="college-highlights-heading" className="cp-sr-only">Quick highlights</h2>
      <div className="cp-glance-grid">{glance.map((item) => <div className="cp-glance-item" key={item.label}>
        <span className="cp-glance-icon"><item.icon size={18} aria-hidden="true" /></span>
        <strong>{item.value}</strong>
        <span>{item.label}</span>
        <small title={item.note}>{item.note}</small>
      </div>)}</div>
    </section>}

    <section className="cp-insight">
      <span className="cp-insight-icon"><Lightbulb size={20} aria-hidden="true" /></span>
      <div><p className="cp-insight-title">Decision note</p><p>{decisionNote(profile, name)}</p></div>
    </section>

    {toc.length > 2 && <ProfileSectionNav items={toc.map(({ id, label }) => ({ id, label }))} />}

    {(profile.about || location || profile.institute.establishmentYear || officialWebsite) && <section id="about" className="cp-card">
      <SectionHeading icon={Building2} subtitle="Background, campus, recognition and official contacts">About {name}</SectionHeading>
      {profile.about && (() => {
        const { lead, rest } = splitLead(readableBlocks(profile.about, { headingShift: 1, resolveLink: resolveAboutLink }));
        if (!lead) return null;
        return <><h3>History and Background</h3><ReadableHtml html={lead} preSanitized />{rest ? <details className="profile-more cp-more"><summary>Read more about {name}<ChevronDown size={16} aria-hidden="true" /></summary><ReadableHtml html={rest} preSanitized /></details> : null}</>;
      })()}
      {(location || profile.institute.establishmentYear) && <><h3>Campus and Location</h3><div className="cp-facts">
        {profile.institute.establishmentYear ? <div><small>Established</small><strong>{profile.institute.establishmentYear}</strong></div> : null}
        {location && <div><small>Location</small><strong>{location}</strong></div>}
        <div><small>Institute type</small><strong className="cp-capitalize">{profile.institute.instituteType || 'College'}{profile.institute.isUniversity ? ' · University' : ''}</strong></div>
        {profile.institute.location.addressLabel ? <div className="is-wide"><small>Campus address</small><strong>{profile.institute.location.addressLabel}</strong></div> : null}
      </div></>}
      {affiliation && <><h3>Affiliation and Recognition</h3><p className="cp-affiliation"><ShieldCheck size={18} aria-hidden="true" /><span>{affiliation}</span></p></>}
      {(officialWebsite || profile.institute.email || profile.institute.phone) && <div className="cp-contacts">
        {officialWebsite && <ContactItem icon={Globe2} label="Website"><a href={officialWebsite} target="_blank" rel="noopener noreferrer">Official website</a></ContactItem>}
        {profile.institute.email && <ContactItem icon={Mail} label="Email"><a href={`mailto:${profile.institute.email}`}>{profile.institute.email}</a></ContactItem>}
        {profile.institute.phone && <ContactItem icon={Phone} label="Phone"><a href={`tel:${profile.institute.phone.replace(/[^\d+]/g, '')}`}>{profile.institute.phone}</a></ContactItem>}
      </div>}
    </section>}

    <AdSlot slotKey="college_mid_1" thin={adThin} />
    {profile.programmes.length > 0 && <section id="courses" className="cp-card">
      <SectionHeading icon={BookOpen} subtitle={`${plural(profile.programmes.length, 'programme')} across ${plural(programmeGroups.length, 'course group')}`}>Courses and Programmes Offered</SectionHeading>
      <div className="programme-groups cp-course-groups" id="programme-groups">{programmeGroups.map((group, groupIndex) => {
          const courseIds = [...new Set(group.programmes.map((programme) => Number(programme.course_id)))];
          const apply = <CollegeApply compact collegeSlug={slug} collegeName={name} courses={applyCourses} courseIds={courseIds} label="Apply" />;
          const groupEligibility = text(groupEligibilitySource(group.programmes)?.eligibility, '');
          const shownEligibility = new Set<string>([groupEligibility]);
          const renderProgramme = (programme: CollegeProfile['programmes'][number]) => {
            const ownKey = text(programme.eligibility, '');
            const own = ownKey && !shownEligibility.has(ownKey) ? programme.eligibility : null;
            if (own) shownEligibility.add(ownKey);
            const long = own ? !isShortText(readableLines(own)) : false;
            const duration = formatProgrammeDuration(programme.duration, programme.programme_name, programme.course_name);
            const courseHref = findPublishedHrefByName(linkableEntities, 'course', programme.course_name);
            const showCourseLink = Boolean(courseHref && !linkedCourseHrefs.has(courseHref));
            if (courseHref && showCourseLink) linkedCourseHrefs.add(courseHref);
            return <div key={programme.programme_id} className="programme-row cp-programme">
              <div className="cp-programme-main">
                <strong>{text(programme.programme_name, programme.course_name)}</strong>
                {own && !long ? <div className="cp-programme-elig"><EligibilityText value={own} /></div> : null}
                {own && long ? <details className="cp-programme-more"><summary>Eligibility<ChevronDown size={14} aria-hidden="true" /></summary><EligibilityText value={own} /></details> : null}
              </div>
              {(duration || showCourseLink) && <div className="cp-programme-meta">
                {duration ? <span className="cp-chip"><Clock size={13} aria-hidden="true" /> {duration}</span> : null}
                {showCourseLink && courseHref ? <Link className="cp-programme-link" href={courseHref}>{text(programme.course_name)} profile <ArrowUpRight size={13} aria-hidden="true" /></Link> : null}
              </div>}
            </div>;
          };
          // Large colleges: the first 8 course groups are expanded with their first few programmes; later groups start collapsed.
          if (groupIndex >= 8) return <details key={group.name} className="programme-group cp-course-group is-collapsed" data-course-ids={courseIds.join(',')}>
            <summary><h3><span className="cp-course-title">{group.heading}</span><span className="cp-count">{plural(group.programmes.length, 'programme')}</span></h3><ChevronDown size={18} aria-hidden="true" /></summary>
            <div className="cp-programmes"><div className="cp-group-apply">{apply}</div>{group.programmes.map(renderProgramme)}</div>
          </details>;
          const rest = group.programmes.slice(PROGRAMMES_VISIBLE);
          return <div key={group.name} className="programme-group cp-course-group" data-course-ids={courseIds.join(',')}>
            <h3><span className="cp-course-title">{group.heading}</span><span className="cp-count">{plural(group.programmes.length, 'programme')}</span>{apply}</h3>
            <div className="cp-programmes">{group.programmes.slice(0, PROGRAMMES_VISIBLE).map(renderProgramme)}{rest.length > 0 && <details className="profile-more cp-more"><summary>Show all {group.programmes.length} programmes<ChevronDown size={16} aria-hidden="true" /></summary>{rest.map(renderProgramme)}</details>}</div>
          </div>;
        })}</div>
      <InterestCourseHighlight containerId="programme-groups" />
    </section>}

    {recordedFeeGroups.length > 0 && <section id="fees" className="cp-card">
      <SectionHeading icon={IndianRupee} subtitle="Recorded tuition fee ranges for each course group">Course Fees at {name}</SectionHeading>
      {renderFeeTable(visibleFeeGroups)}
      {moreFeeGroups.length > 0 && <details className="profile-more cp-more"><summary>Show fees for {moreFeeGroups.length} more courses<ChevronDown size={16} aria-hidden="true" /></summary>{renderFeeTable(moreFeeGroups)}</details>}
      <p className="cp-footnote">Hostel, mess and other charges are additional and not included.</p>
    </section>}

    {(eligibilityGroups.length > 0 || profile.exams.length > 0) && <section id="admission" className="cp-card">
      <SectionHeading icon={ClipboardCheck} subtitle="Eligibility by course, accepted entrance exams and how to apply">Admission Process and Eligibility</SectionHeading>
      {eligibilityGroups.length > 0 && <><h3>Eligibility Criteria by Course</h3>{(() => {
        const renderEligibility = (group: (typeof eligibilityGroups)[number], index: number) => <details key={group.name} className="cp-accordion" open={index === 0}><summary><span>{group.name}</span><ChevronDown size={18} aria-hidden="true" /></summary><div className="cp-accordion-body"><EligibilityText value={group.eligibility} /></div></details>;
        const rest = eligibilityGroups.slice(8);
        return <div className="cp-accordion-list">{eligibilityGroups.slice(0, 8).map(renderEligibility)}{rest.length > 0 && <details className="profile-more cp-more"><summary>Show eligibility for {rest.length} more courses<ChevronDown size={16} aria-hidden="true" /></summary><div className="cp-accordion-list">{rest.map((group, index) => renderEligibility(group, index + 8))}</div></details>}</div>;
      })()}</>}
      {profile.exams.length > 0 && <><h3>Entrance Exams Accepted</h3><div className="cp-exam-chips">{profile.exams.map((exam) => {
        const href = findPublishedHref(linkableEntities, 'exam', exam.slug);
        return href ? <Link key={exam.id} href={href}>{exam.name}<ArrowUpRight size={13} aria-hidden="true" /></Link> : <span key={exam.id}>{exam.name}</span>;
      })}</div></>}
      <h3>How to Apply</h3>
      <ol className="cp-steps">
        <li><strong>Check eligibility</strong><span>Check the relevant programme eligibility above.</span></li>
        <li><strong>Take the entrance route</strong><span>Follow the mapped entrance-exam or university counselling route.</span></li>
        <li><strong>Confirm and apply</strong><span>Confirm dates, documents and fees on the official admission notice.</span></li>
      </ol>
    </section>}

    {hasCutoffs ? <section id="cutoffs-exams" className="cp-card">
      <SectionHeading icon={Target} subtitle="Opening and closing ranks by exam, round and category">Cutoffs and Entrance Exams</SectionHeading>
      {profile.exams.length > 0 && <><h3>Entrance Exams for {name}</h3><p>Admission is through: {examLinks()}.</p></>}
      <CollegeCutoffs slug={slug} collegeName={name} cutoffs={cutoffs} examHref={(examSlug) => findPublishedHref(linkableEntities, 'exam', examSlug)} />
    </section> : profile.exams.length > 0 ? <section id="cutoffs-exams" className="cp-card">
      <SectionHeading icon={Target}>How Admission Works</SectionHeading>
      <p>Admission to {name} is based on {examLinks()}{profile.exams.length > 1 ? ', depending on the programme' : ''}. Qualify in the relevant exam, then take part in the college or counselling process announced on the official admission notice.</p>
    </section> : null}

    <AdSlot slotKey="college_mid_2" thin={adThin} />
    {(hasPlacementData || profile.recruiters.length > 0) && <section id="placements" className="cp-card">
      <SectionHeading icon={BriefcaseBusiness} subtitle={hasPlacementData ? `Recorded packages ${placementYears} and recruiting companies` : 'Recruiting companies on record'}>Placements and Recruiters</SectionHeading>
      {hasPlacementData && <>
        <div className="cp-stats">
          {topPackage ? <div className="cp-stat is-amber"><small>Highest package</small><strong>{packageValue(topPackage.value)}</strong><span>Reported {topPackage.year}</span></div> : null}
          {topAverage ? <div className="cp-stat is-blue"><small>Best average package</small><strong>{packageValue(topAverage.average)}</strong><span>{topAverage.course} ({topAverage.year})</span></div> : null}
          <div className="cp-stat"><small>Years covered</small><strong>{placementYears}</strong><span>{plural(placements.lines.length, 'course record')}</span></div>
          {recruiterNames.length > 0 ? <div className="cp-stat is-teal"><small>Recruiters</small><strong>{recruiterNames.length}</strong><span>companies on record</span></div> : null}
        </div>
        <h3>Placement Highlights ({placementYears})</h3>
        <PlacementChart rows={placements.chart} />
        {placements.wide.length > 0 && <div className="cp-callouts">{placements.wide.map((item) => <p className="cp-callout" key={`wide-${item.year}`}><TrendingUp size={18} aria-hidden="true" /><span><strong>{profile.institute.isUniversity ? 'University' : 'Institute'}-wide highest package ({item.year}):</strong> {packageValue(item.highest)}, the same figure listed for {item.programmes} programmes, so it is shown once here.</span></p>)}</div>}
        {placements.lines.length > 0 && <div className="cp-table-wrap"><table className="cp-table cp-placement-table">
          <thead><tr><th scope="col">Course</th><th scope="col">Year</th><th scope="col">Highest</th><th scope="col">Average</th><th scope="col">Lowest</th></tr></thead>
          <tbody>{placements.lines.map((line) => <tr key={`${line.course}-${line.year}`}>
            <th scope="row">{line.course}</th>
            <td data-label="Year">{line.year}</td>
            <td data-label="Highest">{line.highest ? <strong>{packageValue(line.highest)}</strong> : '—'}</td>
            <td data-label="Average">{line.average ? packageValue(line.average) : '—'}</td>
            <td data-label="Lowest">{line.lowest ? packageValue(line.lowest) : '—'}</td>
          </tr>)}</tbody>
        </table></div>}
      </>}
      {recruiterNames.length > 0 && <><h3>Top Recruiters</h3><ul className="cp-recruiters">{recruiterNames.slice(0, 50).map((recruiter) => <li key={recruiter}>{recruiter}</li>)}{recruiterNames.length > 50 ? <li className="is-more">and {recruiterNames.length - 50} more</li> : null}</ul></>}
      {hasPlacementData && <p className="cp-footnote"><strong>Placement data disclaimer:</strong> Package units, currency and placement percentages are not fully specified in the source. Treat these figures as indicative and verify the latest official placement report.</p>}
    </section>}

    {profile.reviewSummary.count > 0 && <section id="reviews" className="cp-card">
      <SectionHeading icon={Star} subtitle="Aggregate ratings from verified student reviews">Student Reviews and Ratings</SectionHeading>
      <h3>Overall Student Ratings</h3>
      <div className="cp-review-summary">
        <div className="cp-score">
          {rating ? <><strong>{rating.toFixed(1)}</strong><Stars value={rating} /></> : null}
          <span>Total student reviews: {profile.reviewSummary.count}</span>
        </div>
        <RatingChart breakdown={profile.reviewSummary.ratingBreakdown} />
      </div>
      {!ratingRows.length && <p className="muted">Ratings are not available for these reviews yet.</p>}
      <RatingDimensionChart summary={profile.reviewSummary} />
    </section>}

    {profile.faculty.length > 0 && <section id="faculty" className="cp-card">
      <SectionHeading icon={Users} subtitle={`${plural(profile.faculty.length, 'faculty member')} on record`}>Faculty and Departments</SectionHeading>
      <h3>Key Faculty Members</h3>
      <div className="cp-people">{profile.faculty.slice(0, PROGRAMMES_VISIBLE).map(renderMember)}</div>
      {profile.faculty.length > PROGRAMMES_VISIBLE && <details className="profile-more cp-more"><summary>Show all {profile.faculty.length} faculty members<ChevronDown size={16} aria-hidden="true" /></summary><div className="cp-people">{profile.faculty.slice(PROGRAMMES_VISIBLE).map((member, index) => renderMember(member, index + PROGRAMMES_VISIBLE))}</div></details>}
    </section>}

    {rankings.rows.length > 0 && <section id="rankings" className="cp-card">
      <SectionHeading icon={Trophy} subtitle={`${plural(rankings.rows.length, 'ranking record')} from ${rankings.groups.map((group) => group.label).join(', ')}`}>Rankings and Recognition</SectionHeading>
      {rankings.groups.map((group) => <div key={group.label} className="cp-rank-group"><h3>{group.label} Rankings</h3><div className="cp-rank-grid">{group.rows.slice(0, 12).map((row) => <div className="cp-rank" key={`${row.year}-${row.rank}-${row.course}`}>
        <span className="cp-rank-num"><small>#</small>{row.rank}</span>
        <div><strong>{row.course || 'Overall'}</strong><span>{group.label}{row.year ? ` ${row.year}` : ''}{row.outOf ? ` · out of ${row.outOf}` : ''}</span></div>
      </div>)}</div></div>)}
    </section>}

    {profile.comparisonGuides.length > 0 && <section id="compare" className="cp-card">
      <SectionHeading icon={ArrowLeftRight} subtitle="Side-by-side guides on fees, branches and placements">Compare {name}</SectionHeading>
      <div className="cp-compare-grid">{profile.comparisonGuides.map((guide) => <Link className="cp-compare-card" href={`/articles/${guide.slug}`} key={guide.slug}>
        <span className="cp-compare-icon"><ArrowLeftRight size={16} aria-hidden="true" /></span>
        <div><h3>{stripSiteSuffix(text(guide.title, guide.h1 || 'College comparison guide'))}</h3><p>{guide.other_college_name ? `Compare ${name} with ${guide.other_college_name}` : 'Read the published comparison guide'}</p></div>
        <ArrowUpRight className="cp-compare-arrow" size={18} aria-hidden="true" />
      </Link>)}</div>
    </section>}

    {faqs.length > 0 && <section id="faq" className="cp-card">
      <SectionHeading icon={HelpCircle} subtitle={`Quick answers about ${name}`}>Frequently asked questions</SectionHeading>
      <div className="cp-faq">{faqs.map((faq, index) => <details className="cp-faq-item" key={faq.question} open={index === 0}><summary><h3>{faq.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
    </section>}
    <AdSlot slotKey="college_end" thin={adThin} />
    <div className="cp-data-note"><ShieldCheck size={18} aria-hidden="true" /><p><strong>Data note:</strong> Fees, placements, rankings and reviews are recorded evidence and may change by batch, category, role, recruiter mix or academic year. Verify the latest official information before applying.</p></div>
  </div></main>;
}
