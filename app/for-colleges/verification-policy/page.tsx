import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { CLAIM_HREF, FOR_COLLEGES_HREF } from '../../../lib/college-verification';

const title = 'College profile verification policy';
const description = 'How CollegeDecision.in verifies college profile claims, what documents we ask for, how college-submitted updates are reviewed and how verification can be removed.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/for-colleges/verification-policy' },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: '/for-colleges/verification-policy' },
  twitter: { card: 'summary_large_image', title, description }
};

export default function VerificationPolicyPage() {
  return <main className="section ls-page"><div className="wrap">
    <nav className="breadcrumb ls-crumb" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link><span aria-hidden="true">›</span><Link prefetch={false} href={FOR_COLLEGES_HREF}>For colleges</Link><span aria-hidden="true">›</span><span aria-current="page">Verification policy</span></nav>
    <section className="ls-hero">
      <div className="ls-hero-inner is-solo">
        <div className="ls-hero-copy">
          <span className="ls-kicker"><ShieldCheck size={15} aria-hidden="true" /> Verification policy</span>
          <h1>How we verify college profiles</h1>
          <p>This policy explains who can claim a college profile on CollegeDecision.in, what we check before approving a claim and how updates from colleges are reviewed.</p>
        </div>
      </div>
    </section>
    <div className="ls-prose">
      <h2>Who can claim a profile</h2>
      <p>A profile can be claimed by an authorised representative of the institution, such as a registrar, admissions office, director’s office or communications team. Every profile starts as unclaimed and shows no verified badge until a claim is approved.</p>

      <h2>What we check</h2>
      <ul>
        <li><strong>Official email.</strong> The claim must use an email address on the institution’s own domain, and the domain should match the official website on record. We confirm the address with a one-time code. Free webmail addresses are not accepted.</li>
        <li><strong>Supporting documents.</strong> The claim form asks for documents that show you are authorised to act for the institution, for example an authorisation letter on official letterhead. We may ask for more if something is unclear.</li>
        <li><strong>Manual review.</strong> A member of our team reviews every claim. We can approve it, decline it or ask for more information.</li>
      </ul>

      <h2>How your documents are handled</h2>
      <p>Documents are stored in private storage, are not published and are used only to verify the claim. Please do not upload information that is not needed for verification, such as student records or payment details.</p>

      <h2>After approval</h2>
      <ul>
        <li>The profile shows a “Verified by college” badge.</li>
        <li>Each profile has one owner account. Our team can change or remove the owner, for example when staff change or authorisation is withdrawn.</li>
        <li>Updates you submit are change requests. They are reviewed by our team before they are published, and we keep a record of who requested each change.</li>
        <li>Verification does not change rankings, student ratings or reviews.</li>
      </ul>

      <h2>When verification can be removed</h2>
      <p>We may remove verification or the owner account if documents turn out to be invalid, the authorised contact is no longer with the institution, the account is misused or submitted information is repeatedly misleading.</p>

      <h2>Questions and disputes</h2>
      <p>If you believe a profile was claimed by someone who is not authorised, or you want to dispute a decision, write to <a href="mailto:mail@collegedecision.in">mail@collegedecision.in</a> with the college name and profile link.</p>

      <p><Link prefetch={false} className="button primary" href={CLAIM_HREF} rel="nofollow">Claim your college profile</Link></p>
    </div>
  </div></main>;
}
