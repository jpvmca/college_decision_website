import type { MetadataRoute } from 'next';
import { api } from '../lib/api';

type ArticleIndex = { data: Array<{ slug: string }>; pagination: { totalPages: number } };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/articles`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: 'yearly', priority: 0.2 }
  ];
  try {
    const first = await api<ArticleIndex>('/articles?type=all&page=1&perPage=50');
    const allArticles = [...first.data];
    const totalPages = Math.min(first.pagination.totalPages || 1, 100);
    if (totalPages > 1) {
      const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => api<ArticleIndex>(`/articles?type=all&page=${index + 2}&perPage=50`)));
      allArticles.push(...rest.flatMap((page) => page.data));
    }
    pages.push(...allArticles.map((article) => ({
      url: `${base}/articles/${article.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    })));
  } catch {
    // Keep core URLs available if the backend is temporarily unavailable during build.
  }
  return pages;
}
