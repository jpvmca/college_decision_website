'use client';

import { useState } from 'react';
import { imageSrcSet, imageUrl } from '../lib/api';
import { staticImageUrl } from '../lib/image';

const FALLBACK = staticImageUrl('/courses-hero.webp', 768);

type CourseImageProps = {
  src: string | null | undefined;
  alt: string;
};

export default function CourseImage({ src, alt }: CourseImageProps) {
  const [imageSrc, setImageSrc] = useState(imageUrl(src, 768) || FALLBACK);
  const srcSet = imageSrc === FALLBACK ? undefined : imageSrcSet(src, [480, 768]);

  return (
    <img
      className="course-card-image"
      src={imageSrc}
      srcSet={srcSet}
      sizes="(max-width: 760px) 100vw, 400px"
      alt={alt}
      width="1200"
      height="675"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imageSrc !== FALLBACK) setImageSrc(FALLBACK);
      }}
    />
  );
}
