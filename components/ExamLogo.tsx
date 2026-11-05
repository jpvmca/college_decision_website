'use client';

import { useState, type ReactNode } from 'react';
import { instituteLogoUrl } from '../lib/api';

export default function ExamLogo({
  src,
  examName,
  courseName,
  size = 56,
  fallback = null
}: {
  src?: string | null;
  examName: string;
  courseName?: string | null;
  size?: number;
  fallback?: ReactNode;
}) {
  const url = instituteLogoUrl(src);
  const [failed, setFailed] = useState(false);
  if (!url || failed) return fallback;
  const alt = courseName
    ? `${examName} entrance exam logo for ${courseName} admissions in India`
    : `${examName} entrance exam logo for college admissions in India`;
  return (
    <img
      className="exam-logo"
      src={url}
      alt={alt}
      title={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(event) => { if (event.currentTarget.naturalWidth < 8) setFailed(true); }}
    />
  );
}
