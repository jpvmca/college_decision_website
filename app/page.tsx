import Link from 'next/link';
import type { Metadata } from 'next';
import { api, ArticleList } from '../lib/api';
import CollegeDecisionFilter from '../components/CollegeDecisionFilter';
import { ArrowRight, ChartNoAxesCombined, GraduationCap, IndianRupee } from 'lucide-react';

export const metadata: Metadata = {
  title: 'College Decision Platform',
  description: 'Compare college fees, admission routes, placements and total study cost.',
  alternates: { canonical: '/' }
};

function getGuideImageSources(imageUrl: string) {
  const widths = [320, 480, 640];
  const addQuery = (width: number) => `${imageUrl}?w=${width}&h=${Math.round(width * 0.5625)}&q=78&convert=webp`;
  return { src: addQuery(480), srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', ') };
}

export default async function HomePage() {
  let popularGuides: ArticleList['data'] = [];
  try {
    const result = await api<ArticleList>('/articles?type=all&latest=true&perPage=4');
    popularGuides = result.data.slice(0, 4);
  } catch {
    popularGuides = [];
  }
  const typeLabel = (type?: string) => type === 'fees' ? 'Course fees' : type === 'admission' ? 'Admission' : type === 'gov-avg-package' ? 'Placement' : type === 'exam-admission' ? 'MBA entrance' : 'Budget';
  return (
    <>
      <section className="hero">
        <div className="wrap hero-layout">
          <div className="hero-copy">
            <h1>Choose a college with evidence, not noise.</h1>
            <p>Compare fees, admission routes, placements, hostel costs and real decision trade-offs from structured college data.</p>
            <div className="hero-actions"><Link className="button primary" href="/compare-colleges-2026">Compare colleges <ArrowRight size={17} aria-hidden="true" /></Link><Link className="button secondary" href="/articles">Explore decision articles <ArrowRight size={17} aria-hidden="true" /></Link></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-glow" />
            <img src="/college-decision-hero.webp" alt="college decision hero" />
            <span className="hero-visual-badge hero-visual-badge-top">Compare with confidence</span>
            <span className="hero-visual-badge hero-visual-badge-bottom">Fees · Exams · Placements</span>
          </div>
        </div>
      </section>
      <section className="section home-decision-section">
        <div className="wrap">
          <CollegeDecisionFilter />
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2>What makes a useful college decision?</h2>
          <p className="muted">Our pages explain the number, its source, its date and what it does not include.</p>
          <div className="grid">
            <article className="card feature-card"><div className="feature-label"><IndianRupee className="feature-icon" size={20} aria-hidden="true" /><span className="pill">Fees</span></div><h3>Total cost, not just tuition</h3><p>Separate tuition, hostel, mess, deposits and other charges before comparing colleges.</p></article>
            <article className="card feature-card"><div className="feature-label"><GraduationCap className="feature-icon" size={20} aria-hidden="true" /><span className="pill">Admission</span></div><h3>Route and eligibility</h3><p>Understand entrance exams, counselling, eligibility and the evidence behind each claim.</p></article>
            <article className="card feature-card"><div className="feature-label"><ChartNoAxesCombined className="feature-icon" size={20} aria-hidden="true" /><span className="pill">Outcomes</span></div><h3>Placement context</h3><p>Show placement year and units instead of turning an unverified number into a promise.</p></article>
          </div>
        </div>
      </section>
      <section className="section popular-section">
        <div className="wrap">
          <p className="eyebrow">START WITH A USEFUL QUESTION</p>
          <div className="section-heading-row">
            <h2>Popular decision guides</h2>
            <Link className="popular-guides-view-all" href="/articles">View all decision guides <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <p className="muted">Explore current course guides organised around the questions students ask before applying.</p>
          <div className="popular-guides">
            {popularGuides.map((guide) => <article className={guide.imageUrl ? 'card popular-guide popular-guide-with-image' : 'card popular-guide'} key={guide.slug}>
              {guide.imageUrl && (() => { const image = getGuideImageSources(guide.imageUrl); return <img className="popular-guide-image" src={image.src} srcSet={image.srcSet} sizes="(max-width: 760px) 100vw, 320px" alt={guide.title} width="640" height="360" loading="lazy" decoding="async" />; })()}
              <div className="popular-guide-content">
              <span className="pill">{typeLabel(guide.articleType)}</span>
              <h3><Link href={`/articles/${guide.slug}`}>{guide.title}</Link></h3>
              <p>{guide.content || 'Review the latest published course, fee and admission information before applying.'}</p>
              <Link className="guide-link" href={`/articles/${guide.slug}`}>Read guide <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </article>)}
            {!popularGuides.length && <p className="muted">New decision guides will appear here after they are published.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
