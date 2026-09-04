import Link from 'next/link';
import type { CSSProperties } from 'react';
import InstituteLogo from '../InstituteLogo';

type College = {
  id: string;
  name: string;
  officialName: string;
  location: { city: string; state: string; addressLabel: string };
  instituteType: string;
  logo?: string | null;
  programmes?: Array<{ id: number; name: string; duration?: string | null; eligibility?: string | null; description?: string | null }>;
  fees?: Array<{ programme_id: number; programme_name: string; fees: number | string; fee_type?: string | null; fee_duration?: string | null }>;
  exams?: string[];
  placements?: Array<{ programme_id: number; year?: number | string | null; average_package?: number | string | null; highest_package?: number | string | null }>;
  rankings?: Array<{ ranking_body?: string | null; rank?: number | string | null; out_of?: number | string | null; year?: number | string | null; course_name?: string | null }>;
  recruiters?: string[];
};

type ComparisonArticle = {
  h1: string;
  course: { name: string };
  collegeA: College;
  collegeB: College;
  decisionScore?: { collegeA: number; collegeB: number };
};

const unavailable = '-';
const collegeName = (college: College) => college.name || 'College';
const money = (value: number | string | null | undefined) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? `₹${number.toLocaleString('en-IN')}` : unavailable;
};
const packageValue = (value: number | string | null | undefined) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? `₹${number.toLocaleString('en-IN')} lakh` : unavailable;
};
const firstFee = (college: College) => college.fees?.length ? money(Math.min(...college.fees.map((fee) => Number(fee.fees)).filter((fee) => Number.isFinite(fee) && fee > 0))) : unavailable;
const latestPlacement = (college: College) => college.placements?.[0];
const scorePercent = (value: number, total: number) => total > 0 ? (value / total) * 100 : 50;
const scoreDisplay = (value: number) => String(Math.round(value));

function CollegeColumn({ college }: { college: College }) {
  return <section className="comparison-column">
    <div className="institute-heading"><div><h3>{collegeName(college)}</h3>
    <p className="muted">{college.instituteType || unavailable} · {[college.location?.city, college.location?.state].filter(Boolean).join(', ') || unavailable}</p></div><InstituteLogo src={college.logo} alt={`${collegeName(college)} logo`} /></div>
    <h4>Branches and programmes</h4>
    {college.programmes?.length ? <div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Programme / branch</th><th>Duration</th><th>Eligibility</th></tr></thead><tbody>{college.programmes.map((programme) => <tr key={programme.id}><th scope="row">{programme.name}</th><td>{programme.duration || unavailable}</td><td>{programme.eligibility || unavailable}</td></tr>)}</tbody></table></div> : <p>{unavailable}</p>}
    <h4>Fees</h4>
    {college.fees?.length ? <div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Programme</th><th>Amount</th><th>Fee type</th><th>Duration</th></tr></thead><tbody>{college.fees.map((fee, index) => <tr key={`${fee.programme_id}-${index}`}><th scope="row">{fee.programme_name}</th><td><strong>{money(fee.fees)}</strong></td><td>{fee.fee_type || unavailable}</td><td>{fee.fee_duration || unavailable}</td></tr>)}</tbody></table></div> : <p>{unavailable}</p>}
    <h4>Entrance exams</h4>
    {college.exams?.length ? <p>{college.exams.join(', ')}</p> : <p>{unavailable}</p>}
    <h4>Placements</h4>
    {college.placements?.length ? <div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Year</th><th>Average package</th><th>Highest package</th></tr></thead><tbody>{college.placements.map((placement, index) => <tr key={`${placement.year}-${index}`}><th scope="row">{placement.year || unavailable}</th><td>{packageValue(placement.average_package)}</td><td>{packageValue(placement.highest_package)}</td></tr>)}</tbody></table></div> : <p>{unavailable}</p>}
    <h4>Rankings</h4>
    {college.rankings?.length ? <div className="detail-table-wrap"><table className="detail-table"><thead><tr><th>Body / category</th><th>Rank</th><th>Year</th></tr></thead><tbody>{college.rankings.map((ranking, index) => <tr key={`${ranking.ranking_body}-${index}`}><th scope="row">{ranking.ranking_body || unavailable}{ranking.course_name ? ` · ${ranking.course_name}` : ''}</th><td>{ranking.rank || unavailable}{ranking.out_of ? ` / ${ranking.out_of}` : ''}</td><td>{ranking.year || unavailable}</td></tr>)}</tbody></table></div> : <p>{unavailable}</p>}
    <h4>Recruiters</h4>
    {college.recruiters?.length ? <div className="recruiter-chips">{college.recruiters.slice(0, 20).map((recruiter) => <span key={recruiter}>{recruiter}</span>)}</div> : <p>{unavailable}</p>}
  </section>;
}

