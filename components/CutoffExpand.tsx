'use client';

import { useId, useState, type ReactNode } from 'react';

/**
 * Shows the first `visible` table rows of a cutoff year section and a "View all" toggle for the rest.
 * Every row stays in the server-rendered HTML (hidden with CSS only), so search engines still see the full list.
 */
export default function CutoffExpand({ label, total, visible = 5, children }: { label: string; total: number; visible?: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (total <= visible) return <>{children}</>;
  return <>
    <div id={id} className={open ? undefined : 'cutoff-collapsed'}>{children}</div>
    <p><button type="button" className="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
      {open ? `Show top ${visible} only` : label}
    </button></p>
  </>;
}
