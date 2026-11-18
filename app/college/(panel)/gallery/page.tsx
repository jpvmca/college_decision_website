import type { Metadata } from 'next';
import GalleryEditor, { type GalleryLive } from '../../../../components/college-panel/GalleryEditor';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import type { ChangeRequest } from '../../../../lib/college-panel-types';
import type { SectionResponse } from '../../../../lib/college-panel-types';

export const metadata: Metadata = { title: 'Photo gallery', robots: { index: false, follow: false } };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const [res, list] = await Promise.all([
    panelFetch<SectionResponse<GalleryLive>>(`/institutes/${ctx.college.id}/sections/gallery`),
    panelFetch<{ data: ChangeRequest[] }>(`/institutes/${ctx.college.id}/change-requests`)
  ]);
  if (!res.body?.data) return <div className="cpn-alert err">Could not load this section. Please refresh.</div>;
  const pendingCount = (list.body?.data || []).filter((r) => r.section === 'gallery' && r.status === 'pending').length;
  return <>
    <div className="cpn-head"><div><h1>Photo gallery</h1><p>Campus photos on your public profile. New photos, caption edits and removals are published after review.</p></div></div>
    <GalleryEditor instituteId={ctx.college.id} data={res.body.data} pendingCount={pendingCount} />
  </>;
}
