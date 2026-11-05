'use client';

import { useEffect, useRef, useState } from 'react';

type Item = { id: string; label: string };

/** Sticky "On this page" tabs that highlight the section currently in view. */
export default function ProfileSectionNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id || '');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const onScroll = () => {
      const offset = 120;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top - offset <= 0) current = section.id;
        else break;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    const nav = navRef.current?.querySelector<HTMLElement>('.cp-nav-track');
    if (!link || !nav) return;
    const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2;
    nav.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  return <nav ref={navRef} className="cp-nav" aria-label="On this page">
    <span className="cp-nav-label">On this page</span>
    <div className="cp-nav-track">{items.map((item) => <a key={item.id} href={`#${item.id}`} className={item.id === active ? 'is-active' : undefined} aria-current={item.id === active ? 'true' : undefined}>{item.label}</a>)}</div>
  </nav>;
}
