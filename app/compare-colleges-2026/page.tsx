import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CheckCircle2, FileText, GitCompareArrows, GraduationCap } from 'lucide-react';
import CollegeComparePage from '../../components/CollegeComparePage';
import AdSlot from '../../components/ads/AdSlot';
import { api, mediaUrl } from '../../lib/api';
import HeroPhoto from '../../components/HeroPhoto';
import HeroStats from '../../components/HeroStats';

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
  const stats = [
    { icon: GitCompareArrows, value: 4, label: 'Colleges at once' },
    { icon: GraduationCap, value: 3, label: 'Evidence areas' },
    comparisonArticles.length ? { icon: FileText, value: comparisonArticles.length, label: 'Comparison guides' } : null
  ].filter((item): item is { icon: typeof GitCompareArrows; value: number; label: string } => Boolean(item));
  return (
    <main className="section ls-page cm-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
      <div className="wrap">
        <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Compare colleges</span></nav>
        <section className="ls-hero">
          <div className="ls-hero-inner">
            <div className="ls-hero-copy">
              <span className="ls-kicker"><BadgeCheck size={15} aria-hidden="true" /> College comparison tool 2026</span>
              <h1>Compare Colleges in India by Fees, Courses, Placements and Admission</h1>
              <p>Choose up to four colleges and compare the details that matter before you apply. Search by college name, display name or URL keyword.</p>
              <div className="ls-hero-actions">
                <Link className="button ls-btn-primary" href="#compare-tool">Start comparing <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link className="button ls-btn-ghost" href="/articles">Read decision guides</Link>
              </div>
              <div className="cm-hero-points">
                <span><CheckCircle2 size={16} aria-hidden="true" /> Programme-level data</span>
                <span><CheckCircle2 size={16} aria-hidden="true" /> Transparent fee context</span>
                <span><CheckCircle2 size={16} aria-hidden="true" /> Admission and placement evidence</span>
              </div>
            </div>
            <div className="ls-hero-visual">
              <HeroPhoto src="/college-comparison-hero.webp" alt="Students comparing college options and campus cards" width={1024} height={768} />
            </div>
          </div>
          <HeroStats prefix="ls" stats={stats.map((item) => ({ icon: item.icon, label: item.label, value: `${item.value.toLocaleString('en-IN')}${item.value >= 20 ? '+' : ''}` }))} />
        </section>
        <AdSlot slotKey="compare_top" className="listing-ad" />
      </div>

      <section className="section compare-tool-section" id="compare-tool">
        <div className="wrap">
          <div className="ls-head">
            <p className="ls-eyebrow"><GitCompareArrows size={14} aria-hidden="true" /> Comparison tool</p>
            <h2>Add up to four colleges</h2>
          </div>
          <p className="ls-count">Search by college name, then compare fees, programmes, placements and admission routes side by side.</p>
          <CollegeComparePage />
        </div>
      </section>
      {comparisonArticles.length > 0 && <section className="section latest-comparison-section">
        <div className="wrap">
          <div className="ls-head">
            <p className="ls-eyebrow"><FileText size={14} aria-hidden="true" /> Latest college comparison guides</p>
            <h2>Latest College Comparison Guides: Fees, Courses &amp; Placements</h2>
          </div>
          <p className="ls-count">Read the latest college comparison articles to compare fees, courses, placements and admission evidence before you shortlist.</p>
          <div className="ls-courses">
            {comparisonArticles.map((article) => {
              const image = mediaUrl(article.imageUrl) || comparisonImage;
              return <Link className="ls-course" href={`/articles/${article.slug}`} key={article.id}>
                <div className="ls-course-media">
                  <img className="course-card-image" src={image} alt="" width="640" height="360" loading="lazy" />
                </div>
                <div className="ls-course-body">
                  <div className="ls-course-top"><span className="ls-tag">College comparison</span></div>
                  <h2>{article.title}</h2>
                  <span className="ls-course-link">Read comparison <ArrowRight size={15} aria-hidden="true" /></span>
                </div>
              </Link>;
            })}
          </div>
        </div>
      </section>}
      <section className="section compare-content-section">
        <div className="wrap compare-content-grid">
          <article>
            <p className="ls-eyebrow">Make a better shortlist</p>
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
          <p className="ls-eyebrow">Questions</p>
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
  );
}
