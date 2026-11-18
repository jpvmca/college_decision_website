'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Image as ImageIcon, Paperclip, RefreshCw, Send, X } from 'lucide-react';
import {
  FILE_ACCEPT, fileProblem, parseTime, formatBytes, getThread, MESSAGE_MAX, openAttachment, PanelHttpError, resolveTicket, sendMessage, startPolling,
  STATUS_LABEL, type SupportMessage, type Thread, when
} from './support-client';

/** Chat-style thread. New messages are fetched every 30 s (only newer than the last one) while the tab is visible. */
export default function SupportThread({ instituteId, initial }: { instituteId: number; initial: Thread }) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initial.ticket);
  const [messages, setMessages] = useState<SupportMessage[]>(initial.messages);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pollFailed, setPollFailed] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [newCount, setNewCount] = useState(0);
  const lastId = useRef(initial.messages.at(-1)?.id || 0);
  const list = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const scrollDown = useCallback((smooth = true) => {
    requestAnimationFrame(() => list.current?.scrollTo({ top: list.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }));
  }, []);
  useEffect(() => { scrollDown(false); }, [scrollDown]);
  // Opening the thread marked replies read: update the menu badge.
  useEffect(() => { if (initial.markedRead) router.refresh(); }, [initial.markedRead, router]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await getThread(instituteId, ticket.id, lastId.current);
      setTicket(next.ticket);
      const fresh = next.messages.filter((m) => m.id > lastId.current);
      if (fresh.length) {
        lastId.current = fresh[fresh.length - 1].id;
        setMessages((prev) => [...prev, ...fresh]);
        const fromTeam = fresh.filter((m) => m.author === 'admin').length;
        if (fromTeam) setNewCount((n) => n + fromTeam);
        scrollDown();
      }
      if (next.markedRead) router.refresh();
      setCheckedAt(new Date()); setPollFailed(false);
    } catch { setPollFailed(true); /* keep what we have; next tick retries */ } finally { setRefreshing(false); }
  }, [instituteId, ticket.id, router, scrollDown]);

  useEffect(() => startPolling(() => void refresh()), [refresh]);
  useEffect(() => { if (!newCount) return; const t = setTimeout(() => setNewCount(0), 6000); return () => clearTimeout(t); }, [newCount]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    setError('');
    const body = text.trim();
    if (body.length < 2) { setFieldError('Write a message.'); return; }
    const fp = fileProblem(file);
    if (fp) { setFieldError(fp); return; }
    const form = new FormData();
    form.set('message', body);
    if (file) form.set('file', file);
    setBusy(true);
    try {
      await sendMessage(instituteId, ticket.id, form);
      setText(''); setFile(null); setFieldError('');
      if (fileInput.current) fileInput.current.value = '';
      await refresh();
    } catch (err) {
      if (err instanceof PanelHttpError && err.code === 'ticket_closed') { setError('This ticket was closed, so the message was not sent.'); await refresh(); }
      else if (err instanceof PanelHttpError && (err.fields.message || err.fields.file)) setFieldError(err.fields.message || err.fields.file);
      else setError(err instanceof Error ? err.message : 'Could not send the message.');
    } finally { setBusy(false); }
  }

  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void send(); }
  }

  async function markResolved() {
    setError('');
    try { await resolveTicket(instituteId, ticket.id); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not update the ticket.'); }
  }

  const closed = ticket.status === 'closed';
  return <section className="cpn-card cst-thread-card">
    <header className="cst-thread-head">
      <Link href="/college/support" className="cst-back"><ArrowLeft size={15} aria-hidden="true" />All tickets</Link>
      <div className="cst-thread-title">
        <h1>{ticket.subject}</h1>
        <div className="cst-row-top">
          <span className={`cst-status s-${ticket.status}`}>{STATUS_LABEL[ticket.status]}</span>
          <span className="cst-cat">{ticket.categoryLabel}</span>
          <span className="cst-id">#{ticket.id} · opened {when(ticket.createdAt)}</span>
        </div>
      </div>
      <div className="cst-thread-actions">
        <button type="button" className="cpn-btn ghost small" onClick={() => void refresh()} disabled={refreshing} title="Check for new replies"><RefreshCw size={14} className={refreshing ? 'cst-spin' : undefined} aria-hidden="true" />Refresh</button>
        {ticket.status === 'open' || ticket.status === 'awaiting_college'
          ? <button type="button" className="cpn-btn ghost small" onClick={() => void markResolved()}><CheckCircle2 size={14} aria-hidden="true" />Mark resolved</button> : null}
      </div>
    </header>

    <div className="cst-messages" ref={list} aria-live="polite" aria-label="Conversation">
      {messages.map((m, i) => {
        const day = parseTime(m.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
        const prevDay = i ? parseTime(messages[i - 1].createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }) : '';
        return <div key={m.id} className="cst-msg-wrap">
          {day !== prevDay ? <div className="cst-day"><span>{day}</span></div> : null}
          <article className={`cst-msg ${m.author === 'college' ? 'mine' : 'theirs'}`}>
            <div className="cst-msg-meta"><strong>{m.author === 'college' ? (m.authorName || 'You') : 'CollegeDecision support'}</strong><time dateTime={m.createdAt}>{when(m.createdAt)}</time></div>
            <div className="cst-msg-body">{m.body}</div>
            {m.attachment ? <button type="button" className="cst-attachment" onClick={() => openAttachment(instituteId, ticket.id, m.id).catch((e) => setError(e instanceof Error ? e.message : 'Could not open the file.'))}>
              {m.attachment.mime === 'application/pdf' ? <FileText size={15} aria-hidden="true" /> : <ImageIcon size={15} aria-hidden="true" />}
              <span>{m.attachment.name || 'Attachment'}</span><small>{formatBytes(m.attachment.size)}</small>
            </button> : null}
          </article>
        </div>;
      })}
      {newCount ? <div className="cst-new-pill" role="status">{newCount} new {newCount === 1 ? 'reply' : 'replies'}</div> : null}
    </div>

    {closed
      ? <div className="cpn-alert info cst-closed">This ticket is closed. <Link href="/college/support">Open a new ticket</Link> if you need more help.</div>
      : <form className="cst-composer" onSubmit={send} noValidate>
        <label htmlFor="cst-reply" className="sr-only">Your message</label>
        <textarea id="cst-reply" rows={3} value={text} maxLength={MESSAGE_MAX} disabled={busy}
          onChange={(e) => { setText(e.target.value); setFieldError(''); }} onKeyDown={onKey}
          placeholder={ticket.status === 'resolved' ? 'Write again to reopen this ticket…' : 'Write a message… (Ctrl + Enter to send)'} aria-invalid={Boolean(fieldError)} />
        <div className="cst-composer-bar">
          <input ref={fileInput} type="file" accept={FILE_ACCEPT} hidden onChange={(e) => { setFile(e.target.files?.[0] || null); setFieldError(''); }} />
          {file
            ? <span className="cst-file-chip"><Paperclip size={14} aria-hidden="true" />{file.name} <small>{formatBytes(file.size)}</small><button type="button" aria-label="Remove attachment" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}><X size={13} /></button></span>
            : <button type="button" className="cpn-btn ghost small" onClick={() => fileInput.current?.click()} disabled={busy}><Paperclip size={14} aria-hidden="true" />Attach</button>}
          <span className={fieldError ? 'cpn-field-error' : 'cpn-hint cst-count'}>{fieldError || `${text.length}/${MESSAGE_MAX}`}</span>
          <button type="submit" className="cpn-btn" disabled={busy || !text.trim()}><Send size={15} aria-hidden="true" />{busy ? 'Sending…' : 'Send'}</button>
        </div>
      </form>}
    {error ? <div className="cpn-alert err" role="alert">{error}</div> : null}
    {pollFailed ? <p className="cst-poll-note warn" role="status">Could not check for updates. Retrying in 30 seconds…</p> : null}
    <p className="cst-poll-note">New replies appear automatically (checked every 30 seconds while this tab is open){checkedAt ? ` · last updated ${checkedAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit' })} IST` : ''}.</p>
  </section>;
}
