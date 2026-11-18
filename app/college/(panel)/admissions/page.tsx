import type { Metadata } from 'next';
import RichContentEditor, { type RichLive } from '../../../../components/college-panel/v3/RichContentEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'Admissions', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<SectionResponse<RichLive>>(`/institutes/${ctx.college.id}/sections/admissions`);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  const { live, pending, pendingHtml } = res.body.data;
  return <>
    <div className="cpn-head"><div><h1>Admissions</h1><p>How students get in: eligibility, entrance exams, application steps, dates and documents. Shown in the Admission section of your profile.</p></div></div>
    <RichContentEditor instituteId={ctx.college.id} section="admissions" label="Admissions" live={live} pending={pending} pendingHtml={pendingHtml ?? null}
      tips={['Start with a short summary of the admission route for each course group.', 'List eligibility (marks, subjects, age) and the entrance exams you accept.', 'Give the application steps as a numbered list.', 'Mention documents and important dates; say which year they apply to.']} />
  </>;
}
