'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * Lazy-load CD Saathi so the chat bundle stays off the critical path (no SSR).
 * Icon + widget mount only after a short post-load delay.
 */
const CdSaathiChat = dynamic(() => import('./CdSaathiChat'), {
  ssr: false,
  loading: () => null
});

const LOAD_DELAY_MS = 2000;

export default function CdSaathiLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;
  return <CdSaathiChat />;
}
