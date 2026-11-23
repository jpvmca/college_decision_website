import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, ChevronDown, MapPin, Target } from 'lucide-react';
import JsonLd from '../../../../components/JsonLd';
import { Fragment } from 'react';
import CollegeCutoffYearTables from '../../../../components/CollegeCutoffYearTables';
import AdSlot from '../../../../components/ads/AdSlot';
import { instituteLogoUrl } from '../../../../lib/api';
import { staticImageUrl } from '../../../../lib/image';
import {
  breadcrumbJsonLd, cutoffYearHeading, examYearOf, faqJsonLd, formatMetric, examYearNote,
  getCollegeCutoffSummary, getCollegeYearRows, metricWord, siteUrl, fitDescription,
  type CollegeCutoffSummary
} from '../../../../lib/cutoffs';
import {
  buildHowToRead, buildIntroParagraphs, buildLead, clean, coverageRows,
  extraFaqs, hasRealMetric, locationOf, trendTable, uniqueSources, type LoadedSection
} from '../../../../lib/college-cutoff-copy';

export const revalidate = 900;

// ISR: render each path on first visit, then serve cached HTML (time-based + on-demand revalidation).
export async function generateStaticParams() {
  return [];
}

const CAT_LABEL: Record<string, string> = { OPEN: 'General', EWS: 'EWS', OBC_NCL: 'OBC-NCL', SC: 'SC', ST: 'ST', PWD: 'PwD' };

type Loaded = CollegeCutoffSummary & { institute: NonNullable<CollegeCutoffSummary['institute']> };

async function load(slug: string): Promise<Loaded | null> {
  const summary = await getCollegeCutoffSummary(slug);
  if (!summary?.institute) return null;
  return { ...summary, institute: summary.institute };
}

async function loadSections(slug: string, s: Loaded): Promise<LoadedSection[]> {
  const sections = (await Promise.all(s.exams.flatMap((e) => e.years.map(async (y) => {
    const data = await getCollegeYearRows(slug, e.slug, y.year);
    return { exam: e, y, data: data ? { round: data.round, rows: data.rows.filter(hasRealMetric) } : null };
  }))))
    .filter((x): x is LoadedSection => Boolean(x.data && x.data.rows.length));
  return sections;
}

