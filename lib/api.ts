const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';
const PUBLIC_MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '');
const INTERNAL_UPLOADS_ORIGIN = /^(https?:\/\/)(?:127\.0\.0\.1|localhost):9101/i;

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
  const src = String(value).trim().replace(INTERNAL_UPLOADS_ORIGIN, 'https://api.collegedecision.in');
  if (/^https?:\/\//i.test(src)) return src;
  const origin = mediaOrigin();
  return `${origin}${src.startsWith('/') ? src : `/${src}`}`;
}

export function instituteLogoUrl(value: string | null | undefined) {
  const url = mediaUrl(value);
  if (!url) return '';
  if (!/\/uploads\//i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}w=96&q=85&convert=webp`;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const requestInit = { ...init };
  if (!requestInit.cache && !requestInit.next) requestInit.next = { revalidate: 60 };
  const response = await fetch(`${apiUrl}${path}`, {
    ...requestInit
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type ArticleList = {
  data: Array<{ id: number; title: string; slug: string; content: string | null; candidateCount?: number; placementCount?: number; examCount?: number; articleType?: string; isPublished?: boolean; publishedAt?: string | null; imageUrl?: string | null }>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
  budgetLakh?: number;
  availableBudgets?: number[];
  articleType?: string;
};
