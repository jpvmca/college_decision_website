'use client';

import { useMemo, useState } from 'react';

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
  if (!images.length) return null;
  return <section className="cp-gallery" aria-label={`${name} campus photos`}>
    <h2 className="cp-sr-only">{name} campus photos</h2>
    {tabs.length > 1 ? <div className="cp-gallery-tabs" role="tablist" aria-label="Photo type">
      <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : ''} onClick={() => { setTab('all'); setExpanded(false); }}>All ({images.length})</button>
      {tabs.map(([value, { label, count }]) => <button type="button" role="tab" key={value} aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => { setTab(value); setExpanded(false); }}>{label} ({count})</button>)}
    </div> : null}
    <ul className="cp-gallery-list">
      {shown.map((image, index) => (
        <li key={`${image.src}-${index}`}>
          <img src={image.thumb} alt={image.alt} width="480" height="270" loading="lazy" decoding="async" />
          {image.categoryLabel ? <span className="cp-gallery-tag">{image.categoryLabel}</span> : null}
        </li>
      ))}
    </ul>
    {filtered.length > 8 ? <button type="button" className="cp-gallery-more" onClick={() => setExpanded((v) => !v)}>{expanded ? 'Show fewer photos' : `Show all ${filtered.length} photos`}</button> : null}
  </section>;
}
