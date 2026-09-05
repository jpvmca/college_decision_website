import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SearchBox from '../components/SearchBox';
import MobileNav from '../components/MobileNav';
import GoogleTagManager from '../components/GoogleTagManager';
import './globals.css';
import './modal-overrides.css';
import './decision-overrides.css';
import './compare-overrides.css';
import './compare-mobile.css';

const defaultTitle = 'Compare College Fees, Courses & Exams in India';
const defaultDescription = 'Compare college fees, courses, entrance exams, admission routes and placements across India before you shortlist.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: { default: defaultTitle, template: '%s | College Decision' },
  description: defaultDescription,
  authors: [{ name: 'College Decision' }],
  creator: 'College Decision',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'College Decision',
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'College Decision' }]
  },
  twitter: { card: 'summary_large_image', title: defaultTitle, description: defaultDescription }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'College Decision',
    url: `${siteUrl}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string'
      }
    }
  };
  return (
    <html lang="en">
      <body>
        <GoogleTagManager />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <div className="site">
          <nav className="nav">
            <div className="wrap nav-inner">
              <Link className="brand" href="/" aria-label="College Decision home"><Image src="/logo.svg" alt="College Decision" width={188} height={38} priority /></Link>
              <SearchBox />
              <MobileNav />
            </div>
          </nav>
          {children}
          <footer className="footer"><div className="wrap"><Image className="footer-logo" src="/logo.svg" alt="College Decision" width={170} height={34} loading="lazy" /><span>Clear college decisions with practical cost, admission and outcome guidance.</span><nav className="footer-links" aria-label="Footer links"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link><Link href="/disclaimer">Disclaimer</Link></nav></div></footer>
          </div>
      </body>
    </html>
  );
}
