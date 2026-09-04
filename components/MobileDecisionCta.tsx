'use client';

import DecisionTrigger from './DecisionTrigger';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function MobileDecisionCta() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return <aside className={hidden ? 'mobile-decision-cta is-hidden' : 'mobile-decision-cta'} aria-label="College decision tool">
    <DecisionTrigger />
    <button className="mobile-decision-hide" type="button" aria-label={hidden ? 'Show college decision tool' : 'Hide college decision tool'} onClick={() => setHidden((value) => !value)}>
      {hidden ? <ChevronLeft size={17} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
      <span className="sr-only">{hidden ? 'Show' : 'Hide'} Find My Best-Fit College</span>
    </button>
  </aside>;
}
