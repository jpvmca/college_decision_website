import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The requested college decision page could not be found.',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="section ls-page">
      <div className="wrap">
        <div className="ls-404">
          <span className="ls-kicker">Error 404</span>
          <h1>Page not found</h1>
          <p>
            The page may have moved, is not published yet, or the URL may be incomplete.
            Try searching for another course or browse the latest decision guides.
          </p>
          <div className="ls-hero-actions">
            <Link className="button ls-btn-primary" href="/articles">Browse published guides <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="button ls-btn-ghost" href="/search"><Search size={15} aria-hidden="true" /> Search guides</Link>
            <Link className="button ls-btn-ghost" href="/">Return to homepage</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
