'use client';

import { formatProgrammeDuration } from '../lib/duration';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { OFFICIAL_WEBSITE_REL, toExternalHttpUrl } from '../lib/external-url';
import { formatLpa } from '../lib/packages';
import { plainText } from '../lib/readable-text';

type Details = {
  institute: {
    display_name?: string | null;
    full_name: string;
    institute_type?: string | null;
    website?: string | null;
    city?: string | null;
    state?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    establishment_year?: number | null;
    is_university?: number | boolean | null;
  };
  programmes: Array<{
    id: number;
    name: string;
    course_name?: string | null;
    duration?: string | null;
    total_seats?: number | null;
    eligibility?: string | null;
    description?: string | null;
  }>;
  fees: Array<{ programme_id?: number; programme_name?: string | null; programme_duration?: number | string | null; fee_type: string; fees: number | string; fee_duration?: string | null }>;
  exams: Array<{ name: string }>;
  placements: Array<{ year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ id: number; course_id?: number | null; course_name?: string | null; rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; url?: string | null; organization?: string | null; industry?: string | null }>;
  about?: string | null;
  affiliation?: string | null;
  reviewSummary?: { count: number; averageRating?: number | null } | null;
};

type Props = {
  instituteId: number;
  courseId?: number;
  courseName?: string;
  open?: boolean;
  onClose?: () => void;
  buttonLabel?: string;
  buttonClassName?: string;
};

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : null;
}

function uniqueFees(fees: Details['fees']) {
  return Array.from(new Map(fees.map((fee) => [`${fee.programme_id || ''}:${fee.fee_type}:${fee.fees}:${fee.fee_duration || ''}`, fee])).values());
}

function uniquePlacements(placements: Details['placements']) {
  const byYear = new Map<string, Details['placements'][number]>();
  placements.forEach((placement) => {
    const key = String(placement.year || 'unknown');
    const current = byYear.get(key);
    if (!current || Number(placement.highest_package || 0) > Number(current.highest_package || 0)) byYear.set(key, placement);
  });
  return Array.from(byYear.values()).sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
}

function rankingGroups(rankings: Details['rankings']) {
  return Array.from(rankings.reduce((groups, ranking) => {
    const key = `${ranking.ranking_body}:${ranking.course_name || 'Institution'}`;
    const group = groups.get(key) || { key, body: ranking.ranking_body, course: ranking.course_name || 'Institution', rows: [] as Details['rankings'] };
    group.rows.push(ranking);
    groups.set(key, group);
    return groups;
  }, new Map<string, { key: string; body: string; course: string; rows: Details['rankings'] }>()).values())
    .map((group) => ({ ...group, rows: group.rows.sort((a, b) => Number(b.year || 0) - Number(a.year || 0)) }));
}

