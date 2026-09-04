'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GitCompareArrows, Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-navigation">
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      {open ? <X size={28} aria-hidden="true" /> : <Menu size={30} aria-hidden="true" />}
    </button>
    <div id="site-navigation" className={open ? 'nav-links mobile-open' : 'nav-links'}>
      <Link href="/colleges" onClick={() => setOpen(false)}>Colleges</Link>
      <Link href="/exams" onClick={() => setOpen(false)}>Exams</Link>
      <Link href="/courses" onClick={() => setOpen(false)}>Courses</Link>
      <Link href="/articles" onClick={() => setOpen(false)}>Articles</Link>
      <Link href="/compare-colleges-2026" onClick={() => setOpen(false)}><GitCompareArrows size={16} aria-hidden="true" /> Compare colleges</Link>
    </div>
  </div>;
}
