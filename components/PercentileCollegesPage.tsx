import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from './JsonLd';
import ClosingCollegesPage, { allFinderCombos, finderPropsForExam } from './ClosingCollegesPage';
import CollegeFinder from './CollegeFinder';
import CollegeFinderForm, { type FinderCombo } from './CollegeFinderForm';
import { getCourseFacets, courseListingHref, type CourseFacet } from '../lib/listings';
import { breadcrumbJsonLd, faqJsonLd, siteUrl } from '../lib/cutoffs';
import {
  CATEGORY_OPTIONS, FINDER_PARAMS, PERCENTILE_LEVELS, facetForCombo, getFinder, getPercentileCombos, parsePercentileSegment, percentileHref,
  type FinderCollege, type FinderResult, type PercentileCombo, type Requirement
} from '../lib/percentile';

type Query = Record<string, string | string[] | undefined>;
const NA = 'Not available';
const CAT_LABEL = Object.fromEntries(CATEGORY_OPTIONS) as Record<string, string>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';
const fmt = (n: number | null | undefined) => (n === null || n === undefined ? NA : String(Number(n)));
const pwdReq = (c: FinderCollege): Requirement | undefined => c.requirements.PWD || c.requirements.OPEN_PWD;
const sectional = (r?: Requirement) => (!r || (r.varc === null && r.dilr === null && r.qa === null) ? 'Not published'
  : r.varc === r.dilr && r.dilr === r.qa ? `${fmt(r.varc)} each` : `VARC ${fmt(r.varc)} · DILR ${fmt(r.dilr)} · QA ${fmt(r.qa)}`);
const rupees = (n: number) => `₹${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh`;

/** Combos that map onto a course listing (/{key}-colleges), for the finder dropdowns. */
export function finderCombos(combos: PercentileCombo[], facets: CourseFacet[]): FinderCombo[] {
  return combos.flatMap((c) => {
    const f = facetForCombo(c, facets);
    return f ? [{ id: `${f.key}|${c.exam_slug}`, courseKey: f.key, courseLabel: f.label, courseId: c.course_id, exam: c.exam_slug, examName: c.exam_name, years: c.years }] : [];
  });
}

async function resolve(segment: string) {
  const parsed = parsePercentileSegment(segment);
  if (!parsed || !(PERCENTILE_LEVELS as readonly number[]).includes(parsed.level)) return null;
  const [facets, combos] = await Promise.all([getCourseFacets(), getPercentileCombos()]);
  const facet = facets.data.find((f) => f.key === parsed.courseKey);
  const combo = facet && combos.find((c) => c.exam_slug === parsed.exam && facetForCombo(c, facets.data)?.key === facet.key);
  if (!facet || !combo) return null;
  return { ...parsed, facet, combo, combos, facets: facets.data };
}
const hasQuery = (q: Query) => FINDER_PARAMS.some((k) => one(q[k]) !== '');

function titleFor(label: string, level: number, examName: string, year: number) {
  return `${label} Colleges Accepting ${level} Percentile in ${examName} ${year}: Category-wise Minimum Cutoffs`;
}

export async function percentileMetadata(segment: string, query: Query): Promise<Metadata | null> {
  if (!parsePercentileSegment(segment)) return null;
  const r = await resolve(segment);
  if (!r) return null;
  const year = r.combo.years[0].year;
  const clean = await getFinder(new URLSearchParams({ course: String(r.combo.course_id), exam: r.exam, percentile: String(r.level) }));
  const n = clean?.matched.length || 0;
  const title = titleFor(r.facet.label, r.level, r.combo.exam_name, year);
  const description = n
    ? `${n} ${r.facet.label} college${n === 1 ? '' : 's'} list a General-category minimum ${r.combo.exam_name} percentile of ${r.level} or less for ${year} admissions. See category-wise and sectional minimums with sources, and check your own percentile.`
    : `No listed ${r.facet.label} college has a General-category minimum ${r.combo.exam_name} percentile of ${r.level} or less for ${year}. Check other percentile levels and the college finder.`;
  const path = percentileHref(r.facet.key, r.level, r.exam);
  return {
    title, description, alternates: { canonical: path },
    robots: hasQuery(query) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: 'website', title, description, url: `${siteUrl()}${path}`, siteName: 'College Decision' }, twitter: { card: 'summary', title, description }
  };
}

