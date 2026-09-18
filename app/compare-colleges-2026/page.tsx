import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import CollegeComparePage from '../../components/CollegeComparePage';
import { api, mediaUrl } from '../../lib/api';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
const comparisonImage = '/college-comparison-hero.webp';

type ComparisonArticle = {
  id: number;
  slug: string;
  title: string;
  imageUrl?: string | null;
  articleType?: string;
};

async function getLatestComparisonArticles(): Promise<ComparisonArticle[]> {
  try {
    const response = await api<{ data: ComparisonArticle[] }>('/articles?type=college-comparison&page=1&perPage=20', { next: { revalidate: 300 } });
    return response.data || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Compare Colleges in India 2026: Fees, Courses, Placements & Admission',
  description: 'Compare colleges in India in 2026 by courses, fees, location, eligibility, entrance exams, placements and admission routes before creating your shortlist.',
  alternates: { canonical: '/compare-colleges-2026' },
  openGraph: {
    title: 'Compare Colleges in India 2026: Fees, Courses, Placements & Admission',
    description: 'Build a clearer 2026 college shortlist by comparing fees, courses, placements, rankings and admission information.',
    url: `${siteUrl}/compare-colleges-2026`,
    images: [{ url: `${siteUrl}/logo.svg`, width: 188, height: 38, alt: 'College Decision' }]
  }
};

const applicationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', name: 'Compare Colleges in India 2026', url: `${siteUrl}/compare-colleges-2026`, description: metadata.description, image: `${siteUrl}/logo.svg` },
    {
      '@type': 'WebApplication',
      name: 'College Comparison Tool 2026',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      description: 'Compare up to four colleges using programme, fee, location, admission, placement and ranking context.'
    },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Compare Colleges 2026', item: `${siteUrl}/compare-colleges-2026` }] }
  ]
};

export default async function CompareCollegesPage() {
  const comparisonArticles = await getLatestComparisonArticles();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
      <section className="compare-hero">
        <div className="wrap compare-hero-inner">
          <div className="compare-hero-copy">
            <p className="eyebrow">COLLEGE COMPARISON TOOL 2026</p>
            <h1>Compare Colleges in India by Fees, Courses, Placements and Admission</h1>
            <p>Choose up to four colleges and compare the details that matter before you apply. Search by college name, display name or URL keyword.</p>
            <div className="compare-hero-points"><span><CheckCircle2 size={17} aria-hidden="true" /> Programme-level data</span><span><CheckCircle2 size={17} aria-hidden="true" /> Transparent fee context</span><span><CheckCircle2 size={17} aria-hidden="true" /> Admission and placement evidence</span></div>
          </div>
          <div className="compare-hero-art">
            <img src="/college-comparison-hero.webp" alt="Students comparing college options and campus cards" width="1024" height="768" />
          </div>
        </div>
      </section>

      <main>
        <section className="section compare-tool-section">
          <div className="wrap">
            <CollegeComparePage />
          </div>
        </section>
        {comparisonArticles.length > 0 && <section className="section latest-comparison-section">
          <div className="wrap">
            <p className="eyebrow">LATEST COLLEGE COMPARISON GUIDES</p>
            <h2>Latest College Comparison Guides: Fees, Courses &amp; Placements</h2>
            <p>Read the latest college comparison articles to compare fees, courses, placements and admission evidence before you shortlist.</p>
            <div className="latest-comparison-grid">
              {comparisonArticles.map((article) => {
                const image = mediaUrl(article.imageUrl) || comparisonImage;
                return <Link className="latest-comparison-card" href={`/articles/${article.slug}`} key={article.id}>
                  <img src={image} alt="" width="640" height="360" loading="lazy" />
                  <div>
                    <span className="pill">College comparison</span>
                    <h3>{article.title}</h3>
                    <span className="text-link">Read comparison <ArrowRight size={15} aria-hidden="true" /></span>
                  </div>
                </Link>;
              })}
            </div>
          </div>
        </section>}
        <section className="section compare-content-section">
          <div className="wrap compare-content-grid">
            <article>
              <p className="eyebrow">MAKE A BETTER SHORTLIST</p>
              <h2>What can you compare?</h2>
              <p>Compare the college context in one place instead of relying on a single fee or placement number. The tool brings together active programme records, recorded fees, entrance routes, rankings and outcome information where the database has evidence.</p>
              <div className="compare-content-list">
                <div><strong>Courses and programmes</strong><span>See the programmes and course areas linked to each college.</span></div>
                <div><strong>Fees and duration</strong><span>Review recorded fee ranges and programme duration before comparing affordability.</span></div>
                <div><strong>Admission and eligibility</strong><span>Check listed entrance exams and programme-level eligibility context.</span></div>
                <div><strong>Placements and rankings</strong><span>Use year and ranking-body context instead of treating historical figures as guarantees.</span></div>
              </div>
            </article>
            <aside className="compare-method-card">
              <h2>How to compare fairly</h2>
              <ol>
                <li>Compare similar course levels and programme types.</li>
                <li>Check the fee duration and ask about hostel, mess and deposits.</li>
                <li>Separate average and highest placement packages.</li>
                <li>Verify the latest official eligibility and admission notice.</li>
              </ol>
              <Link className="text-link" href="/articles">Read decision guides <ArrowRight size={16} aria-hidden="true" /></Link>
            </aside>
          </div>
        </section>
        <section className="section compare-faq-section">
          <div className="wrap">
            <h2>Frequently asked questions about comparing colleges</h2>
            <div className="compare-faq-grid">
              <article><h3>How many colleges can I compare?</h3><p>You can compare up to four active colleges in one comparison. Remove a college from any slot to replace it.</p></article>
              <article><h3>Does the fee include hostel and mess charges?</h3><p>The displayed amount is recorded programme-fee data. Hostel, mess, deposits and category-specific charges may be separate.</p></article>
              <article><h3>Are placement packages guaranteed?</h3><p>No. Placement figures are historical records and can change by year, role, batch and recruiter mix.</p></article>
              <article><h3>How current is admission information?</h3><p>Use the comparison as research context and confirm the latest official college and entrance-exam notice before applying.</p></article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
