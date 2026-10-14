import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from './JsonLd';
import CollegeFinder, { type AnyFinderCombo } from './CollegeFinder';
import { getCourseFacets, courseListingHref, type CourseFacet } from '../lib/listings';
import { breadcrumbJsonLd, faqJsonLd, siteUrl } from '../lib/cutoffs';
import { facetForCombo, getPercentileCombos, parsePercentileSegment, percentileHref } from '../lib/percentile';
import {
  CLOSING_PARAMS, facetForClosing, fmtRank, getClosingCombos, getClosingFinder, parseRankSegment, rankHref,
  type ClosingCollege, type ClosingCombo, type ClosingKind, type ClosingResult
} from '../lib/closing';

type Query = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';
const QUOTA: Record<string, string> = { AI: 'All India', OS: 'Other State', HS: 'Home State', STATE: 'State', HU: 'Home University', OHU: 'Other than Home University', GO: 'Goa', JK: 'J&K', LA: 'Ladakh' };
const SHOW_PROGRAMMES = 8;

/** All course + exam finder combos (qualifying percentiles, closing ranks, closing percentiles) that map onto a course listing. */
export async function allFinderCombos(): Promise<{ combos: AnyFinderCombo[]; facets: CourseFacet[] }> {
  const [facets, q, c] = await Promise.all([getCourseFacets(), getPercentileCombos(), getClosingCombos()]);
  const out: AnyFinderCombo[] = [];
  q.forEach((combo) => {
    const f = facetForCombo(combo, facets.data);
    if (!f) return;
    const id = `${f.key}|${combo.exam_slug}|qualifying`;
    out.push({ id, mode: 'qualifying', courseKey: f.key, courseLabel: f.label, courseId: combo.course_id, exam: combo.exam_slug, examName: combo.exam_name,
      year: combo.years[0].year, examYear: combo.years[0].exam_year, levels: [95, 90, 80], quotas: [], hasHomeState: false,
      qualifying: { id, courseKey: f.key, courseLabel: f.label, courseId: combo.course_id, exam: combo.exam_slug, examName: combo.exam_name, years: combo.years } });
  });
  c.forEach((combo) => {
    const f = facetForClosing(combo, facets.data);
    if (!f) return;
    out.push({ id: `${f.key}|${combo.exam_slug}|${combo.kind}`, mode: combo.kind, courseKey: f.key, courseLabel: f.label, courseId: combo.course_id, exam: combo.exam_slug,
      examName: combo.exam_name, year: combo.year, examYear: combo.exam_year, levels: combo.levels,
      quotas: combo.quotas.map((code) => ({ code, label: QUOTA[code] || code })), hasHomeState: combo.hasHomeState });
  });
  return { combos: out, facets: facets.data };
}

/** Finder props for an exam cutoff page: preselects the first combo of that exam (qualifying, then rank, then percentile). */
export async function finderPropsForExam(examSlug: string, courseKey?: string) {
  const { combos } = await allFinderCombos();
  const order = { qualifying: 0, rank: 1, percentile: 2 } as const;
  const initial = combos.filter((c) => c.exam === examSlug && (!courseKey || c.courseKey === courseKey)).sort((a, b) => order[a.mode] - order[b.mode])[0];
  return initial ? { combos, initialId: initial.id } : null;
}

async function resolve(segment: string, kind: ClosingKind) {
  const parsed = kind === 'rank' ? parseRankSegment(segment) : parsePercentileSegment(segment);
  if (!parsed) return null;
  const [facets, combos] = await Promise.all([getCourseFacets(), getClosingCombos()]);
  const facet = facets.data.find((f) => f.key === parsed.courseKey);
  const combo = facet && combos.find((c) => c.kind === kind && c.exam_slug === parsed.exam && facetForClosing(c, facets.data)?.key === facet.key);
  if (!facet || !combo || !combo.levels.includes(parsed.level)) return null;
  return { ...parsed, facet, combo };
}
const hasQuery = (q: Query) => CLOSING_PARAMS.some((k) => one(q[k]) !== '');
const levelText = (kind: ClosingKind, n: number) => (kind === 'rank' ? `${fmtRank(n)} Rank` : `${n} Percentile`);
const hrefFor = (combo: ClosingCombo, key: string, n: number) => (combo.kind === 'rank' ? rankHref(key, n, combo.exam_slug) : percentileHref(key, n, combo.exam_slug));
const titleFor = (label: string, kind: ClosingKind, n: number, exam: string, year: number) =>
  `${label} Colleges Accepting ${levelText(kind, n)} in ${exam} ${year}: Branch-wise Closing ${kind === 'rank' ? 'Ranks' : 'Percentiles'}`;
const quotaText = (combo: ClosingCombo) => combo.defaultQuotas.map((q) => QUOTA[q] || q).join(' / ') || 'all';

