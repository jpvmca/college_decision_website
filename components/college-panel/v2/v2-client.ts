import { panelPost } from '../panel-client';
import type { ProofFile } from './types';

/** Proof documents go to private storage; only our reviewers can open them. */
export function uploadProof(instituteId: number, file: File, purpose: 'placements' | 'recruiters') {
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', file);
  return panelPost<{ data: ProofFile }>(`institutes/${instituteId}/proofs`, form);
}

export async function searchRecruiters(q: string): Promise<Array<{ id: number; name: string }>> {
  const response = await fetch(`/api/college-panel/recruiters/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  if (response.status === 401) { window.location.href = '/college/login'; return []; }
  const json = await response.json().catch(() => ({}));
  return Array.isArray(json.data) ? json.data : [];
}

export function confirmReverification(instituteId: number, sections: string[], note: string) {
  return panelPost<{ data: unknown; message: string }>(`institutes/${instituteId}/reverification`, { sections, note: note || null });
}
