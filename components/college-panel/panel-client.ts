import type { ChangeRequest } from '../../lib/college-panel-types';

/** Browser helpers for the college panel proxy (/api/college-panel/*). */
export async function panelPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/college-panel/${path}`, {
    method: 'POST',
    headers: body instanceof FormData ? undefined : { 'content-type': 'application/json' },
    body: body instanceof FormData ? body : JSON.stringify(body ?? {})
  });
  const json = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.href = '/college/login';
    throw new Error('Please sign in again.');
  }
  if (!response.ok) throw new Error(json.error || `Request failed (${response.status})`);
  return json as T;
}

export function submitChange(instituteId: number, section: string, data: unknown, note?: string) {
  return panelPost<{ data: ChangeRequest; message: string }>(`institutes/${instituteId}/change-requests`, { section, data, note: note || null });
}

export function withdrawRequest(instituteId: number, requestId: number) {
  return panelPost<{ data: ChangeRequest }>(`institutes/${instituteId}/change-requests/${requestId}/withdraw`);
}

export function uploadPhoto(instituteId: number, file: File) {
  const form = new FormData();
  form.append('image', file);
  return panelPost<{ data: { path: string; url: string; width: number; height: number } }>(`institutes/${instituteId}/gallery/upload`, form);
}
