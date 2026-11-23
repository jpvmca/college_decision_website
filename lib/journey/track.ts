'use client';

import { parsePageEntities, type PageEntities } from './parse-page-entities';

const VISITOR_KEY = 'cd_visitor_id';
const SESSION_KEY = 'cd_session_id';
const SESSION_AT_KEY = 'cd_session_at';
const CONSENT_KEY = 'cd_consent';
const LANDING_KEY = 'cd_landing';
const SEQ_KEY = 'cd_page_seq';
const SESSION_IDLE_MS = 30 * 60 * 1000;
/**
 * Client-side batching: events queue in memory and go out as one POST at most every FLUSH_MS,
 * or as soon as MAX_QUEUE items are waiting. Tab hide / pagehide flushes with sendBeacon.
 * Navigations never trigger their own request.
 */
const FLUSH_MS = 12000;
const MAX_QUEUE = 20;
const MAX_BATCH = 50;
const MAX_BODY_BYTES = 60000;
const MAX_PROPS_CHARS = 2000;
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|headless|lighthouse|pingdom|uptimerobot|semrush|ahrefs|bytespider|gptbot|claudebot|perplexity|google-inspectiontool|chrome-lighthouse/i;
const ENDPOINT = '/api/track/batch';

type Consent = { analytics: boolean; marketing: boolean; decided: boolean };

type QueueItem =
  | {
      type: 'page_view';
      path: string;
      url?: string;
      seq_no?: number;
      dwell_seconds?: number | null;
      max_scroll?: number | null;
      viewed_at?: string;
      entities?: PageEntities;
    }
  | {
      type: 'event';
      event_name: string;
      props?: Record<string, unknown>;
      page_path?: string;
      created_at?: string;
    };

let queue: QueueItem[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function cookieGet(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function cookieSet(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 86400;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function storageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / private mode
  }
}

export function getConsent(): Consent {
  try {
    const raw = storageGet(CONSENT_KEY) || cookieGet(CONSENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Consent;
      return {
        analytics: parsed.analytics !== false,
        marketing: Boolean(parsed.marketing),
        decided: Boolean(parsed.decided)
      };
    }
  } catch {
    // fall through
  }
  // First-party journey analytics are on by default (no consent banner). Marketing stays off.
  return { analytics: true, marketing: false, decided: true };
}

export function setConsent(next: Partial<Consent>) {
  const current = getConsent();
  const value: Consent = {
    analytics: next.analytics ?? current.analytics,
    marketing: next.marketing ?? current.marketing,
    decided: next.decided ?? true
  };
  const raw = JSON.stringify(value);
  storageSet(CONSENT_KEY, raw);
  cookieSet(CONSENT_KEY, raw, 365);
  return value;
}

export function getVisitorId() {
  let id = cookieGet(VISITOR_KEY) || storageGet(VISITOR_KEY);
  if (!id) {
    id = uuid();
    cookieSet(VISITOR_KEY, id, 365);
    storageSet(VISITOR_KEY, id);
  } else {
    cookieSet(VISITOR_KEY, id, 365);
    storageSet(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId() {
  const now = Date.now();
  let id = storageGet(SESSION_KEY);
  const at = Number(storageGet(SESSION_AT_KEY) || 0);
  if (!id || !at || now - at > SESSION_IDLE_MS) {
    id = uuid();
    storageSet(SESSION_KEY, id);
  }
  storageSet(SESSION_AT_KEY, String(now));
  return id;
}

function touchSession() {
  storageSet(SESSION_AT_KEY, String(Date.now()));
}

function nextSeq() {
  const n = Number(storageGet(SEQ_KEY) || 0) + 1;
  storageSet(SEQ_KEY, String(n));
  return n;
}

function readUtm(search: string) {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 200);
  }
  return Object.keys(utm).length ? utm : null;
}

function deviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

let botChecked: boolean | null = null;
function isBotClient() {
  if (botChecked !== null) return botChecked;
  try {
    botChecked = typeof navigator !== 'undefined' && BOT_UA.test(navigator.userAgent || '');
  } catch {
    botChecked = false;
  }
  return botChecked;
}

function enqueue(item: QueueItem) {
  if (typeof window === 'undefined' || isBotClient()) return;
  queue.push(item);
  // Hard cap so a stuck tab can't grow memory without bound.
  if (queue.length > MAX_BATCH * 4) queue = queue.slice(-MAX_BATCH * 4);
  if (queue.length >= MAX_QUEUE) {
    void flushQueue();
    return;
  }
  if (!flushTimer) flushTimer = setTimeout(() => void flushQueue(), FLUSH_MS);
}

function safeProps(props: Record<string, unknown>) {
  try {
    const raw = JSON.stringify(props ?? {});
    if (raw.length <= MAX_PROPS_CHARS) return props;
    return { truncated: true };
  } catch {
    return {};
  }
}

async function sendBatch(items: QueueItem[], useBeacon: boolean) {
  if (!items.length || typeof window === 'undefined') return false;
  const consent = getConsent();
  const payload = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    consentAnalytics: consent.analytics,
    consentMarketing: consent.marketing,
    device: deviceType(),
    landingUrl: storageGet(LANDING_KEY) || window.location.href,
    referrer: document.referrer || null,
    utm: readUtm(window.location.search),
    items
  };
  let body = JSON.stringify(payload);
  if (body.length > MAX_BODY_BYTES) {
    // Oversized batch: keep only page views (small, most useful), never block the page.
    payload.items = items.filter((i) => i.type === 'page_view').slice(0, 20);
    if (!payload.items.length) return true;
    body = JSON.stringify(payload);
    if (body.length > MAX_BODY_BYTES) return true;
  }
  if (useBeacon && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      return navigator.sendBeacon(ENDPOINT, blob);
    } catch {
      // fall through to fetch
    }
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
      cache: 'no-store'
    });
    return res.ok || res.status === 202 || res.status === 204;
  } catch {
    return false;
  }
}

