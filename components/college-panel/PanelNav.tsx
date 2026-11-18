'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BriefcaseBusiness, Building, ClipboardCheck, ClipboardList, FileText, GraduationCap, Image as ImageIcon, Images, Inbox, IndianRupee, LayoutDashboard, LifeBuoy, Menu, Phone, ShieldCheck, UsersRound, X, type LucideIcon } from 'lucide-react';

type Item = { href: string; label: string; key: string; icon: LucideIcon };
const GROUPS: Array<{ title: string; items: Item[] }> = [
  { title: 'Dashboard', items: [{ href: '/college', label: 'Overview', key: '', icon: LayoutDashboard }] },
  { title: 'Profile', items: [
    { href: '/college/logo', label: 'Logo', key: 'logo', icon: ImageIcon },
    { href: '/college/about', label: 'About', key: 'about', icon: FileText },
    { href: '/college/contact', label: 'Contact details', key: 'contact', icon: Phone },
    { href: '/college/admissions', label: 'Admissions', key: 'admissions', icon: ClipboardList },
    { href: '/college/gallery', label: 'Photo gallery', key: 'gallery', icon: Images },
    { href: '/college/faculty', label: 'Faculty', key: 'faculty', icon: UsersRound }
  ] },
  { title: 'Academics', items: [
    { href: '/college/courses', label: 'Courses', key: 'courses', icon: GraduationCap },
    { href: '/college/fees', label: 'Fees', key: 'fees', icon: IndianRupee },
    { href: '/college/exams', label: 'Entrance exams', key: 'exams', icon: ClipboardCheck }
  ] },
  { title: 'Careers', items: [
    { href: '/college/placements', label: 'Placements', key: 'placements', icon: BriefcaseBusiness },
    { href: '/college/recruiters', label: 'Recruiters', key: 'recruiters', icon: Building }
  ] },
  { title: 'Account', items: [
    { href: '/college/reverify', label: 'Yearly re-verification', key: 'reverify', icon: ShieldCheck },
    { href: '/college/requests', label: 'My requests', key: 'requests', icon: Inbox },
    { href: '/college/support', label: 'Support', key: 'support', icon: LifeBuoy }
  ] }
];

/** Non-secret hint cookie so the public header can say "College panel" (the session cookie itself is httpOnly). */
export const PANEL_HINT_COOKIE = 'cd_college_hint';
const setHint = (on: boolean) => {
  document.cookie = `${PANEL_HINT_COOKIE}=${on ? '1' : ''}; path=/; max-age=${on ? 60 * 60 * 24 * 30 : 0}; samesite=lax`;
  window.dispatchEvent(new Event('cd-college-hint'));
};

function currentLabel(pathname: string) {
  for (const g of GROUPS) for (const item of g.items) {
    if (item.href === '/college' ? pathname === '/college' : pathname.startsWith(item.href)) return item.label;
  }
  return 'Menu';
}

/** Sidebar shell. Below 860px it collapses into a one-line toggle (current page + Menu) so page content shows right away. */
export function PanelSide({ children, alerts = 0 }: { children: ReactNode; alerts?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { setHint(true); }, []);
  return <aside className={`cpn-side${open ? ' open' : ''}`} aria-label="College panel menu">
    <button type="button" className="cpn-side-toggle" aria-expanded={open} aria-controls="cpn-side-body" onClick={() => setOpen((v) => !v)}>
      {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      <span className="cpn-side-toggle-label"><small>College panel</small><strong>{currentLabel(pathname)}</strong></span>
      {alerts > 0 && !open ? <span className="cpn-count cpn-count-new" title="New replies from our team">{alerts}</span> : null}
      <span className="cpn-side-toggle-cta">{open ? 'Close' : 'Menu'}</span>
    </button>
    <div id="cpn-side-body" className="cpn-side-body">{children}</div>
  </aside>;
}

/** Unread support replies: from the layout, then re-checked every 60 s while the tab is visible. */
function useSupportUnread(instituteId: number, initial: number) {
  const [unread, setUnread] = useState(initial);
  useEffect(() => { setUnread(initial); }, [initial]);
  useEffect(() => {
    const check = () => {
      if (document.hidden) return;
      fetch(`/api/college-panel/institutes/${instituteId}/support/unread`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { data?: { unread?: number } } | null) => { if (j?.data) setUnread(Number(j.data.unread) || 0); })
        .catch(() => undefined);
    };
    const timer = setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', check); };
  }, [instituteId]);
  return unread;
}

export default function PanelNav({ pending, instituteId, supportUnread = 0 }: { pending: Record<string, number>; instituteId: number; supportUnread?: number }) {
  const pathname = usePathname();
  const total = Object.values(pending).reduce((a, b) => a + b, 0);
  const unread = useSupportUnread(instituteId, supportUnread);
  return <nav className="cpn-nav" aria-label="College panel">
    {GROUPS.map((g) => <div className="cpn-nav-group" key={g.title}>
      <div className="cpn-nav-title">{g.title}</div>
      {g.items.map((item) => {
        const active = item.href === '/college' ? pathname === '/college' : pathname.startsWith(item.href);
        const count = item.key === 'requests' ? total : item.key === 'support' ? unread : pending[item.key] || 0;
        const Icon = item.icon;
        return <Link key={item.href} href={item.href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
          <Icon size={16} aria-hidden="true" className="cpn-nav-icon" /><span>{item.label}</span>{count ? <span className={`cpn-count${item.key === 'support' ? ' cpn-count-new' : ''}`} title={item.key === 'support' ? 'New replies from our team' : 'Waiting for review'}>{count}</span> : null}
        </Link>;
      })}
    </div>)}
  </nav>;
}

export function CollegeSwitch({ colleges, current }: { colleges: Array<{ id: number; name: string }>; current: number }) {
  const router = useRouter();
  if (colleges.length < 2) return null;
  return <select aria-label="College" value={current} onChange={(e) => {
    document.cookie = `cd_college_active=${encodeURIComponent(e.target.value)}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`;
    router.push('/college');
    router.refresh();
  }}>
    {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
  </select>;
}

export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button type="button" className="cpn-btn ghost small" disabled={busy} onClick={async () => {
    setBusy(true);
    await fetch('/api/college-panel/auth/logout', { method: 'POST' }).catch(() => undefined);
    setHint(false);
    router.replace('/college/login');
    router.refresh();
  }}>Sign out</button>;
}

