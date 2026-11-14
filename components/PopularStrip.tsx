import Link from 'next/link';
import { POPULAR_LINKS } from '../lib/site-nav';

export default function PopularStrip() {
  return <div className="popular-strip">
    <nav className="wrap popular-strip-inner" aria-label="Popular searches">
      <span className="popular-strip-label">Popular</span>
      <ul>
        {POPULAR_LINKS.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
      </ul>
    </nav>
  </div>;
}
