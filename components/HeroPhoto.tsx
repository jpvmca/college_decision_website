type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
};

/** Local public hero image with width-based srcset so mobile does not download the 1200px original. */
export default function HeroPhoto({
  src,
  alt,
  width = 1200,
  height = 675,
  sizes = '(max-width: 760px) calc(100vw - 72px), 42vw'
}: Props) {
  const base = src.replace(/\.webp$/i, '');
  return (
    <img
      src={`${base}-640.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`}
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
