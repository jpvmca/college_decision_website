import { panelPost } from '../panel-client';

/** Panel v3 browser helpers (all through the /api/college-panel proxy; the session cookie never reaches page scripts). */
export type CatalogCourse = { id: number; name: string; shortName: string; years: number | null };
export type CatalogOption = { id: number; name: string; level?: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/college-panel/${path}`, { cache: 'no-store' });
  if (response.status === 401) { window.location.href = '/college/login'; throw new Error('Please sign in again.'); }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || `Request failed (${response.status})`);
  return json.data as T;
}

let coursesCache: Promise<CatalogCourse[]> | null = null;
let examsCache: Promise<CatalogOption[]> | null = null;
export const catalogCourses = () => (coursesCache ||= getJson<CatalogCourse[]>('catalog/courses').catch((e) => { coursesCache = null; throw e; }));
export const catalogExams = () => (examsCache ||= getJson<CatalogOption[]>('catalog/exams').catch((e) => { examsCache = null; throw e; }));
export const catalogPrograms = (courseId: number, q = '') => getJson<CatalogOption[]>(`catalog/programs?courseId=${courseId}${q ? `&q=${encodeURIComponent(q)}` : ''}`);

export function uploadLogo(instituteId: number, file: File) {
  const form = new FormData();
  form.append('image', file);
  return panelPost<{ data: { path: string; url: string; width: number; height: number; bytes: number } }>(`institutes/${instituteId}/logo/upload`, form);
}

export function uploadBrochure(instituteId: number, file: File) {
  const form = new FormData();
  form.append('file', file);
  return panelPost<{ data: { id: number; name: string; sizeBytes: number } }>(`institutes/${instituteId}/brochure/upload`, form);
}
