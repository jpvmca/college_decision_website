'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, Clock, GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import type { V2Live, V2Programme } from '../v2/types';
import { Card, EmptyState, MultiSelect, SearchSelect, SubmitBar, useSubmit, type Option } from './ui';
import { catalogCourses, catalogExams, catalogPrograms, type CatalogCourse } from './v3-client';
import { firstLinkError, LinkWarning } from './LinkGuard';

const clean = (v: string | null | undefined) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/\s+\n/g, '\n').trim();
/** institute_programs.duration is years (older rows sometimes months). */
export const programmeYears = (d: number | null | undefined) => { const n = Number(d) || 0; if (!n) return null; return n > 8 ? Math.max(1, Math.round(n / 12)) : n; };

export default function CoursesManager({ instituteId, live }: { instituteId: number; live: V2Live }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(live.programmes.length === 0);
  const removal = useSubmit(instituteId, 'courses');
  const groups = useMemo(() => {
    const map = new Map<string, V2Programme[]>();
    for (const p of live.programmes) map.set(p.course_name || 'Other', [...(map.get(p.course_name || 'Other') || []), p]);
    return [...map.entries()];
  }, [live.programmes]);

  return <>
    <Card title={<><GraduationCap size={19} /> Courses offered ({live.programmes.length})</>} description="Every course listed on your public profile. Edit seats, eligibility and the course description, or ask us to remove a course you no longer offer."
      actions={<button type="button" className="cpn-btn" onClick={() => setAdding((a) => !a)}><Plus size={16} /> Add a course</button>}>
      {removal.error && <div className="cpn-alert err" role="alert">{removal.error}</div>}
      {removal.ok && <div className="cpn-alert ok" role="status">{removal.ok}</div>}
      {live.programmes.length ? groups.map(([group, list]) => <div key={group} className="cp3-course-group">
        <h3>{group} <small>{list.length}</small></h3>
        {list.map((p) => <div key={p.id} className={`cp3-course${editing === p.id ? ' open' : ''}`}>
          <div className="cp3-course-row">
            <div className="cp3-course-main"><strong>{p.name}</strong>
              <span className="cp3-meta">{programmeYears(p.duration) ? <span><Clock size={13} /> {programmeYears(p.duration)} year{programmeYears(p.duration) === 1 ? '' : 's'}</span> : null}
                <span><Users size={13} /> {p.total_seats ? `${p.total_seats} seats` : 'Seats not set'}</span>
                {!clean(p.eligibility) ? <span className="warn">Eligibility missing</span> : null}</span></div>
            <div className="cp3-course-actions">
              <button type="button" className="cpn-btn ghost small" onClick={() => setEditing(editing === p.id ? null : p.id)}>{editing === p.id ? 'Close' : 'Edit details'} <ChevronDown size={14} /></button>
              <button type="button" className="cpn-btn danger small" aria-label={`Remove ${p.name}`} disabled={removal.busy}
                onClick={() => { if (window.confirm(`Ask us to remove “${p.name}” from your profile? Its fees and placement records will be hidden with it.`)) void removal.submit({ items: [{ op: 'remove', programmeId: p.id }] }); }}><Trash2 size={14} /></button>
            </div>
          </div>
          {editing === p.id ? <CourseDetailsForm instituteId={instituteId} programme={p} onDone={() => setEditing(null)} /> : null}
        </div>)}
      </div>) : <EmptyState icon={<BookOpen size={28} />} title="No courses listed yet">Add the courses you offer: pick the degree and specialisation from our course list.</EmptyState>}
    </Card>
    {adding ? <AddCourseForm instituteId={instituteId} existingProgramIds={live.programmes.map((p) => Number(p.program_id)).filter(Boolean)} onClose={() => setAdding(false)} /> : null}
  </>;
}

