import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SearchBox from '../components/SearchBox';
import MobileNav from '../components/MobileNav';
import GoogleTagManager from '../components/GoogleTagManager';
import './globals.css';
import './modal-overrides.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: { default: 'College Decision Platform', template: '%s | College Decision Platform' },
  description: 'Compare college fees, admission routes, placements and total study cost.',
  keywords: ['college fees', 'college admission', 'college comparison', 'college placements', 'total college cost'],
  authors: [{ name: 'College Decision' }],
  creator: 'College Decision',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'College Decision Platform',
    title: 'College Decision Platform',
    description: 'Make better college decisions with clear fees, admission and outcome context.',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'College Decision' }]
  },
  twitter: { card: 'summary_large_image', title: 'College Decision Platform', description: 'Make better college decisions with clear fees, admission and outcome context.' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <GoogleTagManager />
        <div className="site">
          <nav className="nav">
            <div className="wrap nav-inner">
              <Link className="brand" href="/" aria-label="College Decision home"><Image src="/logo.svg" alt="College Decision" width={188} height={38} priority /></Link>
              <SearchBox />
              <MobileNav />
            </div>
          </nav>
          {children}
          <footer className="footer"><div className="wrap"><Image className="footer-logo" src="/logo.svg" alt="College Decision" width={170} height={34} loading="lazy" /><span>Clear college decisions with practical cost, admission and outcome guidance.</span><nav className="footer-links" aria-label="Footer links"><Link href="/contact">Contact</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link><Link href="/disclaimer">Disclaimer</Link></nav></div></footer>
          </div>
      </body>
    </html>
  );
}
