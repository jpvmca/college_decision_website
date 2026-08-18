import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the CollegeDecision.in Privacy Policy covering website usage, contact messages and technical data.',
  alternates: { canonical: '/privacy-policy' }
};

export default function PrivacyPolicyPage() {
  return <main className="section"><div className="wrap prose">
    <p className="eyebrow">LEGAL INFORMATION</p>
    <h1>Privacy Policy</h1>
    <p className="muted">Last updated: 17 August 2026</p>
    <p>This Privacy Policy explains how CollegeDecision.in handles information when you browse our college guides, use search or contact us. We aim to collect only what is needed to operate, protect and improve the website.</p>
    <h2>Information you provide</h2>
    <p>If you email us, we receive the information you choose to include, such as your name, email address, message, page URL and supporting source. Please do not send passwords, payment information, government identity documents or sensitive student records.</p>
    <h2>Information collected automatically</h2>
    <p>Like most websites, our hosting and security systems may process technical information such as IP address, browser type, device information, referring page and request time. This helps us prevent abuse, diagnose errors and understand general site performance.</p>
    <h2>How we use information</h2>
    <ul><li>To respond to questions and data-correction requests.</li><li>To investigate security, reliability and performance problems.</li><li>To improve article structure, search and the student experience.</li><li>To comply with applicable legal obligations.</li></ul>
    <h2>Cookies and analytics</h2>
    <p>We may use essential technologies required for security, preferences or basic operation. If analytics or optional cookies are introduced, this policy will be updated with their purpose and controls.</p>
    <h2>Advertising</h2>
    <p>If we introduce Google AdSense or another advertising partner, those providers and their partners may use cookies or similar technologies to understand visits and show advertisements. Google may use information about visits to this and other websites for personalised advertising. Visitors can manage personalised advertising through <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ad Settings</a>. This section will be updated if advertising partners, consent tools or regional requirements change.</p>
    <h2>Sharing and retention</h2>
    <p>We do not sell personal information. Information may be processed by service providers that host, secure or operate the website, subject to appropriate safeguards. We retain correspondence only as long as reasonably necessary for the request, records, security or legal obligations.</p>
    <h2>Your choices</h2>
    <p>You may ask what personal information we hold about your correspondence or request correction or deletion where applicable. Contact <a href="mailto:privacy@collegedecision.in">privacy@collegedecision.in</a> with enough context for us to locate the request.</p>
    <h2>Updates</h2>
    <p>We may revise this policy when the website or applicable requirements change. The “Last updated” date identifies the latest version.</p>
  </div></main>;
}
