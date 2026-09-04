'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';

type Details = {
  institute: {
    display_name?: string | null;
    full_name: string;
    institute_type?: string | null;
    website?: string | null;
    city?: string | null;
    state?: string | null;
    address_line_1?: string | null;
    establishment_year?: number | null;
  };
  programmes: Array<{ id: number; name: string; duration?: string | null; eligibility?: string | null }>;
  fees: Array<{ programme_id?: number; programme_name?: string | null; programme_duration?: number | string | null; fee_type: string; fees: number | string; fee_duration?: string | null }>;
  exams: Array<{ name: string }>;
  placements: Array<{ year?: number | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ id: number; course_id?: number | null; course_name?: string | null; rank: number; out_of?: number | null; year?: number | null; ranking_body: string }>;
  recruiters: Array<{ id: number; name: string; url?: string | null; organization?: string | null; industry?: string | null }>;
};

type Props = { instituteId: number; courseId: number; courseName: string };

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Not listed';
}

function formatDuration(value: number | string | null | undefined) {
  const months = Number(value);
  if (Number.isFinite(months) && months >= 12 && months % 12 === 0) return `${months / 12} Years`;
  return value ? `${value} Years` : 'Duration not listed';
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

export default function CollegeViewDetailsModal({ instituteId, courseId, courseName }: Props) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  async function load() {
    setOpen(true);
    if (details) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/college-details?instituteId=${instituteId}&courseId=${courseId}`);
      if (!response.ok) throw new Error('Details unavailable');
      const payload = await response.json() as { data: Details };
      setDetails(payload.data);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button className="details-button" type="button" onClick={load}><span aria-hidden="true">⌾</span> View college details</button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="college-modal decision-college-modal" role="dialog" aria-modal="true" aria-labelledby={`decision-college-${instituteId}`}>
        <button className="modal-close" type="button" aria-label="Close college details" onClick={() => setOpen(false)}><X size={22} aria-hidden="true" /></button>
        {loading && <p>Loading college details…</p>}
        {details && <><p className="eyebrow">COLLEGE PROFILE · {courseName}</p><h2 id={`decision-college-${instituteId}`}>{details.institute.display_name || details.institute.full_name}</h2><p className="muted">{details.institute.institute_type || 'Institution'} · {[details.institute.city, details.institute.state].filter(Boolean).join(', ') || 'Location not listed'}</p><div className="detail-grid"><div><strong>Programme</strong>{details.programmes.map((item) => <div className="programme-detail" key={item.id}><strong className="programme-name">{item.name}</strong><p><span className="detail-label">Duration</span><span className="detail-value">{item.duration || 'Not listed'}</span></p><p><span className="detail-label">Eligibility</span><span className="detail-value">{item.eligibility || 'Not listed'}</span></p></div>)}</div><div><strong>College information</strong><p>{details.institute.address_line_1 || 'Address not listed'}</p><p>{details.institute.establishment_year ? `Established ${details.institute.establishment_year}` : 'Establishment year not listed'}</p>{details.institute.website && <a href={details.institute.website} target="_blank" rel="noreferrer">Official website</a>}</div></div>{(details.fees.length > 0 || details.placements.length > 0) && <div className="profile-two-column">{details.fees.length > 0 && <section><h3>Fees</h3><div className="detail-panel"><strong>Recorded fees</strong>{details.fees.map((item, index) => <p key={`${item.fee_type}-${index}`}><span className="detail-label">{item.fee_type}</span><span className="detail-value">{money(item.fees)}{item.fee_duration ? ` · ${item.fee_duration}` : ''}</span></p>)}</div></section>}{details.placements.length > 0 && <section><h3>Placement</h3><div className="detail-panel"><strong>Placement records</strong>{details.placements.map((item, index) => <p key={`${item.year}-${index}`}><span className="detail-label">{item.year || 'Year not listed'}</span><span className="detail-value">Average {money(item.average_package)} · Highest {money(item.highest_package)}</span></p>)}</div></section>}</div>}<h3>Exams</h3><p>{details.exams.length ? details.exams.map((item) => item.name).join(', ') : 'Exam information not listed.'}</p>{details.rankings.length > 0 && <><h3>Rankings</h3>{(() => { const overview = rankingOverview(details.rankings); return <div className="ranking-overview"><div className="ranking-pie" style={{ '--ranking-pie': overview.gradient } as CSSProperties}><span>{overview.bodies.length}</span></div><div className="ranking-legend">{overview.bodies.map((item) => <div key={item.body}><span className="ranking-legend-dot" style={{ backgroundColor: item.color }} /><strong>{item.body.toUpperCase()}</strong><small>{item.latest?.rank || '—'} latest rank</small></div>)}</div></div>; })()}<div className="ranking-groups">{rankingGroups(details.rankings).map((group) => <div className="ranking-group" key={group.key}><strong>{group.body.toUpperCase()} {group.course}:</strong>{group.rows.map((item) => <p key={item.id}>{item.year || 'Year not listed'}: Rank {item.rank}{item.out_of ? ` / ${item.out_of}` : ''}</p>)}<div className="ranking-trend" aria-label={`${group.body} ${group.course} ranking trend`}>{group.rows.map((item) => <span className="ranking-bar" key={`bar-${item.id}`} title={`${item.year || 'Year'}: rank ${item.rank} of ${item.out_of || '?'}`} style={{ width: `${Math.max(8, item.out_of ? (1 - item.rank / item.out_of) * 100 : 8)}%` }} />)}</div></div>)}</div></>}{details.recruiters.length > 0 && <><h3>Recruiters listed</h3><div className="recruiter-list">{details.recruiters.map((item) => <span className="recruiter-chip" key={item.id}>{item.name}</span>)}</div></>}</>}
      </section>
    </div>}
  </>;
}
