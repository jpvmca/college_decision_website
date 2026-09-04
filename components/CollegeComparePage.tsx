'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, GraduationCap, IndianRupee, MapPin, Plus, Search, X } from 'lucide-react';
import CollegeViewDetailsModal from './CollegeViewDetailsModal';

type CollegeSearchResult = {
  id: number;
  full_name: string;
  display_name?: string | null;
  slug: string;
  institute_type?: string | null;
  city?: string | null;
  state?: string | null;
  programme_count?: number | string;
  course_names?: string | null;
};

type Comparison = {
  institute: CollegeSearchResult & { website?: string | null; establishment_year?: number | null; is_university?: number | boolean | null };
  programmes: Array<{ course_id?: number | string | null; programme_name?: string | null; course_name?: string | null; duration?: string | number | null; min_total_fee?: number | string | null; max_total_fee?: number | string | null }>;
  fees: { min_total_fee?: number | string | null; max_total_fee?: number | string | null; average_year_fee?: number | string | null } | null;
  exams: Array<{ name?: string | null }>;
  placements: Array<{ year?: number | string | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings: Array<{ ranking_body?: string | null; course_name?: string | null; rank?: number | string | null; out_of?: number | string | null; year?: number | string | null }>;
  recruiters: Array<{ name?: string | null }>;
};

const emptySlots = [null, null, null, null] as Array<CollegeSearchResult | null>;

function displayName(college: CollegeSearchResult) {
  return college.display_name || college.full_name;
}

function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`
    : 'Not listed';
}

function packageValue(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `₹${amount} lakh` : 'Not listed';
}

export default function CollegeComparePage() {
  const [slots, setSlots] = useState<Array<CollegeSearchResult | null>>(emptySlots);
  const [details, setDetails] = useState<Comparison[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CollegeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('college-decision-compare-four') || '[]');
      if (Array.isArray(saved)) setSlots(emptySlots.map((_, index) => saved[index] || null));
    } catch {
      localStorage.removeItem('college-decision-compare-four');
    }
  }, []);

  const selected = useMemo(() => slots.filter((college): college is CollegeSearchResult => Boolean(college)), [slots]);

  useEffect(() => {
    localStorage.setItem('college-decision-compare-four', JSON.stringify(slots));
    if (!selected.length) {
      setDetails([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(`/api/college-compare?instituteIds=${selected.map((college) => college.id).join(',')}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { data?: Comparison[]; error?: string };
        if (!response.ok || !payload.data) throw new Error(payload.error || 'Comparison data could not be loaded.');
        return payload.data;
      })
      .then(setDetails)
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Comparison data could not be loaded.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selected]);

  useEffect(() => {
    if (activeSlot === null || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      fetch(`/api/college-search?q=${encodeURIComponent(query.trim())}&perPage=12`, { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          const payload = await response.json() as { data?: CollegeSearchResult[]; error?: string };
          if (!response.ok) throw new Error(payload.error || 'College search failed.');
          return payload.data || [];
        })
        .then(setSearchResults)
        .catch((requestError) => {
          if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) setError(requestError instanceof Error ? requestError.message : 'College search failed.');
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeSlot, query]);

  function openSearch(slot: number) {
    setActiveSlot(slot);
    setQuery('');
    setSearchResults([]);
    setError('');
  }

  function chooseCollege(college: CollegeSearchResult) {
    if (slots.some((item) => item?.id === college.id)) {
      setError('That college is already selected. Choose a different college.');
      return;
    }
    if (activeSlot === null) return;
    setSlots((current) => current.map((item, index) => index === activeSlot ? college : item));
    setActiveSlot(null);
    setQuery('');
  }

  function removeCollege(slot: number) {
    setSlots((current) => current.map((item, index) => index === slot ? null : item));
  }

  function collegeDetails(slot: CollegeSearchResult | null) {
    return slot ? details.find((item) => item.institute.id === slot.id) : undefined;
  }

  return (
    <div className="compare-tool">
      <div className="compare-slots">
        {slots.map((college, index) => {
          const item = collegeDetails(college);
          if (!college) {
            return <button className="compare-slot compare-slot-empty" type="button" onClick={() => openSearch(index)} key={`empty-${index}`}>
              <span className="compare-plus"><Plus size={28} aria-hidden="true" /></span>
              <strong>Add college</strong>
              <small>Search by college name</small>
            </button>;
          }
          const latestPlacement = item?.placements[0];
          const latestRank = item?.rankings[0];
          return <article className="compare-slot compare-slot-filled" key={college.id}>
            <button className="compare-slot-remove" type="button" onClick={() => removeCollege(index)} aria-label={`Remove ${displayName(college)}`}><X size={16} aria-hidden="true" /></button>
            <h2>{displayName(college)}</h2>
            {college.full_name !== displayName(college) && <p>{college.full_name}</p>}
            <span><MapPin size={15} aria-hidden="true" /> {[college.city, college.state].filter(Boolean).join(', ') || 'Location not listed'}</span>
            <div className="compare-slot-actions">
              <button className="compare-replace-button" type="button" onClick={() => openSearch(index)}>Replace college</button>
              {item?.programmes[0]?.course_id && <CollegeViewDetailsModal instituteId={college.id} courseId={Number(item.programmes[0].course_id)} courseName={item.programmes[0].course_name || item.programmes[0].programme_name || displayName(college)} />}
            </div>
            {item && <div className="comparison-details">
              <div className="comparison-fact"><Building2 size={16} aria-hidden="true" /><span>Type</span><strong>{college.institute_type === 'public' ? 'Government / public' : college.institute_type || 'Not listed'}</strong></div>
              <div className="comparison-fact"><GraduationCap size={16} aria-hidden="true" /><span>Programmes</span><strong>{item.programmes.length || 'Not listed'}</strong></div>
              <div className="comparison-fact"><IndianRupee size={16} aria-hidden="true" /><span>Recorded fee range</span><strong>{item.fees ? `${money(item.fees.min_total_fee)} – ${money(item.fees.max_total_fee)}` : 'Not listed'}</strong></div>
              <div className="comparison-fact"><IndianRupee size={16} aria-hidden="true" /><span>Average yearly fee</span><strong>{money(item.fees?.average_year_fee)}</strong></div>
              <div className="comparison-fact"><BarChart3 size={16} aria-hidden="true" /><span>Latest placement package</span><strong>{latestPlacement ? `${packageValue(latestPlacement.average_package)} average · ${packageValue(latestPlacement.highest_package)} highest` : 'Not listed'}</strong></div>
              <div className="comparison-fact"><span>Latest ranking</span><strong>{latestRank?.rank ? `${latestRank.ranking_body || 'Ranking'}: ${latestRank.rank}${latestRank.out_of ? ` / ${latestRank.out_of}` : ''}` : 'Not listed'}</strong></div>
              <div className="comparison-fact"><span>Entrance exams</span><strong>{item.exams.length ? item.exams.slice(0, 5).map((exam) => exam.name).filter(Boolean).join(', ') : 'Not listed'}</strong></div>
              <div className="comparison-fact"><span>Recruiters</span><strong>{item.recruiters.length ? item.recruiters.slice(0, 4).map((recruiter) => recruiter.name).filter(Boolean).join(', ') : 'Not listed'}</strong></div>
              <div className="comparison-programmes"><span>Popular programmes</span>{item.programmes.slice(0, 5).map((programme) => <small key={`${programme.course_id || programme.course_name}-${programme.programme_name}`}>{programme.programme_name || programme.course_name}</small>)}</div>
            </div>}
          </article>;
        })}
      </div>

      {selected.length > 0 && <div className="compare-status" aria-live="polite">
        {loading && <p className="compare-loading">Updating comparison…</p>}
        {error && <p className="compare-error">{error}</p>}
      </div>}

      {activeSlot !== null && <div className="compare-search-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setActiveSlot(null)}>
        <section className="compare-search-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-search-title">
          <button className="modal-close" type="button" onClick={() => setActiveSlot(null)} aria-label="Close college search"><X size={22} aria-hidden="true" /></button>
          <p className="eyebrow">ADD COLLEGE {activeSlot + 1} OF 4</p>
          <h2 id="compare-search-title">Search for a college</h2>
          <p className="muted">Search by the college name, display name or URL keyword.</p>
          <label className="compare-search-input"><Search size={18} aria-hidden="true" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type at least 2 characters..." /></label>
          {searching && <p className="compare-search-status">Searching colleges…</p>}
          {!searching && query.trim().length >= 2 && !searchResults.length && <p className="compare-search-status">No active colleges found. Try another name.</p>}
          <div className="compare-search-results">{searchResults.map((college) => <button type="button" key={college.id} onClick={() => chooseCollege(college)}><strong>{displayName(college)}</strong><span>{[college.city, college.state].filter(Boolean).join(', ') || 'Location not listed'} · {college.programme_count || 0} programmes</span></button>)}</div>
        </section>
      </div>}
    </div>
  );
}
