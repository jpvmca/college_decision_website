import type { Metadata } from 'next';
import PendingNotice from '../../../../components/college-panel/v2/PendingNotice';
import CoursesManager from '../../../../components/college-panel/v3/CoursesManager';
import type { V2Live } from '../../../../components/college-panel/v2/types';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Courses', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<V2Live>>(`/institutes/${ctx.college.id}/sections/courses`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Courses</h1><p>Add the degrees and specialisations you offer from our course list, and keep seats, eligibility and descriptions up to date. Every change is reviewed by our team before it goes live.</p></div></div>
    <PendingNotice pending={res.body.data.pending} />
    <CoursesManager instituteId={ctx.college.id} live={res.body.data.live} />
  </>;
}
