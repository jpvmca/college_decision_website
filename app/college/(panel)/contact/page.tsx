import type { Metadata } from 'next';
import ContactEditor, { type ContactLive } from '../../../../components/college-panel/v3/ContactEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'Contact details', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<ContactLive>>(`/institutes/${ctx.college.id}/sections/contact`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Contact details</h1><p>Phone numbers, email, website, campus address and founding year shown on your public profile.</p></div></div>
    <ContactEditor instituteId={ctx.college.id} data={res.body.data} />
  </>;
}
