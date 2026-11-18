import type { Metadata } from 'next';
import LogoEditor, { type LogoLive } from '../../../../components/college-panel/v3/LogoEditor';
import BrochureEditor, { type BrochureLive } from '../../../../components/college-panel/v3/BrochureEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { SectionResponse } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'Logo & brochure', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const [res, brochure] = await Promise.all([
    panelFetch<SectionResponse<LogoLive>>(`/institutes/${ctx.college.id}/sections/logo`),
    panelFetch<SectionResponse<BrochureLive>>(`/institutes/${ctx.college.id}/sections/brochure`)
  ]);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  return <>
    <div className="cpn-head"><div><h1>Logo &amp; brochure</h1><p>Shown on your profile header, in search results, listings and comparisons. Your profile has no separate cover image: the featured photo of your <a href="/college/gallery">photo gallery</a> is shown first.</p></div></div>
    <LogoEditor instituteId={ctx.college.id} data={res.body.data} collegeName={ctx.college.name} />
    {brochure.body?.data ? <BrochureEditor instituteId={ctx.college.id} data={brochure.body.data} /> : <div className="cpn-alert err">Could not load the brochure section. Please refresh.</div>}
  </>;
}
