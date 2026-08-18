const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

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
  data: Array<{ id: number; title: string; slug: string; content: string | null; candidateCount?: number; placementCount?: number; examCount?: number; articleType?: string; isPublished?: boolean; publishedAt?: string | null }>;
  pagination: { page: number; perPage: number; total: number; totalPages: number };
  budgetLakh?: number;
  availableBudgets?: number[];
  articleType?: string;
};
