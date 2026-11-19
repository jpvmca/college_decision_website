'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Thin top progress bar shown the moment an internal link is clicked, until the new page is on screen.
 * Server-rendered pages (e.g. college profiles) can take a moment on a slow network; without this the click
 * looked like nothing happened. Pure client UI: page HTML, status codes and SEO output are unchanged.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Capture phase: next/link calls preventDefault() on its own clicks, so a bubbling listener never sees them.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return;
      let url: URL;
      try { url = new URL(anchor.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page / #anchor
      if (/^\/(api|_next)\//.test(url.pathname)) return;
      if (timer.current) clearTimeout(timer.current);
      // Fast navigations finish before the bar would appear, so it never flashes.
      timer.current = setTimeout(() => setActive(true), 120);
    };
    const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setActive(false); };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', stop);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('popstate', stop); };
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setActive(false);
  }, [pathname]);

  // Safety net: never leave the bar running (e.g. navigation cancelled or failed).
  useEffect(() => {
    if (!active) return;
    const stop = setTimeout(() => setActive(false), 15000);
    return () => clearTimeout(stop);
  }, [active]);

  return <div className={`nav-progress${active ? ' is-active' : ''}`} role="progressbar" aria-hidden={!active} aria-label="Loading page" />;
}
