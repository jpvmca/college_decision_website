import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { mediaUrl } from '../lib/api';

export type GuideArticle = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  candidateCount?: number;
  placementCount?: number;
  examCount?: number;
  articleType?: string;
  imageUrl?: string | null;
};

export function articleTypeLabel(type?: string, fallback = 'Published guide') {
  if (type === 'fees') return 'Course fees';
  if (type === 'admission') return 'Admission & eligibility';
  if (type === 'gov-avg-package') return 'Gov · avg package';
  if (type === 'exam-admission') return 'MBA · entrance exam';
  if (type === 'college-comparison') return 'College comparison';
  return fallback;
}

export function articleFactLabel(type?: string) {
  if (type === 'gov-avg-package') return 'Average package ranked';
  if (type === 'exam-admission') return 'Entrance exam matched';
  if (type === 'admission') return 'Eligibility checked';
  if (type === 'fees') return 'Fee comparison';
  if (type === 'college-comparison') return 'Side-by-side comparison';
  return 'Budget comparison';
}

export function getGuideImageSources(rawImageUrl: string) {
  if (rawImageUrl.startsWith('/') && !rawImageUrl.startsWith('/uploads/')) {
    return { src: rawImageUrl, srcSet: undefined as string | undefined, sizes: undefined as string | undefined };
  }
  const imageUrl = mediaUrl(rawImageUrl);
  const widths = [480, 768, 1200, 1600];
  const addQuery = (width: number) => `${imageUrl}?w=${width}&h=${Math.round(width * 0.5625)}&q=78&convert=webp`;
  return {
    src: addQuery(1200),
    srcSet: widths.map((width) => `${addQuery(width)} ${width}w`).join(', '),
    sizes: '(max-width: 760px) 100vw, 50vw'
  };
}

export default function GuideCard({ article, pill, index }: { article: GuideArticle; pill?: string; index?: number }) {
  const href = `/articles/${article.slug}`;
  const label = pill || articleTypeLabel(article.articleType);
  const options = Number(article.candidateCount || 0);
  const image = article.imageUrl ? getGuideImageSources(article.imageUrl) : null;
  return <article className="ls-course" id={index != null ? `guide-${index + 1}` : undefined}>
    <div className="ls-course-media">
      {image
        ? <Link href={href} tabIndex={-1} aria-hidden="true"><img className="course-card-image" src={image.src} srcSet={image.srcSet} sizes={image.sizes} alt="" width="1200" height="675" loading="lazy" decoding="async" /></Link>
        : <Link href={href} className="ls-guide-fallback" tabIndex={-1} aria-hidden="true" />}
      {options > 0 && <span className="ls-course-tag">{options.toLocaleString('en-IN')} options</span>}
    </div>
    <div className="ls-course-body">
      <div className="ls-course-top"><span className="ls-tag">{label}</span></div>
      <h2><Link href={href}>{article.title}</Link></h2>
      <p className="ls-course-lead">{article.content || 'Compare fees, eligibility, admission route and outcomes before making a college decision.'}</p>
      <div className="ls-guide-facts">
        <span><CheckCircle2 size={14} aria-hidden="true" /> {articleFactLabel(article.articleType)}</span>
        <span><CheckCircle2 size={14} aria-hidden="true" /> {article.articleType === 'gov-avg-package' ? 'Government colleges' : article.articleType === 'college-comparison' ? 'Fees & placements' : 'Admission context'}</span>
        {article.placementCount ? <span><CheckCircle2 size={14} aria-hidden="true" /> {article.placementCount} placement-linked</span> : null}
        {article.examCount ? <span><CheckCircle2 size={14} aria-hidden="true" /> {article.examCount} entrance routes</span> : null}
      </div>
      <Link className="ls-course-link" href={href}>Read guide <ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
  </article>;
}
