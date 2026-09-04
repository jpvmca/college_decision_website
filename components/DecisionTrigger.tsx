'use client';

import { GraduationCap } from 'lucide-react';

export function openDecisionTool() {
  window.dispatchEvent(new CustomEvent('college-decision:open'));
}

export default function DecisionTrigger({ className = 'button decision-launch' }: { className?: string }) {
  return <button className={className} type="button" onClick={openDecisionTool}><GraduationCap size={18} aria-hidden="true" /> Find My Best-Fit College</button>;
}
