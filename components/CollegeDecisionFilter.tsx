'use client';

import { FormEvent, useEffect, useState } from 'react';
import ExpandableText from './ExpandableText';
import CollegeDecisionCard, { CollegeDecisionResult } from './CollegeDecisionCard';
import { decisionCities, decisionCourses, decisionStates } from '../lib/decision-static';
import { ArrowRight, BadgeCheck, Building2, GitBranch, MapPin, Search, WalletCards, X } from 'lucide-react';

type Option = { name: string; slug: string };
type CountOption = { name: string; stateSlug?: string };
type DecisionOptions = {
  branches: CountOption[];
  exams: CountOption[];
  budget: { min: number; max: number };
};
type Recommendation = CollegeDecisionResult & { courseName: string; placementYear: number | null };
export type DecisionFilterValues = {
  course?: string;
  state?: string;
  city?: string;
  budgetMax?: string;
  instituteType?: string;
  branch?: string;
  exam?: string;
};

function money(value: number | string | null) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}` : 'Not listed';
}

export default function CollegeDecisionFilter({ initialFilters = {}, collapsible = false }: { initialFilters?: DecisionFilterValues; collapsible?: boolean }) {
  const inline = true;
  const global = false;
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(!collapsible);
  const [courses, setCourses] = useState<Option[]>([...decisionCourses]);
  const [states, setStates] = useState<Option[]>([...decisionStates]);
  const [course, setCourse] = useState(initialFilters.course || '');
  const [state, setState] = useState(initialFilters.state || '');
  const [courseSearch, setCourseSearch] = useState(decisionCourses.find((item) => item.slug === initialFilters.course)?.name || '');
  const [stateSearch, setStateSearch] = useState(decisionStates.find((item) => item.slug === initialFilters.state)?.name || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [citySearch, setCitySearch] = useState(initialFilters.city || '');
  const [cities, setCities] = useState<CountOption[]>([...decisionCities]);
  const [budget, setBudget] = useState(initialFilters.budgetMax || '');
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 1 });
  const [budgetTouched, setBudgetTouched] = useState(Boolean(initialFilters.budgetMax));
  const [instituteType, setInstituteType] = useState(initialFilters.instituteType || '');
  const [branch, setBranch] = useState(initialFilters.branch || '');
  const [exam, setExam] = useState(initialFilters.exam || '');
  const [appliedBranch, setAppliedBranch] = useState(initialFilters.branch || '');
  const [appliedExam, setAppliedExam] = useState(initialFilters.exam || '');
  const [results, setResults] = useState<Recommendation[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [branches, setBranches] = useState<CountOption[]>([]);
  const [exams, setExams] = useState<CountOption[]>([]);
  const [branchFocused, setBranchFocused] = useState(false);
  const [examFocused, setExamFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!global || inline) return;
    const openTool = () => setOpen(true);
    window.addEventListener('college-decision:open', openTool);
    return () => window.removeEventListener('college-decision:open', openTool);
  }, [global, inline]);

  useEffect(() => {
    if (!open || !course) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
    const params = new URLSearchParams();
    if (course) params.set('course', course);
    if (state) params.set('state', state);
    if (city) params.set('city', city);
    if (instituteType) params.set('instituteType', instituteType);
    if (budgetTouched && budget) params.set('budgetMax', budget);
    if (appliedBranch) params.set('branch', appliedBranch);
    if (appliedExam) params.set('exam', appliedExam);
    fetch(`/api/decision/options?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { data?: DecisionOptions; error?: string; message?: string };
        if (!response.ok || !payload.data) throw new Error(payload.message || payload.error || 'Decision options could not be loaded.');
        return payload as { data: DecisionOptions };
      })
      .then((payload: { data: DecisionOptions }) => {
        setError('');
        setCourses([...decisionCourses]);
        setStates([...decisionStates]);
        setCities(decisionCities.filter((item) => !state || item.stateSlug.toLowerCase() === state.toLowerCase()));
        setBranches(payload.data.branches);
        setExams(payload.data.exams);
        if (course) setCourseSearch(decisionCourses.find((item) => item.slug === course)?.name || course);
        if (state) setStateSearch(decisionStates.find((item) => item.slug === state)?.name || state);
        setBudgetRange(payload.data.budget);
        setBudget((current) => {
          const next = current
            ? String(Math.min(payload.data.budget.max, Math.max(payload.data.budget.min, Number(current))))
            : String(payload.data.budget.max);
          return next === current ? current : next;
        });
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Decision options could not be loaded.');
      });
    }, 600);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, course, state, city, instituteType, budget, budgetTouched, appliedBranch, appliedExam]);

  async function findColleges(event: FormEvent) {
    event.preventDefault();
    if (inline) {
      const params = new URLSearchParams();
      params.set('course', course);
      if (state) params.set('state', state);
      if (city) params.set('city', city);
      if (budgetTouched && budget) params.set('budgetMax', budget);
      if (instituteType) params.set('instituteType', instituteType);
      if (branch.trim()) params.set('branch', branch.trim());
      if (exam.trim()) params.set('exam', exam.trim());
      window.location.assign(`/search?${params.toString()}`);
      return;
    }
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (course) params.set('course', course);
    if (state) params.set('state', state);
    if (city) params.set('city', city);
    if (budgetTouched && budget) params.set('budgetMax', budget);
    if (instituteType) params.set('instituteType', instituteType);
    if (branch.trim()) params.set('branch', branch.trim());
    if (exam.trim()) params.set('exam', exam.trim());
    params.set('page', '1');
    params.set('perPage', '10');
    try {
      const response = await fetch(`/api/decision/recommendations?${params}`, { cache: 'no-store' });
      const payload = await response.json() as { data?: Recommendation[]; pagination?: { total: number }; error?: string };
      if (!response.ok) throw new Error(payload.error || 'Recommendations could not be loaded.');
      setResults(payload.data || []);
      setResultsTotal(payload.pagination?.total || 0);
      setResultsPage(1);
      if (payload.data?.length) setResultsOpen(true);
      else setError('No colleges match these filters. Try a wider budget or remove the branch/exam keyword.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Recommendations could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function loadResultsPage(page: number) {
    setLoading(true);
    const params = new URLSearchParams();
    if (course) params.set('course', course);
    if (state) params.set('state', state);
    if (city) params.set('city', city);
    if (budgetTouched && budget) params.set('budgetMax', budget);
    if (instituteType) params.set('instituteType', instituteType);
    if (branch.trim()) params.set('branch', branch.trim());
    if (exam.trim()) params.set('exam', exam.trim());
    params.set('page', String(page));
    params.set('perPage', '10');
    try {
      const response = await fetch(`/api/decision/recommendations?${params}`, { cache: 'no-store' });
      const payload = await response.json() as { data?: Recommendation[]; error?: string };
      if (!response.ok) throw new Error(payload.error || 'College list could not be loaded.');
      setResults(payload.data || []);
      setResultsPage(page);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'College list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  if (collapsible && !visible) {
    return <button className="decision-filter-launch" type="button" onClick={() => setVisible(true)}><Search size={18} aria-hidden="true" /> Adjust filters</button>;
  }

  return <>
    {!global && !inline && <button className="button decision-launch" type="button" onClick={() => setOpen(true)}><Search size={18} aria-hidden="true" /> Find My Best-Fit College</button>}
    {open && <div className={inline ? 'inline-decision-shell' : 'decision-backdrop'} role="presentation" onMouseDown={(event) => !inline && event.target === event.currentTarget && setOpen(false)}>
      <section className={inline ? 'inline-decision-form' : 'decision-modal'} role={inline ? undefined : 'dialog'} aria-modal={inline ? undefined : true} aria-labelledby="decision-title">
        {!inline && <button className="modal-close" type="button" aria-label="Close decision tool" onClick={() => setOpen(false)}><X size={22} aria-hidden="true" /></button>}
        <p className="eyebrow">COLLEGE DECISION TOOL</p>
        <h2 id="decision-title">Find your best-fit college</h2>
        <p className="muted">Choose what matters to you. We rank matching active programme records using fees, location, college type and placement context.</p>
        <nav className="decision-journey" aria-label="How the college decision tool works">
          <ol>
            <li className={`is-start${course ? ' is-active' : ''}`}><BadgeCheck size={16} aria-hidden="true" /><span>Course</span></li>
            <li className={state ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><span>Preferred state</span></li>
            <li className={city ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><MapPin size={16} aria-hidden="true" /><span>City</span></li>
            <li className={budgetTouched ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><WalletCards size={16} aria-hidden="true" /><span>Budget</span></li>
            <li className={instituteType ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><Building2 size={16} aria-hidden="true" /><span>College type</span></li>
            <li className={branch.trim() ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><GitBranch size={16} aria-hidden="true" /><span>Branch / programme</span></li>
            <li className={exam.trim() ? 'is-active' : ''}><ArrowRight size={15} aria-hidden="true" /><BadgeCheck size={16} aria-hidden="true" /><span>Entrance exam</span></li>
            <li className={course ? 'is-ready' : ''}><ArrowRight size={15} aria-hidden="true" /><Search size={16} aria-hidden="true" /><span>Find colleges</span></li>
          </ol>
        </nav>
        <form className="decision-form" onSubmit={findColleges}>
          <label>Course<input required list="decision-courses" value={courseSearch} onChange={(event) => { const value = event.target.value; setCourseSearch(value); const match = courses.find((item) => item.name.toLowerCase() === value.toLowerCase() || item.slug.toLowerCase() === value.toLowerCase()); setCourse(match?.slug || ''); if (!match) { setState(''); setStateSearch(''); setCity(''); setCitySearch(''); } }} placeholder="Search course name..." /><datalist id="decision-courses">{courses.filter((item) => item.name.toLowerCase().includes(courseSearch.toLowerCase())).slice(0, 50).map((item) => <option value={item.name} key={item.slug || item.name} />)}</datalist></label>
          <label>Preferred state<input list="decision-states" value={stateSearch} onChange={(event) => { const value = event.target.value; setStateSearch(value); const match = states.find((item) => item.name.toLowerCase() === value.toLowerCase() || item.slug.toLowerCase() === value.toLowerCase()); setState(match?.slug || ''); setCity(''); setCitySearch(''); }} placeholder={course ? 'Search state...' : 'Select a course first'} disabled={!course} /><datalist id="decision-states">{states.filter((item) => item.name.toLowerCase().includes(stateSearch.toLowerCase())).map((item) => <option value={item.name} key={item.slug || item.name} />)}</datalist></label>
          <label>City<input list="decision-cities" value={citySearch} onChange={(event) => { const value = event.target.value; setCitySearch(value); const match = cities.find((item) => item.name.toLowerCase() === value.toLowerCase()); setCity(match?.name || ''); }} placeholder={!course ? 'Select a course first' : !state ? 'Select a state first' : 'Search city...'} disabled={!course || !state} /><datalist id="decision-cities">{cities.filter((item) => item.name.toLowerCase().includes(citySearch.toLowerCase())).map((item) => <option value={item.name} key={`${item.name}-${item.stateSlug || ''}`} />)}</datalist></label>
          {course && <><label>Budget <span className="range-value">{budgetTouched ? `Up to ₹${budget || budgetRange.max} lakh` : 'Any budget'}</span><input className="budget-range" type="range" min={budgetRange.min} max={budgetRange.max} step="0.1" value={budget || budgetRange.max} onChange={(event) => { setBudgetTouched(true); setBudget(event.target.value); }} /></label>
          <label>College type<select value={instituteType} onChange={(event) => setInstituteType(event.target.value)}><option value="">Government or private</option><option value="public">Government / public</option><option value="private">Private</option></select></label>
          <label className="filter-with-options">Branch or programme<input value={branch} onFocus={() => setBranchFocused(true)} onBlur={() => window.setTimeout(() => { setBranchFocused(false); setAppliedBranch(branch.trim()); }, 150)} onChange={(event) => setBranch(event.target.value)} placeholder="Enter branch keyword..." />{branchFocused && <div className="filter-menu">{branches.filter((item) => item.name.toLowerCase().includes(branch.toLowerCase())).slice(0, 8).map((item) => <button type="button" key={item.name} onMouseDown={() => { setBranch(item.name); setAppliedBranch(item.name); setBranchFocused(false); }}>{item.name}</button>)}</div>}</label>
          <label className="filter-with-options">Entrance exam<input value={exam} onFocus={() => setExamFocused(true)} onBlur={() => window.setTimeout(() => { setExamFocused(false); setAppliedExam(exam.trim()); }, 150)} onChange={(event) => setExam(event.target.value)} placeholder="Enter exam keyword..." />{examFocused && <div className="filter-menu">{exams.filter((item) => item.name.toLowerCase().includes(exam.toLowerCase())).slice(0, 8).map((item) => <button type="button" key={item.name} onMouseDown={() => { setExam(item.name); setExamFocused(false); setAppliedExam(item.name); }}>{item.name}</button>)}</div>}</label></>}
          <button className="button primary" type="submit" disabled={loading || !course}><Search size={17} aria-hidden="true" /> {loading ? 'Finding colleges…' : 'Find colleges'}</button>
        </form>
        {error && <p className="modal-error">{error}</p>}
        {!inline && resultsOpen && <div className="decision-results-backdrop" role="presentation"><section className="decision-results-modal" role="dialog" aria-modal="true" aria-labelledby="results-title"><button className="modal-close" type="button" aria-label="Close college results" onClick={() => setResultsOpen(false)}><X size={22} aria-hidden="true" /></button><p className="eyebrow">MATCHED COLLEGES</p><h2 id="results-title">{resultsTotal.toLocaleString('en-IN')} colleges for your preferences</h2><p className="muted">Showing page {resultsPage} of {Math.max(1, Math.ceil(resultsTotal / 10))}. Compare programme, location, fee and admission context before deciding.</p><div className="decision-results-list">{results.map((item) => <CollegeDecisionCard key={item.programmeId} item={item} showCompare={resultsTotal > 1} />)}</div><nav className="decision-pagination" aria-label="College result pages"><button type="button" disabled={resultsPage <= 1 || loading} onClick={() => loadResultsPage(resultsPage - 1)}>Previous</button><span>Page {resultsPage}</span><button type="button" disabled={resultsPage >= Math.ceil(resultsTotal / 10) || loading} onClick={() => loadResultsPage(resultsPage + 1)}>Next</button></nav></section></div>}
        {!loading && !error && results.length === 0 && <p className="muted decision-empty">Set your preferences and select “Find colleges” to see matching options.</p>}
      </section>
    </div>}
  </>;
}
