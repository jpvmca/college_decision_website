'use client';

import { ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Search, UploadCloud, X } from 'lucide-react';
import { submitChange } from '../panel-client';

/** Shared building blocks for the college panel (v3). Prefix: cp3- */

export type Option = { id: number; name: string; hint?: string };

/** Searchable single select (combobox). Keyboard: arrows, Enter, Escape. */
export function SearchSelect({ options, value, onChange, placeholder = 'Search…', disabled, label, emptyText = 'No matches', footer, loading }: {
  options: Option[]; value: number | null; onChange: (id: number | null, option?: Option) => void; placeholder?: string; disabled?: boolean;
  label?: string; emptyText?: string; footer?: (query: string, close: () => void) => ReactNode; loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.id === value) || null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.name.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q)) : options;
    return list.slice(0, 200);
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  useEffect(() => { setActive(0); }, [query]);

  const pick = (option: Option) => { onChange(option.id, option); setOpen(false); setQuery(''); };
  return <div className={`cp3-select${open ? ' open' : ''}${disabled ? ' disabled' : ''}`} ref={box}>
    <button type="button" className="cp3-select-trigger" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={label}
      onClick={() => { setOpen((o) => !o); setTimeout(() => input.current?.focus(), 0); }}>
      <span className={selected ? '' : 'cp3-placeholder'}>{selected ? selected.name : loading ? 'Loading…' : placeholder}</span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
    {open ? <div className="cp3-select-pop">
      <div className="cp3-select-search"><Search size={15} aria-hidden="true" />
        <input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search" role="combobox" aria-controls={listId} aria-expanded="true" aria-autocomplete="list"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) pick(filtered[active]); }
            else if (e.key === 'Escape') setOpen(false);
          }} />
      </div>
      <ul className="cp3-select-list" role="listbox" id={listId}>
        {filtered.length ? filtered.map((o, i) => <li key={o.id} role="option" aria-selected={o.id === value}>
          <button type="button" className={i === active ? 'active' : ''} onMouseEnter={() => setActive(i)} onClick={() => pick(o)}>
            <span>{o.name}{o.hint ? <small>{o.hint}</small> : null}</span>{o.id === value ? <Check size={15} aria-hidden="true" /> : null}
          </button>
        </li>) : <li className="cp3-select-empty">{loading ? 'Loading…' : emptyText}</li>}
      </ul>
      {footer ? <div className="cp3-select-foot">{footer(query, () => setOpen(false))}</div> : null}
    </div> : null}
  </div>;
}

/** Searchable multi select shown as removable chips. */
export function MultiSelect({ options, values, onChange, placeholder = 'Add…', disabled, label }: {
  options: Option[]; values: number[]; onChange: (ids: number[]) => void; placeholder?: string; disabled?: boolean; label?: string;
}) {
  const available = useMemo(() => options.filter((o) => !values.includes(o.id)), [options, values]);
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  return <div className="cp3-multi">
    {values.length ? <div className="cp3-chips">{values.map((id) => <span className="cp3-chip" key={id}>{byId.get(id)?.name || `#${id}`}
      {!disabled ? <button type="button" aria-label={`Remove ${byId.get(id)?.name || id}`} onClick={() => onChange(values.filter((v) => v !== id))}><X size={13} /></button> : null}</span>)}</div> : null}
    {!disabled ? <SearchSelect options={available} value={null} label={label} placeholder={placeholder} onChange={(id) => { if (id) onChange([...values, id]); }} /> : null}
  </div>;
}

/** Drag & drop / click file zone. */
export function DropZone({ accept, multiple, disabled, busy, onFiles, title, hint }: {
  accept: string; multiple?: boolean; disabled?: boolean; busy?: boolean; onFiles: (files: File[]) => void; title: string; hint?: string;
}) {
  const [over, setOver] = useState(false);
  return <label className={`cp3-drop${over ? ' over' : ''}${disabled || busy ? ' disabled' : ''}`}
    onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }} onDragLeave={() => setOver(false)}
    onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled && !busy) onFiles(Array.from(e.dataTransfer.files || [])); }}>
    <UploadCloud size={28} aria-hidden="true" />
    <strong>{busy ? 'Uploading…' : title}</strong>
    {hint ? <span>{hint}</span> : null}
    <input type="file" accept={accept} multiple={multiple} hidden disabled={disabled || busy} onChange={(e) => { const files = Array.from(e.target.files || []); e.target.value = ''; if (files.length) onFiles(files); }} />
  </label>;
}

/** Submits one change request for a section and refreshes the page data. */
export function useSubmit(instituteId: number, section: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  async function submit(data: unknown, note?: string) {
    setBusy(true); setError(''); setOk('');
    try {
      const result = await submitChange(instituteId, section, data, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, ok, setError, setOk, submit };
}

/** Note + submit button + result messages, sticky at the bottom of long editors. */
export function SubmitBar({ busy, error, ok, disabled, label, count, note, onNote, onSubmit, extra, sticky = true }: {
  busy: boolean; error: string; ok: string; disabled?: boolean; label: string; count?: number; note: string; onNote: (v: string) => void;
  onSubmit: () => void; extra?: ReactNode; sticky?: boolean;
}) {
  return <div className={`cp3-submit${sticky ? ' sticky' : ''}`}>
    {error && <div className="cpn-alert err" role="alert">{error}</div>}
    {ok && <div className="cpn-alert ok" role="status">{ok}</div>}
    <div className="cp3-submit-row">
      <input className="cpn-input" type="text" maxLength={500} value={note} onChange={(e) => onNote(e.target.value)} placeholder="Note for our reviewer (optional), e.g. source: prospectus 2026-27, page 4" aria-label="Note for the reviewer" />
      {extra}
      <button type="button" className="cpn-btn" disabled={busy || disabled} onClick={onSubmit}>{busy ? 'Submitting…' : label}{count ? <span className="cp3-count">{count}</span> : null}</button>
    </div>
  </div>;
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return <div className="cp3-empty">{icon}<strong>{title}</strong>{children ? <div>{children}</div> : null}</div>;
}

/** Section card with title, optional description and actions. */
export function Card({ title, description, actions, children, className = '' }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`cpn-card cp3-card ${className}`}>
    {title || actions ? <div className="cp3-card-head"><div>{title ? <h2>{title}</h2> : null}{description ? <p>{description}</p> : null}</div>{actions ? <div className="cp3-card-actions">{actions}</div> : null}</div> : null}
    {children}
  </section>;
}

export const inr = (n: number | null | undefined) => (n ? `₹${Math.round(Number(n)).toLocaleString('en-IN')}` : '—');
