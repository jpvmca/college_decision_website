'use client';

import Link from 'next/link';
import { highlight, SUGGEST_GROUPS, type SuggestItem, type SuggestResult } from '../lib/typeahead';
import CollegeViewDetailsModal from './CollegeViewDetailsModal';

function isUnpublishedCollege(item: SuggestItem) {
  return item.type === 'college' && item.isPublished === false;
}

export default function SearchResultGroups({ results, keyword }: { results: SuggestResult; keyword: string }) {
  const groups = SUGGEST_GROUPS.map((group) => ({ ...group, items: results[group.key] })).filter((group) => group.items.length);
  if (!groups.length) return null;
  const mark = results.fuzzy ? '' : keyword;
  return <div className="search-groups">{groups.map((group) => <section className="search-group" key={group.key} aria-labelledby={`sg-${group.key}`}>
    <h2 id={`sg-${group.key}`}>{group.label} <small>{group.items.length}{group.items.length >= 20 ? '+' : ''}</small></h2>
    <div className="search-group-list">{group.items.map((item) => (
      isUnpublishedCollege(item)
        ? <div className="search-hit is-preview" key={`${item.type}-${item.id}`}>
            <div>
              <strong>{highlight(item.title, mark)}</strong>
              {item.subtitle && <small>{item.subtitle}</small>}
            </div>
            <CollegeViewDetailsModal instituteId={Number(item.id)} buttonLabel="View" buttonClassName="view-button search-hit-view" />
          </div>
        : <Link prefetch={false} className="search-hit" key={`${item.type}-${item.id}`} href={item.href}>
            <strong>{highlight(item.title, mark)}</strong>
            {item.subtitle && <small>{item.type === 'listing' ? 'Listing · ' : ''}{item.subtitle}</small>}
          </Link>
    ))}</div>
  </section>)}</div>;
}
