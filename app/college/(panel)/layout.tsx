import Link from 'next/link';
import { redirect } from 'next/navigation';
import PanelNav, { CollegeSwitch, PanelSide, SignOut } from '../../../components/college-panel/PanelNav';
import { getPanelContext, panelFetch } from '../../../lib/college-panel';
import { instituteLogoUrl } from '../../../lib/api';

export const dynamic = 'force-dynamic';

type Overview = { data: { sections: Array<{ key: string; label: string; pending: number }> } };

export default async function CollegePanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPanelContext();
  if (!ctx) redirect('/college/login');
  const [overview, support] = await Promise.all([
    panelFetch<Overview>(`/institutes/${ctx.college.id}/overview`),
    panelFetch<{ data: { unread: number } }>(`/institutes/${ctx.college.id}/support/unread`)
  ]);
  const pending = Object.fromEntries((overview.body?.data.sections || []).map((s) => [s.key, s.pending]));
  const logo = instituteLogoUrl(ctx.college.logo);
  return <main className="cpn-page"><div className="wrap">
    <div className="cpn-shell">
      <PanelSide alerts={Number(support.body?.data.unread || 0)}>
        <div className="cpn-side-college">
          {logo ? <img src={logo} alt="" width={40} height={40} /> : null}
          <div><strong>{ctx.college.name}</strong><small>{[ctx.college.city, ctx.college.state].filter(Boolean).join(', ')}</small></div>
        </div>
        <PanelNav pending={pending} instituteId={ctx.college.id} supportUnread={Number(support.body?.data.unread || 0)} />
        <div className="cpn-side-foot">
          {ctx.college.slug && ctx.college.isPublished ? <Link href={`/colleges/${ctx.college.slug}`} target="_blank">View public profile ↗</Link> : null}
          <CollegeSwitch colleges={ctx.colleges.map((c) => ({ id: c.id, name: c.name }))} current={ctx.college.id} />
          <span>Signed in as {ctx.user.email}</span>
          <SignOut />
        </div>
      </PanelSide>
      <div className="cpn-main">{children}</div>
    </div>
  </div></main>;
}
