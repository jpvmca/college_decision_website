import type { Metadata } from 'next';
import PendingNotice from '../../../../components/college-panel/v2/PendingNotice';
import FeeGrid from '../../../../components/college-panel/v3/FeeGrid';
import type { V2Live } from '../../../../components/college-panel/v2/types';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Fees', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<V2Live>>(`/institutes/${ctx.college.id}/sections/fees`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Fee structure</h1><p>Year-wise fees for each course. Pick a course, fill the grid and submit; our team reviews every change before it goes live.</p></div></div>
    <PendingNotice pending={res.body.data.pending} />
    <FeeGrid instituteId={ctx.college.id} live={res.body.data.live} />
  </>;
}
