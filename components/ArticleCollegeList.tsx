'use client';

import { useState } from 'react';
import CollegeDetailsModal from '../app/articles/[slug]/CollegeDetailsModal';
import DecisionActions from '../app/articles/[slug]/DecisionActions';
import ExpandableText from './ExpandableText';
import InstituteLogo from './InstituteLogo';

export type ArticleCandidate = {
  institute_id: number;
  course_id: number;
  institute_program_id: number;
  institute_name: string;
  logo?: string | null;
  institute_type: string;
  city: string | null;
  state: string | null;
  programme_name: string;
  duration: string | null;
  eligibility: string | null;
  min_total_fee?: string;
  max_total_fee?: string;
  fee_record_count?: number;
  qualifying_programme_count?: number;
  average_year_fee?: number | string | null;
  average_package?: number | string | null;
  nirf_rank?: number | string | null;
  nirf_out_of?: number | string | null;
  admission_routes?: string | null;
  highest_package?: number | string | null;
  placement_year?: number | string | null;
};

type Props = {
  slug: string;
  articleType: string;
  initialCandidates: ArticleCandidate[];
  candidateCount: number;
  initialPage: number;
  totalPages: number;
  summaryLabel: string;
};

function formatFee(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    : 'Fee available on request';
}

function formatPackage(value: number | string | null | undefined) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Package not listed';
  return `₹${amount} LPA`;
}

function isGovAvgPackageArticle(type: string) {
  return type.includes('government-state-avg-package') || type.includes('gov-avg-package');
}

function isHighestPackageArticle(type: string) {
  return type.includes('highest-package-threshold');
}

function isAveragePackageExceedsFeesArticle(type: string) {
  return type.includes('average-package-exceeds-fees');
}

function isUniqueCollegeArticle(type: string) {
  return type.includes('budget') || (type.includes('fees') && !type.includes('exceeds-fees'));
}

function getCandidateNote(candidate: ArticleCandidate, uniqueCollege = false) {
  const programmeCount = Number(candidate.qualifying_programme_count || 0);
  if (uniqueCollege && programmeCount > 1) {
    return `${programmeCount} qualifying programmes at this college. Showing the lowest recorded fee. Use View college details for the full programme list.`;
  }
  if (!candidate.eligibility) {
    return 'Eligibility is not listed for this option. Confirm the latest admission notice before applying.';
  }
  if (candidate.institute_type === 'public') {
    return `${candidate.fee_record_count || 0} fee entries found. Public fees may vary by category, year and required charges.`;
  }
  return `${candidate.fee_record_count || 0} fee entries found. Private colleges may add development, hostel and other charges.`;
}

function getCandidateHeading(candidate: ArticleCandidate, uniqueCollege = false) {
  if (uniqueCollege) return candidate.institute_name;
  return candidate.programme_name
    ? `${candidate.institute_name} — ${candidate.programme_name}`
    : candidate.institute_name;
}

function getCourseContext(candidate: ArticleCandidate, uniqueCollege = false) {
  const location = [candidate.city, candidate.state].filter(Boolean).join(', ');
  const institute = candidate.institute_name || 'this institute';
  const programme = candidate.programme_name || 'Programme';
  if (uniqueCollege) {
    return `Lowest recorded fee: ${programme} at ${institute}${location ? `, ${location}` : ''}`;
  }
  return `${programme} at ${institute}${location ? `, ${location}` : ''}`;
}

