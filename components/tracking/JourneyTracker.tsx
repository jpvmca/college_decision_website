'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { flushQueue, getVisitorId, trackPageLeave, trackPageView } from '../../lib/journey/track';

/**
 * Mount once in root layout. Tracks SPA navigations, dwell, and scroll depth.
 * Never throws into the UI.
 */
export default function JourneyTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startedAt = useRef(Date.now());
  const maxScroll = useRef(0);
  const lastPath = useRef('');

  useEffect(() => {
    try {
      getVisitorId();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      try {
        const doc = document.documentElement;
        const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
        const pct = Math.round((window.scrollY / scrollable) * 100);
        if (pct > maxScroll.current) maxScroll.current = Math.min(100, pct);
      } catch {
        // ignore
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const flushLeave = () => {
      try {
        if (!lastPath.current) return;
        const dwell = (Date.now() - startedAt.current) / 1000;
        trackPageLeave(lastPath.current, dwell, maxScroll.current);
      } catch {
        // ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushLeave();
    };
    window.addEventListener('pagehide', flushLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flushLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    try {
      const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
      if (lastPath.current && lastPath.current !== pathname) {
        const dwell = (Date.now() - startedAt.current) / 1000;
        trackPageLeave(lastPath.current, dwell, maxScroll.current);
        void flushQueue(true);
      }
      startedAt.current = Date.now();
      maxScroll.current = 0;
      lastPath.current = pathname || '/';
      trackPageView(pathname || '/', search);
    } catch {
      // ignore
    }
  }, [pathname, searchParams]);

  return null;
}
