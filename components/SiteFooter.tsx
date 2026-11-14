import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { FOOTER_COMPANY, FOOTER_COURSES, FOOTER_EXAMS, FOOTER_STATES, FOOTER_STREAMS, SITE_EMAIL_ADDRESS, type NavLink } from '../lib/site-nav';

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return <nav className="footer-col" aria-label={title}>
    <p className="footer-col-title">{title}</p>
    <ul>{links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
  </nav>;
}

export default function SiteFooter() {
  return <footer className="footer site-footer">
    <div className="wrap">
      <div className="footer-top">
        <div className="footer-brand">
          <Image className="footer-logo" src="/logo-wordmark.svg" alt="College Decision" width={190} height={34} loading="lazy" />
          <p>Clear college decisions with practical cost, admission and outcome guidance.</p>
          <a className="footer-email" href={`mailto:${SITE_EMAIL_ADDRESS}`}><Mail size={15} aria-hidden="true" />{SITE_EMAIL_ADDRESS}</a>
        </div>
        <div className="footer-grid">
          <FooterColumn title="Top streams" links={FOOTER_STREAMS} />
          <FooterColumn title="By state" links={FOOTER_STATES} />
          <FooterColumn title="Top exams" links={FOOTER_EXAMS} />
          <FooterColumn title="Courses" links={FOOTER_COURSES} />
          <FooterColumn title="Company" links={FOOTER_COMPANY} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} College Decision. A research and comparison resource: confirm fees, dates and cutoffs with official sources before applying.</span>
        <nav className="footer-links" aria-label="Legal"><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link><Link href="/disclaimer">Disclaimer</Link></nav>
      </div>
    </div>
  </footer>;
}