function rankingOverview(rankings: Details['rankings']) {
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];
  const latestByBody = new Map<string, Details['rankings'][number][]>();
  rankingGroups(rankings).forEach((group) => {
    const latest = group.rows[0];
    if (latest) latestByBody.set(group.body, [...(latestByBody.get(group.body) || []), latest]);
  });
  const bodies = Array.from(latestByBody.entries()).map(([body, rows], index) => ({
    body,
    color: colors[index % colors.length],
    score: rows.reduce((sum, row) => sum + (row.out_of ? Math.max(1, 1 - row.rank / row.out_of) * 100 : 1), 0) / rows.length,
    latest: rows[0]
  }));
  const totalScore = bodies.reduce((sum, item) => sum + item.score, 0);
  let start = 0;
  const segments = bodies.map((item) => {
    const end = start + (item.score / Math.max(1, totalScore)) * 360;
    const segment = `${item.color} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });
  return { bodies, gradient: segments.join(', ') };
}

function visibleTextLength(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().length;
}

function AboutBlock({ html }: { html: string }) {
  const long = visibleTextLength(html) > 900;
  const [expanded, setExpanded] = useState(!long);
  return (
    <div>
      <div className={`readable college-modal-about${expanded ? '' : ' is-collapsed'}`} dangerouslySetInnerHTML={{ __html: html }} />
      {long ? <button className="collapsible-toggle" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show less' : 'Read more about this college'}</button> : null}
    </div>
  );
}

export default function CollegeViewDetailsModal({
  instituteId,
  courseId,
  courseName,
  open: openProp,
  onClose,
  buttonLabel = 'View college details',
  buttonClassName = 'details-button'
}: Props) {
  const controlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlled ? Boolean(openProp) : internalOpen;
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const loadedFor = useRef<string>('');

  function close() {
    if (!controlled) setInternalOpen(false);
    onClose?.();
  }

  function openModal() {
    if (!controlled) setInternalOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const key = `${instituteId}:${courseId || ''}`;
    if (loadedFor.current === key && details) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ instituteId: String(instituteId) });
    if (courseId) params.set('courseId', String(courseId));
    fetch(`/api/college-details?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Details unavailable');
        const payload = await response.json() as { data: Details };
        loadedFor.current = key;
        setDetails(payload.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('College details could not be loaded. Please try again.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, instituteId, courseId]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
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
  }, [open]);

  const trigger = controlled ? null : (
    <button className={buttonClassName} type="button" onClick={openModal}>{buttonClassName.includes('details-button') ? <><span aria-hidden="true">⌾</span> {buttonLabel}</> : buttonLabel}</button>
  );

  if (!open) return trigger;

  const name = details ? (details.institute.display_name || details.institute.full_name) : '';
  const location = details ? [details.institute.city, details.institute.state].filter(Boolean).join(', ') : '';
  const website = toExternalHttpUrl(details?.institute.website || null);
  const address = details ? [details.institute.address_line_1, details.institute.address_line_2].filter((v) => v && String(v).trim()).join(', ') : '';
  const typeLabel = details
    ? [details.institute.institute_type, details.institute.is_university ? 'University' : null].filter(Boolean).join(' · ') || 'Institution'
    : '';
  const review = details?.reviewSummary;
  const fees = details ? uniqueFees(details.fees).filter((fee) => money(fee.fees)) : [];
  const placements = details ? uniquePlacements(details.placements) : [];
  const programmes = details?.programmes || [];

  const dialog: ReactNode = (
    <div className="modal-backdrop college-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialogRef} className="college-modal decision-college-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button ref={closeRef} className="modal-close" type="button" aria-label="Close college details" onClick={close}><X size={22} aria-hidden="true" /></button>
        {loading && <p>Loading college details…</p>}
        {error && !loading && <p className="modal-error">{error}</p>}
        {details && !loading && <>
          {courseName ? <p className="eyebrow">College profile{courseName ? ` · ${courseName}` : ''}</p> : null}
          <h2 id={titleId}>{name}</h2>
          <p className="muted">{typeLabel}{location ? ` · ${location}` : ''}</p>
          {review && review.count > 0 ? <p className="college-modal-rating">Student reviews <strong>{review.count}{review.averageRating ? ` · ${Number(review.averageRating).toFixed(1)}/5` : ''}</strong></p> : null}
          {details.affiliation ? <p className="cp-affiliation college-modal-affiliation">{details.affiliation}</p> : null}

          {details.about ? <div className="college-modal-section"><h3>About</h3><AboutBlock html={details.about} /></div> : null}

          {(programmes.length > 0 || address || details.institute.establishment_year || website) && <div className="detail-grid">
            {programmes.length > 0 && <div>
              <strong>{programmes.length === 1 ? 'Programme' : 'Courses'}</strong>
              {programmes.map((item) => {
                const duration = formatProgrammeDuration(item.duration, item.name);
                const eligibility = plainText(item.eligibility || '', '');
                const seats = Number(item.total_seats) > 0 ? String(item.total_seats) : '';
                const programmeFees = fees.filter((fee) => Number(fee.programme_id) === Number(item.id));
                return <div className="programme-detail" key={item.id}>
                  <strong className="programme-name">{item.name}{item.course_name && item.course_name !== item.name ? ` · ${item.course_name}` : ''}</strong>
                  {duration ? <p><span className="detail-label">Duration</span><span className="detail-value">{duration}</span></p> : null}
                  {seats ? <p><span className="detail-label">Seats</span><span className="detail-value">{seats}</span></p> : null}
                  {eligibility ? <p><span className="detail-label">Eligibility</span><span className="detail-value">{eligibility}</span></p> : null}
                  {programmeFees.map((fee, index) => {
                    const amount = money(fee.fees);
                    if (!amount) return null;
                    const period = fee.fee_duration === 'total' ? 'total fees for the full course' : fee.fee_duration ? `per ${fee.fee_duration}` : '';
                    return <p key={`${fee.fee_type}-${index}`}><span className="detail-label">{fee.fee_type}</span><span className="detail-value">{amount}{period ? ` · ${period}` : ''}</span></p>;
                  })}
                </div>;
              })}
            </div>}
            {(address || details.institute.establishment_year || website) && <div>
              <strong>College information</strong>
              {address ? <p>{address}</p> : null}
              {details.institute.establishment_year ? <p>Established {details.institute.establishment_year}</p> : null}
              {website ? <p><a href={website} target="_blank" rel={OFFICIAL_WEBSITE_REL}>Official website</a></p> : null}
            </div>}
          </div>}

          {fees.length > 0 && programmes.length === 0 && <section><h3>Fees</h3><div className="detail-panel">{fees.map((item, index) => {
            const amount = money(item.fees);
            if (!amount) return null;
            return <p key={`${item.fee_type}-${index}`}><span className="detail-label">{item.fee_type}</span><span className="detail-value">{amount}{item.fee_duration === 'total' ? ' · total fees for the full course' : item.fee_duration ? ` · per ${item.fee_duration}` : ''}</span></p>;
          })}</div></section>}

          {placements.length > 0 && <section><h3>Placement</h3><div className="detail-panel"><strong>Placement records</strong>{placements.map((item, index) => <p key={`${item.year}-${index}`}><span className="detail-label">{item.year || 'Year not listed'}</span><span className="detail-value">Average {formatLpa(item.average_package)} · Highest {formatLpa(item.highest_package)}</span></p>)}</div></section>}

          {details.exams.length > 0 && <><h3>Exams</h3><p>{details.exams.map((item) => item.name).join(', ')}</p></>}

          {details.rankings.length > 0 && <><h3>Rankings</h3>{(() => {
            const overview = rankingOverview(details.rankings);
            return <div className="ranking-overview"><div className="ranking-pie" style={{ '--ranking-pie': overview.gradient } as CSSProperties}><span>{overview.bodies.length}</span></div><div className="ranking-legend">{overview.bodies.map((item) => <div key={item.body}><span className="ranking-legend-dot" style={{ backgroundColor: item.color }} /><strong>{item.body.toUpperCase()}</strong><small>{item.latest?.rank || '—'} latest rank</small></div>)}</div></div>;
          })()}<div className="ranking-groups">{rankingGroups(details.rankings).map((group) => <div className="ranking-group" key={group.key}><strong>{group.body.toUpperCase()} {group.course}:</strong>{group.rows.map((item) => <p key={item.id}>{item.year || 'Year not listed'}: Rank {item.rank}{item.out_of ? ` / ${item.out_of}` : ''}</p>)}</div>)}</div></>}

          {details.recruiters.length > 0 && <><h3>Recruiters listed</h3><div className="recruiter-list">{details.recruiters.map((item) => <span className="recruiter-chip" key={item.id}>{item.name}</span>)}</div></>}
        </>}
      </section>
    </div>
  );

  return <>
    {trigger}
    {createPortal(dialog, document.body)}
  </>;
}
