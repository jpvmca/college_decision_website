'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Shows only the first few lines of long editorial content with a "Show more" toggle.
 * The full content is always rendered into the HTML (collapsed with CSS only), so crawlers see all of it.
 */
export default function CollapsibleContent({ children, className = '', collapsedHeight = 150, moreLabel = 'Show more', lessLabel = 'Show less' }: {
  children: ReactNode;
  className?: string;
  collapsedHeight?: number;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (el && el.scrollHeight <= collapsedHeight + 24) setNeedsToggle(false);
  }, [collapsedHeight]);
  const collapsed = needsToggle && !expanded;
  return <div className={`collapsible-content ${collapsed ? 'is-collapsed' : 'is-expanded'} ${className}`.trim()}>
    <div ref={bodyRef} className="collapsible-content-body" style={collapsed ? { maxHeight: collapsedHeight } : undefined}>
      {children}
    </div>
    {needsToggle ? <button type="button" className="collapsible-toggle" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
      {expanded ? lessLabel : moreLabel}<ChevronDown size={16} aria-hidden="true" style={expanded ? { transform: 'rotate(180deg)' } : undefined} />
    </button> : null}
  </div>;
}
