import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Building2, ClipboardCheck, FileCheck2, MailCheck, ShieldCheck } from 'lucide-react';
import { CLAIM_HREF, VERIFICATION_POLICY_HREF } from '../../lib/college-verification';
import { fitSeoTitle } from '../../lib/seo-title';

const title = 'For colleges: claim and verify your college profile';
const description = 'Colleges and universities listed on CollegeDecision.in can claim their profile, verify it and request updates to courses, fees, admissions and contact details. Every change is reviewed before publishing.';

export const metadata: Metadata = {
  title: fitSeoTitle(title),
  description,
  alternates: { canonical: '/for-colleges' },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: '/for-colleges' },
  twitter: { card: 'summary_large_image', title, description }
};

const steps = [
  { icon: Building2, title: 'Find your college', text: 'Open your college profile on CollegeDecision.in and choose “Claim this profile”, or start from the claim form and search for your institution.' },
  { icon: MailCheck, title: 'Confirm your official email', text: 'Use an email address on your college’s own domain. We send a one-time code to confirm you can receive mail there. Free webmail addresses are not accepted for claims.' },
  { icon: FileCheck2, title: 'Upload verification documents', text: 'Attach the documents the form asks for, such as an authorisation letter on the institution’s letterhead. Documents are stored privately and used only for verification.' },
  { icon: ClipboardCheck, title: 'Our team reviews the claim', text: 'A reviewer checks the request against the official website and your documents. We may ask for more information before approving or declining.' }
];

export default function ForCollegesPage() {
  return <main className="section ls-page"><div className="wrap">
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">For colleges</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner is-solo">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><Building2 size={15} aria-hidden="true" /> For colleges and universities</span>
          <h1>Claim and verify your college profile</h1>
          <p>Help students see accurate information about your institution. Once your claim is approved, your profile shows a verified badge and you can request updates to the details students rely on.</p>
          <div className="ls-hero-actions">
            <Link prefetch={false} className="button primary" href={CLAIM_HREF} rel="nofollow">Claim your profile</Link>
            <Link prefetch={false} className="button" href={VERIFICATION_POLICY_HREF}>Read the verification policy</Link>
          </div>
        </div>
      </div>
    </section>
    <div className="ls-prose">
      <h2>How claiming works</h2>
      <div className="grid">
        {steps.map(({ icon: Icon, title: stepTitle, text }, index) => <article className="card" key={stepTitle}>
          <span className="pill">Step {index + 1}</span>
          <h3><Icon size={17} aria-hidden="true" /> {stepTitle}</h3>
          <p>{text}</p>
        </article>)}
      </div>
      <h2>What a verified profile means</h2>
      <div className="grid">
        <article className="card"><span className="pill"><BadgeCheck size={13} aria-hidden="true" /> Verified</span><h3>Confirmed ownership</h3><p>An authorised representative of the institution has claimed the profile and our team has approved the claim.</p></article>
        <article className="card"><span className="pill"><ShieldCheck size={13} aria-hidden="true" /> Reviewed</span><h3>Every edit is reviewed</h3><p>Changes submitted by a college are checked by our team before they appear on the site. Students keep seeing independent, evidence-backed information.</p></article>
        <article className="card"><span className="pill">Unclaimed</span><h3>Unclaimed profiles</h3><p>Profiles that no college representative has claimed yet show no verified badge. Their information comes from public and official sources.</p></article>
      </div>
      <h2>Good to know</h2>
      <ul>
        <li>Claiming or verifying a profile does not change rankings, student ratings or the order of listing pages.</li>
        <li>Each college profile has one owner account. Our team can transfer ownership if the authorised contact changes.</li>
        <li>College representatives cannot edit or remove student reviews and ratings.</li>
        <li>Found an error but do not represent the college? <Link prefetch={false} href="/contact">Report a data issue</Link> instead.</li>
      </ul>
      <p><Link prefetch={false} className="button primary" href={CLAIM_HREF} rel="nofollow">Start a claim</Link></p>
    </div>
  </div></main>;
}
