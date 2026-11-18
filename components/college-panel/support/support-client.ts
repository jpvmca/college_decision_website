/** Browser helpers + types for the college panel support tickets (through /api/college-panel/*). */

export type SupportStatus = 'open' | 'awaiting_college' | 'resolved' | 'closed';
export type SupportTicket = {
  id: number; instituteId: number; subject: string; category: string; categoryLabel: string; status: SupportStatus;
  messageCount: number; unread: number; lastMessageAt: string | null; lastMessageBy: 'college' | 'admin' | null; closedAt: string | null; createdAt: string;
};
export type SupportMessage = {
  id: number; author: 'college' | 'admin'; authorName: string | null; body: string; createdAt: string;
  attachment: { name: string | null; mime: string | null; size: number } | null;
};
export type TicketList = { tickets: SupportTicket[]; unread: number; categories: Record<string, string> };
export type Thread = { ticket: SupportTicket; messages: SupportMessage[]; markedRead: number; categories: Record<string, string> };

export const STATUS_LABEL: Record<SupportStatus, string> = {
  open: 'Waiting for our team',
  awaiting_college: 'Replied',
  resolved: 'Resolved',
  closed: 'Closed'
};
export const POLL_MS = 30_000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const FILE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf';
export const SUBJECT_MAX = 150;
export const MESSAGE_MAX = 5000;

export class PanelHttpError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}, public code = '') { super(message); }
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: FormData | object): Promise<T> {
  const response = await fetch(`/api/college-panel/${path}`, {
    method,
    cache: 'no-store',
    headers: body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : undefined,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });
  const json = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.href = '/college/login';
    throw new PanelHttpError('Please sign in again.', 401);
  }
  if (!response.ok) {
    const fields: Record<string, string> = { ...(json.fields || {}) };
    if (json.field && json.error && !fields[json.field]) fields[json.field] = json.error;
    const fallback = response.status === 429 ? 'Too many requests. Please wait a little and try again.'
      : response.status >= 500 ? 'Support is temporarily unavailable. Please try again shortly.' : `Request failed (${response.status})`;
    throw new PanelHttpError(json.error || fallback, response.status, fields, json.code || '');
  }
  return json as T;
}

const base = (instituteId: number) => `institutes/${instituteId}/support`;
export const listTickets = (instituteId: number) => call<{ data: TicketList }>('GET', `${base(instituteId)}/tickets`).then((r) => r.data);
export const getThread = (instituteId: number, ticketId: number, after = 0) =>
  call<{ data: Thread }>('GET', `${base(instituteId)}/tickets/${ticketId}${after ? `?after=${after}` : ''}`).then((r) => r.data);
export const createTicket = (instituteId: number, form: FormData) => call<{ data: { id: number }; message: string }>('POST', `${base(instituteId)}/tickets`, form);
export const sendMessage = (instituteId: number, ticketId: number, form: FormData) => call<{ data: { messageId: number } }>('POST', `${base(instituteId)}/tickets/${ticketId}/messages`, form);
export const resolveTicket = (instituteId: number, ticketId: number) => call<{ data: { status: SupportStatus } }>('POST', `${base(instituteId)}/tickets/${ticketId}/resolve`, {});
export const unreadCount = (instituteId: number) => call<{ data: { unread: number } }>('GET', `${base(instituteId)}/unread`).then((r) => r.data.unread);
export const attachmentLink = (instituteId: number, ticketId: number, messageId: number) =>
  call<{ data: { url: string; name: string | null } }>('GET', `${base(instituteId)}/tickets/${ticketId}/messages/${messageId}/attachment`).then((r) => r.data);

/** Problem with a picked file, or '' when it is fine. */
export function fileProblem(file: File | null) {
  if (!file) return '';
  if (!/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/i.test(file.type)) return 'Attach a JPG, PNG, WebP or GIF image, or a PDF.';
  if (file.size > MAX_FILE_BYTES) return 'Attachments can be at most 10 MB.';
  if (!file.size) return 'This file is empty.';
  return '';
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const IST: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata' };
/** API timestamps are UTC; a zone-less DB DATETIME string is read as UTC too. */
export function parseTime(value: string) {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.replace(' ', 'T')}Z`);
}

export function when(value: string | null) {
  if (!value) return '—';
  const d = parseTime(value);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay = d.toLocaleDateString('en-IN', IST) === now.toLocaleDateString('en-IN', IST);
  const time = d.toLocaleTimeString('en-IN', { ...IST, hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  return `${d.toLocaleDateString('en-IN', { ...IST, day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' })}, ${time}`;
}

/** Calls `tick` every POLL_MS while the tab is visible; runs it right away when the tab comes back. */
export function startPolling(tick: () => void) {
  let timer: ReturnType<typeof setInterval> | null = null;
  const start = () => { if (!timer) timer = setInterval(() => { if (!document.hidden) tick(); }, POLL_MS); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const onVisibility = () => { if (document.hidden) stop(); else { tick(); start(); } };
  if (!document.hidden) start();
  document.addEventListener('visibilitychange', onVisibility);
  return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
}

/** Opens a private attachment through a short-lived link (window opened first so popup blockers allow it). */
export async function openAttachment(instituteId: number, ticketId: number, messageId: number) {
  const win = window.open('', '_blank');
  try {
    const link = await attachmentLink(instituteId, ticketId, messageId);
    if (win) { win.opener = null; win.location.href = link.url; } else window.location.href = link.url;
  } catch (error) {
    win?.close();
    throw error;
  }
}
