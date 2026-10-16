'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import CourseImage from './CourseImage';

export type DirectoryCourse = { id: number; name: string; slug: string; published_slug?: string | null; mode: string | null; image_url: string | null; programme_count: number; institute_count: number; review_count: number | string | null; average_rating: number | string | null };

/** /courses list: first batch server-rendered; "Load more" fetches the next batch without ?page=. */
export default function CourseDirectory({ initial, total, perPage }: { initial: DirectoryCourse[]; total: number; perPage: number }) {
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
  return <>
    <div className="article-list">{items.length ? items.map((course, index) => <article className="article-card article-card-with-image" id={`course-${index + 1}`} key={course.id}>{course.published_slug ? <Link href={`/courses/${course.published_slug}`}><CourseImage src={course.image_url} alt={`${course.name} course`} /></Link> : <CourseImage src={course.image_url} alt={`${course.name} course`} />}<div className="article-card-content"><div className="article-card-top"><span className="pill">{course.mode || 'Course'}</span><span className="muted">{Number(course.institute_count || 0)} colleges</span></div><h2>{course.published_slug ? <Link href={`/courses/${course.published_slug}`}>{course.name}</Link> : course.name}</h2><p>Explore {course.name} colleges, programmes and admission context in India.</p><div className="article-facts"><span>{Number(course.programme_count || 0)} active programmes</span>{course.review_count ? <span>{course.review_count} reviews · {Number(course.average_rating).toFixed(1)}/5</span> : <span>Reviews not listed</span>}</div>{course.published_slug ? <p><Link className="view-button" href={`/courses/${course.published_slug}`}>View course profile</Link></p> : null}</div></article>) : <div className="card"><h2>Course list unavailable</h2><p>Please try again shortly.</p></div>}</div>
    {(items.length < total || error) && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>{loading ? 'Loading courses…' : error ? 'Try again' : 'Load more'} <ArrowDown size={16} aria-hidden="true" /></button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
