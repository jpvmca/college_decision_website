import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Clock, Lock, Mail } from 'lucide-react';
import { api } from '../../../lib/api';
import ClaimForm from '../../../components/claim/ClaimForm';
import type { ClaimCollege } from '../../../components/claim/claim-shared';
import './claim.css';

export const metadata: Metadata = {
  title: 'Claim your college profile',
  description: 'Claim and verify your college profile on CollegeDecision.in with your official college email and an authorization letter.',
  alternates: { canonical: '/for-colleges/claim' },
  robots: { index: false, follow: false }
};

async function prefill(college: string | undefined): Promise<ClaimCollege | null> {
  const key = String(college || '').trim().slice(0, 255);
  if (!key || !/^[a-z0-9-]+$/i.test(key)) return null;
  try {
    const response = await api<{ data: ClaimCollege[] }>(`/claims/college-search?college=${encodeURIComponent(key)}`, { cache: 'no-store' });
    return response.data?.[0] || null;
  } catch {
    return null;
  }
}

/** Whether the backend requires the mobile OTP (CLAIM_PHONE_OTP_ENABLED). Defaults to required if the check fails. */
async function phoneOtpRequired(): Promise<boolean> {
  try {
    const response = await api<{ data: { phoneOtpRequired?: boolean } }>('/claims/config', { cache: 'no-store' });
    return response.data?.phoneOtpRequired !== false;
  } catch {
    return true;
  }
}

export default async function ClaimPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [initialCollege, requirePhoneOtp] = await Promise.all([prefill(Array.isArray(params.college) ? params.college[0] : params.college), phoneOtpRequired()]);
  return <main className="section cl-page"><div className="wrap">
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> › </span><Link href="/for-colleges">For colleges</Link><span aria-hidden="true"> › </span><span aria-current="page">Claim your profile</span></nav>
    <header className="cl-intro">
      <h1>Claim {initialCollege ? initialCollege.name : 'your college profile'}</h1>
      <p>Verify that you represent the college with {requirePhoneOtp ? 'your mobile number, your official email' : 'your official email'} and two documents. Once our team approves the claim, the profile shows a “Verified by college” badge.</p>
      <ul className="cl-hero-badges">
        <li><Clock size={14} aria-hidden="true" /> About 5 minutes</li>
        <li><Mail size={14} aria-hidden="true" /> {requirePhoneOtp ? 'Mobile + email OTP' : 'Official email check'}</li>
        <li><Lock size={14} aria-hidden="true" /> Private document storage</li>
        <li><BadgeCheck size={14} aria-hidden="true" /> Verified badge on approval</li>
      </ul>
    </header>
    <ClaimForm initialCollege={initialCollege} phoneOtpRequired={requirePhoneOtp} />
  </div></main>;
}
