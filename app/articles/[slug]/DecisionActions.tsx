'use client';

import { useState } from 'react';
import { GitCompareArrows, GraduationCap, X } from 'lucide-react';

type Props = {
  instituteId: number;
  courseId: number;
  instituteName: string;
  programmeName: string;
  duration: string | null;
  eligibility: string | null;
  fee: string;
  feeRecordCount?: number;
  instituteType?: string | null;
  city?: string | null;
  state?: string | null;
  averagePackage?: number | string | null;
  highestPackage?: number | string | null;
  placementYear?: number | string | null;
  admissionRoutes?: string | null;
  showCompare?: boolean;
};

type ComparedCollege = Omit<Props, 'fee'> & { fee: string };
type VerifiedDetails = {
  programmes: Array<{ name: string; duration?: string | null; eligibility?: string | null }>;
  fees: Array<{ fee_type: string; fees: number | string; fee_duration?: string | null }>;
  exams: Array<{ name: string }>;
};
const STORAGE_KEY = 'college-decision-compare';

function packageLabel(value: number | string | null | undefined, year: number | string | null | undefined) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not listed';
  return `₹${amount} LPA${year ? ` (${year})` : ''}`;
}

export default function DecisionActions(props: Props) {
  const [compareOpen, setCompareOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [compared, setCompared] = useState<ComparedCollege[]>([]);
  const [verifiedDetails, setVerifiedDetails] = useState<VerifiedDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  function readCompared() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ComparedCollege[];
      if (stored.some((item) => !('instituteType' in item))) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return stored;
    } catch {
      return [];
    }
  }

  async function loadVerifiedDetails() {
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const response = await fetch(`/api/college-details?instituteId=${props.instituteId}&courseId=${props.courseId}`);
      if (!response.ok) throw new Error('College details unavailable');
      const payload = await response.json() as { data: VerifiedDetails };
      setVerifiedDetails(payload.data);
      return payload.data;
    } catch {
      setDetailsError('Verified college details could not be loaded. Showing the available programme data.');
      return null;
    } finally {
      setDetailsLoading(false);
    }
  }

  async function compareCollege() {
    await loadVerifiedDetails();
    const current = readCompared();
    const exists = current.some((item) => item.instituteId === props.instituteId && item.courseId === props.courseId);
    const next = exists
      ? current.map((item) => item.instituteId === props.instituteId && item.courseId === props.courseId ? props : item)
      : [...current, props].slice(-3);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCompared(next);
    setCompareOpen(true);
  }


  async function checkAdmission() {
    await loadVerifiedDetails();
    setAdmissionOpen(true);
  }

  function removeCollege(instituteId: number, courseId: number) {
    const next = compared.filter((item) => item.instituteId !== instituteId || item.courseId !== courseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCompared(next);
  }

  return <>
    <div className="decision-actions">
      {props.showCompare !== false && <button className="view-button" type="button" onClick={compareCollege} disabled={detailsLoading}><GitCompareArrows size={16} aria-hidden="true" /> {detailsLoading ? 'Loading…' : 'Compare This College'}</button>}
      <button className="admission-button" type="button" onClick={checkAdmission} disabled={detailsLoading}><GraduationCap size={16} aria-hidden="true" /> {detailsLoading ? 'Loading…' : 'Check admission'}</button>
    </div>
    {compareOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCompareOpen(false)}>
      <section className="decision-modal" role="dialog" aria-modal="true" aria-labelledby="compare-title">
        <button className="modal-close" type="button" aria-label="Close comparison" onClick={() => setCompareOpen(false)}><X size={22} aria-hidden="true" /></button>
        <p className="eyebrow">COLLEGE COMPARISON</p>
        <h2 id="compare-title">Compare up to three colleges</h2>
        <p className="muted">Your comparison is saved only in this browser. Add another college from this article to compare alternatives.</p>
        <div className="compare-grid">{compared.map((item) => <article className="compare-card" key={`${item.instituteId}-${item.courseId}`}><button className="compare-remove" type="button" onClick={() => removeCollege(item.instituteId, item.courseId)}>Remove</button><h3>{item.instituteName}</h3><p className="compare-programme">{item.programmeName}</p><dl><div><dt>College type</dt><dd>{item.instituteType === 'public' ? 'Government / public' : item.instituteType || 'Not listed'}</dd></div><div><dt>Location</dt><dd>{[item.city, item.state].filter(Boolean).join(', ') || 'Not listed'}</dd></div><div><dt>Duration</dt><dd>{item.duration || 'Not listed'}</dd></div><div><dt>Recorded fee</dt><dd>{item.fee}</dd></div><div><dt>Fee records</dt><dd>{item.feeRecordCount ? `${item.feeRecordCount} records` : 'Not listed'}</dd></div><div><dt>Average package</dt><dd>{packageLabel(item.averagePackage, item.placementYear)}</dd></div><div><dt>Highest package</dt><dd>{packageLabel(item.highestPackage, item.placementYear)}</dd></div><div><dt>Eligibility</dt><dd>{item.eligibility || 'Check the latest official notice.'}</dd></div><div><dt>Admission route</dt><dd>{item.admissionRoutes || 'Not listed'}</dd></div></dl></article>)}</div>
      </section>
    </div>}
    {admissionOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAdmissionOpen(false)}>
      <section className="decision-modal admission-modal" role="dialog" aria-modal="true" aria-labelledby="admission-title">
        <button className="modal-close" type="button" aria-label="Close admission details" onClick={() => setAdmissionOpen(false)}><X size={22} aria-hidden="true" /></button>
        <p className="eyebrow">ADMISSION CHECK</p>
        <h2 id="admission-title">{props.programmeName}</h2>
        <p className="muted">{props.instituteName}</p>
        {detailsError && <p className="modal-error">{detailsError}</p>}
        <dl className="admission-summary">
          <div><dt>College type</dt><dd>{props.instituteType === 'public' ? 'Government / public' : props.instituteType || 'Not listed'}</dd></div>
          <div><dt>Location</dt><dd>{[props.city, props.state].filter(Boolean).join(', ') || 'Not listed'}</dd></div>
          <div><dt>Programme duration</dt><dd>{props.duration || 'Not listed'}</dd></div>
          <div><dt>Lowest recorded fee</dt><dd>{props.fee}</dd></div>
          <div><dt>Fee records</dt><dd>{props.feeRecordCount ? `${props.feeRecordCount} records` : 'Not listed'}</dd></div>
          <div><dt>Average package</dt><dd>{packageLabel(props.averagePackage, props.placementYear)}</dd></div>
          <div><dt>Highest package</dt><dd>{packageLabel(props.highestPackage, props.placementYear)}</dd></div>
        </dl>
        <h3>Eligibility</h3><p>{verifiedDetails?.programmes.find((item) => item.name === props.programmeName)?.eligibility || props.eligibility || 'Eligibility is not listed. Confirm the latest official admission notice.'}</p>
        <h3>Admission route and exams</h3><p>{props.admissionRoutes || (verifiedDetails?.exams.length ? verifiedDetails.exams.map((exam) => exam.name).join(', ') : 'The admission route is not listed for this programme. Check the official college notice.')}</p>
        <div className="notice"><strong>Before applying:</strong> confirm the current academic year, required subjects, minimum marks, entrance exam, counselling process and application deadline with the institution.</div>
      </section>
    </div>}
  </>;
}
