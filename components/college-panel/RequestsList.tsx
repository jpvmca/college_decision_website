'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SECTION_LABEL, STATUS_LABEL, formatIst, type ChangeItem, type ChangeRequest } from '../../lib/college-panel-types';
import { imageUrl } from '../../lib/api';
import { withdrawRequest } from './panel-client';

const HIDDEN_KEYS = new Set(['course_id', 'program_id', 'exam_id', 'exam_ids', 'recruiter_id', 'programme_id', 'institute_program_id', 'fees_type_id', 'path', 'proof_file_ids']);
const KEY_LABEL: Record<string, string> = {
  course: 'Course', specialisation: 'Specialisation', name: 'Name', duration_years: 'Duration (years)', total_seats: 'Seats', eligibility: 'Eligibility',
  description: 'Description', exams: 'Exams', exam: 'Exam', position: 'Designation', education: 'Qualification', speciality: 'Specialisation',
  fees: 'Amount (₹)', fee_type: 'Fee type', period: 'Period', year: 'Year', highest_package: 'Highest (LPA)', average_package: 'Average (LPA)',
  lowest_package: 'Lowest (LPA)', students_placed: 'Students placed', title: 'Caption', featured: 'Featured'
};

function text(value: unknown): string {
  return String(value).replace(/<[^>]+>/g, (tag) => (/^<\/(p|h\d|li)>|^<br/i.test(tag) ? '\n' : '')).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim();
}

/** Readable rendering of an old/new value: images as thumbnails, records as label/value lists, rich text as plain text. */
function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="muted">(empty)</span>;
  if (typeof value === 'boolean') return <>{value ? 'Yes' : 'No'}</>;
  if (Array.isArray(value)) return <>{value.map((v) => (typeof v === 'object' && v ? (v as { name?: string }).name || JSON.stringify(v) : String(v))).join(', ') || '(none)'}</>;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    const src = typeof v.path === 'string' && v.path.startsWith('/uploads/') ? imageUrl(v.path, 192) : typeof v.url === 'string' && /^https?:\/\//.test(v.url) ? v.url : null;
    const entries = Object.entries(v).filter(([k, x]) => !HIDDEN_KEYS.has(k) && k !== 'url' && k !== 'file_name' && x !== null && x !== undefined && x !== '');
    return <div className="cp3-value">
      {src ? <img src={src} alt="" className="cp3-value-img" /> : null}
      {entries.length ? <dl>{entries.map(([k, x]) => <Fragment key={k}><dt>{KEY_LABEL[k] || k.replace(/_/g, ' ')}</dt><dd>{Array.isArray(x) ? x.map((e) => (typeof e === 'object' && e ? (e as { name?: string }).name : String(e))).join(', ') : typeof x === 'object' ? JSON.stringify(x) : typeof x === 'boolean' ? (x ? 'Yes' : 'No') : text(x)}</dd></Fragment>)}</dl> : null}
    </div>;
  }
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text(value)}</span>;
}

export default function RequestsList({ instituteId, requests }: { instituteId: number; requests: ChangeRequest[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [items, setItems] = useState<Record<number, ChangeItem[]>>({});
  const [error, setError] = useState('');

  async function toggle(id: number) {
    if (open === id) return setOpen(null);
    setOpen(id);
    if (!items[id]) {
      const response = await fetch(`/api/college-panel/institutes/${instituteId}/change-requests/${id}`);
      const json = await response.json().catch(() => ({}));
      if (response.ok) setItems((m) => ({ ...m, [id]: json.data.items || [] }));
      else setError(json.error || 'Could not load the request');
    }
  }

  if (!requests.length) return <div className="cpn-card"><p className="muted" style={{ margin: 0 }}>No requests yet.</p></div>;
  return <section className="cpn-card">
    {error && <div className="cpn-alert err">{error}</div>}
    <table className="cpn-table">
      <thead><tr><th>#</th><th>Section</th><th>Change</th><th>Submitted</th><th>Reviewed</th><th>Status</th><th /></tr></thead>
      <tbody>{requests.map((r) => <Fragment key={r.id}>
        <tr>
          <td>{r.id}</td>
          <td>{SECTION_LABEL[r.section] || r.section}</td>
          <td>{r.summary || '—'}{r.note ? <div className="muted" style={{ fontSize: 13 }}>Your note: {r.note}</div> : null}{r.review_reason ? <div style={{ fontSize: 13, color: r.status === 'rejected' ? '#991b1b' : '#166534' }}>{r.status === 'rejected' ? 'Reason' : 'Reviewer note'}: {r.review_reason}</div> : null}</td>
          <td>{formatIst(r.created_at)}</td>
          <td>{formatIst(r.reviewed_at)}</td>
          <td><span className={`cpn-status ${r.status}`}>{STATUS_LABEL[r.status] || r.status}</span></td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <button type="button" className="cpn-btn ghost small" onClick={() => toggle(r.id)}>{open === r.id ? 'Hide' : 'Details'}</button>{' '}
            {r.status === 'pending' ? <button type="button" className="cpn-btn danger small" onClick={async () => { try { await withdrawRequest(instituteId, r.id); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not withdraw'); } }}>Withdraw</button> : null}
          </td>
        </tr>
        {open === r.id ? <tr><td colSpan={7}>
          {(items[r.id] || []).map((item) => <div key={item.id} style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 13 }}>{item.label || item.field_name}</strong> <span className={`cpn-status ${item.status}`}>{item.status}</span>
            <div className="cpn-diff" style={{ marginTop: 4 }}>
              <div><span className="muted">Before</span><Value value={item.action === 'create' ? null : item.old_value} /></div>
              <div><span className="muted">{item.action === 'delete' ? 'Proposed (remove)' : 'Proposed'}</span>{item.action === 'delete' ? <span className="muted">Will be removed</span> : <Value value={item.new_value} />}</div>
            </div>
          </div>)}
          {!items[r.id] ? <span className="muted">Loading…</span> : null}
        </td></tr> : null}
      </Fragment>)}</tbody>
    </table>
  </section>;
}