function CourseDetailsForm({ instituteId, programme, onDone }: { instituteId: number; programme: V2Programme; onDone: () => void }) {
  const [seats, setSeats] = useState(programme.total_seats ? String(programme.total_seats) : '');
  const [eligibility, setEligibility] = useState(clean(programme.eligibility));
  const [description, setDescription] = useState(clean(programme.description));
  const [note, setNote] = useState('');
  const { busy, error, ok, submit } = useSubmit(instituteId, 'courses');
  const item: Record<string, unknown> = { programmeId: programme.id };
  if (seats !== (programme.total_seats ? String(programme.total_seats) : '')) item.totalSeats = seats ? Number(seats) : null;
  if (eligibility !== clean(programme.eligibility)) item.eligibility = eligibility;
  if (description !== clean(programme.description)) item.description = description;
  const count = Object.keys(item).length - 1;
  const linkError = firstLinkError([[eligibility, 'Eligibility'], [description, 'Course description']]);
  return <div className="cp3-course-form cpn-form">
    <div className="cp3-fields-3">
      <label>Total seats (intake)<input type="number" min={1} max={50000} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="e.g. 120" /></label>
    </div>
    <label>Eligibility<textarea rows={3} maxLength={4000} value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="e.g. 10+2 with Physics, Chemistry and Mathematics, minimum 50% marks (45% for reserved categories)" /><span className="cpn-hint">{eligibility.length}/4000</span><LinkWarning value={eligibility} label="Eligibility" /></label>
    <label>Course description<textarea rows={4} maxLength={8000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What students learn, specialisations, labs, internships" /><span className="cpn-hint">{description.length}/8000</span><LinkWarning value={description} label="Course description" /></label>
    <SubmitBar sticky={false} busy={busy} error={error} ok={ok} note={note} onNote={setNote} count={count} label="Submit course details" disabled={!count || Boolean(linkError)}
      onSubmit={async () => { if (await submit({ items: [item] }, note)) { setNote(''); setTimeout(onDone, 1200); } }} />
  </div>;
}

function AddCourseForm({ instituteId, existingProgramIds, onClose }: { instituteId: number; existingProgramIds: number[]; onClose: () => void }) {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [programs, setPrograms] = useState<Option[]>([]);
  const [exams, setExams] = useState<Option[]>([]);
  const [loading, setLoading] = useState({ courses: true, programs: false });
  const [courseId, setCourseId] = useState<number | null>(null);
  const [programId, setProgramId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [years, setYears] = useState('');
  const [seats, setSeats] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [description, setDescription] = useState('');
  const [examIds, setExamIds] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const { busy, error, ok, setError, submit } = useSubmit(instituteId, 'courses');

  useEffect(() => {
    catalogCourses().then((list) => { setCourses(list); setLoading((l) => ({ ...l, courses: false })); }).catch((e) => setError(e.message));
    catalogExams().then((list) => setExams(list.map((e) => ({ id: e.id, name: e.name, hint: e.level })))).catch(() => undefined);
  }, [setError]);
  useEffect(() => {
    setPrograms([]); setProgramId(null);
    if (!courseId) return;
    setLoading((l) => ({ ...l, programs: true }));
    catalogPrograms(courseId).then((list) => setPrograms(list.map((p) => ({ ...p, hint: existingProgramIds.includes(p.id) ? 'Already listed' : undefined }))))
      .catch((e) => setError(e.message)).finally(() => setLoading((l) => ({ ...l, programs: false })));
    const c = courses.find((x) => x.id === courseId);
    if (c?.years) setYears(String(c.years));
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const courseOptions = useMemo(() => courses.map((c) => ({ id: c.id, name: c.name, hint: c.years ? `${c.years} yr` : undefined })), [courses]);
  const duplicate = programId ? existingProgramIds.includes(programId) : false;
  const ready = courseId && programId && !duplicate && name.trim().length >= 2;
  const linkError = firstLinkError([[name, 'Course name'], [eligibility, 'Eligibility'], [description, 'Course description']]);

  return <Card className="cp3-add" title={<><Plus size={19} /> Add a course</>} description="Pick the degree and the specialisation from our course list so students can find it in search and course pages."
    actions={<button type="button" className="cpn-btn ghost small" onClick={onClose}>Cancel</button>}>
    <div className="cpn-form">
      <div className="cp3-fields-2">
        <div className="cp3-label"><span className="cp3-label-text">Degree / course <span className="cp3-req">*</span></span>
          <SearchSelect options={courseOptions} value={courseId} loading={loading.courses} label="Degree" placeholder="Choose a degree, e.g. B.Tech, MBA, B.Sc" onChange={(id) => setCourseId(id)} />
        </div>
        <div className="cp3-label"><span className="cp3-label-text">Specialisation <span className="cp3-req">*</span></span>
          <SearchSelect options={programs} value={programId} disabled={!courseId} loading={loading.programs} label="Specialisation" placeholder={courseId ? 'Choose the specialisation' : 'Choose a degree first'}
            emptyText="No specialisation matches. Write to us if yours is missing." onChange={(id, option) => { setProgramId(id); if (option) setName(option.name); }} />
          {duplicate ? <span className="cpn-field-error">This specialisation is already listed for your college.</span> : null}
        </div>
      </div>
      <div className="cp3-fields-3">
        <label><span className="cp3-label-text">Name shown on your profile <span className="cp3-req">*</span></span><input type="text" maxLength={255} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. B.Tech Computer Science and Engineering" /><LinkWarning value={name} label="Course name" /></label>
        <label>Duration (years)<select value={years} onChange={(e) => setYears(e.target.value)}><option value="">Select</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((y) => <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>)}</select></label>
        <label>Total seats<input type="number" min={1} max={50000} inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="e.g. 60" /></label>
      </div>
      <div className="cp3-label">Entrance exams accepted<MultiSelect options={exams} values={examIds} onChange={setExamIds} label="Exams" placeholder="Search exams, e.g. JEE Main, CAT, NEET" /></div>
      <label>Eligibility<textarea rows={3} maxLength={4000} value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="e.g. Graduation in any discipline with 50% marks" /><LinkWarning value={eligibility} label="Eligibility" /></label>
      <label>Course description <span className="cpn-hint">(optional)</span><textarea rows={3} maxLength={8000} value={description} onChange={(e) => setDescription(e.target.value)} /><LinkWarning value={description} label="Course description" /></label>
    </div>
    <SubmitBar sticky={false} busy={busy} error={error} ok={ok} note={note} onNote={setNote} label="Submit new course for review" disabled={!ready || Boolean(linkError)}
      onSubmit={async () => {
        const done = await submit({ items: [{ op: 'add', courseId, programId, name: name.trim(), duration: years ? Number(years) : null, totalSeats: seats ? Number(seats) : null, eligibility, description, examIds }] }, note);
        if (done) { setCourseId(null); setProgramId(null); setName(''); setSeats(''); setEligibility(''); setDescription(''); setExamIds([]); setNote(''); }
      }} />
  </Card>;
}
