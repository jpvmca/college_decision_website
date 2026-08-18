import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CollegeDecision.in',
  description: 'Learn how CollegeDecision.in helps students compare college fees, courses, eligibility, admission routes and outcomes.',
  alternates: { canonical: '/about' }
};

export default function AboutPage() {
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">ABOUT COLLEGEDECISION.IN</p>
    <h1>College research that helps you decide with confidence</h1>
    <p>CollegeDecision.in is built for students and families who want more than a college name, a ranking or a single fee number. We bring course, institute, cost, eligibility, admission and placement information together so you can ask better questions before applying.</p>
    <h2>What we are building</h2>
    <p>Our goal is to make college research easier to understand and easier to verify. Instead of treating every number as a promise, our guides explain what the record represents, which academic details may be missing and what should be confirmed with the institution.</p>
    <div className="grid">
      <article className="card"><span className="pill">Compare</span><h3>Course-level choices</h3><p>See how the same college can offer different programmes, durations, fee records and admission routes.</p></article>
      <article className="card"><span className="pill">Understand</span><h3>Useful context</h3><p>Read fee, eligibility and placement information alongside practical questions about location, duration and additional costs.</p></article>
      <article className="card"><span className="pill">Verify</span><h3>Clear limitations</h3><p>Know when a figure is a recorded lead rather than a current official quote, and where further confirmation is needed.</p></article>
    </div>
    <h2>Our editorial approach</h2>
    <p>We use structured records to create original explanations, not copied college descriptions. Official institute and programme names are retained for accuracy, while the comparison language is written for students. Data can change, so the official college website and current admission notice remain the final sources for decisions.</p>
    <h2>Who CollegeDecision.in is for</h2>
    <p>The platform is designed for applicants comparing undergraduate, postgraduate, diploma and professional courses across India. It is useful at the early research stage, when you are narrowing options and preparing questions for admissions offices.</p>
    <h2>Who runs CollegeDecision.in</h2>
    <p>CollegeDecision.in is maintained by an independent product and research team focused on making education data easier to compare. We are not affiliated with every institution listed on the platform, and we do not accept editorial control in exchange for changing factual information. For corrections or collaboration questions, contact <a href="mailto:hello@collegedecision.in">hello@collegedecision.in</a>.</p>
  </div></main>;
}
