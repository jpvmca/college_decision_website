import type { Metadata } from 'next';
import Link from 'next/link';
import ClaimInfoForm from '../../../../components/claim/ClaimInfoForm';
import '../claim.css';

export const metadata: Metadata = {
  title: 'Send information for your college claim',
  description: 'Reply to an information request for your college profile claim.',
  robots: { index: false, follow: false }
};

export default async function ClaimInfoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.claim) ? params.claim[0] : params.claim;
  const claimId = raw && /^\d{1,12}$/.test(raw) ? Number(raw) : null;
  return <main className="section cl-page"><div className="wrap">
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> › </span><Link href="/for-colleges">For colleges</Link><span aria-hidden="true"> › </span><span aria-current="page">Claim information</span></nav>
    <header className="cl-intro">
      <h1>Send the requested information</h1>
      <p>Our team needs a little more information to finish reviewing your claim. Confirm the claim email, then add a note or documents.</p>
    </header>
    <div className="cl-layout"><ClaimInfoForm claimId={claimId} /></div>
  </div></main>;
}
