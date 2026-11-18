/**
 * Upload image URLs (S3 + size variants).
 *
 * The DB stores upload paths as "/uploads/{rel}" (some older rows hold absolute API URLs such as
 * https://api.collegedecision.in/uploads/{rel}). When NEXT_PUBLIC_IMAGE_BASE_URL is set
 * (https://cd-mrd-file-storage.s3.ap-south-1.amazonaws.com/cd/uploads/public) those paths are served
 * from S3:
 *   original : {base}/{rel}
 *   variant  : {base}/{rel-without-ext}.w{W}.webp
 * Variant widths per top folder must match college_decision_backend/src/config/image-variants.ts.
 * Every listed width exists for every image (smaller sources are never upscaled).
 * Leave NEXT_PUBLIC_IMAGE_BASE_URL empty to fall back to the API's /uploads route (?w=&q=&convert=webp).
 */
export const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/+$/, '');

export const IMAGE_VARIANT_WIDTHS: Record<string, readonly number[]> = {
  institutes: [96, 192, 480, 768],
  exams: [96, 192, 480, 768, 1200],
  course: [480, 768, 1200],
  articles: [480, 768, 1200],
  listings: [480, 768, 1200],
  brand: [],
  default: [480, 768, 1200]
};

const UPLOADS_ORIGIN = /^https?:\/\/(?:api\.collegedecision\.in|(?:www\.)?collegedecision\.in|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)(?=\/uploads\/)/i;

/** "/uploads/course/x.webp?v=1" -> { rel: "course/x.webp", query: "?v=1" }; null for non-upload URLs. */
export function uploadsPath(value: string | null | undefined) {
  if (!value) return null;
  const src = String(value).trim().replace(UPLOADS_ORIGIN, '');
  const match = src.match(/^\/?uploads\/([^?#]+)(\?[^#]*)?/i);
  if (!match || match[1].split('/').some((part) => part === '.' || part === '..')) return null;
  return { rel: match[1], query: match[2] || '' };
}

function variantRel(rel: string, width: number) {
  const dot = rel.lastIndexOf('.');
  const slash = rel.lastIndexOf('/');
  return `${dot > slash ? rel.slice(0, dot) : rel}.w${width}.webp`;
}

function encodePath(rel: string) {
  return rel.split('/').map((part) => encodeURIComponent(decodeURIComponent(part))).join('/');
}

export function variantWidthsFor(rel: string): readonly number[] {
  if (!rel.includes('/')) return IMAGE_VARIANT_WIDTHS.default;
  return IMAGE_VARIANT_WIDTHS[rel.split('/')[0]] ?? IMAGE_VARIANT_WIDTHS.default;
}

/** Smallest stored variant that is at least `width` px wide (null = use the original). */
export function pickVariantWidth(rel: string, width?: number) {
  if (!width) return null;
  return variantWidthsFor(rel).find((candidate) => candidate >= width) ?? null;
}

/** S3 URL for an upload path, or null when S3 is not configured / the value is not an upload. */
export function s3ImageUrl(value: string | null | undefined, width?: number) {
  if (!IMAGE_BASE_URL) return null;
  const parsed = uploadsPath(value);
  if (!parsed) return null;
  const variant = pickVariantWidth(parsed.rel, width);
  const rel = variant ? variantRel(parsed.rel, variant) : parsed.rel;
  return `${IMAGE_BASE_URL}/${encodePath(rel)}${parsed.query}`;
}

/**
 * Website static images (files in public/) mirrored to S3 under {base}/static/{path}, with the same
 * .w{W}.webp variants (480/768/1200; SVGs are stored as the original only).
 * Without NEXT_PUBLIC_IMAGE_BASE_URL the local public path is returned unchanged.
 */
export const STATIC_VARIANT_WIDTHS = [480, 768, 1200] as const;

export function staticImageUrl(publicPath: string, width?: number) {
  const clean = publicPath.replace(/^\/+/, '');
  if (!IMAGE_BASE_URL || /^https?:\/\//i.test(publicPath)) return publicPath.startsWith('/') || /^https?:/i.test(publicPath) ? publicPath : `/${clean}`;
  const rel = `static/${clean}`;
  if (!width || /\.svg$/i.test(clean)) return `${IMAGE_BASE_URL}/${encodePath(rel)}`;
  const variant = STATIC_VARIANT_WIDTHS.find((candidate) => candidate >= width) ?? null;
  return `${IMAGE_BASE_URL}/${encodePath(variant ? variantRel(rel, variant) : rel)}`;
}

/** srcset for a static image when served from S3 (undefined locally or for SVGs). */
export function staticImageSrcSet(publicPath: string, widths: readonly number[] = STATIC_VARIANT_WIDTHS) {
  if (!IMAGE_BASE_URL || /\.svg$/i.test(publicPath)) return undefined;
  return widths.map((width) => `${staticImageUrl(publicPath, width)} ${width}w`).join(', ');
}

export const STATIC_FROM_S3 = Boolean(IMAGE_BASE_URL);
