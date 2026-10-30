'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { AdClientSettings, AdSlotConfig, AdUnit } from '../../lib/ads';

declare global {
  interface Window { adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number; pauseAdRequests?: number } }
}

const DESKTOP_QUERY = '(min-width: 768px)';

function styleObject(style: string | undefined): CSSProperties {
  const out: Record<string, string> = {};
  for (const part of String(style || '').split(';')) {
    const [rawKey, ...rest] = part.split(':');
    const key = rawKey?.trim();
    const value = rest.join(':').trim();
    if (!key || !value || /expression|url\s*\(/i.test(value)) continue;
    out[key.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())] = value;
  }
  return out as CSSProperties;
}

function sizeOf(unit: AdUnit): { width?: number; height?: number } {
  const m = /^(\d{2,4})x(\d{2,4})$/.exec(unit.sizeHint || '');
  return m ? { width: Number(m[1]), height: Number(m[2]) } : {};
}

function pickUnit(units: AdUnit[]): AdUnit | null {
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;
  const pool = units.filter((u) => u.weight > 0 && (u.device === 'all' || (u.device === 'desktop') === desktop));
  const total = pool.reduce((sum, u) => sum + u.weight, 0);
  if (!pool.length || total <= 0) return null;
  let r = Math.random() * total;
  for (const unit of pool) { r -= unit.weight; if (r < 0) return unit; }
  return pool[pool.length - 1];
}

function track(unitId: number, event: 'impression' | 'click') {
  try {
    const body = JSON.stringify({ unitId, event });
    if (!navigator.sendBeacon?.('/api/ads/track', new Blob([body], { type: 'application/json' }))) {
      void fetch('/api/ads/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  } catch { /* ignore */ }
}

function isExcluded(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r.endsWith('/') ? r : `${r}/`));
}

/**
 * Client part: lazy loads (IntersectionObserver), reserves height to avoid layout shift, shows the
 * "Advertisement" label, rotates A/B/C variants by weight and pushes adsbygoogle only for AdSense units.
 * Test mode: when the admin turned test mode on, `?adtest=1` shows dashed placeholders with the slot size.
 */
export default function AdSlotClient({ slot, settings, className }: { slot: AdSlotConfig; settings: AdClientSettings; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [mode, setMode] = useState<'pending' | 'live' | 'test' | 'hidden'>(slot.active ? 'pending' : 'hidden');
  const [visible, setVisible] = useState(false);
  const [unit, setUnit] = useState<AdUnit | null>(null);

  useEffect(() => {
    const test = settings.testMode && new URLSearchParams(window.location.search).get('adtest') === '1';
    if (isExcluded(window.location.pathname, settings.excludedRoutes)) setMode('hidden');
    else if (test) setMode('test');
    else if (!slot.active) setMode('hidden');
    else {
      const chosen = pickUnit(slot.units);
      setUnit(chosen);
      setMode(chosen ? 'live' : 'hidden');
    }
  }, [slot, settings]);

  useEffect(() => {
    if (mode !== 'live' || visible || !wrapRef.current) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: `${settings.lazyMarginPx}px 0px` });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [mode, visible, settings.lazyMarginPx]);

  useEffect(() => {
    if (mode !== 'live' || !visible || !unit) return;
    if (unit.codeType === 'adsense_ins' && !pushed.current) {
      pushed.current = true;
      try {
        const queue = (window.adsbygoogle = window.adsbygoogle || []);
        const consented = /(?:^|;\s*)cd_ad_consent=granted/.test(document.cookie);
        if (settings.nonPersonalized || (settings.consentRequired && !consented)) queue.requestNonPersonalizedAds = 1;
        queue.push({});
      } catch { /* the AdSense loader may be blocked */ }
    } else if (unit.codeType === 'html_script' && htmlRef.current && !htmlRef.current.childNodes.length) {
      // createContextualFragment runs <script> tags from the trusted admin-pasted code.
      htmlRef.current.appendChild(document.createRange().createContextualFragment(unit.html || ''));
    }
    track(unit.id, 'impression');
  }, [mode, visible, unit, settings.nonPersonalized, settings.consentRequired]);

  if (mode === 'hidden') return null;
  const reserve = mode === 'test' ? Math.max(slot.minHeight, 90) : slot.minHeight;
  const classes = ['ad-wrap', `ad-format-${slot.format}`, `ad-device-${slot.device}`, mode === 'test' ? 'ad-test' : '', className || ''].filter(Boolean).join(' ');
  const size = unit ? sizeOf(unit) : {};

  return <aside ref={wrapRef} className={classes} aria-label="Advertisement" data-ad-slot-key={slot.key} style={{ minHeight: reserve + 22 }}>
    <span className="ad-label">Advertisement</span>
    {mode === 'test' && <div className="ad-placeholder" style={{ minHeight: reserve }}>
      <strong>{slot.key}</strong><span>{slot.format.replace(/_/g, ' ')} · {slot.device} · reserved {slot.minHeight}px{slot.active ? ' · LIVE' : ' · off'}</span>
    </div>}
    {mode === 'live' && unit && <div className="ad-inner" style={{ minHeight: reserve }}>
      {visible && unit.codeType === 'adsense_ins' && unit.ins && <ins
        className="adsbygoogle"
        style={{ display: 'block', ...styleObject(unit.ins.style) }}
        data-ad-client={unit.ins['data-ad-client']}
        data-ad-slot={unit.ins['data-ad-slot']}
        data-ad-format={unit.ins['data-ad-format']}
        data-ad-layout={unit.ins['data-ad-layout']}
        data-ad-layout-key={unit.ins['data-ad-layout-key']}
        data-full-width-responsive={unit.ins['data-full-width-responsive']}
        data-matched-content-ui-type={unit.ins['data-matched-content-ui-type']}
        data-matched-content-rows-num={unit.ins['data-matched-content-rows-num']}
        data-matched-content-columns-num={unit.ins['data-matched-content-columns-num']}
      />}
      {unit.codeType === 'html_script' && <div ref={htmlRef} className="ad-html" />}
      {visible && unit.codeType === 'image_link' && unit.imageUrl && unit.linkUrl && <a href={unit.linkUrl} target="_blank" rel="sponsored noopener noreferrer" onClick={() => track(unit.id, 'click')}>
        <img src={unit.imageUrl} alt={unit.alt || 'Advertisement'} width={size.width} height={size.height} loading="lazy" decoding="async" />
      </a>}
    </div>}
  </aside>;
}
