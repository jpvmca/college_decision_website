import type { Metadata } from 'next';
import PendingNotice from '../../../../components/college-panel/v2/PendingNotice';
import ExamsEditor, { type ExamsLive } from '../../../../components/college-panel/v3/ExamsEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Entrance exams', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<ExamsLive>>(`/institutes/${ctx.college.id}/sections/exams`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Entrance exams</h1><p>The entrance exams you accept for each course, chosen from our exam list.</p></div></div>
    <PendingNotice pending={res.body.data.pending} />
    <ExamsEditor instituteId={ctx.college.id} live={res.body.data.live} />
  </>;
}