export async function closingMetadata(segment: string, query: Query, kind: ClosingKind): Promise<Metadata | null> {
  const r = await resolve(segment, kind);
  if (!r) return null;
  const res = await getClosingFinder(new URLSearchParams({ course: String(r.combo.course_id), exam: r.exam, kind, value: String(r.level) }));
  const n = res?.matched.length || 0;
  const title = titleFor(r.facet.label, kind, r.level, r.combo.exam_name, r.combo.year);
  const description = `${n} ${r.facet.label.toLowerCase()} college${n === 1 ? '' : 's'} had a ${r.combo.year} final-round closing ${kind} ${kind === 'rank' ? `of ${fmtRank(r.level)} or higher` : `of ${r.level} or lower`} in ${r.combo.exam_name} (General, gender-neutral, ${quotaText(r.combo)} quota). See branch-wise closing ${kind}s and check your own ${kind}.`;
  const path = hrefFor(r.combo, r.facet.key, r.level);
  return { title, description, alternates: { canonical: path }, robots: hasQuery(query) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: 'website', title, description, url: `${siteUrl()}${path}`, siteName: 'College Decision' }, twitter: { card: 'summary', title, description } };
}

function fmtVal(kind: ClosingKind, v: number) { return kind === 'rank' ? fmtRank(v) : String(v); }
function CollegeTable({ list, kind, showGap }: { list: ClosingCollege[]; kind: ClosingKind; showGap?: boolean }) {
  return <div className="detail-table-wrap"><table className="detail-table cutoff-table">
    <thead><tr><th scope="col">College</th><th scope="col">Branches within reach (closing {kind}{showGap ? ' · your margin' : ''})</th><th scope="col">Quota</th></tr></thead>
    <tbody>{list.map((c) => {
      const shown = c.programmes.slice(0, SHOW_PROGRAMMES);
      const quotas = Array.from(new Set(c.programmes.map((p) => QUOTA[p.quota || ''] || p.quota || '—')));
      return <tr key={c.institute_id}>
        <th scope="row"><Link href={`/colleges/${c.slug}/cutoff`}>{c.name}</Link>{c.city ? <small className="muted"> · {c.city}{c.state ? `, ${c.state}` : ''}</small> : null}</th>
        <td><ul className="cutoff-branch-list">{shown.map((p, i) => <li key={`${p.program_name}-${p.quota}-${p.gender_pool}-${i}`}>{p.program_name}: <strong>{fmtVal(kind, p.closing)}</strong>
          {p.gender_pool === 'FEMALE_ONLY' ? <small className="muted"> (female-only)</small> : null}{showGap && p.gap !== null ? <small className={p.gap >= 0 ? 'finder-gap-pos' : 'finder-gap-neg'}> {p.gap >= 0 ? '+' : ''}{kind === 'rank' ? fmtRank(p.gap) : p.gap}</small> : null}</li>)}
          {c.programmes.length > SHOW_PROGRAMMES && <li className="muted">+{c.programmes.length - SHOW_PROGRAMMES} more · <Link href={`/colleges/${c.slug}/cutoff`}>all branches</Link></li>}</ul></td>
        <td>{quotas.join(', ')}</td>
      </tr>;
    })}</tbody></table></div>;
}

