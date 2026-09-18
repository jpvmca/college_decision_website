'use client';

import { useState } from 'react';
import { mediaUrl } from '../lib/api';

type CourseImageProps = {
  src: string | null | undefined;
  alt: string;
};

export default function CourseImage({ src, alt }: CourseImageProps) {
  const [imageSrc, setImageSrc] = useState(mediaUrl(src) || '/courses-hero.webp');

  return (
    <img
      className="course-card-image"
      src={imageSrc}
      alt={alt}
      width="1200"
      height="675"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imageSrc !== '/courses-hero.webp') setImageSrc('/courses-hero.webp');
      }}
    />
  );
}