function titleFor(s: Loaded) {
  const years = s.exams.flatMap((e) => e.years.map((y) => examYearOf(y)));
  const latest = years.length ? Math.max(...years) : new Date().getFullYear();
  const first = s.exams[0];
  const examNames = s.exams.slice(0, 2).map((e) => clean(e.name)).join(' & ');
  const metrics = new Set(s.exams.slice(0, 2).map((e) => e.metric));
  const tail = !first ? 'Cutoffs' : metrics.size > 1 ? 'Cutoffs by Branch & Category' : first.metric === 'rank' ? 'Closing Ranks by Branch & Category' : `${metricWord(first.metric)}s by Category`;
  return { latest, title: `${clean(s.institute.name)} Cutoff ${latest}: ${examNames} ${tail}`.replace(/\s+/g, ' ').trim() };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) return { title: 'Cutoff not found', robots: { index: false, follow: false } };
  const sections = await loadSections(slug, s);
  const name = clean(s.institute.name);
  if (!sections.length) {
    return {
      title: `${name} cutoff: no published data yet`,
      description: fitDescription(`CollegeDecision does not currently list official cutoff ranks or scores for ${name}. See the college profile for courses and admissions.`),
      alternates: { canonical: `/colleges/${slug}` },
      robots: { index: false, follow: true }
    };
  }
  const { title } = titleFor(s);
  const yearBit = s.exams.map((e) => `${clean(e.name)} (${e.years.map((y) => (y.exam_year && y.exam_year !== y.year ? y.exam_year : y.year)).join(', ')})`).join('; ');
  const metricBit = s.exams.some((e) => e.metric === 'rank') ? 'opening and closing ranks by programme, round, category and quota' : 'published minimum percentiles or scores by category';
  const description = fitDescription(`${name} cutoff for ${yearBit}: ${metricBit}, with official source links.`);
  const url = `${siteUrl()}/colleges/${slug}/cutoff`;
  const logo = s.institute.logo ? instituteLogoUrl(s.institute.logo) : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/colleges/${slug}/cutoff` },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', title, description, url, siteName: 'College Decision', ...(logo ? { images: [{ url: logo, alt: `${name} logo` }] } : {}) },
    twitter: { card: 'summary', title, description }
  };
}

function EmptyCutoffPage({ slug, name }: { slug: string; name: string }) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name, path: `/colleges/${slug}` }, { name: 'Cutoff', path: `/colleges/${slug}/cutoff` }];
  return <main className="section college-profile-page cp-page"><div className="wrap">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    <nav className="breadcrumb cp-breadcrumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><Link prefetch={false} href="/colleges">Colleges</Link><span aria-hidden="true">›</span><Link prefetch={false} href={`/colleges/${slug}`}>{name}</Link><span aria-hidden="true">›</span><span aria-current="page">Cutoff</span></nav>
    <header className="cp-hero">
      <div className="cp-hero-copy">
        <p className="cp-eyebrow">Cutoff</p>
        <h1>{name} cutoff</h1>
      </div>
      <p className="cp-hero-lead">CollegeDecision does not currently have official cutoff ranks, scores or percentiles for {name} in its database. We do not invent cutoffs. Check the college profile for courses and admissions, and the official counselling or institute website for the latest lists.</p>
      <div className="cp-hero-actions">
        <Link prefetch={false} className="button ls-btn-primary" href={`/colleges/${slug}`}><Building2 size={15} aria-hidden="true" /> View {name} overview</Link>
      </div>
    </header>
  </div></main>;
}

export default async function CollegeCutoffPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) notFound();
  const name = clean(s.institute.name);
  const sections = await loadSections(slug, s);
  if (!sections.length) return <EmptyCutoffPage slug={slug} name={name} />;

  const { title } = titleFor(s);
  const location = locationOf(s);
  const lead = buildLead(s);
  const intros = buildIntroParagraphs(s, sections);
  const howTo = buildHowToRead(s);
  const coverage = coverageRows(s);
  const sources = uniqueSources(sections);

  const faqs: Array<{ question: string; answer: string }> = [];
  for (const e of s.exams) {
    const examName = clean(e.name);
    const years = e.years.map((y) => y.year);
    faqs.push({ question: `Which years of ${examName} cutoff are available for ${name}?`, answer: `${examName} cutoffs for ${name} are listed for ${years.join(', ')}${e.years[0] && e.metric !== 'percentile' ? `; the ${e.years[0].year} list covers ${e.years[0].programmes} programme(s)${e.metric === 'rank' && e.years[0].rounds ? ` across ${e.years[0].rounds} counselling round(s)` : ''}` : ''}.` });
    const h = e.headline;
    if (h && Number(h.value) > 0) {
      const cat = CAT_LABEL[h.category] || h.category;
      if (e.metric === 'rank') {
        faqs.push({ question: `What was the ${examName} ${h.year} closing rank for ${clean(h.program_name)} at ${name}?`, answer: `In ${h.year} (round ${h.round}), the closing rank for ${clean(h.program_name)} at ${name} was ${formatMetric(h.value, 'rank')} for the ${cat} category, gender-neutral seat pool${h.quota ? `, ${h.quota} quota` : ''}.` });
      } else {
        faqs.push({ question: `What is the ${examName} ${e.years.find((y) => y.year === h.year)?.exam_year || h.year} cutoff for ${name}?`, answer: `${name} lists a minimum overall ${examName} ${e.metric === 'percentile' ? 'percentile' : 'score'} of ${Number(h.value)} for the ${cat} category${e.years[0]?.exam_year && e.years[0].exam_year !== h.year ? ` for ${h.year}–${String(h.year + 2).slice(-2)} admissions (based on ${examName} ${e.years[0].exam_year} scores)` : ''}${h.quality_flag === 'source_aggregator' ? '. This figure comes from a secondary (aggregator) source because the official document was not available' : ''}. Meeting it makes a candidate eligible for shortlisting but does not guarantee admission.` });
      }
    }
  }
  faqs.push(...extraFaqs(s, sections));
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name, path: `/colleges/${slug}` }, { name: 'Cutoff', path: `/colleges/${slug}/cutoff` }];
  const faqLd = faqJsonLd(faqs);
  const logo = s.institute.logo ? instituteLogoUrl(s.institute.logo) : null;

  return <main className="section college-profile-page cp-page"><div className="wrap">
    <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
    {faqLd && <JsonLd data={faqLd} />}
    <nav className="breadcrumb cp-breadcrumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><Link prefetch={false} href="/colleges">Colleges</Link><span aria-hidden="true">›</span><Link prefetch={false} href={`/colleges/${slug}`}>{name}</Link><span aria-hidden="true">›</span><span aria-current="page">Cutoff</span></nav>
    <AdSlot slotKey="cutoff_top" />
    <header className="cp-hero">
      <div className="cp-hero-copy">
        <p className="cp-eyebrow">Cutoff</p>
        <h1>{title}</h1>
        <div className="cp-hero-meta">
          <span><MapPin size={15} aria-hidden="true" /> {location || 'India'}</span>
          <span><Target size={15} aria-hidden="true" /> {s.exams.map((e) => clean(e.name)).join(', ')}</span>
        </div>
      </div>
      {logo ? <div className="cp-hero-logo"><img src={logo} alt={`${name} college logo`} width="112" height="112" /></div> : null}
      <p className="cp-hero-lead">{lead}</p>
      {intros.map((p, i) => <p key={i} className="cp-hero-lead">{p}</p>)}
      <div className="cp-hero-actions">
        <Link prefetch={false} className="button ls-btn-primary" href={`/colleges/${slug}`}><Building2 size={15} aria-hidden="true" /> View {name} overview</Link>
        {s.exams.filter((e) => e.published).map((e) => (
          <Link prefetch={false} key={e.slug} className="button" href={`/exams/${e.slug}/cutoff`}>{clean(e.name)} cutoff for all colleges</Link>
        ))}
      </div>
    </header>

    <section className="cutoff-section" aria-labelledby="cutoff-coverage-heading">
      <h2 id="cutoff-coverage-heading">{name} cutoff coverage</h2>
      <div className="detail-table-wrap"><table className="detail-table cutoff-table">
        <caption className="muted">Exams, years and how many programmes are listed on this page</caption>
        <thead><tr><th scope="col">Exam</th><th scope="col">Years listed</th><th scope="col">Programmes (latest year)</th><th scope="col">Metric</th><th scope="col">Source type</th></tr></thead>
        <tbody>{coverage.map((c) => <tr key={c.slug}>
          <th scope="row">{c.exam}</th>
          <td>{c.years.join(', ')}</td>
          <td>{c.programmes}</td>
          <td>{c.metric === 'rank' ? 'Rank' : c.metric === 'percentile' ? 'Percentile' : 'Score'}</td>
          <td>{c.aggregator ? 'Includes secondary-source rows' : 'Official document'}</td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section className="cutoff-section" aria-labelledby="how-to-read-cutoffs">
      <h2 id="how-to-read-cutoffs">How to read {name} cutoffs</h2>
      <figure style={{ margin: '12px 0 16px' }}>
        <img src={staticImageUrl('/images/cutoff-how-to-read.svg')} alt={`How to read opening and closing ranks on the ${name} cutoff tables`} width="960" height="280" loading="lazy" />
      </figure>
      {howTo.map((p, i) => <p key={i}>{p}</p>)}
    </section>

    {s.exams.map((exam, examIndex) => {
      const trend = trendTable(sections, exam.slug);
      return <Fragment key={exam.slug}><section id={`${exam.slug}-cutoff`} className="cutoff-section">
        <p className="muted">{clean(exam.name)} cutoff years: {exam.years.map((y) => <a key={y.year} href={`#${exam.slug}-${y.year}`} style={{ marginRight: '0.6rem' }}>{y.year}</a>)}
          {exam.published && <> · <Link prefetch={false} href={`/exams/${exam.slug}/cutoff`}>{clean(exam.name)} cutoff for all colleges</Link></>}</p>
        {trend && <div className="detail-table-wrap" style={{ marginBottom: '1.2rem' }}><table className="detail-table cutoff-table">
          <caption className="muted">General (OPEN) gender-neutral closing ranks by year{trend.rows[0]?.quota ? ` · ${trend.rows[0].quota} quota preferred when several quotas exist` : ''}. A lower rank is more competitive; year-to-year movement is not a forecast.</caption>
          <thead><tr><th scope="col">Programme</th>{trend.years.map((y) => <th scope="col" key={y}>{trend.examName} {y}</th>)}</tr></thead>
          <tbody>{trend.rows.map((r) => <tr key={r.program}><th scope="row">{r.program}</th>{r.values.map((v) => <td key={v.year}>{v.closing && v.closing > 0 ? formatMetric(v.closing, 'rank') : 'Not available'}</td>)}</tr>)}</tbody>
        </table></div>}
        {sections.filter((x) => x.exam.slug === exam.slug).map(({ y, data }) => <div key={y.year} id={`${exam.slug}-${y.year}`} className="cutoff-section">
          <h2>{name} {cutoffYearHeading(clean(exam.name), y)}</h2>
          <p className="muted">{exam.metric === 'rank' ? `Final round (round ${data.round}) opening and closing ranks for ${y.programmes} programme(s); a lower rank is more competitive.` : exam.metric === 'score' ? `Final round (round ${data.round}) closing scores for ${y.programmes} programme(s).` : 'Published minimum eligibility or shortlisting criteria, depending on the institute. Meeting a published minimum does not guarantee an interview call or admission. Criteria and selection processes vary by institute.'}{' '}{examYearNote(clean(exam.name), y.year, y.exam_year) || ''}</p>
          <CollegeCutoffYearTables rows={data.rows} metric={exam.metric} />
        </div>)}
      </section>{examIndex === 0 && <AdSlot slotKey="cutoff_mid" />}</Fragment>;
    })}

    {sources.length > 0 && <section className="cutoff-section" aria-labelledby="cutoff-sources">
      <h2 id="cutoff-sources">{name} cutoff sources</h2>
      <ul>{sources.map((src) => <li key={src.url}><a href={src.url} target="_blank" rel="noopener nofollow">{src.exam} {src.year}{src.aggregator ? ' (secondary source)' : ' (official)'}</a></li>)}</ul>
    </section>}

    {faqs.length > 0 && <section className="cutoff-section"><h2>{name} Cutoff FAQs</h2>
      <div className="cp-faq">{faqs.map((f) => <details className="cp-faq-item" key={f.question}><summary><h3>{f.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary><p>{f.answer}</p></details>)}</div></section>}

    <section className="cutoff-section" aria-labelledby="cutoff-related-links">
      <h2 id="cutoff-related-links">Related pages</h2>
      <ul>
        <li><Link prefetch={false} href={`/colleges/${slug}`}>{name} college profile</Link> — courses, fees and admissions overview.</li>
        {s.exams.filter((e) => e.published).map((e) => (
          <li key={e.slug}><Link prefetch={false} href={`/exams/${e.slug}/cutoff`}>{clean(e.name)} cutoffs for all colleges</Link></li>
        ))}
      </ul>
    </section>
    <AdSlot slotKey="cutoff_end" />
  </div></main>;
}
