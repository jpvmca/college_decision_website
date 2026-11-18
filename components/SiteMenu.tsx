import Link from 'next/link';
import { ChevronDown, GitCompareArrows, Sparkles, MessageCircle, Building2, ClipboardCheck, BookOpen, FileText, LogIn } from 'lucide-react';
import { BEST_FIT_HREF, COMPARE_ARTICLES, COMPARE_HREF, CONTACT_HREF, FOR_COLLEGES_NAV_HREF, NAV_STREAMS, PRIMARY_LINKS, type NavLink } from '../lib/site-nav';

const PRIMARY_ICONS = [Building2, ClipboardCheck, BookOpen, FileText, GitCompareArrows];

function Column({ title, links, id }: { title: string; links: NavLink[]; id: string }) {
  if (!links.length) return null;
  return <div className="mega-col">
    <p className="mega-col-title" id={id}>{title}</p>
    <ul aria-labelledby={id}>
      {links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
    </ul>
  </div>;
}

/**
 * Server-rendered stream mega menu. Uses <details>/<summary> so every link is in the HTML,
 * works without JavaScript and is keyboard operable; MobileNav adds close-others / Escape /
 * outside-click behaviour and turns this same element into the mobile drawer.
 */
export default function SiteMenu() {
  return <div id="site-navigation" className="site-menu" aria-label="Main menu" role="navigation">
    <div className="wrap site-menu-inner">
      <div className="menu-mobile-only menu-primary">
        {PRIMARY_LINKS.map((link, index) => {
          const Icon = PRIMARY_ICONS[index] || Building2;
          return <Link key={link.href} href={link.href}><Icon size={16} aria-hidden="true" /> {link.label}</Link>;
        })}
      </div>
      <ul className="mega-list">
        {NAV_STREAMS.map((stream) => {
          const base = `mega-${stream.key}`;
          return <li key={stream.key} className="mega-item">
            <details className="mega" data-mega="">
              <summary>{stream.label}<ChevronDown size={14} aria-hidden="true" /></summary>
              <div className="mega-panel">
                <div className="mega-grid">
                  <Column id={`${base}-colleges`} title={`${stream.label === 'More' ? 'Other' : stream.label} colleges`} links={stream.colleges} />
                  <Column id={`${base}-col2`} title={stream.col2Title} links={stream.col2} />
                  <div className="mega-col">
                    <p className="mega-col-title" id={`${base}-exams`}>Exams &amp; cutoffs</p>
                    <ul aria-labelledby={`${base}-exams`}>
                      {stream.exams.map((exam) => <li key={exam.href} className="mega-exam">
                        <Link href={exam.href}>{exam.label}</Link>
                        {exam.cutoff && <Link className="mega-cutoff" href={exam.cutoff} aria-label={`${exam.label} cutoff`}>Cutoff</Link>}
                      </li>)}
                    </ul>
                  </div>
                  <Column id={`${base}-guides`} title="Course guide" links={stream.guides} />
                </div>
              </div>
            </details>
          </li>;
        })}
        <li className="mega-item mega-item-compare">
          <details className="mega" data-mega="">
            <summary><GitCompareArrows size={15} aria-hidden="true" />Compare<ChevronDown size={14} aria-hidden="true" /></summary>
            <div className="mega-panel mega-panel-compare">
              <div className="mega-compare-lead">
                <Link className="mega-compare-tool" href={COMPARE_HREF}>
                  <strong>Compare colleges side by side</strong>
                  <span>Fees, admission routes, cutoffs and placements in one table.</span>
                </Link>
              </div>
              <div className="mega-grid mega-grid-compare">
                {COMPARE_ARTICLES.map((group) => <Column key={group.stream} id={`mega-compare-${group.stream.toLowerCase()}`} title={`${group.stream} comparisons`} links={group.links} />)}
              </div>
            </div>
          </details>
        </li>
      </ul>
      <div className="menu-actions">
        <Link className="menu-forcolleges" href={FOR_COLLEGES_NAV_HREF} aria-label="For colleges"><Building2 size={14} aria-hidden="true" /><span>For colleges</span></Link>
        <Link className="menu-bestfit" href={BEST_FIT_HREF}><Sparkles size={15} aria-hidden="true" /><span>Find your best-fit college</span></Link>
        <Link className="menu-talk menu-mobile-only" href={CONTACT_HREF}><MessageCircle size={15} aria-hidden="true" />Talk to us</Link>
        <Link className="menu-college-login menu-mobile-only" href="/college/login"><LogIn size={15} aria-hidden="true" />College login</Link>
      </div>
    </div>
  </div>;
}
