'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Undo2, X } from 'lucide-react';
import { DropZone, SubmitBar } from './v3/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { imageUrl } from '../../lib/api';
import type { SectionResponse } from '../../lib/college-panel-types';
import { submitChange, uploadPhoto } from './panel-client';
import { firstLinkError, LinkWarning } from './v3/LinkGuard';

export type GalleryCategory = { value: string; label: string };
export type GalleryLive = {
  images: Array<{ id: number; file_name: string; title: string; category: string | null; category_label: string | null; sort_order: number; is_featured: boolean; path: string | null; url: string | null }>;
  categories?: GalleryCategory[];
  maxAddPerRequest: number;
  maxActive: number;
};

type NewPhoto = { key: string; path: string; preview: string; title: string; category: string };
/** Featured photo: an existing row id, or the upload path of a new photo. */
type Featured = { kind: 'id'; id: number } | { kind: 'new'; path: string } | null;

const FALLBACK_CATEGORIES: GalleryCategory[] = [
  { value: 'campus', label: 'Campus' }, { value: 'building', label: 'Building' }, { value: 'classroom', label: 'Classroom' }, { value: 'lab', label: 'Lab' },
  { value: 'library', label: 'Library' }, { value: 'computer_lab', label: 'Computer Lab' }, { value: 'hostel_boys', label: 'Hostel (Boys)' },
  { value: 'hostel_girls', label: 'Hostel (Girls)' }, { value: 'hostel_room', label: 'Hostel Room' }, { value: 'cafeteria', label: 'Cafeteria / Food Court' },
  { value: 'auditorium', label: 'Auditorium' }, { value: 'sports', label: 'Sports' }, { value: 'events', label: 'Events' },
  { value: 'campus_life', label: 'Students / Campus Life' }, { value: 'placements', label: 'Placements' }, { value: 'awards', label: 'Awards / Rankings' },
  { value: 'infrastructure', label: 'Infrastructure' }, { value: 'other', label: 'Other' }
];

