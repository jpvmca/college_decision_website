import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The requested college decision page could not be found.',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="section not-found-page">
      <div className="wrap">
        <div className="not-found-card">
          <p className="eyebrow">ERROR 404</p>
          <h1>Page not found</h1>
          <p className="not-found-copy">
            The page may have moved, is not published yet, or the URL may be incomplete.
            Try searching for another course or browse the latest decision guides.
          </p>
          <div className="not-found-actions">
            <Link className="button primary" href="/articles">Browse published guides</Link>
            <Link className="button" href="/search">Search guides</Link>
            <Link className="text-link" href="/">Return to homepage</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
