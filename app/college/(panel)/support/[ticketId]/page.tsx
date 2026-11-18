import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SupportThread from '../../../../../components/college-panel/support/SupportThread';
import type { Thread } from '../../../../../components/college-panel/support/support-client';
import { getPanelContext, panelFetch } from '../../../../../lib/college-panel';

export const metadata: Metadata = { title: 'Support ticket', robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const id = Number(ticketId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<{ data: Thread }>(`/institutes/${ctx.college.id}/support/tickets/${id}`);
  if (res.status === 404 || res.status === 403) notFound();
  if (!res.body?.data) return <div className="cpn-alert err">This ticket could not be loaded right now. Please refresh the page.</div>;
  return <SupportThread key={id} instituteId={ctx.college.id} initial={res.body.data} />;
}
