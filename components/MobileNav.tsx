'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Building2, ClipboardCheck, FileText, GitCompareArrows, LayoutDashboard, LogIn, Menu, MessageCircle, X } from 'lucide-react';
import { COMPARE_HREF, CONTACT_HREF } from '../lib/site-nav';

const links = [
  { href: '/colleges', label: 'Colleges', icon: Building2, current: (path: string) => path === '/colleges' || path.startsWith('/colleges/') },
  { href: '/exams', label: 'Exams', icon: ClipboardCheck, current: (path: string) => path === '/exams' || path.startsWith('/exams/') },
  { href: '/courses', label: 'Courses', icon: BookOpen, current: (path: string) => path === '/courses' || path.startsWith('/courses/') },
  { href: '/articles', label: 'Articles', icon: FileText, current: (path: string) => path === '/articles' || path.startsWith('/articles/') },
  { href: COMPARE_HREF, label: 'Compare', icon: GitCompareArrows, current: (path: string) => path === COMPARE_HREF || path.startsWith('/compare-colleges') }
];

const DESKTOP = '(min-width: 1024px)';
const HOVER = '(hover: hover) and (pointer: fine)';

function menuDetails(): HTMLDetailsElement[] {
  return Array.from(document.querySelectorAll<HTMLDetailsElement>('#site-navigation details[data-mega]'));
}

/**
 * Header controller: desktop primary links, the mobile menu toggle and the small amount of
 * behaviour the server-rendered <details> mega menu needs (one open at a time, Escape,
 * outside click, hover intent on desktop, close on navigation). No menu data lives here.
 */
export default function MobileNav() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  // "College panel" when a college session hint cookie exists (the session cookie itself is httpOnly).
  const [hasPanelHint, setHasPanelHint] = useState(false);
  useEffect(() => {
    const read = () => setHasPanelHint(/(?:^|;\s*)cd_college_hint=1(?:;|$)/.test(document.cookie));
    read();
    window.addEventListener('cd-college-hint', read);
    return () => window.removeEventListener('cd-college-hint', read);
  }, [pathname]);
  const panel = hasPanelHint && pathname !== '/college/login';
  const inPanel = pathname === '/college' || pathname.startsWith('/college/');

  // Close everything after navigation.
  useEffect(() => {
    setOpen(false);
    menuDetails().forEach((item) => { item.open = false; });
  }, [pathname]);

  // Mobile drawer state lives on the shared #site-navigation element.
  useEffect(() => {
    const menu = document.getElementById('site-navigation');
    menu?.classList.toggle('menu-open', open);
    menu?.closest('.nav')?.classList.toggle('nav-menu-open', open);
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    const items = menuDetails();
    const timers = new Map<HTMLDetailsElement, number>();
    const closeOthers = (current: HTMLDetailsElement) => {
      if (!window.matchMedia(DESKTOP).matches) return;
      items.forEach((item) => { if (item !== current) item.open = false; });
    };
    const onToggle = (event: Event) => {
      const item = event.currentTarget as HTMLDetailsElement;
      if (item.open) closeOthers(item);
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !window.matchMedia(DESKTOP).matches || !window.matchMedia(HOVER).matches) return;
      const item = event.currentTarget as HTMLDetailsElement;
      window.clearTimeout(timers.get(item));
      timers.set(item, window.setTimeout(() => { item.open = true; }, 120));
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !window.matchMedia(DESKTOP).matches) return;
      const item = event.currentTarget as HTMLDetailsElement;
      window.clearTimeout(timers.get(item));
      timers.set(item, window.setTimeout(() => { item.open = false; }, 180));
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const active = items.find((item) => item.open);
      if (active) {
        active.open = false;
        active.querySelector('summary')?.focus();
        return;
      }
      setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      items.forEach((item) => { if (item.open && !item.contains(target) && window.matchMedia(DESKTOP).matches) item.open = false; });
    };
    const onFocusOut = (event: FocusEvent) => {
      const item = event.currentTarget as HTMLDetailsElement;
      const next = event.relatedTarget as Node | null;
      if (next && !item.contains(next) && window.matchMedia(DESKTOP).matches) item.open = false;
    };
    const onLinkClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('a')) {
        items.forEach((item) => { item.open = false; });
        setOpen(false);
      }
    };
    const menu = document.getElementById('site-navigation');
    items.forEach((item) => {
      item.addEventListener('toggle', onToggle);
      item.addEventListener('pointerenter', onEnter);
      item.addEventListener('pointerleave', onLeave);
      item.addEventListener('focusout', onFocusOut);
    });
    menu?.addEventListener('click', onLinkClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      items.forEach((item) => {
        item.removeEventListener('toggle', onToggle);
        item.removeEventListener('pointerenter', onEnter);
        item.removeEventListener('pointerleave', onLeave);
        item.removeEventListener('focusout', onFocusOut);
      });
      timers.forEach((timer) => window.clearTimeout(timer));
      menu?.removeEventListener('click', onLinkClick);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return <div className="mobile-navigation">
    {open && <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <div className="nav-links nav-primary">
      {links.map((link) => {
        const Icon = link.icon;
        return <Link key={link.href} href={link.href} aria-current={link.current(pathname) ? 'page' : undefined}>
          <Icon size={15} aria-hidden="true" /> {link.label}
        </Link>;
      })}
      <Link className="nav-talk" href={CONTACT_HREF} aria-current={pathname === CONTACT_HREF ? 'page' : undefined}>
        <MessageCircle size={15} aria-hidden="true" /> Talk to us
      </Link>
      <Link className="nav-college-login" href={panel ? '/college' : '/college/login'} aria-current={inPanel ? 'page' : undefined} title={panel ? 'Open your college panel' : 'Sign in to manage your college profile'}>
        {panel ? <LayoutDashboard size={15} aria-hidden="true" /> : <LogIn size={15} aria-hidden="true" />} <span className="ncl-full">{panel ? 'College panel' : 'College login'}</span><span className="ncl-short" aria-hidden="true">{panel ? 'Panel' : 'Login'}</span>
      </Link>
    </div>
    <Link className="nav-login-compact" href={panel ? '/college' : '/college/login'} aria-current={inPanel ? 'page' : undefined} aria-label={panel ? 'College panel' : 'College login'}>
      {panel ? <LayoutDashboard size={15} aria-hidden="true" /> : <LogIn size={15} aria-hidden="true" />}<span>{panel ? 'Panel' : 'Login'}</span>
    </Link>
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
    </button>
  </div>;
}
