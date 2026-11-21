'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { OFFICIAL_WEBSITE_REL, toExternalHttpUrl } from '../lib/external-url';

export type UnpublishedCollegeSummary = {
  id: number;
  name: string;
  officialName?: string | null;
  city: string | null;
  state: string | null;
  instituteType: string | null;
  isUniversity: boolean;
  establishmentYear: number | null;
  website: string | null;
  affiliation: string | null;
  courses: string[];
};

type ModalProps = {
  instituteId: number | null;
  open: boolean;
  onClose: () => void;
};

type ButtonProps = {
  instituteId: number;
  label?: string;
};

function typeLabel(details: UnpublishedCollegeSummary) {
  const ownership = details.instituteType ? details.instituteType.charAt(0).toUpperCase() + details.instituteType.slice(1) : null;
  const kind = details.isUniversity ? 'University' : 'College';
  return [ownership, kind].filter(Boolean).join(' · ') || 'College';
}

function Fact({ label, children }: { label: string; children: string }) {
  return <div className="search-unpublished-fact"><small>{label}</small><strong>{children}</strong></div>;
}

export default function UnpublishedCollegeModal({ instituteId, open, onClose }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [details, setDetails] = useState<UnpublishedCollegeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !instituteId) { setDetails(null); setError(false); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setDetails(null);
    fetch(`/api/colleges/unpublished/${instituteId}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as { data: UnpublishedCollegeSummary };
        setDetails(json.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, instituteId]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !instituteId) return null;
  const location = [details?.city, details?.state].filter(Boolean).join(', ');
  const website = toExternalHttpUrl(details?.website || null);

  const dialog = (
    <div className="modal-backdrop search-unpublished-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="college-modal search-unpublished-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button ref={closeRef} className="modal-close" type="button" aria-label="Close college details" onClick={onClose}><X size={22} aria-hidden="true" /></button>
        {loading && <p>Loading college details…</p>}
        {error && !loading && <p className="modal-error">Details for this college are not available right now.</p>}
        {details && !loading && <>
          <h2 id={titleId}>{details.name}</h2>
          {location ? <p className="muted">{location}</p> : null}
          <div className="search-unpublished-facts">
            <Fact label="Type">{typeLabel(details)}</Fact>
            <Fact label="Established">{details.establishmentYear ? String(details.establishmentYear) : 'Not listed'}</Fact>
            {location ? <Fact label="Location">{location}</Fact> : <Fact label="Location">Not listed</Fact>}
          </div>
          <div className="search-unpublished-block">
            <h3>Affiliation and approvals</h3>
            <p>{details.affiliation || 'Not listed'}</p>
          </div>
          <div className="search-unpublished-block">
            <h3>Courses</h3>
            {details.courses.length ? <ul className="search-unpublished-courses">{details.courses.map((course) => <li key={course}>{course}</li>)}</ul> : <p>Not listed</p>}
          </div>
          {website ? <p className="search-unpublished-website"><a href={website} target="_blank" rel={OFFICIAL_WEBSITE_REL}>Official website</a></p> : null}
        </>}
      </section>
    </div>
  );
  return createPortal(dialog, document.body);
}

export function UnpublishedCollegeViewButton({ instituteId, label = 'View' }: ButtonProps) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="view-button search-hit-view" type="button" onClick={() => setOpen(true)}>{label}</button>
    <UnpublishedCollegeModal instituteId={instituteId} open={open} onClose={() => setOpen(false)} />
  </>;
}
