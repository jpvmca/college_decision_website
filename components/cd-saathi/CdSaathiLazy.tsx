'use client';

import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { usePathname } from 'next/navigation';
import { SAATHI_HREF, SAATHI_NAME } from '../../lib/site-nav';
import CdSaathiFab from './CdSaathiFab';

/**
 * Floating CD Saathi launcher.
 *
 * Until the visitor opens the chat, this renders only a static FAB (plus a local, timer-based nudge):
 * no chat JS chunk, no /api/chat session, no recommendation or journey-profile lookups and no
 * chat tracking. The chat module is fetched with a dynamic import on the first click and then
 * opens itself (`autoOpen`), which is when the session starts and `chat_opened` is tracked.
 * A plain import() inside the click path is used instead of next/dynamic because next/dynamic
 * lets the framework preload the chunk with the page.
 *
 * If the visitor had the chat open before a full reload (sessionStorage), it is restored right away,
 * because they already opened it.
 */
type ChatComponent = ComponentType<{ variant?: 'widget' | 'page'; autoOpen?: boolean }>;
let chatModule: Promise<ChatComponent> | null = null;
function loadChat() {
  if (!chatModule) {
    chatModule = import('./CdSaathiChat').then((m) => m.default as ChatComponent);
    chatModule.catch(() => {
      chatModule = null; // allow a retry on the next click
    });
  }
  return chatModule;
}

const NUDGE_KEY = 'cd_saathi_nudge_shown';
const OPEN_KEY = 'cd_saathi_open';
const MINIMIZED_KEY = 'cd_saathi_minimized';

function nudgeDelayMs(pathname: string) {
  if (/\/colleges\/[^/]+/.test(pathname)) return 12000;
  if (/-colleges/.test(pathname)) return 10000;
  if (/\/exams\//.test(pathname) || /\/courses\//.test(pathname)) return 14000;
  return 18000;
}

function hiddenOn(pathname: string) {
  return (
    /^\/(college|privacy-policy|terms-and-conditions|disclaimer|saathi|college-decision-saathi)(\/|$)/.test(pathname) ||
    pathname === SAATHI_HREF
  );
}

function readSession(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore private mode / quota
  }
}

export default function CdSaathiLazy() {
  const pathname = usePathname() || '/';
  const hidden = hiddenOn(pathname);
  const [loaded, setLoaded] = useState(false);
  const [Chat, setChat] = useState<ChatComponent | null>(null);
  const [failed, setFailed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [nudge, setNudge] = useState(false);

  const open = useCallback(() => {
    setNudge(false);
    setFailed(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || Chat) return;
    let alive = true;
    loadChat()
      .then((component) => {
        if (alive) setChat(() => component);
      })
      .catch(() => {
        if (!alive) return;
        setLoaded(false);
        setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [loaded, Chat]);

  // Restore a chat the visitor had already opened (full reload), and the "Resume chat" label.
  useEffect(() => {
    if (readSession(OPEN_KEY) === '1') setLoaded(true);
    else if (readSession(MINIMIZED_KEY) === '1') setMinimized(true);
  }, []);

  // Proactive nudge, once per browser session. Purely local: no network.
  useEffect(() => {
    if (loaded || hidden || minimized) return;
    if (readSession(NUDGE_KEY) === '1') return;
    const show = () => {
      setNudge(true);
      writeSession(NUDGE_KEY, '1');
    };
    const timer = window.setTimeout(show, nudgeDelayMs(pathname));
    const onExit = (e: MouseEvent) => {
      if (e.clientY > 16) return;
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onExit);
      show();
    };
    document.addEventListener('mouseout', onExit);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onExit);
    };
  }, [pathname, loaded, hidden, minimized]);

  if (Chat) return <Chat variant="widget" autoOpen />;
  if (hidden) return null;
  if (loaded) {
    return (
      <div className="cds-root">
        <CdSaathiFab onClick={() => undefined} disabled sub="Opening…" />
      </div>
    );
  }

  return (
    <div className="cds-root">
      {nudge ? (
        <div className="cds-nudge" role="status">
          <p>Need a quick college shortlist? {SAATHI_NAME} can help from what you’re browsing.</p>
          <div className="cds-nudge-actions">
            <button type="button" className="cds-nudge-dismiss" onClick={() => setNudge(false)}>
              Not now
            </button>
            <button type="button" className="cds-nudge-open" onClick={open}>
              Chat
            </button>
          </div>
        </div>
      ) : null}
      <CdSaathiFab
        onClick={open}
        title={minimized ? 'Resume chat' : SAATHI_NAME}
        sub={failed ? 'Couldn’t load, tap to retry' : minimized ? 'Continue where you left' : 'Ask me anything'}
        unread={nudge ? 1 : 0}
      />
    </div>
  );
}
