'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { COMPARE_HREF, SAATHI_HREF, SAATHI_NAME } from '../../lib/site-nav';
import { openEnquiryPopup } from '../../lib/college-apply';
import { getSessionId, getVisitorId, track } from '../../lib/journey/track';
import { instituteLogoUrl } from '../../lib/api';
import CollegeViewDetailsModal from '../CollegeViewDetailsModal';
import {
  markCardClick,
  sendChatFeedback,
  startChatSession,
  streamChatMessage,
  type CollegeCard,
  type QuickReply
} from '../../lib/cd-saathi/api';
type Role = 'user' | 'assistant';
type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  messageId?: number;
  cards?: CollegeCard[];
  feedback?: 1 | -1 | 0;
  streaming?: boolean;
};

const HISTORY_KEY = 'cd_saathi_history_v1';
const MINIMIZED_KEY = 'cd_saathi_minimized';
const NUDGE_KEY = 'cd_saathi_nudge_shown';
const OPEN_KEY = 'cd_saathi_open';

const CARD_BATCH = 10;

const PLACEHOLDER_PROMPTS = [
  'Show me Lucknow colleges…',
  'MBA colleges under ₹10 lakh…',
  'Which colleges accept JEE Main?…',
  'Best BTech colleges in Pune…',
  'Tell me about CAT exam…',
  'Fees for engineering in Delhi…',
  'Compare Amity vs Lucknow University…',
  'NEET colleges in Uttar Pradesh…'
];

function useTypingPlaceholder(active: boolean, prompts: string[]) {
  const [text, setText] = useState(prompts[0] || '');
  useEffect(() => {
    if (!active || !prompts.length) return;
    let promptIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const full = prompts[promptIdx] || '';
      if (!deleting) {
        charIdx += 1;
        setText(full.slice(0, charIdx));
        if (charIdx >= full.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1600);
          return;
        }
        timer = window.setTimeout(tick, 42 + Math.random() * 36);
        return;
      }
      charIdx -= 1;
      setText(full.slice(0, Math.max(0, charIdx)));
      if (charIdx <= 0) {
        deleting = false;
        promptIdx = (promptIdx + 1) % prompts.length;
        timer = window.setTimeout(tick, 320);
        return;
      }
      timer = window.setTimeout(tick, 22);
    };
    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [active, prompts]);
  return text;
}