function CandidateCard({
  candidate,
  index,
  articleType,
  uniqueCollege,
  showCompare
}: {
  candidate: ArticleCandidate;
  index: number;
  articleType: string;
  uniqueCollege: boolean;
  showCompare: boolean;
}) {
  return (
    <article className="card" key={uniqueCollege ? String(candidate.institute_id) : `${candidate.institute_name}-${candidate.programme_name}-${index}`}>
      <div className="institute-heading">
        <h3>{index + 1}. {getCandidateHeading(candidate, uniqueCollege)}</h3>
        <InstituteLogo src={candidate.logo} alt={`${candidate.institute_name} logo`} />
      </div>
      <p className="muted">{candidate.institute_type === 'public' ? 'Government or public institution' : 'Private institution'} · {candidate.city || 'Location not listed'}, {candidate.state || 'India'}</p>
      <p className="course-context"><strong>Course:</strong> {getCourseContext(candidate, uniqueCollege)}</p>
      {(candidate.average_year_fee || candidate.average_package || candidate.highest_package || candidate.nirf_rank) && (
        <div className="article-college-highlights">
          {candidate.average_year_fee && <span>Average yearly fee: <strong>{formatFee(String(candidate.average_year_fee))}</strong></span>}
          {candidate.average_package && <span>Average placement: <strong>{formatPackage(candidate.average_package)}</strong></span>}
          {candidate.highest_package && <span>Highest placement: <strong>{formatPackage(candidate.highest_package)}</strong></span>}
          {candidate.nirf_rank && <span>NIRF: <strong>Rank {candidate.nirf_rank}{candidate.nirf_out_of ? ` / ${candidate.nirf_out_of}` : ''}</strong></span>}
        </div>
      )}
      <p><strong>Duration:</strong> {candidate.duration || 'Check the current programme duration.'}</p>
      <p><strong>Eligibility:</strong> <ExpandableText text={candidate.eligibility || 'Check the latest college admission notice.'} /></p>
      {isAveragePackageExceedsFeesArticle(articleType) ? (
        <>
          <p className="price">{formatPackage(candidate.average_package)} average package</p>
          <p><strong>Recorded fee:</strong> {formatFee(candidate.min_total_fee || '')}</p>
        </>
      ) : isHighestPackageArticle(articleType) ? (
        <>
          <p className="price">{formatPackage(candidate.highest_package)} highest package{candidate.placement_year ? ` · ${candidate.placement_year}` : ''}</p>
          {candidate.average_package ? <p><strong>Average package:</strong> {formatPackage(candidate.average_package)}</p> : null}
        </>
      ) : isGovAvgPackageArticle(articleType) ? (
        <>
          <p className="price">{formatPackage(candidate.average_package)} average package{candidate.placement_year ? ` · ${candidate.placement_year}` : ''}</p>
          {candidate.highest_package ? <p><strong>Highest package:</strong> {formatPackage(candidate.highest_package)}</p> : null}
        </>
      ) : articleType.includes('admission') ? (
        <p><strong>Admission route:</strong> {candidate.admission_routes || 'Check the latest official admission notice.'}</p>
      ) : (
        <p className="price">{formatFee(candidate.min_total_fee || '')} lowest recorded fee</p>
      )}
      <div className="card-actions">
        <small>
          {isAveragePackageExceedsFeesArticle(articleType)
            ? 'This comparison uses recorded average package and fee values; verify their years and current official reports before applying.'
            : isHighestPackageArticle(articleType)
              ? 'Highest package values are historical placement records. Verify the latest official report before applying.'
              : isGovAvgPackageArticle(articleType)
                ? 'Average package ranking uses active placement records for government or public institutes. Verify the latest official report before applying.'
                : articleType.includes('admission')
                  ? 'Eligibility, duration and admission route are present in the active programme records. Verify the current official notice before applying.'
                  : getCandidateNote(candidate, uniqueCollege)}
        </small>
        <div className="card-action-buttons">
          <CollegeDetailsModal instituteId={candidate.institute_id} courseId={candidate.course_id} courseName={candidate.programme_name} />
          <DecisionActions
            showCompare={showCompare}
            instituteId={candidate.institute_id}
            courseId={candidate.course_id}
            instituteName={candidate.institute_name}
            programmeName={candidate.programme_name}
            duration={candidate.duration}
            eligibility={candidate.eligibility}
            fee={formatFee(candidate.min_total_fee || '')}
            feeRecordCount={candidate.fee_record_count}
            instituteType={candidate.institute_type}
            city={candidate.city}
            state={candidate.state}
            averagePackage={candidate.average_package}
            highestPackage={candidate.highest_package}
            placementYear={candidate.placement_year}
            admissionRoutes={candidate.admission_routes}
          />
        </div>
      </div>
    </article>
  );
}

export default function ArticleCollegeList({
  slug,
  articleType,
  initialCandidates,
  candidateCount,
  initialPage,
  totalPages,
  summaryLabel
}: Props) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uniqueCollege = isUniqueCollegeArticle(articleType);
  const hasMore = page < totalPages;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/articles/${encodeURIComponent(slug)}?page=${nextPage}&perPage=20`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load more colleges (${response.status})`);
      const payload = await response.json() as { data?: { candidates?: ArticleCandidate[] } };
      const nextCandidates = payload.data?.candidates || [];
      setCandidates((current) => [...current, ...nextCandidates]);
      setPage(nextPage);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load more colleges');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="muted">Showing {candidates.length} of {candidateCount} unique college options · {summaryLabel}</p>
      {candidates.map((candidate, index) => (
        <CandidateCard
          key={uniqueCollege ? `${candidate.institute_id}-${index}` : `${candidate.institute_id}-${candidate.institute_program_id}-${index}`}
          candidate={candidate}
          index={index}
          articleType={articleType}
          uniqueCollege={uniqueCollege}
          showCompare={candidateCount > 1}
        />
      ))}
      {hasMore && (
        <div className="article-load-more">
          <button type="button" className="button primary" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading more colleges…' : `Load more colleges (${Math.min(20, candidateCount - candidates.length)} more)`}
          </button>
          {error ? <p className="muted">{error}</p> : null}
        </div>
      )}
    </>
  );
}
