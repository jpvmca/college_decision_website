'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Star } from 'lucide-react';
import CourseImage from './CourseImage';
import AdSlotClient from './ads/AdSlotClient';
import { feedPositions } from '../lib/ad-feed';
import type { AdFeed } from '../lib/ads';

export type DirectoryCourse = { id: number; name: string; slug: string; published_slug?: string | null; mode: string | null; image_url: string | null; programme_count: number; institute_count: number; review_count: number | string | null; average_rating: number | string | null };

function formatCount(value: number) {
  return value.toLocaleString('en-IN');
}

/** /courses list: first batch server-rendered; "Load more" fetches the next batch without ?page=. */
export default function CourseDirectory({ initial, total, perPage, adFeed = null }: { initial: DirectoryCourse[]; total: number; perPage: number; adFeed?: AdFeed | null }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function loadMore() {
    if (loading || items.length >= total) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/courses?page=${page + 1}&perPage=${perPage}`);
      if (!response.ok) throw new Error('failed');
      const payload = await response.json() as { data?: DirectoryCourse[] };
      setItems((current) => { const seen = new Set(current.map((c) => c.id)); return [...current, ...(payload.data || []).filter((c) => !seen.has(c.id))]; });
      setPage((p) => p + 1);
    } catch { setError('Unable to load more courses. Please try again.'); } finally { setLoading(false); }
  }
  const ads = feedPositions(adFeed, items.length, 5);
  return <>
    {items.length ? <div className="ls-courses">{items.map((course, index) => {
      const href = course.published_slug ? `/courses/${course.published_slug}` : null;
      const colleges = Number(course.institute_count || 0);
      const programmes = Number(course.programme_count || 0);
      const reviews = Number(course.review_count || 0);
      const rating = course.average_rating == null || course.average_rating === '' ? null : Number(course.average_rating);
      const heading = href ? <Link href={href}>{course.name}</Link> : course.name;
      const media = <CourseImage src={course.image_url} alt={`${course.name} course`} />;
      return <Fragment key={course.id}>
        <article className="ls-course" id={`course-${index + 1}`}>
          <div className="ls-course-media">
            {href ? <Link href={href}>{media}</Link> : media}
            <span className="ls-course-tag">{formatCount(colleges)} colleges</span>
          </div>
          <div className="ls-course-body">
            <div className="ls-course-top">
              <span className="ls-tag">{course.mode || 'Course'}</span>
            </div>
            <h2>{heading}</h2>
            <p className="ls-course-lead">Explore {course.name} colleges, programmes and admission context in India.</p>
            <dl className="ls-facts">
              <div><dt>Colleges</dt><dd>{formatCount(colleges)}</dd></div>
              <div><dt>Programmes</dt><dd>{formatCount(programmes)}</dd></div>
            </dl>
            <p className="ls-rating">
              {reviews > 0 ? <>
                <Star size={14} aria-hidden="true" />
                <strong>{rating != null && Number.isFinite(rating) ? `${rating.toFixed(1)}/5` : 'Reviews'}</strong>
                <span>{formatCount(reviews)} review{reviews === 1 ? '' : 's'}</span>
              </> : <span>Reviews not listed</span>}
            </p>
            {href ? <Link className="ls-course-link" href={href}>View course profile <ArrowRight size={15} aria-hidden="true" /></Link> : null}
          </div>
        </article>
        {ads.has(index + 1) && adFeed ? <AdSlotClient slot={adFeed.slot} settings={adFeed.settings} className="ad-in-list" /> : null}
      </Fragment>;
    })}</div> : <div className="ls-empty"><h2>Course list unavailable</h2><p>Please try again shortly.</p></div>}
    {(items.length < total || error) && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>{loading ? 'Loading courses…' : error ? 'Try again' : 'Load more'} <ArrowDown size={16} aria-hidden="true" /></button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
