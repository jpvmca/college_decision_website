'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, LifeBuoy, MessageSquarePlus, Paperclip, RefreshCw, X } from 'lucide-react';
import {
  createTicket, FILE_ACCEPT, fileProblem, formatBytes, listTickets, MESSAGE_MAX, PanelHttpError, startPolling, STATUS_LABEL, SUBJECT_MAX,
  type SupportTicket, type TicketList, when
} from './support-client';

type Fields = Partial<Record<'subject' | 'category' | 'message' | 'file', string>>;

/** Ticket list + "New ticket" form. The list refreshes every 30 s while the tab is visible. */
export default function SupportTickets({ instituteId, initial }: { instituteId: number; initial: TicketList }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [showForm, setShowForm] = useState(initial.tickets.length === 0);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pollFailed, setPollFailed] = useState(false);
  const lastUnread = useRef(initial.unread);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await listTickets(instituteId);
      if (next.unread !== lastUnread.current) router.refresh(); // keep the menu badge in step
      lastUnread.current = next.unread;
      setData(next);
      setCheckedAt(new Date()); setPollFailed(false);
    } catch { setPollFailed(true); /* keep the last list; the next tick retries */ } finally { setRefreshing(false); }
  }, [instituteId, router]);

  useEffect(() => startPolling(() => void refresh()), [refresh]);

  const tickets = data.tickets.filter((t) => filter === 'all' || (filter === 'active' ? t.status === 'open' || t.status === 'awaiting_college' : t.status === 'resolved' || t.status === 'closed'));
  const activeCount = data.tickets.filter((t) => t.status === 'open' || t.status === 'awaiting_college').length;

  return <>
    {showForm
      ? <NewTicket instituteId={instituteId} categories={data.categories} onCancel={data.tickets.length ? () => setShowForm(false) : undefined} onCreated={(id) => router.push(`/college/support/${id}`)} />
      : null}
    <section className="cpn-card cst-card">
      <div className="cst-list-head">
        <div>
          <h2>Your tickets</h2>
          <p className="cp3-meta">{data.tickets.length ? `${activeCount} active · ${data.tickets.length} total` : 'No tickets yet'}{data.unread ? ` · ${data.unread} new ${data.unread === 1 ? 'reply' : 'replies'}` : ''}</p>
        </div>
        <div className="cst-list-actions">
          {data.tickets.length ? <div className="cst-tabs" role="tablist" aria-label="Filter tickets">
            {(['all', 'active', 'done'] as const).map((f) => <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'on' : undefined} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Resolved / closed'}</button>)}
          </div> : null}
          <button type="button" className="cpn-btn ghost small" onClick={() => void refresh()} disabled={refreshing} title="Refresh now"><RefreshCw size={14} className={refreshing ? 'cst-spin' : undefined} aria-hidden="true" />Refresh</button>
          {!showForm ? <button type="button" className="cpn-btn small" onClick={() => setShowForm(true)}><MessageSquarePlus size={15} aria-hidden="true" />New ticket</button> : null}
        </div>
      </div>
      {tickets.length
        ? <ul className="cst-list">{tickets.map((t) => <TicketRow key={t.id} ticket={t} />)}</ul>
        : <div className="cp3-empty"><LifeBuoy size={28} aria-hidden="true" /><strong>{data.tickets.length ? 'No tickets in this view' : 'Need help with your college profile?'}</strong><span>{data.tickets.length ? 'Try another filter.' : 'Open a ticket and our team will reply here, usually within one working day.'}</span></div>}
      {pollFailed ? <p className="cst-poll-note warn" role="status">Could not check for updates. Retrying in 30 seconds…</p> : null}
      <p className="cst-poll-note" aria-live="polite">Updates automatically every 30 seconds{checkedAt ? ` · last updated ${checkedAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit' })} IST` : ''}</p>
    </section>
  </>;
}

function TicketRow({ ticket: t }: { ticket: SupportTicket }) {
  return <li>
    <Link href={`/college/support/${t.id}`} className={`cst-row${t.unread ? ' unread' : ''}`}>
      <div className="cst-row-main">
        <div className="cst-row-top">
          <span className={`cst-status s-${t.status}`}>{STATUS_LABEL[t.status]}</span>
          <span className="cst-cat">{t.categoryLabel}</span>
          <span className="cst-id">#{t.id}</span>
        </div>
        <strong>{t.unread ? <span className="cst-dot" aria-label="Unread" /> : null}{t.subject}</strong>
        <small>{t.messageCount} message{t.messageCount === 1 ? '' : 's'} · last {t.lastMessageBy === 'admin' ? 'reply from CollegeDecision' : 'message from you'} · {when(t.lastMessageAt || t.createdAt)}</small>
      </div>
      {t.unread ? <span className="cst-unread" title="New replies">{t.unread} new</span> : null}
      <ChevronRight size={18} aria-hidden="true" className="cst-chevron" />
    </Link>
  </li>;
}