export default async function ClosingCollegesPage({ segment, query, kind }: { segment: string; query: Query; kind: ClosingKind }) {
  const r = await resolve(segment, kind);
  if (!r) notFound();
  const { facet, combo, level } = r;
  const label = facet.label;
  const exam = combo.exam_name;
  const path = hrefFor(combo, facet.key, level);
  const clean = await getClosingFinder(new URLSearchParams({ course: String(combo.course_id), exam: r.exam, kind, value: String(level) }));
  if (!clean) notFound();
  const searching = hasQuery(query);
  let personal: ClosingResult | null = null;
  if (searching) {
    const p = new URLSearchParams({ course: String(combo.course_id), exam: r.exam, kind });
    p.set('value', one(query[kind === 'rank' ? 'rank' : 'percentile']) || String(level));
    (['category', 'quota', 'homeState', 'gender', 'branch'] as const).forEach((k) => { const v = one(query[k]).slice(0, 80); if (v) p.set(k, v); });
    personal = await getClosingFinder(p);
  }
  const list = clean.matched;
  const year = combo.year;
  const cond = kind === 'rank' ? `closing rank of ${fmtRank(level)} or higher` : `closing percentile of ${level} or lower`;
  const progCount = list.reduce((n, c) => n + c.programmes.length, 0);
  const faqs: Array<{ question: string; answer: string }> = [];
  faqs.push({ question: `Which ${label.toLowerCase()} colleges can I get with ${levelText(kind, level).toLowerCase()} in ${exam}?`, answer: list.length
    ? `In ${year}, ${list.length} listed college${list.length === 1 ? '' : 's'} (${progCount} branch options) had a final-round ${cond} for General, gender-neutral seats under the ${quotaText(combo)} quota, for example ${list.slice(0, 4).map((c) => `${c.name} (${c.programmes[0].program_name}: ${fmtVal(kind, c.programmes[0].closing)})`).join('; ')}.`
    : `No listed college had a ${year} final-round ${cond} for General, gender-neutral seats under the ${quotaText(combo)} quota.` });
  faqs.push({ question: `Is a ${year} closing ${kind} a guarantee of admission?`, answer: `No. Closing ${kind}s are the last ${kind}s admitted in the final ${year} round and change every year with seat matrix, applicants and category. Use them as a guide, and check the official counselling schedule and seat matrix.` });
  if (combo.hasHomeState) faqs.push({ question: `How does home state quota change the ${exam} cutoff?`, answer: `This page uses All India and Other State quota seats. Colleges in your home state also have Home State quota seats with different closing ranks; enter your home state in the College Finder above to include them.` });
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name: `${label} Colleges`, path: courseListingHref(facet.key) }, { name: `Accepting ${levelText(kind, level)} in ${exam}`, path }];
  const faqLd = faqJsonLd(faqs);
  const { combos } = await allFinderCombos();
  const a = personal?.applied;
  const sortedLevels = [...combo.levels].sort((x, y) => (kind === 'rank' ? x - y : y - x));

  return <main className="section college-profile-page"><div className="wrap prose">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && !searching && <JsonLd data={faqLd} />}
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><Link href={courseListingHref(facet.key)}>{label} Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">Accepting {levelText(kind, level)} in {exam}</span></nav>
    <header className="college-profile-header"><div>
      <p className="eyebrow">{exam} {kind === 'rank' ? 'RANK' : 'PERCENTILE'}</p>
      <h1>{label} Colleges Accepting {levelText(kind, level)} in {exam} {year}</h1>
      <p>{list.length
        ? `${list.length} ${label.toLowerCase()} college${list.length === 1 ? '' : 's'} had at least one branch with a ${year} final-round ${cond} in ${exam}, so a candidate with ${kind === 'rank' ? `rank ${fmtRank(level)}` : `${level} percentile`} would have been within reach of ${progCount} branch option${progCount === 1 ? '' : 's'}.`
        : `No listed college had a ${year} final-round ${cond} in ${exam}.`}</p>
      <p className="muted"><strong>Basis:</strong> {year} final counselling round, General (Open) category, gender-neutral seats, {quotaText(combo)} quota{combo.exam_slug === 'jee-main' ? ', B.E./B.Tech programmes (Paper 1)' : ''}. Closing {kind}s vary by category, quota, seat pool and year and are not a guarantee of admission.</p>
      <div className="cutoff-year-links" role="navigation" aria-label={`${exam} ${kind} levels`}>
        {sortedLevels.map((l) => <Link key={l} className={`button${l === level ? ' primary' : ''}`} aria-current={l === level ? 'page' : undefined} href={hrefFor(combo, facet.key, l)}>Accepting {levelText(kind, l)}</Link>)}
        <Link className="button" href={`/exams/${r.exam}/cutoff`}>{exam} cutoff for all colleges</Link>
      </div>
    </div></header>

    <CollegeFinder combos={combos} initialId={`${facet.key}|${r.exam}|${kind}`} initialFacets={clean.facets} resetHref={path}
      initialValues={searching ? { value: one(query[kind === 'rank' ? 'rank' : 'percentile']), category: one(query.category) || 'OPEN', quota: one(query.quota), homeState: one(query.homeState), gender: one(query.gender) || 'GENDER_NEUTRAL', branch: one(query.branch) } : undefined} />

    {searching && personal && a && <section className="cutoff-section" aria-live="polite">
      <h2>Your results</h2>
      <p className="finder-summary">{exam} {year} · {kind === 'rank' ? `rank ${fmtRank(a.value || level)}` : `${a.value} percentile`} · {personal.facets.categories.find((c) => c.code === a.category)?.label || a.category}
        {a.homeState ? ` · home state ${a.homeState}` : a.quota ? ` · ${QUOTA[a.quota] || a.quota} quota` : ` · ${quotaText(combo)} quota`} · {a.gender === 'FEMALE_ONLY' ? 'female (gender-neutral + female-only seats)' : 'gender-neutral seats'}{a.branch ? ` · branch “${a.branch}”` : ''}</p>
      <h3>Within reach ({personal.matched.length} colleges)</h3>
      {personal.matched.length ? <CollegeTable list={personal.matched} kind={kind} showGap /> : <p>No listed branch had a closing {kind} within reach for these inputs.</p>}
      <h3>Near misses ({personal.nearMiss.length} colleges)</h3>
      <p className="muted">Branches where your {kind} was just outside the {year} closing {kind} (within {personal.nearWindow}).</p>
      {personal.nearMiss.length ? <CollegeTable list={personal.nearMiss} kind={kind} showGap /> : <p>No near misses.</p>}
    </section>}

    <section className="cutoff-section">
      <h2>{searching ? `All colleges accepting ${levelText(kind, level).toLowerCase()} (General, gender-neutral)` : `${exam} ${year}: colleges and branches within reach`}</h2>
      {list.length ? <CollegeTable list={list} kind={kind} /> : <p>No college is listed at this level. Try another level above.</p>}
      <p className="muted">Branches are sorted from most to least competitive. Colleges without {exam} {year} final-round data are not listed.</p>
    </section>
    {!searching && <section className="cutoff-section"><h2>FAQs</h2>
      {faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>}
  </div></main>;
}