function CollegeLink({ c }: { c: FinderCollege }) {
  return <><Link href={`/colleges/${c.slug}/cutoff`}>{c.name}</Link>{c.city ? <small className="muted"> · {c.city}{c.state ? `, ${c.state}` : ''}</small> : null}</>;
}
function Source({ c }: { c: FinderCollege }) {
  return c.source_url ? <a href={c.source_url} target="_blank" rel="noopener nofollow">{c.aggregator ? 'Aggregator*' : 'Official'}</a> : <>—</>;
}

function CleanTable({ list }: { list: FinderCollege[] }) {
  return <div className="detail-table-wrap"><table className="detail-table cutoff-table">
    <thead><tr><th scope="col">College</th><th scope="col">General</th><th scope="col">General sectional</th><th scope="col">EWS</th><th scope="col">NC-OBC</th><th scope="col">SC</th><th scope="col">ST</th><th scope="col">PwD</th><th scope="col">Source</th></tr></thead>
    <tbody>{list.map((c) => <tr key={c.institute_id}>
      <th scope="row"><CollegeLink c={c} /></th>
      <td><strong>{fmt(c.requirements.OPEN?.overall)}</strong></td><td>{sectional(c.requirements.OPEN)}</td>
      {['EWS', 'OBC_NCL', 'SC', 'ST'].map((k) => <td key={k}>{fmt(c.requirements[k]?.overall)}</td>)}
      <td>{fmt(pwdReq(c)?.overall)}</td><td><Source c={c} /></td>
    </tr>)}</tbody></table></div>;
}

function gapText(g: number | null | undefined) {
  if (g === null || g === undefined) return '—';
  return g >= 0 ? `+${g}` : `${g}`;
}
function ResultTable({ list, category }: { list: FinderCollege[]; category: string }) {
  return <div className="detail-table-wrap"><table className="detail-table cutoff-table">
    <thead><tr><th scope="col">College</th><th scope="col">{CAT_LABEL[category] || category} overall minimum</th><th scope="col">Your gap</th><th scope="col">Sectional minimum</th><th scope="col">Sectional gap (VARC / DILR / QA)</th><th scope="col">Fee</th><th scope="col">Source</th></tr></thead>
    <tbody>{list.map((c) => <tr key={c.institute_id}>
      <th scope="row"><CollegeLink c={c} /></th>
      <td><strong>{fmt(c.requirement.overall)}</strong></td>
      <td className={c.fails.includes('overall') ? 'finder-gap-neg' : 'finder-gap-pos'}>{gapText(c.gaps.overall)}</td>
      <td>{sectional(c.requirement)}</td>
      <td>{(['varc', 'dilr', 'qa'] as const).map((s) => gapText(c.gaps[s])).join(' / ')}</td>
      <td>{c.fee ? rupees(c.fee) : NA}</td><td><Source c={c} /></td>
    </tr>)}</tbody></table></div>;
}

