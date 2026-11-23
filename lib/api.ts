import { s3ImageUrl, uploadsPath } from './image';

const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
const PUBLIC_MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '');
const INTERNAL_UPLOADS_ORIGIN = /^(https?:\/\/)(?:127\.0\.0\.1|localhost):9101/i;
const PRODUCTION_UPLOADS_ORIGIN = /^https?:\/\/api\.collegedecision\.in(?=\/uploads\/)/i;

function mediaOrigin() {
  if (PUBLIC_MEDIA_ORIGIN) return PUBLIC_MEDIA_ORIGIN;
  const fromApi = apiUrl.replace(/\/api\/v1\/?$/i, '');
  try {
    const url = new URL(fromApi);
    if ((url.hostname === '127.0.0.1' || url.hostname === 'localhost') && url.port === '9101') {
      return 'https://api.collegedecision.in';
    }
  } catch {
    // Fall through to the API origin.
  }
  return fromApi;
}

export function mediaUrl(value: string | null | undefined) {
  if (!value || !String(value).trim()) return '';
  const fromS3 = s3ImageUrl(value);
  if (fromS3) return fromS3;
  let src = String(value).trim().replace(INTERNAL_UPLOADS_ORIGIN, 'https://api.collegedecision.in');
  if (PUBLIC_MEDIA_ORIGIN) src = src.replace(PRODUCTION_UPLOADS_ORIGIN, PUBLIC_MEDIA_ORIGIN);
  if (/^https?:\/\//i.test(src)) return src;
  const origin = mediaOrigin();
  return `${origin}${src.startsWith('/') ? src : `/${src}`}`;
}

/**
 * Sized upload image: the S3 variant closest above `width` when NEXT_PUBLIC_IMAGE_BASE_URL is set,
 * otherwise the API's on-the-fly resize (?w=&h=&q=&convert=webp). Non-upload URLs are returned as is.
 */
export function imageUrl(value: string | null | undefined, width?: number, options: { height?: number; quality?: number } = {}) {
  if (!value || !String(value).trim()) return '';
  const fromS3 = s3ImageUrl(value, width);
  if (fromS3) return fromS3;
  const url = mediaUrl(value);
  if (!url || !width || !uploadsPath(value)) return url;
  const height = options.height ? `&h=${options.height}` : '';
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}${height}&q=${options.quality ?? 82}&convert=webp`;
}

/** srcset string for an upload image at the given display widths. */
export function imageSrcSet(value: string | null | undefined, widths: number[], options: { aspect?: number; quality?: number } = {}) {
  if (!value || !uploadsPath(value)) return undefined;
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const width of widths) {
    const url = imageUrl(value, width, { height: options.aspect ? Math.round(width / options.aspect) : undefined, quality: options.quality });
    if (!url || seen.has(url)) continue;
    seen.add(url);
    parts.push(`${url} ${width}w`);
  }
  return parts.join(', ') || undefined;
}

export function instituteLogoUrl(value: string | null | undefined) {
  if (!mediaUrl(value)) return '';
  return imageUrl(value, 96, { quality: 85 });
}

/**
 * Public pages are ISR: their backend reads go through Next's data cache and are refreshed on a timer
 * (fallback) or on demand via /api/admin/cache/clear (tags/paths sent by the backend on admin edits).
 * Never use this for user-specific data; that stays in client components / no-store route handlers.
 */
export const PUBLIC_REVALIDATE_SECONDS = 900;
/** College profiles: the backend notifies the website (tag college:{slug} + /colleges/{slug} path) on edits. */
export const PROFILE_REVALIDATE_SECONDS = 1800;

export function publicFetchInit(tags: string[], revalidate = PUBLIC_REVALIDATE_SECONDS): RequestInit {
  return { next: { revalidate, tags } };
}

/** Thrown by api() for a non-2xx backend response; status lets callers tell a real 404 from a backend failure. */
export class ApiError extends Error {
  constructor(public status: number) {
    super(`API request failed: ${status}`);
  }
}

export function isNotFoundError(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 410);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const requestInit = { ...init };
  if (!requestInit.cache && !requestInit.next) requestInit.next = { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ['public'] };
  const response = await fetch(`${apiUrl}${path}`, {
    ...requestInit
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}

export type ArticleList = {
  data: Array<{ id: number; title: string; slug: string; content: string | null; candidateCount?: number; placementCount?: number; examCount?: number; articleType?: string; isPublished?: boolean; publishedAt?: string | null; imageUrl?: string | null }>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
  budgetLakh?: number;
  availableBudgets?: number[];
  articleType?: string;
};
