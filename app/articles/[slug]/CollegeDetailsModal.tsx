'use client';

import { useEffect, useState } from 'react';

type CollegeDetails = {
  institute: {
    id: number;
    full_name: string;
    display_name?: string | null;
    slug?: string | null;
    institute_type?: string | null;
    website?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    phone_number_1?: string | null;
    email?: string | null;
    establishment_year?: number | null;
    is_university?: number | boolean | null;
    city?: string | null;
    state?: string | null;
  };
  programmes: Array<{
    id: number;
    name: string;
    duration?: string | null;
    total_seats?: number | null;
    eligibility?: string | null;
    description?: string | null;
  }>;
  fees: Array<{ programme_id: number; fee_type: string; fees: number | string; fee_duration?: string | null }>;
  exams: Array<{ id: number; name: string; slug?: string | null }>;
  placements: Array<{ programme_id: number; year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
};

type Props = {
  instituteId: number;
  courseId: number;
  courseName: string;
};

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

export default function CollegeDetailsModal({ instituteId, courseId, courseName }: Props) {
  const [details, setDetails] = useState<CollegeDetails | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  async function loadDetails() {
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/college-details?instituteId=${instituteId}&courseId=${courseId}`);
      if (!response.ok) throw new Error('Details unavailable');
      const payload = await response.json() as { data: CollegeDetails };
      setDetails(payload.data);
    } catch {
      setError('College details could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button className="view-button" type="button" onClick={loadDetails}>View college details</button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="college-modal" role="dialog" aria-modal="true" aria-labelledby={`college-title-${instituteId}`}>
        <button className="modal-close" type="button" aria-label="Close college details" onClick={() => setOpen(false)}>×</button>
        {loading && <p>Loading verified college details…</p>}
        {error && <p className="modal-error">{error}</p>}
        {details && <div>
          <p className="eyebrow">College profile · {courseName}</p>
          <h2 id={`college-title-${instituteId}`}>{details.institute.display_name || details.institute.full_name}</h2>
          <p className="muted">{details.institute.institute_type || 'Institution'} · {[details.institute.city, details.institute.state].filter(Boolean).join(', ') || 'Location not listed'}</p>
          <div className="detail-grid">
            <div><strong>About this college</strong><p>{details.institute.address_line_1 || 'Address not listed'}{details.institute.address_line_2 ? `, ${details.institute.address_line_2}` : ''}</p><p>{details.institute.establishment_year ? `Established ${details.institute.establishment_year}.` : 'Establishment year not listed.'} {details.institute.is_university ? 'Listed as a university.' : ''}</p></div>
            <div><strong>Contact</strong><p>{details.institute.website ? <a href={details.institute.website} target="_blank" rel="noreferrer">Official website</a> : 'Website not listed'}</p><p>{details.institute.email || details.institute.phone_number_1 || 'Contact details not listed'}</p></div>
          </div>
          <h3>Programme details</h3>
          {details.programmes.map((programme) => <div className="modal-block" key={programme.id}><strong>{programme.name}</strong><p>Duration: {programme.duration || 'Not listed'} · Seats: {programme.total_seats || 'Not listed'}</p><p>Eligibility: {programme.eligibility || 'Check the latest official notice.'}</p>{programme.description && <p>{programme.description}</p>}</div>)}
          <h3>Fees and placement records</h3>
          <div className="detail-grid">
            <div><strong>Recorded fees</strong>{details.fees.length ? details.fees.map((fee, index) => <p key={`${fee.programme_id}-${fee.fee_type}-${index}`}>{fee.fee_type}: {formatMoney(fee.fees)}{fee.fee_duration ? ` · ${fee.fee_duration}` : ''}</p>) : <p>Fee records not listed.</p>}</div>
            <div><strong>Placement records</strong>{details.placements.length ? details.placements.map((placement, index) => <p key={`${placement.programme_id}-${placement.year}-${index}`}>{placement.year || 'Year not listed'}: average {formatMoney(placement.average_package)}, highest {formatMoney(placement.highest_package)}</p>) : <p>Placement records not listed.</p>}</div>
          </div>
          <h3>Relevant exams</h3>
          <p>{details.exams.length ? details.exams.map((exam) => exam.name).join(', ') : 'Exam information not listed.'}</p>
          <div className="original-summary"><strong>College Decision summary</strong><p>This profile is an original comparison summary based on the listed institute, programme and source records. The official college name and reported figures are retained for accuracy; confirm current details with the institution before applying.</p></div>
        </div>}
      </section>
    </div>}
  </>;
}
