import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { getPanelContext, panelFetch } from '../../../lib/college-panel';
import { ChangeRequest, SECTION_LABEL, STATUS_LABEL, formatIst } from '../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'Overview', robots: { index: false, follow: false } };

type Overview = { data: { sections: Array<{ key: string; label: string; pending: number }>; requests: ChangeRequest[]; completeness?: Record<string, number> } };

/** Checklist shown on the overview. `goal` is the live count that counts as "done". */
const CHECKLIST: Array<{ key: string; href: string; label: string; desc: string; goal: number; unit: string }> = [
  { key: 'logo', href: '/college/logo', label: 'Logo', desc: 'Your official logo on the profile, search and listings.', goal: 1, unit: '' },
  { key: 'about', href: '/college/about', label: 'About', desc: 'The introduction students read first.', goal: 1, unit: '' },
  { key: 'contact', href: '/college/contact', label: 'Contact details', desc: 'Phone, email, website and address.', goal: 3, unit: 'of 4 filled' },
  { key: 'admissions', href: '/college/admissions', label: 'Admissions', desc: 'Eligibility, process and key steps.', goal: 1, unit: '' },
  { key: 'gallery', href: '/college/gallery', label: 'Photo gallery', desc: 'Campus photos; aim for at least 6.', goal: 6, unit: 'photos' },
  { key: 'courses', href: '/college/courses', label: 'Courses', desc: 'Degrees and specialisations you offer.', goal: 1, unit: 'courses' },
  { key: 'fees', href: '/college/fees', label: 'Fees', desc: 'Year-wise fee structure per course.', goal: 1, unit: 'fee entries' },
  { key: 'exams', href: '/college/exams', label: 'Entrance exams', desc: 'Exams accepted for each course.', goal: 1, unit: 'course–exam links' },
  { key: 'placements', href: '/college/placements', label: 'Placements', desc: 'Packages by course and year.', goal: 1, unit: 'records' },
  { key: 'recruiters', href: '/college/recruiters', label: 'Recruiters', desc: 'Companies that hire your students.', goal: 5, unit: 'companies' },
  { key: 'faculty', href: '/college/faculty', label: 'Faculty', desc: 'Key faculty with designation.', goal: 3, unit: 'members' }
];

export default async function CollegePanelHome() {
  const ctx = (await getPanelContext())!;
  const overview = await panelFetch<Overview>(`/institutes/${ctx.college.id}/overview`);
  const pending = Object.fromEntries((overview.body?.data.sections || []).map((s) => [s.key, s.pending]));
  const counts = overview.body?.data.completeness || {};
  const requests = (overview.body?.data.requests || []).slice(0, 8);
  const items = CHECKLIST.map((c) => ({ ...c, count: Number(counts[c.key] || 0), pending: pending[c.key] || 0 }));
  const done = items.filter((i) => i.count >= i.goal).length;
  const pct = Math.round((done / items.length) * 100);
  const next = items.find((i) => i.count < i.goal && !i.pending);
  return <>
    <div className="cpn-head">
      <div>
        <h1>Welcome, {ctx.user.name ? ctx.user.name.trim().charAt(0).toUpperCase() + ctx.user.name.trim().slice(1) : ctx.user.email}</h1>
        <p>Manage the public profile of {ctx.college.name}. Every change is reviewed by the CollegeDecision team before it goes live.</p>
      </div>
    </div>
    <section className="cpn-card cp3-card cp3-progress-card">
      <div className="cp3-progress-head">
        <div className="cp3-ring" style={{ ['--pct' as string]: `${pct}%` }}><span>{pct}%</span></div>
        <div>
          <h2>Profile completeness</h2>
          <p>{done} of {items.length} sections complete.{next ? <> Next suggested step: <Link href={next.href}>{next.label}</Link>.</> : ' Great work: keep it up to date every year.'}</p>
        </div>
      </div>
      <ul className="cp3-checklist">
        {items.map((i) => {
          const ok = i.count >= i.goal;
          return <li key={i.key} className={ok ? 'done' : ''}>
            <Link href={i.href}>
              {ok ? <CheckCircle2 size={20} className="ok" aria-label="Complete" /> : i.pending ? <Clock size={20} className="wait" aria-label="Waiting for review" /> : <Circle size={20} className="todo" aria-label="To do" />}
              <span className="cp3-check-text"><strong>{i.label}</strong><small>{i.desc}</small></span>
              <span className="cp3-check-meta">
                {i.unit ? <small>{i.count} {i.unit}</small> : <small>{ok ? 'Added' : 'Missing'}</small>}
                {i.pending ? <span className="cpn-status pending">{i.pending} in review</span> : null}
              </span>
            </Link>
          </li>;
        })}
      </ul>
    </section>
    <section className="cpn-card">
      <h2>Recent requests</h2>
      {requests.length ? <table className="cpn-table">
        <thead><tr><th>#</th><th>Section</th><th>Change</th><th>Submitted</th><th>Status</th></tr></thead>
        <tbody>{requests.map((r) => <tr key={r.id}>
          <td>{r.id}</td>
          <td>{SECTION_LABEL[r.section] || r.section}</td>
          <td>{r.summary || '—'}{r.status === 'rejected' && r.review_reason ? <div className="muted" style={{ fontSize: 13 }}>Reason: {r.review_reason}</div> : null}</td>
          <td>{formatIst(r.created_at)}</td>
          <td><span className={`cpn-status ${r.status}`}>{STATUS_LABEL[r.status] || r.status}</span></td>
        </tr>)}</tbody>
      </table> : <p className="muted">No requests yet. Pick a section above to suggest your first update.</p>}
      {requests.length ? <p style={{ marginBottom: 0 }}><Link href="/college/requests">All requests →</Link></p> : null}
    </section>
  </>;
}
