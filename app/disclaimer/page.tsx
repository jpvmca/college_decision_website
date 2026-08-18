import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Understand the limits of CollegeDecision.in college fees, eligibility, admission and placement information.',
  alternates: { canonical: '/disclaimer' }
};

export default function DisclaimerPage() {
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">READ BEFORE YOU DECIDE</p>
    <h1>Disclaimer</h1>
    <p className="muted">Last updated: 18 August 2026</p>
    <div className="notice"><strong>Short version:</strong> CollegeDecision.in is a research and comparison resource. It is not a substitute for the current official information published by a college, university, examination authority or regulator.</div>
    <h2>Fees and total cost</h2>
    <p>Fee values shown on our pages are recorded data points or comparison leads. They may exclude hostel, mess, deposits, development charges, examination fees, transport, taxes, category differences or later academic-year changes. Ask the institution for a current written fee schedule before paying or applying.</p>
    <h2>Eligibility and admission</h2>
    <p>Eligibility wording, entrance exams, counselling routes, seat rules and deadlines can vary by programme, campus, category and academic year. A course appearing in a guide does not mean that you are eligible or that an application route is currently open.</p>
    <h2>Placements and outcomes</h2>
    <p>Placement records may reflect a particular year, programme, campus, recruiter set or reporting method. Average and highest packages are not promises of a student’s salary. Review the latest official placement report and ask how the figures were calculated.</p>
    <h2>Data limitations</h2>
    <p>We combine structured records with source-aware review workflows, but records can be incomplete, delayed, duplicated or incorrectly mapped. If you find an issue, please <a href="/contact">contact us with official evidence</a> so it can be reviewed.</p>
    <h2>No professional advice or guarantee</h2>
    <p>Our content is general educational information. It is not legal, financial, immigration, career or admission advice, and we do not guarantee admission, rankings, scholarships, employment or any particular outcome.</p>
    <p>Use CollegeDecision.in to prepare questions and compare possibilities, then make the final decision using current official sources and your own circumstances.</p>
  </div></main>;
}