function CdsCollegeCards(props: {
  cards: CollegeCard[];
  msgId: string;
  chatSessionId: number | null;
  onViewUnpublished: (collegeId: number) => void;
  onCounselling: () => void;
  hideOnNavigate: () => void;
  track: typeof track;
  rich?: boolean;
}) {
  const { cards, msgId, chatSessionId, onViewUnpublished, onCounselling, hideOnNavigate, rich } = props;
  const [visible, setVisible] = useState(Math.min(CARD_BATCH, cards.length));
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const loadingMore = useRef(false);

  useEffect(() => {
    setVisible(Math.min(CARD_BATCH, cards.length));
  }, [cards]);

  const loadMore = useCallback(() => {
    if (loadingMore.current) return;
    if (visible >= cards.length) return;
    loadingMore.current = true;
    setVisible((n) => Math.min(n + CARD_BATCH, cards.length));
    window.setTimeout(() => {
      loadingMore.current = false;
    }, 200);
  }, [cards.length, visible]);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 48;
    if (nearEnd) loadMore();
  }, [loadMore]);

  const shown = cards.slice(0, visible);
  const remaining = Math.max(0, cards.length - visible);

  return (
    <div className="cds-cards-wrap">
      <div
        className="cds-cards"
        ref={scrollerRef}
        onScroll={onScroll}
        role="list"
        aria-label="College shortlist"
      >
        {shown.map((card) => {
          const fee = money(card.feesMin);
          const feeMax = money(card.feesMax);
          const place = card.placementAvg != null ? `${card.placementAvg} LPA avg` : null;
          const exams = card.examNames.slice(0, rich ? 6 : 3).map((e) => e.toUpperCase());
          const courses = (card.courseNames || []).slice(0, rich ? 4 : 2);
          const logoSrc = card.logo ? instituteLogoUrl(card.logo) : '';
          const typeLabel = card.instituteType
            ? String(card.instituteType).replace(/-/g, ' ')
            : null;
          return (
            <article className={`cds-card${rich ? ' is-rich' : ''}`} key={`${msgId}-${card.collegeId}`} role="listitem">
              <div className="cds-card-top">
                <div className="cds-card-logo" aria-hidden={!logoSrc}>
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt="" width={56} height={56} loading="lazy" />
                  ) : (
                    <span>{card.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="cds-card-heading">
                  <h3>{card.name}</h3>
                  <p className="cds-card-loc">{[card.city, card.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <ul className="cds-card-facts">
                {fee ? (
                  <li>
                    <strong>Fees</strong>
                    <span>
                      {fee}
                      {feeMax && feeMax !== fee ? ` – ${feeMax}` : ''}
                    </span>
                  </li>
                ) : null}
                {place ? (
                  <li>
                    <strong>Placement</strong>
                    <span>{place}</span>
                  </li>
                ) : null}
                {typeLabel ? (
                  <li>
                    <strong>Type</strong>
                    <span style={{ textTransform: 'capitalize' }}>{typeLabel}</span>
                  </li>
                ) : null}
                {rich && courses.length ? (
                  <li>
                    <strong>Courses</strong>
                    <span>{courses.join(', ')}</span>
                  </li>
                ) : null}
              </ul>
              {rich && exams.length ? (
                <div className="cds-card-exams" aria-label="Exams">
                  {exams.map((ex) => (
                    <span key={ex}>{ex}</span>
                  ))}
                </div>
              ) : null}
              {!rich ? (
                <p className="cds-card-meta">
                  {[fee, exams.slice(0, 3).join(', '), place].filter(Boolean).join(' · ')}
                  {card.reason ? `\n${card.reason}` : ''}
                </p>
              ) : card.reason ? (
                <p className="cds-card-meta">{card.reason}</p>
              ) : null}
              <div className="cds-card-actions">
                {card.isPublished === false ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      props.track('card_clicked', { action: 'view', college_slug: card.slug });
                      if (chatSessionId) void markCardClick(chatSessionId, card.collegeId, 'view');
                      onViewUnpublished(card.collegeId);
                    }}
                  >
                    View
                  </button>
                ) : (
                  <Link
                    href={`/colleges/${card.slug}`}
                    className="primary"
                    onClick={() => {
                      props.track('card_clicked', { action: 'view', college_slug: card.slug });
                      if (chatSessionId) void markCardClick(chatSessionId, card.collegeId, 'view');
                      hideOnNavigate();
                    }}
                  >
                    View
                  </Link>
                )}
                <Link
                  href={COMPARE_HREF}
                  onClick={() => {
                    props.track('card_clicked', { action: 'compare', college_slug: card.slug });
                    if (chatSessionId) void markCardClick(chatSessionId, card.collegeId, 'compare');
                    hideOnNavigate();
                  }}
                >
                  Compare
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    props.track('card_clicked', { action: 'counselling', college_slug: card.slug });
                    if (chatSessionId) void markCardClick(chatSessionId, card.collegeId, 'counselling');
                    onCounselling();
                  }}
                >
                  Yes, for counselling
                </button>
              </div>
            </article>
          );
        })}
        {remaining > 0 ? (
          <button type="button" className="cds-cards-more" onClick={loadMore}>
            +{Math.min(CARD_BATCH, remaining)} more
          </button>
        ) : null}
      </div>
    </div>
  );
}

