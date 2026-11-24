import Link from 'next/link';
import type { ListedCollege } from './CollegeListResults';
import { formatLpa } from '../lib/packages';
import { HOW_WE_RANK_SHORT } from '../lib/listing-rank-copy';
import { displayNirfLabel } from '../lib/nirf-rank';

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`
    : '—';
}

function packageText(value: number | string | null | undefined) {
  const text = formatLpa(value, '', 'lakh');
  return text || '—';
}

function nirfText(college: ListedCollege) {
  return displayNirfLabel({
    label: college.nirf_label,
    year: college.nirf_year,
    category: college.nirf_category,
    courseId: college.course_id,
    rank: college.nirf_rank,
    outOf: college.nirf_out_of
  }) || '—';
}

function hasCompleteListingData(college: ListedCollege) {
  const fee = Number(college.lowest_fee);
  const hasFee = Number.isFinite(fee) && fee > 0;
  const hasNirf = college.nirf_rank != null && Number(college.nirf_rank) > 0;
  const hasPlacement = Number(college.average_package) > 0 || Number(college.highest_package) > 0;
  return hasFee && (hasNirf || hasPlacement);
}

export default function ListingSummaryTable({
  colleges,
  heading,
  year
}: {
  colleges: ListedCollege[];
  heading: string;
  year: number;
}) {
  const rows = colleges.filter(hasCompleteListingData).slice(0, 10);
  if (!rows.length) return null;
  const headingWithCount = heading.replace(/Top \d+/, `Top ${rows.length}`);
  return (
    <section className="listing-summary-table" aria-labelledby="listing-summary-heading">
      <div className="ls-head">
        <p className="ls-eyebrow">Summary</p>
        <h2 id="listing-summary-heading">{headingWithCount}</h2>
      </div>
      <p className="ls-rank-note">{HOW_WE_RANK_SHORT}</p>
      <div className="detail-table-wrap">
        <table className="detail-table listing-top-table">
          <caption className="muted">This table lists colleges that have a published total fee and at least one of a NIRF rank for this course or a published placement, in the same order as the cards below ({year}). A dash means that column is not in our records yet.</caption>
          <thead>
            <tr>
              <th scope="col">College</th>
              <th scope="col">Total fees</th>
              <th scope="col">Average placement</th>
              <th scope="col">Exams</th>
              <th scope="col">NIRF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((college) => {
              const name = college.display_name || college.full_name;
              const slug = college.published_slug || college.slug;
              return (
                <tr key={college.id}>
                  <th scope="row">{slug ? <Link prefetch={false} href={`/colleges/${slug}`}>{name}</Link> : name}</th>
                  <td>{money(college.lowest_fee)}</td>
                  <td>{packageText(college.average_package)}</td>
                  <td>{college.admission_routes?.trim() || '—'}</td>
                  <td>{nirfText(college)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
