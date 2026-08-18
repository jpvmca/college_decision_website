import Link from 'next/link';
import { api, ArticleList } from '../lib/api';

export default async function HomePage() {
  let popularGuides: ArticleList['data'] = [];
  try {
    const result = await api<ArticleList>('/articles?type=all&latest=true&perPage=4');
    popularGuides = result.data.slice(0, 4);
  } catch {
    popularGuides = [];
  }
  const typeLabel = (type?: string) => type === 'fees' ? 'Course fees' : type === 'admission' ? 'Admission' : type === 'gov-avg-package' ? 'Placement' : 'Budget';
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Choose a college with evidence, not noise.</h1>
          <p>Compare fees, admission routes, placements, hostel costs and real decision trade-offs from structured college data.</p>
          <Link className="button" href="/articles">Explore decision articles</Link>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2>What makes a useful college decision?</h2>
          <p className="muted">Our pages explain the number, its source, its date and what it does not include.</p>
          <div className="grid">
            <article className="card"><span className="pill">Fees</span><h3>Total cost, not just tuition</h3><p>Separate tuition, hostel, mess, deposits and other charges before comparing colleges.</p></article>
            <article className="card"><span className="pill">Admission</span><h3>Route and eligibility</h3><p>Understand entrance exams, counselling, eligibility and the evidence behind each claim.</p></article>
            <article className="card"><span className="pill">Outcomes</span><h3>Placement context</h3><p>Show placement year and units instead of turning an unverified number into a promise.</p></article>
          </div>
        </div>
      </section>
      <section className="section popular-section">
        <div className="wrap">
          <p className="eyebrow">START WITH A USEFUL QUESTION</p>
          <h2>Popular decision guides</h2>
          <p className="muted">Explore current course guides organised around the questions students ask before applying.</p>
          <div className="popular-guides">
            {popularGuides.map((guide) => <article className="card popular-guide" key={guide.slug}>
              <span className="pill">{typeLabel(guide.articleType)}</span>
              <h3><Link href={`/articles/${guide.slug}`}>{guide.title}</Link></h3>
              <p>{guide.content || 'Review the latest published course, fee and admission information before applying.'}</p>
              <Link className="guide-link" href={`/articles/${guide.slug}`}>Read guide →</Link>
            </article>)}
            {!popularGuides.length && <p className="muted">New decision guides will appear here after they are published.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
