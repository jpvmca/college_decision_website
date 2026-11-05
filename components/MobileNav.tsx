'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Building2, ClipboardCheck, FileText, GitCompareArrows, Menu, X } from 'lucide-react';

const links = [
  { href: '/colleges', label: 'Colleges', icon: Building2, current: (path: string) => path === '/colleges' || path.startsWith('/colleges/') },
  { href: '/exams', label: 'Exams', icon: ClipboardCheck, current: (path: string) => path === '/exams' || path.startsWith('/exams/') },
  { href: '/courses', label: 'Courses', icon: BookOpen, current: (path: string) => path === '/courses' || path.startsWith('/courses/') },
  { href: '/articles', label: 'Articles', icon: FileText, current: (path: string) => path === '/articles' || path.startsWith('/articles/') }
];

export default function MobileNav() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const compareCurrent = pathname.startsWith('/compare-colleges');

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return <div className="mobile-navigation">
    {open && <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
    </button>
    <div id="site-navigation" className={open ? 'nav-links mobile-open' : 'nav-links'}>
      {links.map((link) => {
        const Icon = link.icon;
        return <Link key={link.href} href={link.href} aria-current={link.current(pathname) ? 'page' : undefined} onClick={() => setOpen(false)}>
          <Icon size={15} aria-hidden="true" /> {link.label}
        </Link>;
      })}
      <Link className="nav-compare" href="/compare-colleges-2026" aria-current={compareCurrent ? 'page' : undefined} onClick={() => setOpen(false)}>
        <GitCompareArrows size={15} aria-hidden="true" /> Compare<span className="nav-compare-extra"> colleges</span>
      </Link>
    </div>
  </div>;
}