function money(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return null;
  if (n >= 100000) return `₹${(Math.round((n / 100000) * 10) / 10).toLocaleString('en-IN')}L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function loadHistory(): { chatSessionId: number | null; messages: ChatMessage[] } {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return { chatSessionId: null, messages: [] };
    const parsed = JSON.parse(raw) as { chatSessionId?: number; messages?: ChatMessage[] };
    return {
      chatSessionId: parsed.chatSessionId || null,
      messages: Array.isArray(parsed.messages) ? parsed.messages.filter((m) => m && m.text) : []
    };
  } catch {
    return { chatSessionId: null, messages: [] };
  }
}

function saveHistory(chatSessionId: number | null, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        chatSessionId,
        messages: messages.slice(-40).map(({ streaming, ...rest }) => rest)
      })
    );
  } catch {
    // ignore
  }
}

function nudgeDelayMs(pathname: string) {
  if (/\/colleges\/[^/]+/.test(pathname)) return 12000;
  if (/-colleges/.test(pathname)) return 10000;
  if (/\/exams\//.test(pathname) || /\/courses\//.test(pathname)) return 14000;
  return 18000;
}

export default function CdSaathiChat({ variant = 'widget' }: { variant?: 'widget' | 'page' }) {
  const pathname = usePathname() || '/';
  const isPage = variant === 'page';
  const [open, setOpen] = useState(isPage);
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<QuickReply[]>([]);
  const [previewCollegeId, setPreviewCollegeId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const booted = useRef(false);

  const pageUrl = useMemo(() => {
    if (typeof window === 'undefined') return pathname;
    return `${window.location.pathname}${window.location.search}`;
  }, [pathname]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    try {
      const hist = loadHistory();
      if (hist.messages.length) {
        setMessages(hist.messages);
        setChatSessionId(hist.chatSessionId);
      }
      if (sessionStorage.getItem(OPEN_KEY) === '1') setOpen(true);
      if (sessionStorage.getItem(MINIMIZED_KEY) === '1') setMinimized(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    saveHistory(chatSessionId, messages);
  }, [chatSessionId, messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, chips, busy]);

  // Proactive nudge — once per browser session
  useEffect(() => {
    if (open || minimized) return;
    try {
      if (sessionStorage.getItem(NUDGE_KEY) === '1') return;
    } catch {
      return;
    }
    const delay = nudgeDelayMs(pathname);
    const timer = window.setTimeout(() => {
      setNudge(true);
      setUnread((n) => Math.max(n, 1));
      try {
        sessionStorage.setItem(NUDGE_KEY, '1');
      } catch {
        // ignore
      }
    }, delay);

    const onExit = (e: MouseEvent) => {
      if (e.clientY > 16) return;
      setNudge(true);
      setUnread((n) => Math.max(n, 1));
      try {
        sessionStorage.setItem(NUDGE_KEY, '1');
      } catch {
        // ignore
      }
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onExit);
    };
    document.addEventListener('mouseout', onExit);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onExit);
    };
  }, [pathname, open, minimized]);

  const ensureSession = useCallback(async () => {
    if (chatSessionId) return chatSessionId;
    const data = await startChatSession({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      pageUrl
    });
    setChatSessionId(data.chatSessionId);
    setChips(data.quickReplies || []);
    setMessages((prev) => {
      if (prev.length) return prev;
      return [{ id: `g-${data.chatSessionId}`, role: 'assistant', text: data.greeting, messageId: undefined }];
    });
    return data.chatSessionId;
  }, [chatSessionId, pageUrl]);

  const openChat = useCallback(async () => {
    setOpen(true);
    setMinimized(false);
    setNudge(false);
    setUnread(0);
    try {
      sessionStorage.setItem(OPEN_KEY, '1');
      sessionStorage.setItem(MINIMIZED_KEY, '0');
    } catch {
      // ignore
    }
    track('chat_opened', { path: pathname });
    try {
      await ensureSession();
    } catch {
      setMessages([{ id: 'err', role: 'assistant', text: 'I couldn’t connect just now. Please try again in a moment.' }]);
    }
  }, [ensureSession, pathname]);

  const closeChat = () => {
    setOpen(false);
    setMinimized(false);
    try {
      sessionStorage.setItem(OPEN_KEY, '0');
      sessionStorage.setItem(MINIMIZED_KEY, '0');
    } catch {
      // ignore
    }
  };

  const minimiseChat = () => {
    setOpen(false);
    setMinimized(true);
    try {
      sessionStorage.setItem(OPEN_KEY, '0');
      sessionStorage.setItem(MINIMIZED_KEY, '1');
    } catch {
      // ignore
    }
  };

  /** Hide the modal when the user follows an in-site link (View / Compare). */
  const hideOnNavigate = () => {
    setOpen(false);
    setMinimized(true);
    try {
      sessionStorage.setItem(OPEN_KEY, '0');
      sessionStorage.setItem(MINIMIZED_KEY, '1');
    } catch {
      // ignore
    }
  };

  /** Use the existing site enquiry popup (StudentLeadPopup) — not a separate CD Saathi form. */
  const openSiteEnquiry = () => {
    track('lead_prompt_shown', { source: 'cd_saathi' });
    setMinimized(true);
    try {
      sessionStorage.setItem(MINIMIZED_KEY, '1');
    } catch {
      // ignore
    }
    openEnquiryPopup();
  };

  const send = async (text?: string, quickReplyId?: string) => {
    const content = (text ?? input).trim();
    if ((!content && !quickReplyId) || busy) return;
    setInput('');
    setBusy(true);
    // Counselling: open existing enquiry popup immediately (don't wait for stream).
    if (quickReplyId === 'talk:counsellor') openSiteEnquiry();
    setChips([]);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content || (quickReplyId || '…')
    };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '', streaming: true }]);
    track('chat_message_sent', { quickReplyId: quickReplyId || null });

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const sessionId = await ensureSession();
      let cards: CollegeCard[] = [];
      await streamChatMessage(
        { chatSessionId: sessionId, text: content || undefined, quickReplyId },
        {
          onToken: (chunk) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, text: `${m.text}${chunk}` } : m))
            );
          },
          onCards: (next) => {
            cards = next;
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, cards: next } : m)));
          },
          onQuickReplies: setChips,
          onLeadPrompt: (payload) => {
            if (payload.show) openSiteEnquiry();
          },
          onDone: (messageId) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, messageId, streaming: false, cards: m.cards || cards } : m))
            );
          },
          onError: (message) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, text: message, streaming: false } : m))
            );
          }
        },
        controller.signal
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: m.text || 'Something went wrong. Please try again.', streaming: false } : m))
      );
    } finally {
      setBusy(false);
    }
  };

  const onFeedback = async (msg: ChatMessage, thumbs: 1 | -1) => {
    if (!msg.messageId) return;
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, feedback: thumbs } : m)));
    await sendChatFeedback(msg.messageId, thumbs);
  };

  useEffect(() => {
    if (!isPage) return;
    void openChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPage]);

  // Keep the floating widget off panel/legal pages and the full Saathi page (dedicated UI there).
  if (
    !isPage &&
    (/^\/(college|privacy-policy|terms-and-conditions|disclaimer|saathi|college-decision-saathi)(\/|$)/.test(pathname) ||
      pathname === SAATHI_HREF)
  ) {
    return null;
  }

  const TitleTag = isPage ? 'h1' : 'h2';
  const userSent = messages.some((m) => m.role === 'user');
  const showStarters = isPage && !userSent && !busy && messages.some((m) => m.role === 'assistant');
  const typingPlaceholder = useTypingPlaceholder(open && !input && !busy, PLACEHOLDER_PROMPTS);
  const firstAssistantId = messages.find((m) => m.role === 'assistant')?.id;

  const chatBody = (
    <>
            <header className="cds-header">
              <div className="cds-header-avatar" aria-hidden="true">
                CD
              </div>
              <div>
                <TitleTag className="cds-header-title">{SAATHI_NAME}</TitleTag>
                <p className="cds-online">
                  <i aria-hidden="true" /> Online
                </p>
              </div>
              {!isPage ? (
                <div className="cds-header-actions">
                  <button type="button" className="cds-icon-btn" aria-label="Minimise chat" onClick={minimiseChat}>
                    –
                  </button>
                  <button type="button" className="cds-icon-btn" aria-label="Close chat" onClick={closeChat}>
                    ×
                  </button>
                </div>
              ) : null}
            </header>

            <div className="cds-messages" ref={listRef} aria-live="polite">
              {messages.map((msg) => {
                const isWelcome = msg.role === 'assistant' && msg.id === firstAssistantId && !userSent;
                return (
                  <div key={msg.id} className={`cds-msg cds-msg-${msg.role}`}>
                    {isWelcome ? (
                      <div className="cds-welcome">
                        <p className="cds-welcome-kicker">College · Course · Exam buddy</p>
                        <p className="cds-welcome-text">{msg.text}</p>
                        <div className="cds-welcome-tags" aria-hidden="true">
                          <span>Colleges</span>
                          <span>Courses</span>
                          <span>Exams</span>
                          <span>Fees</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`cds-bubble cds-bubble-${msg.role}`}>
                        {msg.streaming && !msg.text ? (
                          <div className="cds-typing" aria-label={`${SAATHI_NAME} is typing`}>
                            <span /><span /><span />
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.cards?.length ? (
                      <CdsCollegeCards
                        cards={msg.cards}
                        msgId={msg.id}
                        chatSessionId={chatSessionId}
                        track={track}
                        rich={isPage}
                        hideOnNavigate={hideOnNavigate}
                        onViewUnpublished={(id) => setPreviewCollegeId(id)}
                        onCounselling={() => openSiteEnquiry()}
                      />
                    ) : null}
                    {msg.role === 'assistant' && msg.messageId && !msg.streaming && !isWelcome ? (
                      <div className="cds-feedback">
                        <button
                          type="button"
                          className={msg.feedback === 1 ? 'is-on' : undefined}
                          aria-label="Helpful"
                          onClick={() => void onFeedback(msg, 1)}
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          className={msg.feedback === -1 ? 'is-on' : undefined}
                          aria-label="Not helpful"
                          onClick={() => void onFeedback(msg, -1)}
                        >
                          👎
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {showStarters ? (
                <div className="cds-starters" aria-label="Try asking">
                  <p className="cds-starters-label">Try one of these to start</p>
                  <div className="cds-starters-grid">
                    {[
                      { title: 'Colleges by city', text: 'Show me Lucknow colleges', hint: 'City shortlist with logos' },
                      { title: 'Course + budget', text: 'MBA colleges under 10 lakh', hint: 'Fees-first shortlist' },
                      { title: 'Exam path', text: 'Which colleges accept JEE Main?', hint: 'Entrance → colleges' },
                      { title: 'One college', text: 'Tell me about Lucknow University', hint: 'Fees, type, placements' }
                    ].map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        className="cds-starter"
                        onClick={() => void send(item.text)}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {chips.length && !busy ? (
              <div className="cds-chips">
                {chips.map((chip) => (
                  <button key={chip.id} type="button" className="cds-chip" onClick={() => void send(chip.label, chip.id)}>
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              className="cds-composer"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={typingPlaceholder || 'Ask about colleges, fees, exams…'}
                maxLength={1000}
                disabled={busy}
                aria-label={`Message ${SAATHI_NAME}`}
              />
              <button type="submit" disabled={busy || !input.trim()}>
                Send
              </button>
            </form>
    </>
  );

  if (isPage) {
    return (
      <div className="cds-root cds-page-root">
        <div className="cds-page-shell" role="region" aria-label={SAATHI_NAME}>
          <div className="cds-panel cds-panel-page">{chatBody}</div>
        </div>
        {previewCollegeId != null ? (
          <CollegeViewDetailsModal
            instituteId={previewCollegeId}
            open
            onClose={() => setPreviewCollegeId(null)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="cds-root">
      {!open && nudge ? (
        <div className="cds-nudge" role="status">
          <p>Need a quick college shortlist? {SAATHI_NAME} can help from what you’re browsing.</p>
          <div className="cds-nudge-actions">
            <button type="button" className="cds-nudge-dismiss" onClick={() => setNudge(false)}>
              Not now
            </button>
            <button type="button" className="cds-nudge-open" onClick={() => void openChat()}>
              Chat
            </button>
          </div>
        </div>
      ) : null}

      {!open ? (
        <button type="button" className="cds-fab" onClick={() => void openChat()} aria-label={`Open ${SAATHI_NAME}`}>
          <span className="cds-fab-ring" aria-hidden="true" />
          <span className="cds-fab-avatar" aria-hidden="true">
            <span className="cds-fab-face">CD</span>
            <span className="cds-fab-online" />
          </span>
          <span className="cds-fab-label">
            <span className="cds-fab-title">{minimized ? 'Resume chat' : SAATHI_NAME}</span>
            <span className="cds-fab-sub">{minimized ? 'Continue where you left' : 'Ask me anything'}</span>
          </span>
          {unread > 0 ? <span className="cds-fab-badge">{unread > 9 ? '9+' : unread}</span> : null}
        </button>
      ) : null}

      {open ? (
        <div className="cds-overlay" role="dialog" aria-modal="true" aria-label={SAATHI_NAME}>
          <div className="cds-panel">{chatBody}</div>
        </div>
      ) : null}

      {previewCollegeId != null ? (
        <CollegeViewDetailsModal
          instituteId={previewCollegeId}
          open
          onClose={() => setPreviewCollegeId(null)}
        />
      ) : null}
    </div>
  );
}
