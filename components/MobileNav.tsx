'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-navigation">
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
      <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      <span aria-hidden="true">{open ? '×' : '☰'}</span>
    </button>
    <div id="site-navigation" className={open ? 'nav-links mobile-open' : 'nav-links'}>
      <Link href="/articles" onClick={() => setOpen(false)}>Articles</Link>
      <Link href="/about" onClick={() => setOpen(false)}>About</Link>
      <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
    </div>
  </div>;
}
