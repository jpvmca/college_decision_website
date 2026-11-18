import type { Metadata } from 'next';
import RichContentEditor, { type RichLive } from '../../../../components/college-panel/v3/RichContentEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'About', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<RichLive>>(`/institutes/${ctx.college.id}/sections/about`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  const { live, pending, pendingHtml } = res.body.data;
  return <>
    <div className="cpn-head"><div><h1>About</h1><p>The introduction shown at the top of your public profile.</p></div></div>
    <RichContentEditor instituteId={ctx.college.id} section="about" label="About" live={live} pending={pending} pendingHtml={pendingHtml ?? null}
      tips={['Open with one or two sentences: who you are, where you are and since when.', 'Cover approvals and affiliation (UGC, AICTE, NAAC grade, university) with the exact names.', 'Describe the campus, hostels, labs and libraries in plain words.', 'Keep claims factual: rankings and awards with the year and the body that gave them.']} />
  </>;
}
