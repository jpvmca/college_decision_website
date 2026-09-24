'use client';

import ExpandableText from './ExpandableText';
import CollegeViewDetailsModal from './CollegeViewDetailsModal';
import DecisionActions from './DecisionActions';
import InstituteLogo from './InstituteLogo';
import LinkedTextParts from './LinkedTextParts';
import Link from 'next/link';
import { findPublishedHrefByName, linkAdmissionRouteParts, type LinkableEntity } from '../lib/auto-link-entities';

export type CollegeDecisionResult = {
  instituteId: number;
  courseId: number;
  programmeId: number;
  instituteName: string;
  publishedSlug?: string | null;
  instituteType: string | null;
  city: string | null;
  state: string | null;
  programmeName: string;
  logo?: string | null;
  duration: string | null;
  lowestFee: number | string | null;
  averageYearFee?: number | string | null;
  averagePackage: number | string | null;
  highestPackage?: number | string | null;
  nirfRank?: number | string | null;
  nirfOutOf?: number | string | null;
  reviewCount?: number | string | null;
  averageRating?: number | string | null;
  eligibility: string | null;
  admissionRoutes: string | null;
};

type Props = {
  item: CollegeDecisionResult;
  showCompare?: boolean;
  showReviews?: boolean;
  linkableEntities?: LinkableEntity[];
};

function money(value: number | string | null) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}` : 'Not listed';
}

function hasAmount(value: number | string | null | undefined) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function durationLabel(value: string | null) {
  if (!value) return null;
  const years = Number(value);
  return Number.isFinite(years) ? `${years} years` : value;
}

function packageMoney(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `₹${amount} lakh` : null;
}

function CourseLabel({
  name,
  entities
}: {
  name: string;
  entities?: LinkableEntity[];
}) {
  if (!entities?.length) return <>{name}</>;
  // Prefer exact course-name match; also try a leading clean token like "MBA" / "B.Tech".
  const exact = findPublishedHrefByName(entities, 'course', name);
  if (exact) return <Link href={exact} className="auto-entity-link">{name}</Link>;
  const leading = name.split(/[\s/–—-]+/).filter(Boolean)[0];
  if (leading && leading.length >= 2 && leading.toLowerCase() !== name.toLowerCase()) {
    const leadHref = findPublishedHrefByName(entities, 'course', leading);
    if (leadHref) {
      return (
        <>
          <Link href={leadHref} className="auto-entity-link">{leading}</Link>
          {name.slice(leading.length)}
        </>
      );
    }
  }
  return <>{name}</>;
}

export default function CollegeDecisionCard({ item, showCompare = true, showReviews = true, linkableEntities = [] }: Props) {
  const admissionParts = linkableEntities.length
    ? linkAdmissionRouteParts(item.admissionRoutes, linkableEntities)
    : null;

  return <article className="decision-result college-decision-card">
    <div className="college-card-heading">
      <div className="college-card-title-row">
        <InstituteLogo src={item.logo} alt={`${item.instituteName} college logo`} />
        <div>
          <h3>{item.publishedSlug ? <Link href={`/colleges/${item.publishedSlug}`}>{item.instituteName}</Link> : item.instituteName}</h3>
          <strong><CourseLabel name={item.programmeName} entities={linkableEntities} /></strong>
        </div>
      </div>
      <span className="college-type-pill">{item.instituteType === 'public' ? 'Public' : 'Private'}</span>
    </div>
    <p className="college-location">{item.city || 'Location not listed'}, {item.state || 'India'}</p>
    {(hasAmount(item.lowestFee) || item.duration) && <div className="college-facts">{hasAmount(item.lowestFee) && <span>Lowest fee <b>{money(item.lowestFee)}</b></span>}{item.duration && <span>Duration <b>{durationLabel(item.duration)}</b></span>}</div>}
    {(item.averageYearFee || item.averagePackage || item.highestPackage || item.nirfRank || (showReviews && item.reviewCount)) && <div className="decision-card-highlights">{showReviews && item.reviewCount && <span>Student reviews <b>{item.reviewCount}{item.averageRating ? ` · ${Number(item.averageRating).toFixed(1)}/5` : ''}</b></span>}{item.averageYearFee && <span>Average yearly fee <b>{money(item.averageYearFee)}</b></span>}{item.averagePackage && packageMoney(item.averagePackage) && <span>Average placement <b>{packageMoney(item.averagePackage)}</b></span>}{item.highestPackage && packageMoney(item.highestPackage) && <span>Highest placement <b>{packageMoney(item.highestPackage)}</b></span>}{item.nirfRank && <span>NIRF <b>Rank {item.nirfRank}{item.nirfOutOf ? ` / ${item.nirfOutOf}` : ''}</b></span>}</div>}
    <p><b>Eligibility:</b> <ExpandableText text={item.eligibility || 'Check the latest official notice.'} /></p>
    <p><b>Admission route:</b> {admissionParts?.length ? <LinkedTextParts parts={admissionParts} /> : (item.admissionRoutes || 'Not listed')}</p>
    <div className="decision-result-actions">{!item.publishedSlug && <CollegeViewDetailsModal instituteId={item.instituteId} courseId={item.courseId} courseName={item.programmeName} />}<DecisionActions showCompare={showCompare} instituteId={item.instituteId} courseId={item.courseId} instituteName={item.instituteName} programmeName={item.programmeName} duration={item.duration} eligibility={item.eligibility} fee={money(item.lowestFee)} instituteType={item.instituteType} city={item.city} state={item.state} averagePackage={item.averagePackage} highestPackage={item.highestPackage} admissionRoutes={item.admissionRoutes} /></div>
  </article>;
}