export default async function PercentileCollegesPage({ segment, query }: { segment: string; query: Query }) {
  const r = await resolve(segment);
  // Not a qualifying-percentile combo (e.g. MHT CET closing percentiles): closing-cutoff page handles it or 404s.
  if (!r) return <ClosingCollegesPage segment={segment} query={query} kind="percentile" />;
  const { facet, combo, level } = r;
  const label = facet.label;
  const exam = combo.exam_name;
  const path = percentileHref(facet.key, level, r.exam);
  const cleanParams = new URLSearchParams({ course: String(combo.course_id), exam: r.exam, percentile: String(level) });
  const clean = await getFinder(cleanParams);
  if (!clean) notFound();
  const year = clean.year;
  const searching = hasQuery(query);
  let personal: FinderResult | null = null;
  if (searching) {
    const p = new URLSearchParams({ course: String(combo.course_id), exam: r.exam });
    FINDER_PARAMS.forEach((k) => { const v = one(query[k]).slice(0, 80); if (v) p.set(k, v); });
    if (!p.get('percentile')) p.set('percentile', String(level));
    personal = await getFinder(p);
  }
  const list = clean.matched;
  const all = [...clean.matched, ...clean.nearMiss];
  const examYearNote = clean.examYear !== year ? ` ${exam} ${year} cutoffs are for ${year}–${String(year + 2).slice(-2)} admissions and are based on ${exam} ${clean.examYear} exam scores.` : '';
  const generals = list.map((c) => c.requirements.OPEN?.overall).filter((v): v is number => v !== null && v !== undefined);
  const faqs: Array<{ question: string; answer: string }> = [];
  faqs.push({ question: `Which ${label} colleges accept ${level} percentile in ${exam} ${year}?`, answer: list.length
    ? `${list.length} listed college${list.length === 1 ? '' : 's'} publish a General-category minimum ${exam} percentile of ${level} or less: ${list.map((c) => `${c.name} (${fmt(c.requirements.OPEN?.overall)})`).join(', ')}.`
    : `None of the ${clean.totalWithData} colleges with published ${exam} ${year} minimums has a General-category overall minimum of ${level} or less.` });
  if (generals.length) faqs.push({ question: `Does meeting the minimum percentile guarantee an interview call?`, answer: `No. These are minimum shortlisting criteria (General-category minimums on this page range from ${Math.min(...generals)} to ${Math.max(...generals)}). Actual interview-call and final admission cutoffs are usually higher and also depend on academics, work experience, diversity factors and interviews.` });
  const higher = clean.nearMiss.length + (clean.totalWithData - clean.noRequirement - list.length - clean.nearMiss.length);
  if (higher > 0) faqs.push({ question: `Which colleges need more than ${level} percentile?`, answer: `${higher} listed college${higher === 1 ? '' : 's'} publish a General-category minimum above ${level}, for example ${all.filter((c) => !list.includes(c)).slice(0, 3).map((c) => `${c.name} (${fmt(c.requirements.OPEN?.overall)})`).join(', ') || 'see the higher-percentile page'}.` });
  if (examYearNote) faqs.push({ question: `Why is it called the ${exam} ${year} cutoff?`, answer: examYearNote.trim() });
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name: `${label} Colleges`, path: courseListingHref(facet.key) }, { name: `Accepting ${level} Percentile in ${exam}`, path }];
  const faqLd = faqJsonLd(faqs);
  const { combos: combosForForm } = await allFinderCombos();
  const a = personal?.applied;

  return <main className="section college-profile-page"><div className="wrap prose">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && !searching && <JsonLd data={faqLd} />}
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/colleges">Colleges</Link><span aria-hidden="true">›</span><Link href={courseListingHref(facet.key)}>{label} Colleges</Link><span aria-hidden="true">›</span><span aria-current="page">Accepting {level} Percentile in {exam}</span></nav>
    <header className="college-profile-header"><div>
      <p className="eyebrow">{exam} PERCENTILE</p>
      <h1>{label} Colleges Accepting {level} Percentile in {exam} {year}</h1>
      <p>{list.length
        ? `${list.length} ${label} college${list.length === 1 ? '' : 's'} publish a General-category minimum overall ${exam} percentile of ${level} or less for ${year} admissions, so a General-category candidate with ${level} percentile meets their minimum requirement.`
        : `None of the ${clean.totalWithData} ${label} colleges with published ${exam} ${year} minimums has a General-category overall minimum of ${level} percentile or less.`}{examYearNote}</p>
      <p className="muted"><strong>Important:</strong> these are minimum shortlisting criteria published by each institute, not guaranteed admission or final interview-call cutoffs. Many colleges also apply sectional minimums and later rank candidates on academics, work experience, diversity and interviews.</p>
      <div className="cutoff-year-links" role="navigation" aria-label={`${exam} percentile levels`}>
        {PERCENTILE_LEVELS.map((l) => <Link key={l} className={`button${l === level ? ' primary' : ''}`} aria-current={l === level ? 'page' : undefined} href={percentileHref(facet.key, l, r.exam)}>Accepting {l} Percentile</Link>)}
        <Link className="button" href={`/exams/${r.exam}/cutoff`}>{exam} cutoff for all colleges</Link>
      </div>
    </div></header>

    {combosForForm.length > 0 && <CollegeFinder combos={combosForForm} initialId={`${facet.key}|${r.exam}|qualifying`} initialFacets={clean.facets} resetHref={path}
      initialValues={searching ? { percentile: one(query.percentile), category: one(query.category) || 'OPEN', varc: one(query.varc), dilr: one(query.dilr), qa: one(query.qa), state: one(query.state), city: one(query.city), programme: one(query.programme), budget: one(query.budget), year: one(query.year) } : undefined} />}

    {searching && personal && a && <section className="cutoff-section" aria-live="polite">
      <h2>Your results</h2>
      <p className="finder-summary">{exam} {personal.year} · {a.percentile} overall percentile · {CAT_LABEL[a.category] || a.category}
        {a.varc !== null ? ` · VARC ${a.varc}` : ''}{a.dilr !== null ? ` · DILR ${a.dilr}` : ''}{a.qa !== null ? ` · QA ${a.qa}` : ''}
        {a.city ? ` · ${a.city}` : a.state ? ` · ${a.state}` : ' · Any location'}{a.programme ? ` · ${a.programme}` : ''}{a.budget ? ` · fee up to ${rupees(a.budget)}` : ''}</p>
      <h3>Colleges whose minimum you meet ({personal.matched.length})</h3>
      {personal.matched.length ? <ResultTable list={personal.matched} category={a.category} /> : <p>No listed college&apos;s published minimum is met with these inputs.</p>}
      <h3>Near misses ({personal.nearMiss.length})</h3>
      <p className="muted">Colleges where your overall percentile is up to {personal.nearMissWindow} below the minimum, or where only a sectional minimum is not met.</p>
      {personal.nearMiss.length ? <ResultTable list={personal.nearMiss} category={a.category} /> : <p>No near misses.</p>}
      {personal.noRequirement > 0 && <p className="muted">{personal.noRequirement} college(s) in scope publish no overall minimum for this category and are not shown.</p>}
      {a.budget && <p className="muted">Fee filter uses the lowest listed total fee for each college&apos;s full-time programmes; colleges without a listed fee are not excluded.</p>}
    </section>}

    <section className="cutoff-section">
      <h2>{searching ? `All ${label} colleges accepting ${level} percentile (General category)` : `${exam} ${year} minimum percentiles by category`}</h2>
      {list.length ? <CleanTable list={list} /> : <p>No college is listed at this level. Try <Link href={percentileHref(facet.key, PERCENTILE_LEVELS.find((l) => l > level) || 95, r.exam)}>a higher percentile level</Link> or see the <Link href={`/exams/${r.exam}/cutoff`}>{exam} cutoff for all colleges</Link>.</p>}
      <p className="muted">Values are minimum overall percentiles; &ldquo;Not available&rdquo; means the institute does not publish a figure for that category. * Aggregator: the official document could not be retrieved, so the figure comes from a secondary source. Colleges without published {exam} minimums are not listed.</p>
    </section>

    {!searching && <section className="cutoff-section"><h2>FAQs</h2>
      {faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>}
  </div></main>;
}

/** Finder props for an exam cutoff page (e.g. /exams/cat/cutoff → MBA + CAT preselected), or null when the exam has no finder data. */
export async function examFinderProps(examSlug: string) {
  return finderPropsForExam(examSlug);
}
