import Link from 'next/link';
import { Link2 } from 'lucide-react';
import type { RelatedLinkGroup } from '../lib/listing-related-links';

export default function ListingRelatedLinks({ groups }: { groups: RelatedLinkGroup[] }) {
  const visible = groups.filter((group) => group.links.length > 0);
  if (!visible.length) return null;

  return (
    <section className="listing-related" aria-labelledby="listing-related-heading">
      <div className="ls-head">
        <p className="ls-eyebrow"><Link2 size={14} aria-hidden="true" /> Related lists</p>
        <h2 id="listing-related-heading">Related college lists</h2>
      </div>
      {visible.map((group) => (
        <div className="listing-related-group" key={group.title}>
          <h3>{group.title}</h3>
          <ul className="listing-related-links">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link prefetch={false} href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
