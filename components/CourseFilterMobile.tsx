'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import type { CourseFilterOption } from './CourseFilterPanel';

type Props = { options: CourseFilterOption[]; totalColleges: number; selectedKey: string | null; selectedLabel: string | null };

const formatCount = (value: number) => value.toLocaleString('en-IN');

export default function CourseFilterMobile({ options, totalColleges, selectedKey, selectedLabel }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const selected = selectedRef.current;
    const list = selected?.closest('ul');
    if (selected && list) list.scrollTop = Math.max(0, selected.offsetTop - list.clientHeight / 2);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return <div className="course-filter-mobile">
    <button type="button" className="course-filter-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <SlidersHorizontal size={16} aria-hidden="true" />
      <span>{selectedLabel ? <>Course: <b>{selectedLabel}</b></> : 'Filter by Course'}</span>
    </button>
    {open && <div className="course-filter-sheet-backdrop" onClick={() => setOpen(false)}>
      <div className="course-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="course-filter-sheet-title" onClick={(event) => event.stopPropagation()}>
        <div className="course-filter-sheet-head">
          <h2 id="course-filter-sheet-title">Filter by Course</h2>
          <button ref={closeRef} type="button" className="course-filter-close" aria-label="Close course filter" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        </div>
        <ul className="course-filter-list course-filter-sheet-list">
          <li><Link prefetch={false} href="/colleges" onClick={() => setOpen(false)} ref={!selectedKey ? selectedRef : undefined} className="course-filter-option" aria-current={!selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">All courses</span>{totalColleges > 0 && <span className="course-filter-count">({formatCount(totalColleges)})</span>}</Link></li>
          {options.map((option) => <li key={option.key}><Link prefetch={false} href={option.href} onClick={() => setOpen(false)} ref={option.key === selectedKey ? selectedRef : undefined} className="course-filter-option" aria-current={option.key === selectedKey ? 'page' : undefined}><span className="course-filter-radio" aria-hidden="true" /><span className="course-filter-label">{option.label}</span><span className="course-filter-count">({formatCount(option.count)})</span></Link></li>)}
        </ul>
      </div>
    </div>}
  </div>;
}