export default function CollegeComparisonArticle({ article }: { article: ComparisonArticle }) {
  const a = article.collegeA;
  const b = article.collegeB;
  const scoreA = article.decisionScore?.collegeA || 0;
  const scoreB = article.decisionScore?.collegeB || 0;
  const totalScore = scoreA + scoreB;
  const pieA = scorePercent(scoreA, totalScore);
  const scoreLeader = scoreA === scoreB ? 'Equal recorded score' : scoreA > scoreB ? collegeName(a) : collegeName(b);
  const scoreAStatus = scoreA >= scoreB ? 'score-success' : 'score-warning';
  const scoreBStatus = scoreB >= scoreA ? 'score-success' : 'score-warning';
  const branchLabel = /B\.? ?Tech|B\.?E\.?/i.test(article.course.name) ? 'B.E.' : article.course.name;
  const sharedExams = (a.exams || []).filter((exam) => (b.exams || []).includes(exam));
  const examLabel = sharedExams[0] || 'the same entrance exam';
  const placementA = latestPlacement(a);
  const placementB = latestPlacement(b);
  const comparisonRows = [
    ['College name', collegeName(a), collegeName(b)],
    ['Location', [a.location?.city, a.location?.state].filter(Boolean).join(', ') || unavailable, [b.location?.city, b.location?.state].filter(Boolean).join(', ') || unavailable],
    ['Institute type', a.instituteType || unavailable, b.instituteType || unavailable],
    ['Programmes / branches', a.programmes?.length ? `${a.programmes.length} listed` : unavailable, b.programmes?.length ? `${b.programmes.length} listed` : unavailable],
    ['Recorded fees', firstFee(a), firstFee(b)],
    ['Entrance exams', a.exams?.length ? a.exams.join(', ') : unavailable, b.exams?.length ? b.exams.join(', ') : unavailable],
    ['Average placement', placementA?.average_package ? money(placementA.average_package) : unavailable, placementB?.average_package ? money(placementB.average_package) : unavailable],
    ['Highest placement', placementA?.highest_package ? money(placementA.highest_package) : unavailable, placementB?.highest_package ? money(placementB.highest_package) : unavailable],
    ['Ranking', a.rankings?.[0] ? `${a.rankings[0].ranking_body || unavailable}: ${a.rankings[0].rank || unavailable}` : unavailable, b.rankings?.[0] ? `${b.rankings[0].ranking_body || unavailable}: ${b.rankings[0].rank || unavailable}` : unavailable]
  ];
  return <section className="college-comparison-article">
    <p className="article-intro">This course-wise guide compares recorded programme, fee, admission, placement and ranking evidence for {collegeName(a)} and {collegeName(b)}. Fees and outcomes can change; verify the latest official notification.</p>
    <div className="comparison-section-heading"><div><p className="eyebrow">AT A GLANCE</p><h2>Quick comparison</h2></div><span className="comparison-course-badge">{article.course.name}</span></div>
    <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Factor</th><th><span className="comparison-college-head">{collegeName(a)}<InstituteLogo src={a.logo} alt={`${collegeName(a)} logo`} /></span></th><th><span className="comparison-college-head">{collegeName(b)}<InstituteLogo src={b.logo} alt={`${collegeName(b)} logo`} /></span></th></tr></thead><tbody>{comparisonRows.map(([factor, valueA, valueB]) => <tr key={factor}><th scope="row">{factor}</th><td>{valueA}</td><td>{valueB}</td></tr>)}</tbody></table></div>
    <h2>Decision score</h2>
    <div className="comparison-score-panel">
      <div className="comparison-pie" style={{ background: `conic-gradient(var(--success) 0 ${pieA}%, var(--warning) ${pieA}% 100%)` }} role="img" aria-label={`Decision score share: ${collegeName(a)} ${scoreDisplay(scoreA)} and ${collegeName(b)} ${scoreDisplay(scoreB)}`}><span>Score<br /><strong>{scoreDisplay(Math.max(scoreA, scoreB))}</strong></span></div>
      <div className="comparison-score-legend"><p className="score-winner">Higher recorded score: <strong className={scoreA >= scoreB ? 'score-success-text' : 'score-warning-text'}>{scoreLeader}</strong></p><div><i className={`score-dot ${scoreAStatus}`} />{collegeName(a)}<strong className={`${scoreAStatus}-text`}>{scoreDisplay(scoreA)} / 100</strong><span className="score-bar"><b className={scoreAStatus} style={{ width: `${Math.min(scoreA, 100)}%` } as CSSProperties} /></span></div><div><i className={`score-dot ${scoreBStatus}`} />{collegeName(b)}<strong className={`${scoreBStatus}-text`}>{scoreDisplay(scoreB)} / 100</strong><span className="score-bar"><b className={scoreBStatus} style={{ width: `${Math.min(scoreB, 100)}%` } as CSSProperties} /></span></div></div>
    </div>
    <p>There is no universal winner. The better fit depends on your preferred {article.course.name} branch, budget, admission route, location and the quality and year of available evidence.</p>
    <h2>Which university has lower comparable fees?</h2>
    <p>Compare the recorded tuition cost, fee type and duration for the same or closely matching programme. Annual charges and total fees should not be treated as equivalent.</p>
    <h2>Which {branchLabel} branches are available?</h2>
    <p>Review the programme names below to find the branch that matches your academic and career goals.</p>
    <h2>Detailed evidence</h2><div className="comparison-detail-grid"><CollegeColumn college={a} /><CollegeColumn college={b} /></div>
    <h2>What are the eligibility requirements?</h2>
    <p>Eligibility is shown for each recorded programme. Requirements can differ by branch, qualification and admission year.</p>
    <h2>Do both universities accept {examLabel}?</h2>
    <p>Only active programme-to-exam mappings are shown. Confirm the current admission notification before applying.</p>
    <h2>Which university has better placement evidence?</h2>
    <p>Compare placement years, programme coverage and the available average or highest package records. Different years or coverage levels do not establish a definitive winner.</p>
    <h2>How do their rankings compare?</h2>
    <p>Compare ranking body, category and year. Rankings from different categories or years may not be directly comparable.</p>
    <h2>Which university is better for different students?</h2>
    <div className="comparison-priorities">
      <p><strong>Lower comparable fee:</strong> Compare programme names, fee type, duration and year. Hostel and additional charges are excluded unless explicitly recorded.</p>
      <p><strong>Preferred branch:</strong> Choose the college listing the branch that matches your goals.</p>
      <p><strong>Placement priority:</strong> Prefer the college with stronger comparable placement records only when programme coverage and years are comparable.</p>
      <p><strong>Admission route:</strong> Use the active course-to-exam mappings shown above and confirm the current official notice.</p>
    </div>
    <h2>What should you verify before admission?</h2>
    <ul><li>Current fee year, duration and included charges.</li><li>Programme-specific eligibility and admission route.</li><li>Placement year, programme coverage and recruiter context.</li><li>Ranking body, category and year.</li></ul>
    <h2>Conclusion</h2>
    <p>{scoreLeader === 'Equal recorded score' ? <><strong className="conclusion-college">{collegeName(a)}</strong> and <strong className="conclusion-college">{collegeName(b)}</strong> have an equal recorded decision score. Your preferred branch, comparable tuition cost, admission route and location should guide the final choice.</> : <><strong className="conclusion-winner">{scoreLeader}</strong> has the higher recorded evidence score, but this does not make it a universal winner. Choose <strong className="conclusion-college">{collegeName(a)}</strong> if its available branches, recorded cost and admission route fit your priorities; choose <strong className="conclusion-college">{collegeName(b)}</strong> if its programmes, location or placement evidence better match your goals.</>}</p>
    <p className="notice"><strong>Final takeaway:</strong> Compare the exact branch and programme cost first, then verify eligibility, active entrance-exam mappings and the latest official placement information before admission.</p>
    <p className="notice"><strong>Data note:</strong> A dash means the information is not available in the current records. This page does not invent values or treat different years and fee types as directly comparable.</p>
    <p><Link href="/compare-colleges-2026">Compare other colleges side by side →</Link></p>
  </section>;
}