const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const move = <T,>(list: T[], index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

function TypeSelect({ value, categories, onChange, disabled, required }: { value: string; categories: GalleryCategory[]; onChange: (v: string) => void; disabled?: boolean; required?: boolean }) {
  return <select className={`cp3-type-select${!value && required ? ' missing' : ''}`} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label="Photo type">
    <option value="">{required ? 'Choose photo type…' : 'Type not set'}</option>
    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
  </select>;
}

export default function GalleryEditor({ instituteId, data, pendingCount }: { instituteId: number; data: SectionResponse<GalleryLive>['data']; pendingCount: number }) {
  const router = useRouter();
  const images = data.live.images;
  const categories = data.live.categories?.length ? data.live.categories : FALLBACK_CATEGORIES;
  const labelOf = (value: string | null | undefined) => categories.find((c) => c.value === value)?.label || '';

  const [order, setOrder] = useState<number[]>(() => images.map((i) => i.id));
  const [titles, setTitles] = useState<Record<number, string>>(() => Object.fromEntries(images.map((i) => [i.id, i.title])));
  const [types, setTypes] = useState<Record<number, string>>(() => Object.fromEntries(images.map((i) => [i.id, i.category || ''])));
  const originalFeatured = images.find((i) => i.is_featured)?.id ?? null;
  const [featured, setFeatured] = useState<Featured>(() => (originalFeatured ? { kind: 'id', id: originalFeatured } : null));
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<NewPhoto[]>([]);
  const [defaultType, setDefaultType] = useState('campus');
  const [filter, setFilter] = useState<string>('all');
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [note, setNote] = useState('');

  const byId = useMemo(() => new Map(images.map((i) => [i.id, i])), [images]);
  const orderChanged = order.some((id, index) => id !== images[index]?.id);
  const uploading = Boolean(progress);
  const kept = order.filter((id) => !removed.has(id));
  const room = Math.max(0, Math.min(data.live.maxAddPerRequest - added.length, data.live.maxActive - kept.length - added.length));

  const update = order
    .filter((id) => !removed.has(id))
    .map((id, index) => {
      const i = byId.get(id)!;
      const u: Record<string, unknown> = { id };
      if ((titles[id] || '').trim() !== i.title.trim()) u.title = titles[id];
      if ((types[id] || '') !== (i.category || '') && types[id]) u.category = types[id];
      const isFeat = featured?.kind === 'id' && featured.id === id;
      if (isFeat !== i.is_featured) u.isFeatured = isFeat;
      if (orderChanged && (index + 1) * 10 !== i.sort_order) u.sortOrder = (index + 1) * 10;
      return u;
    })
    .filter((u) => Object.keys(u).length > 1);
  const hasChanges = added.length > 0 || removed.size > 0 || update.length > 0;
  const missingType = added.some((a) => !a.category);
  const linkError = firstLinkError([
    ...added.map((a) => [a.title, 'Photo caption'] as [unknown, string]),
    ...Object.values(titles).map((t) => [t, 'Photo caption'] as [unknown, string])
  ]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const id of order) { const key = types[id] || 'none'; map.set(key, (map.get(key) || 0) + 1); }
    return map;
  }, [order, types]);
  const visible = order.filter((id) => filter === 'all' || (types[id] || 'none') === filter);

  async function onFiles(picked: File[]) {
    const isImage = (f: File) => /^image\/(jpeg|pjpeg|png|webp|avif|gif)$/i.test(f.type) || (!f.type && /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name));
    const tooBig = picked.filter((f) => isImage(f) && f.size > MAX_BYTES);
    const files = picked.filter((f) => isImage(f) && f.size <= MAX_BYTES);
    setError('');
    const skipped = [
      ...picked.filter((f) => !isImage(f)).map((f) => `${f.name}: not a JPG, PNG, WebP, AVIF or GIF image`),
      ...tooBig.map((f) => `${f.name}: larger than ${MAX_MB} MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`)
    ];
    if (skipped.length) setError(`Some photos were not added. ${skipped.join(' · ')}`);
    if (!files.length) return;
    if (files.length > room) {
      setError(room ? `You can add ${room} more photo${room > 1 ? 's' : ''} in this request (max ${data.live.maxAddPerRequest} per request, ${data.live.maxActive} in the gallery).` : 'No more photos can be added in this request.');
      return;
    }
    const failed: string[] = [...skipped];
    for (const [index, file] of files.entries()) {
      setProgress(`Uploading ${index + 1} of ${files.length}…`);
      try {
        const result = await uploadPhoto(instituteId, file);
        const photo: NewPhoto = { key: result.data.path, path: result.data.path, preview: URL.createObjectURL(file), title: '', category: defaultType };
        setAdded((list) => [...list, photo]);
      } catch (err) {
        failed.push(`${file.name}: ${err instanceof Error ? err.message : 'upload failed'}`);
      }
    }
    setProgress('');
    if (failed.length) setError(`Some photos were not added. ${failed.join(' · ')}`);
  }

  function setNew(index: number, patch: Partial<NewPhoto>) {
    setAdded((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function submit() {
    if (linkError) { setError(linkError); return; }
    setBusy(true); setError(''); setOk('');
    try {
      const base = orderChanged ? kept.length * 10 : Math.max(0, ...images.map((i) => i.sort_order));
      const add = added.map((a, index) => ({ path: a.path, title: a.title.trim(), category: a.category, isFeatured: featured?.kind === 'new' && featured.path === a.path, sortOrder: base + (index + 1) * 10 }));
      const updates = [...update];
      const result = await submitChange(instituteId, 'gallery', { add, remove: [...removed], update: updates }, note);
      setOk(`${result.message} Request #${result.data.id}.`);
      setAdded([]); setRemoved(new Set()); setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return <>
    {pendingCount ? <div className="cpn-alert warn">{pendingCount} gallery request{pendingCount > 1 ? 's are' : ' is'} waiting for review. <Link href="/college/requests">See requests</Link></div> : null}
    <section className="cpn-card">
      <div className="cp3-card-head">
        <div><h2>Add photos</h2><p>Pick a photo type, then drop several photos at once. You can change the type and caption of each photo, choose the featured photo and set the order before you submit. Any photo size works: each photo is compressed and converted to WebP (longest side up to 1600 px) and stored securely.</p></div>
      </div>
      <div className="cp3-gal-toolbar">
        <label className="cp3-label">Photo type for new uploads
          <TypeSelect value={defaultType} categories={categories} required onChange={setDefaultType} />
        </label>
        {added.length > 1 ? <button type="button" className="cpn-btn ghost small" disabled={!defaultType} onClick={() => setAdded((list) => list.map((p) => ({ ...p, category: defaultType })))}>Set “{labelOf(defaultType)}” for all {added.length} new photos</button> : null}
      </div>
      <DropZone accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple busy={uploading} disabled={room === 0} onFiles={(files) => { void onFiles(files); }}
        title={progress || 'Drop photos here or click to choose'} hint={`JPG, PNG, WebP, AVIF or GIF · up to ${MAX_MB} MB each · converted to WebP · up to ${data.live.maxAddPerRequest} per request · ${room} more allowed now`} />
      {added.length ? <div className="cpn-gallery cp3-gal-grid" style={{ marginTop: 14 }}>
        {added.map((photo, index) => {
          const isFeat = featured?.kind === 'new' && featured.path === photo.path;
          return <div className={`cpn-photo new${isFeat ? ' featured' : ''}`} key={photo.key}>
            <div className="cp3-gal-thumb"><img src={photo.preview} alt="" />{photo.category ? <span className="cp3-gal-tag">{labelOf(photo.category)}</span> : null}<span className="cp3-gal-new">New</span>
              <button type="button" className="cp3-gal-x" aria-label="Remove photo" title="Remove photo" onClick={() => { if (isFeat) setFeatured(originalFeatured ? { kind: 'id', id: originalFeatured } : null); setAdded((list) => list.filter((_, i) => i !== index)); }}><X size={16} strokeWidth={2.75} aria-hidden="true" /></button></div>
            <div className="cpn-photo-body cpn-form">
              <label>Photo type<span className="cp3-req">*</span><TypeSelect value={photo.category} categories={categories} required onChange={(v) => setNew(index, { category: v })} /></label>
              <label>Caption <span className="muted">(optional)</span><input type="text" maxLength={120} value={photo.title} onChange={(e) => setNew(index, { title: e.target.value })} placeholder={photo.category ? labelOf(photo.category) : 'e.g. Central library'} /><LinkWarning value={photo.title} label="Photo caption" /></label>
              <div className="cpn-actions cp3-gal-actions">
                <label className="cp3-gal-feat"><input type="radio" name="featured" checked={isFeat} onChange={() => setFeatured({ kind: 'new', path: photo.path })} /> <Star size={14} aria-hidden="true" /> Featured</label>
                <span className="cp3-gal-move">
                  <button type="button" className="cpn-btn ghost small" aria-label="Move left" disabled={index === 0} onClick={() => setAdded((list) => move(list, index, -1))}><ArrowLeft size={14} /></button>
                  <button type="button" className="cpn-btn ghost small" aria-label="Move right" disabled={index === added.length - 1} onClick={() => setAdded((list) => move(list, index, 1))}><ArrowRight size={14} /></button>
                </span>
              </div>
            </div>
          </div>;
        })}
      </div> : null}
    </section>
    <section className="cpn-card">
      <div className="cp3-card-head">
        <div><h2>Current gallery ({images.length})</h2><p>Filter by type, change a photo’s type or caption, pick the featured photo (shown first) and use the arrows to change the order.</p></div>
      </div>
      {images.length ? <>
        <div className="cp3-gal-filters" role="tablist" aria-label="Filter by photo type">
          <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All <b>{order.length}</b></button>
          {categories.filter((c) => counts.get(c.value)).map((c) => <button type="button" role="tab" key={c.value} aria-selected={filter === c.value} className={filter === c.value ? 'active' : ''} onClick={() => setFilter(c.value)}>{c.label} <b>{counts.get(c.value)}</b></button>)}
          {counts.get('none') ? <button type="button" role="tab" aria-selected={filter === 'none'} className={`warn${filter === 'none' ? ' active' : ''}`} onClick={() => setFilter('none')}>Type not set <b>{counts.get('none')}</b></button> : null}
        </div>
        <div className="cpn-gallery cp3-gal-grid">
          {visible.map((id) => {
            const image = byId.get(id)!;
            const src = image.path ? imageUrl(image.path, 480) : '';
            const isRemoved = removed.has(id);
            const isFeat = featured?.kind === 'id' && featured.id === id;
            const pos = order.indexOf(id);
            return <div className={`cpn-photo${isRemoved ? ' removing' : ''}${isFeat ? ' featured' : ''}`} key={id}>
              <div className="cp3-gal-thumb">{src ? <img src={src} alt={image.title} loading="lazy" /> : <div className="cp3-gal-missing">Image file missing. Remove it and upload a new photo.</div>}{types[id] ? <span className="cp3-gal-tag">{labelOf(types[id])}</span> : null}{isFeat ? <span className="cp3-gal-new star"><Star size={12} /> Featured</span> : null}
                {isRemoved
                  ? <div className="cp3-gal-removed"><span>Will be removed when you submit</span><button type="button" className="cpn-btn ghost small" onClick={() => setRemoved((set) => { const next = new Set(set); next.delete(id); return next; })}><Undo2 size={14} /> Keep photo</button></div>
                  : <button type="button" className="cp3-gal-x" aria-label="Remove photo" title="Remove photo" onClick={() => { if (!window.confirm('Remove this photo from your gallery? It is removed after our team approves the request.')) return; setRemoved((set) => new Set(set).add(id)); if (isFeat) setFeatured(null); }}><X size={16} strokeWidth={2.75} aria-hidden="true" /></button>}
              </div>
              <div className="cpn-photo-body cpn-form">
                <label>Photo type<TypeSelect value={types[id] || ''} categories={categories} disabled={isRemoved} onChange={(v) => setTypes((t) => ({ ...t, [id]: v }))} /></label>
                <label>Caption<input type="text" maxLength={120} disabled={isRemoved} value={titles[id] || ''} onChange={(e) => setTitles((t) => ({ ...t, [id]: e.target.value }))} /><LinkWarning value={titles[id] || ''} label="Photo caption" /></label>
                <div className="cpn-actions cp3-gal-actions">
                  <label className="cp3-gal-feat"><input type="radio" name="featured" disabled={isRemoved} checked={isFeat} onChange={() => setFeatured({ kind: 'id', id })} /> <Star size={14} aria-hidden="true" /> Featured</label>
                  {filter === 'all' ? <span className="cp3-gal-move">
                    <button type="button" className="cpn-btn ghost small" aria-label="Move earlier" disabled={pos === 0 || isRemoved} onClick={() => setOrder((list) => move(list, pos, -1))}><ArrowLeft size={14} /></button>
                    <button type="button" className="cpn-btn ghost small" aria-label="Move later" disabled={pos === order.length - 1 || isRemoved} onClick={() => setOrder((list) => move(list, pos, 1))}><ArrowRight size={14} /></button>
                  </span> : null}
                </div>
              </div>
            </div>;
          })}
        </div>
        {!visible.length ? <p className="muted">No photos of this type.</p> : null}
      </> : <p className="muted">No photos yet. Add your first photos above.</p>}
    </section>
    <SubmitBar busy={busy} error={error} ok={ok} note={note} onNote={setNote} disabled={uploading || !hasChanges || missingType || Boolean(linkError)}
      label="Submit gallery for review" count={added.length + removed.size + update.length} onSubmit={() => { void submit(); }}
      extra={<span className="cpn-hint">{missingType ? 'Choose a photo type for every new photo · ' : ''}{added.length} to add · {removed.size} to remove · {update.length} edited</span>} />
  </>;
}
