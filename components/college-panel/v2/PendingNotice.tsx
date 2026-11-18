import Link from 'next/link';
import { formatIst, type ChangeItem, type ChangeRequest } from '../../../lib/college-panel-types';

/** Latest request still waiting for review in this section (items listed so the owner does not resubmit). */
export default function PendingNotice({ pending }: { pending: (ChangeRequest & { items: ChangeItem[] }) | null }) {
  if (!pending) return null;
  return <div className="cpn-alert warn">
    Request #{pending.id} is waiting for review (submitted {formatIst(pending.created_at)}): {pending.items.map((i) => i.label).filter(Boolean).slice(0, 6).join('; ')}
    {pending.items.length > 6 ? ` and ${pending.items.length - 6} more` : ''}. Changes go live only after our team approves them. <Link href="/college/requests">See all requests</Link>
  </div>;
}
