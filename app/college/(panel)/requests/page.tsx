import type { Metadata } from 'next';
import RequestsList from '../../../../components/college-panel/RequestsList';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { ChangeRequest } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'My requests', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<{ data: ChangeRequest[] }>(`/institutes/${ctx.college.id}/change-requests`);
  return <>
    <div className="cpn-head"><div><h1>My requests</h1><p>Everything submitted for {ctx.college.name}, newest first. Open a request to see exactly what was proposed.</p></div></div>
    <RequestsList instituteId={ctx.college.id} requests={res.body?.data || []} />
  </>;
}