function NewTicket({ instituteId, categories, onCancel, onCreated }: { instituteId: number; categories: Record<string, string>; onCancel?: () => void; onCreated: (id: number) => void }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Fields>({});
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  function validate(): Fields {
    const e: Fields = {};
    if (subject.trim().length < 5) e.subject = 'Write a short subject (at least 5 characters).';
    if (!category) e.category = 'Choose a category.';
    if (message.trim().length < 2) e.message = 'Describe what you need help with.';
    const fp = fileProblem(file);
    if (fp) e.file = fp;
    return e;
  }
  const shown = touched ? { ...validate(), ...errors } : errors;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true); setError('');
    const e = validate();
    setErrors({});
    if (Object.keys(e).length) {
      document.getElementById(`cst-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    const form = new FormData();
    form.set('subject', subject.trim());
    form.set('category', category);
    form.set('message', message.trim());
    if (file) form.set('file', file);
    setBusy(true);
    try {
      const created = await createTicket(instituteId, form);
      onCreated(created.data.id);
    } catch (err) {
      const fields = err instanceof PanelHttpError ? err.fields as Fields : {};
      if (Object.keys(fields).length) setErrors(fields);
      else setError(err instanceof Error ? err.message : 'Could not create the ticket.');
      setBusy(false);
    }
  }

  return <section className="cpn-card cst-card cst-new">
    <div className="cp3-card-head">
      <div><h2><MessageSquarePlus size={18} aria-hidden="true" />New support ticket</h2><p>Tell us what you need. You can attach a screenshot (converted to WebP) or a PDF. Files are stored privately and only our team can open them.</p></div>
      {onCancel ? <button type="button" className="cpn-btn ghost small" onClick={onCancel}><X size={14} aria-hidden="true" />Cancel</button> : null}
    </div>
    <form className="cpn-form" onSubmit={submit} noValidate>
      <div className="cst-fields">
        <label htmlFor="cst-subject"><span>Subject<span className="cp3-req" aria-hidden="true">*</span></span>
          <input id="cst-subject" type="text" value={subject} maxLength={SUBJECT_MAX} onChange={(e) => { setSubject(e.target.value); setErrors((x) => ({ ...x, subject: undefined })); }}
            placeholder="e.g. Update our NIRF ranking" aria-invalid={Boolean(shown.subject)} aria-describedby="cst-subject-hint" />
          <span id="cst-subject-hint" className={shown.subject ? 'cpn-field-error' : 'cpn-hint'}>{shown.subject || `${subject.length}/${SUBJECT_MAX}`}</span>
        </label>
        <label htmlFor="cst-category"><span>Category<span className="cp3-req" aria-hidden="true">*</span></span>
          <select id="cst-category" value={category} onChange={(e) => { setCategory(e.target.value); setErrors((x) => ({ ...x, category: undefined })); }} aria-invalid={Boolean(shown.category)}>
            <option value="">Choose a category…</option>
            {Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          {shown.category ? <span className="cpn-field-error">{shown.category}</span> : <span className="cpn-hint">Helps us route it to the right person.</span>}
        </label>
      </div>
      <label htmlFor="cst-message"><span>Message<span className="cp3-req" aria-hidden="true">*</span></span>
        <textarea id="cst-message" rows={6} value={message} maxLength={MESSAGE_MAX} onChange={(e) => { setMessage(e.target.value); setErrors((x) => ({ ...x, message: undefined })); }}
          placeholder="Describe the problem or the change you need. Include links or page names if they help." aria-invalid={Boolean(shown.message)} />
        <span className={shown.message ? 'cpn-field-error' : 'cpn-hint'}>{shown.message || `${message.length}/${MESSAGE_MAX}`}</span>
      </label>
      <div className="cst-attach">
        <input ref={fileInput} id="cst-file" type="file" accept={FILE_ACCEPT} hidden onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); setErrors((x) => ({ ...x, file: undefined })); }} />
        {file
          ? <span className="cst-file-chip"><Paperclip size={14} aria-hidden="true" />{file.name} <small>{formatBytes(file.size)}</small><button type="button" aria-label="Remove attachment" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}><X size={13} /></button></span>
          : <button type="button" className="cpn-btn ghost small" onClick={() => fileInput.current?.click()}><Paperclip size={14} aria-hidden="true" />Attach file (optional)</button>}
        <span className={shown.file ? 'cpn-field-error' : 'cpn-hint'}>{shown.file || 'JPG, PNG, WebP, GIF or PDF · max 10 MB'}</span>
      </div>
      {error ? <div className="cpn-alert err" role="alert">{error}</div> : null}
      <div className="cpn-actions"><button type="submit" className="cpn-btn" disabled={busy}>{busy ? 'Sending…' : 'Create ticket'}</button></div>
    </form>
  </section>;
}