export async function flushQueue(useBeacon = false) {
  if (flushing) return;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  flushing = true;
  try {
    while (queue.length) {
      const batch = queue.splice(0, MAX_BATCH);
      touchSession();
      // Beacon is fire-and-forget on unload; no retry there (the page is going away).
      const ok = await sendBatch(batch, useBeacon);
      if (!ok) {
        // Drop on failure to avoid retry storms against a struggling backend; never throw into UI.
        queue = [];
        break;
      }
      if (!useBeacon) break; // timer flushes send one batch; the next timer picks up the rest
    }
  } finally {
    flushing = false;
    if (queue.length && !flushTimer) flushTimer = setTimeout(() => void flushQueue(), FLUSH_MS);
  }
}

/** Flush everything with sendBeacon (tab hidden / page unloading). */
export function flushOnHide() {
  if (flushing) {
    // A timer flush is in flight; beacon the remainder so nothing is lost on unload.
    if (!queue.length) return;
    const batch = queue.splice(0, MAX_BATCH);
    void sendBatch(batch, true);
    return;
  }
  void flushQueue(true);
}

export function trackPageView(path: string, search = '') {
  try {
    touchSession();
    if (!storageGet(LANDING_KEY)) storageSet(LANDING_KEY, `${path}${search}`);
    const entities = parsePageEntities(path);
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}${search}` : path;
    enqueue({
      type: 'page_view',
      path,
      url,
      seq_no: nextSeq(),
      viewed_at: new Date().toISOString(),
      entities
    });

    // Auto semantic events from page type
    if (entities.page_type === 'college_detail' && entities.college_slug) {
      track('view_college', { college_slug: entities.college_slug });
    } else if (entities.page_type === 'exam_detail' && entities.exam_slug) {
      track('view_exam', { exam_slug: entities.exam_slug });
    } else if (entities.page_type === 'course_detail' && entities.course_slug) {
      track('view_course', { course_slug: entities.course_slug });
    } else if (entities.page_type === 'compare_tool') {
      track('click_compare', { source: 'compare_page' });
    }
  } catch {
    // never throw
  }
}

export function trackPageLeave(path: string, dwellSeconds: number, maxScroll: number) {
  try {
    enqueue({
      type: 'page_view',
      path,
      seq_no: nextSeq(),
      dwell_seconds: Math.max(0, Math.round(dwellSeconds)),
      max_scroll: Math.max(0, Math.min(100, Math.round(maxScroll))),
      viewed_at: new Date().toISOString(),
      entities: parsePageEntities(path)
    });
  } catch {
    // never throw
  }
}

/** Fire a named journey event. Failures are silent. */
export function track(eventName: string, props: Record<string, unknown> = {}) {
  try {
    if (!eventName) return;
    enqueue({
      type: 'event',
      event_name: String(eventName).slice(0, 80),
      props: safeProps(props),
      page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      created_at: new Date().toISOString()
    });
  } catch {
    // never throw
  }
}

export type { PageEntities };
