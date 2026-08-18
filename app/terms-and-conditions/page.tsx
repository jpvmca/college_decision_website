import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Read the Terms and Conditions for using CollegeDecision.in college research guides and website services.',
  alternates: { canonical: '/terms-and-conditions' }
};

export default function TermsPage() {
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">LEGAL INFORMATION</p>
    <h1>Terms and Conditions</h1>
    <p className="muted">Last updated: 18 August 2026</p>
    <p>By using CollegeDecision.in, you agree to use the website responsibly and to read these terms. If you do not agree, please do not use the website.</p>
    <h2>Purpose of the website</h2>
    <p>CollegeDecision.in provides college and course research material to help students compare options. It is not an educational institution, admission authority, counselling service, employment agency or legal adviser.</p>
    <h2>Use of our content</h2>
    <p>You may read and share links to our pages for personal, non-commercial research. Do not copy, republish, scrape, sell or present our original explanations as your own without written permission. Official college names, course names and factual figures may belong to their respective owners.</p>
    <h2>Copyright concerns</h2>
    <p>If you believe content on CollegeDecision.in infringes your copyright, email <a href="mailto:copyright@collegedecision.in">copyright@collegedecision.in</a> with the original work, the page URL, an explanation of the concern and your contact details. We may remove or restrict access to material while a good-faith complaint is reviewed.</p>
    <h2>Accuracy and changes</h2>
    <p>We work to present useful, source-aware information, but college fees, eligibility, seats, exams, placements and admission rules can change. We may correct, update, remove or reorganise content without notice. Always confirm important details with the institution’s current official notice.</p>
    <h2>Acceptable use</h2>
    <ul><li>Do not use the website to mislead applicants or impersonate an institution.</li><li>Do not interfere with website security, availability or access controls.</li><li>Do not submit unlawful, abusive, deceptive or confidential material.</li><li>Do not use automated requests in a way that overloads the service.</li></ul>
    <h2>External links</h2>
    <p>Our pages may link to official college websites or other external resources. We do not control those websites and are not responsible for their content, availability, privacy practices or decisions.</p>
    <h2>Limitation of liability</h2>
    <p>To the extent permitted by law, CollegeDecision.in is not responsible for loss arising from reliance on incomplete, outdated or incorrectly interpreted information, or from an admission, financial or career decision made using the website.</p>
    <h2>Contact</h2>
    <p>Questions about these terms can be sent to <a href="mailto:hello@collegedecision.in">hello@collegedecision.in</a>.</p>
  </div></main>;
}
