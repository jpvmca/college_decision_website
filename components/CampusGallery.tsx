'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type CampusGalleryImage = { src: string; thumb: string; alt: string; featured: boolean; category: string | null; categoryLabel: string | null };

/** Public profile photo gallery: type tabs (only when photos have 2+ types) and "show all" after 8 photos. */
export default function CampusGallery({ name, images }: { name: string; images: CampusGalleryImage[] }) {
  const [tab, setTab] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const tabs = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const image of images) if (image.category && image.categoryLabel) map.set(image.category, { label: image.categoryLabel, count: (map.get(image.category)?.count || 0) + 1 });
    return [...map.entries()];
  }, [images]);
  const filtered = tab === 'all' ? images : images.filter((image) => image.category === tab);
  const shown = expanded ? filtered : filtered.slice(0, 8);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + filtered.length) % filtered.length)), [filtered.length]);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, close, step]);
  if (!images.length) return null;
  const current = open == null ? null : filtered[open];
  return <div className="cp-gallery" aria-label={`${name} photos`}>
    {tabs.length > 1 ? <div className="cp-gallery-tabs" role="tablist" aria-label="Photo type">
      <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : ''} onClick={() => { setTab('all'); setExpanded(false); setOpen(null); }}>All ({images.length})</button>
      {tabs.map(([value, { label, count }]) => <button type="button" role="tab" key={value} aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => { setTab(value); setExpanded(false); setOpen(null); }}>{label} ({count})</button>)}
    </div> : null}
    <ul className="cp-gallery-list">
      {shown.map((image, index) => (
        <li key={`${image.src}-${index}`}>
          <button type="button" className="cp-gallery-open" onClick={() => setOpen(index)} aria-label={`Open photo: ${image.alt}`}>
            <img src={image.thumb} alt={image.alt} width="480" height="270" loading="lazy" decoding="async" />
          </button>
          {image.categoryLabel ? <span className="cp-gallery-tag">{image.categoryLabel}</span> : null}
        </li>
      ))}
    </ul>
    {filtered.length > 8 ? <button type="button" className="cp-gallery-more" onClick={() => setExpanded((v) => !v)}>{expanded ? 'Show fewer photos' : `Show all ${filtered.length} photos`}</button> : null}
    {current ? <div className="cp-lightbox" role="dialog" aria-modal="true" aria-label={current.alt} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <button type="button" className="cp-lightbox-close" onClick={close} aria-label="Close"><X size={22} aria-hidden="true" /></button>
      {filtered.length > 1 ? <button type="button" className="cp-lightbox-nav is-prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={26} aria-hidden="true" /></button> : null}
      <figure>
        <img src={current.src} alt={current.alt} decoding="async" />
        <figcaption>{current.alt}{filtered.length > 1 ? ` · ${(open ?? 0) + 1} / ${filtered.length}` : ''}</figcaption>
      </figure>
      {filtered.length > 1 ? <button type="button" className="cp-lightbox-nav is-next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={26} aria-hidden="true" /></button> : null}
    </div> : null}
  </div>;
}
