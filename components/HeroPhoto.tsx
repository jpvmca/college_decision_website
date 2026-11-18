import { STATIC_FROM_S3, staticImageSrcSet, staticImageUrl } from '../lib/image';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
};

/**
 * Hero image with a width-based srcset so mobile does not download the full original.
 * With NEXT_PUBLIC_IMAGE_BASE_URL set it loads the S3 copies (static/{name}.w480/.w768/.w1200.webp);
 * otherwise the local public/{name}-640/-960.webp files.
 */
export default function HeroPhoto({
  src,
  alt,
  width = 1200,
  height = 675,
  sizes = '(max-width: 760px) calc(100vw - 72px), 42vw'
}: Props) {
  const base = src.replace(/\.webp$/i, '');
  const imgSrc = STATIC_FROM_S3 ? staticImageUrl(src, 768) : `${base}-640.webp`;
  const srcSet = STATIC_FROM_S3 ? staticImageSrcSet(src) : `${base}-640.webp 640w, ${base}-960.webp 960w`;
  return (
    <img
      src={imgSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      fetchPriority="high"
      loading="eager"
      decoding="async"
    />
  );
}
