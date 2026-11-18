import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BadgeCheck, Building2, ShieldCheck } from 'lucide-react';
import LoginForm from '../../../components/college-panel/LoginForm';
import { getPanelContext } from '../../../lib/college-panel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default async function CollegeLoginPage() {
  if (await getPanelContext()) redirect('/college');
  return <main className="cpn-login-page">
    <div className="cpn-login">
      <div className="cpn-login-card">
        <div className="cpn-login-badge" aria-hidden="true"><Building2 size={26} strokeWidth={2} /></div>
        <h1>College panel sign in</h1>
        <p className="cpn-login-lead">For verified college owners. Enter the email address that owns your college profile and we will email you a one-time code.</p>
        <LoginForm />
        <ul className="cpn-login-points">
          <li><ShieldCheck size={16} aria-hidden="true" /> No password needed: a fresh code every time</li>
          <li><BadgeCheck size={16} aria-hidden="true" /> Every change is reviewed before it goes live</li>
        </ul>
      </div>
      <p className="cpn-login-foot">Not verified yet? <Link href="/for-colleges/claim">Claim your college profile</Link> · <Link href="/for-colleges">How it works</Link></p>
    </div>
  </main>;
}
