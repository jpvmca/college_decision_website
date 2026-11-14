import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SearchBox from '../components/SearchBox';
import MobileNav from '../components/MobileNav';
import SiteMenu from '../components/SiteMenu';
import PopularStrip from '../components/PopularStrip';
import SiteFooter from '../components/SiteFooter';
import GoogleTagManager from '../components/GoogleTagManager';
import StudentLeadPopup from '../components/StudentLeadPopup';
import AdsenseLoader from '../components/ads/AdsenseLoader';
import AdSlot from '../components/ads/AdSlot';
import JsonLd from '../components/JsonLd';
import { organizationId, organizationJsonLd } from '../lib/structured-data';
import './globals.css';
import './modal-overrides.css';
import './decision-overrides.css';
import './compare-overrides.css';
import './compare-mobile.css';
import './listing-filter.css';
import './student-lead.css';
import './ads.css';
import './college-profile.css';
import './home.css';
import './exams.css';
import './listings.css';
import './header.css';
import './overflow-guards.css';

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
    publisher: { '@id': organizationId(siteUrl) },
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
      <body className={process.env.NODE_ENV === "development" ? "debug-rails" : undefined}>
        <GoogleTagManager />
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd(siteUrl)} />
        <div className="site">
          <header className="nav">
            <div className="wrap nav-inner">
              <Link className="brand" href="/" aria-label="College Decision home"><Image src="/logo-wordmark.svg" alt="College Decision" width={223} height={40} priority /></Link>
              <SearchBox />
              <MobileNav />
            </div>
            <SiteMenu />
          </header>
          <PopularStrip />
          <div className="site-page-rails">
            <aside className="site-page-rail site-page-rail-left" aria-label="Advertisements"><AdSlot slotKey="global_side_left" /></aside>
            <div className="site-page-content">{children}</div>
            <aside className="site-page-rail site-page-rail-right" aria-label="Advertisements"><AdSlot slotKey="global_side_right" /></aside>
          </div>
          <SiteFooter />
          </div>
        <StudentLeadPopup />
        <AdsenseLoader />
      </body>
    </html>
  );
}
