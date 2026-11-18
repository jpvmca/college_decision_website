import type { Metadata } from 'next';
import PendingNotice from '../../../../components/college-panel/v2/PendingNotice';
import RecruitersManager from '../../../../components/college-panel/v3/RecruitersManager';
import type { V2Live } from '../../../../components/college-panel/v2/types';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Recruiters', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<V2Live>>(`/institutes/${ctx.college.id}/sections/recruiters`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Recruiters</h1><p>Companies that hire your students, picked from our company list. A proof document is required for new or changed records.</p></div></div>
    <PendingNotice pending={res.body.data.pending} />
    <RecruitersManager instituteId={ctx.college.id} live={res.body.data.live} />
  </>;
}
