'use client';

import { useEffect, useState, type CSSProperties } from 'react';

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
  fees: Array<{ programme_id: number; programme_name?: string | null; programme_duration?: number | string | null; fee_type: string; fees: number | string; fee_duration?: string | null }>;
  exams: Array<{ id: number; name: string; slug?: string | null }>;
  placements: Array<{ programme_id: number; year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ id: number; course_id?: number | null; course_name?: string | null; rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; url?: string | null; organization?: string | null; industry?: string | null }>;
};

type Props = {
  instituteId: number;
  courseId: number;
  courseName: string;
};

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

function formatPlacement(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `₹${amount} lakh` : 'Not listed';
}

function formatDuration(value: number | string | null | undefined) {
  const months = Number(value);
  if (Number.isFinite(months) && months >= 12 && months % 12 === 0) return `${months / 12} Years`;
  return value ? `${value} Years` : 'Duration not listed';
}

function uniqueFees(fees: CollegeDetails['fees']) {
  return Array.from(new Map(fees.map((fee) => [`${fee.fee_type}:${fee.fees}:${fee.fee_duration || ''}`, fee])).values());
}

function uniquePlacements(placements: CollegeDetails['placements']) {
  const byYear = new Map<string, CollegeDetails['placements'][number]>();
  placements.forEach((placement) => {
    const key = String(placement.year || 'unknown');
    const current = byYear.get(key);
    if (!current || Number(placement.highest_package || 0) > Number(current.highest_package || 0)) byYear.set(key, placement);
  });
  return Array.from(byYear.values()).sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
}

function rankingGroups(rankings: CollegeDetails['rankings']) {
  return Array.from(rankings.reduce((groups, ranking) => {
    const key = `${ranking.ranking_body}:${ranking.course_name || 'Institution'}`;
    const group = groups.get(key) || { key, body: ranking.ranking_body, course: ranking.course_name || 'Institution', rows: [] as CollegeDetails['rankings'] };
    group.rows.push(ranking);
    groups.set(key, group);
    return groups;
  }, new Map<string, { key: string; body: string; course: string; rows: CollegeDetails['rankings'] }>()).values())
    .map((group) => ({ ...group, rows: group.rows.sort((a, b) => Number(b.year || 0) - Number(a.year || 0)) }));
}

function rankingOverview(rankings: CollegeDetails['rankings']) {
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];
  const latestByBody = new Map<string, CollegeDetails['rankings'][number][]>();
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
          {details.programmes.map((programme) => <div className="modal-block" key={programme.id}><strong>{programme.name}</strong><p><span className="detail-label">Duration</span><span className="detail-value">{programme.duration || 'Not listed'}</span><span className="detail-separator">·</span><span className="detail-label">Seats</span><span className="detail-value">{programme.total_seats || 'Not listed'}</span></p><p><span className="detail-label">Eligibility</span><span className="detail-value">{programme.eligibility || 'Check the latest official notice.'}</span></p>{programme.description && <p><span className="detail-label">Admission note</span><span className="detail-value">{programme.description}</span></p>}</div>)}
          {(details.fees.length > 0 || details.placements.length > 0) && <div className="profile-two-column">{details.fees.length > 0 && <section><h3>Fees</h3><div className="detail-panel"><strong>Course &amp; Duration</strong>{uniqueFees(details.fees).map((fee, index) => <div className="fee-course-row" key={`${fee.programme_id}-${fee.fee_type}-${fee.fees}-${index}`}><strong>{fee.programme_name || 'Programme not listed'}</strong><span>Full Time | {formatDuration(fee.programme_duration)} | On Campus</span><b>{formatMoney(fee.fees)}{fee.fee_duration ? ` per ${fee.fee_duration}` : ''}</b></div>)}</div></section>}{details.placements.length > 0 && <section><h3>Placement</h3><div className="detail-panel"><strong>Year-wise placement summary</strong>{uniquePlacements(details.placements).map((placement, index) => <p key={`${placement.year}-${index}`}>{placement.year || 'Year not listed'}: average {formatPlacement(placement.average_package)}, highest {formatPlacement(placement.highest_package)}</p>)}</div></section>}</div>}
          {details.exams.length > 0 && <><h3>Relevant exams</h3><p>{details.exams.map((exam) => exam.name).join(', ')}</p></>}
          {details.rankings.length > 0 && <><h3>Rankings</h3>{(() => { const overview = rankingOverview(details.rankings); return <div className="ranking-overview"><div className="ranking-pie" style={{ '--ranking-pie': overview.gradient } as CSSProperties}><span>{overview.bodies.length}</span></div><div className="ranking-legend">{overview.bodies.map((item) => <div key={item.body}><span className="ranking-legend-dot" style={{ backgroundColor: item.color }} /><strong>{item.body.toUpperCase()}</strong><small>{item.latest?.rank || '—'} latest rank</small></div>)}</div></div>; })()}<div className="ranking-groups">{rankingGroups(details.rankings).map((group) => { const latest = group.rows[0]; const score = latest?.out_of ? Math.max(0, Math.min(100, (1 - latest.rank / latest.out_of) * 100)) : 0; return <div className="ranking-group" key={group.key}><strong>{group.body.toUpperCase()} {group.course}:</strong><div className="ranking-visual"><div className="ranking-donut-wrap"><div className="ranking-donut" style={{ '--ranking-score': `${score}%` } as CSSProperties}><span>{latest?.rank || '—'}</span></div><small>Latest rank</small></div><div className="ranking-history">{group.rows.map((ranking) => <p key={ranking.id}>{ranking.year || 'Year not listed'}: Rank {ranking.rank}{ranking.out_of ? ` / ${ranking.out_of}` : ''}</p>)}</div></div></div>; })}</div></>}
          {details.recruiters.length > 0 && <><h3>Recruiters listed</h3><div className="recruiter-list">{details.recruiters.map((recruiter) => <span className="recruiter-chip" key={recruiter.id}>{recruiter.name}</span>)}</div></>}
          <div className="original-summary"><strong>College Decision summary</strong><p>This profile is an original comparison summary based on the listed institute, programme and source records. The official college name and reported figures are retained for accuracy; confirm current details with the institution before applying.</p></div>
        </div>}
      </section>
    </div>}
  </>;
}
