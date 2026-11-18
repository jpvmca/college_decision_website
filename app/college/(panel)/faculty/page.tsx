import type { Metadata } from 'next';
import PendingNotice from '../../../../components/college-panel/v2/PendingNotice';
import FacultyEditor, { type FacultyLive } from '../../../../components/college-panel/v3/FacultyEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Faculty', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<FacultyLive>>(`/institutes/${ctx.college.id}/sections/faculty`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Faculty</h1><p>Key faculty members shown on your profile, with designation and qualification.</p></div></div>
    <PendingNotice pending={res.body.data.pending} />
    <FacultyEditor instituteId={ctx.college.id} live={res.body.data.live} />
  </>;
}
