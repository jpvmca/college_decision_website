import type { Metadata } from 'next';
import ReverifyForm from '../../../../components/college-panel/v2/ReverifyForm';
import { getPanelContext, panelFetch } from '../../../../lib/college-panel';
import { formatIst } from '../../../../lib/college-panel-types';
import '../../college-panel-v2.css';

export const metadata: Metadata = { title: 'Yearly re-verification', robots: { index: false, follow: false } };

type Reverify = { due_at: string; days_left: number; status: 'current' | 'due_soon' | 'overdue'; last_confirmed_at: string | null; owner_since: string };

export default async function Page() {
  const ctx = (await getPanelContext())!;
  const res = await panelFetch<{ data: Reverify | null }>(`/institutes/${ctx.college.id}/reverification`);
  const r = res.body?.data;
  const due = r ? new Date(r.due_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }) : null;
  return <>
    <div className="cpn-head"><div><h1>Yearly re-verification</h1><p>Once every 12 months, please confirm that your profile data is still correct. You stay the owner even if it lapses; the profile then shows “Verification due” until you confirm.</p></div></div>
    {r ? <div className={`cpn-alert ${r.status === 'overdue' ? 'err' : r.status === 'due_soon' ? 'warn' : 'ok'}`}>
      {r.status === 'overdue' ? `Re-verification was due on ${due} (${-r.days_left} days ago). Your profile shows “Verification due”.`
        : r.status === 'due_soon' ? `Re-verification is due on ${due} (${r.days_left} days left).`
          : `Up to date. Next re-verification due on ${due}.`}
      {' '}Last confirmed: {r.last_confirmed_at ? formatIst(r.last_confirmed_at) : `not yet (owner since ${formatIst(r.owner_since)})`}.
    </div> : <div className="cpn-alert err">Could not load the re-verification status.</div>}
    <ReverifyForm instituteId={ctx.college.id} />
  </>;
}
