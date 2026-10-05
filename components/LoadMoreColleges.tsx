'use client';

import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { CollegeListResults, type ListedCollege } from './CollegeListResults';
import type { LinkableEntity } from '../lib/auto-link-entities';

type Props = {
  initial: ListedCollege[];
  total: number;
  perPage: number;
  query: string;
  linkableEntities: LinkableEntity[];
};

export default function LoadMoreColleges({ initial, total, perPage, query, linkableEntities }: Props) {
  const [colleges, setColleges] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const hasMore = colleges.length < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/colleges?page=${page + 1}&perPage=${perPage}${query ? `&${query}` : ''}`);
      if (!response.ok) throw new Error('Unable to load more colleges');
      const payload = await response.json() as { data?: ListedCollege[] };
      setColleges((current) => {
        const existing = new Set(current.map((college) => college.id));
        return [...current, ...(payload.data || []).filter((college) => !existing.has(college.id))];
      });
      setPage((current) => current + 1);
    } catch {
      setError('Unable to load more colleges. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <>
    <CollegeListResults colleges={colleges} total={total} linkableEntities={linkableEntities} />
    {hasMore && <div className="load-more-wrap">
      <button className="button secondary" type="button" onClick={loadMore} disabled={loading}>
        {loading ? 'Loading colleges…' : error ? 'Try again' : 'Load more'}
        <ArrowDown size={16} aria-hidden="true" />
      </button>
      {error && <p className="muted" role="alert">{error}</p>}
    </div>}
  </>;
}
