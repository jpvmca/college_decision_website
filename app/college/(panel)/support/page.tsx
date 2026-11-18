import type { Metadata } from 'next';
import SupportTickets from '../../../../components/college-panel/support/SupportTickets';
import type { TicketList } from '../../../../components/college-panel/support/support-client';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';

export const metadata: Metadata = { title: 'Support', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<{ data: TicketList }>(`/institutes/${ctx.college.id}/support/tickets`);
  const data = res.body?.data || { tickets: [], unread: 0, categories: {} };
  return <>
    <div className="cpn-head"><div><h1>Support</h1><p>Questions about {ctx.college.name}&apos;s profile, your account or the panel? Message our team here. Replies show up in the ticket and by email.</p></div></div>
    {res.status !== 200 ? <div className="cpn-alert err">Support tickets could not be loaded right now. Please refresh the page.</div> : null}
    <SupportTickets key={ctx.college.id} instituteId={ctx.college.id} initial={data} />
  </>;
}
