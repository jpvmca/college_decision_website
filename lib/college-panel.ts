import { cookies } from 'next/headers';

/**
 * College panel (website /college/*) server helpers.
 * The session token lives only in the httpOnly cookie below; the browser never sees it. Client components
 * talk to the backend through /api/college-panel/* (app/api/college-panel/[...path]/route.ts).
 */
export const COLLEGE_SESSION_COOKIE = 'cd_college_session';
export const COLLEGE_ACTIVE_COOKIE = 'cd_college_active';

const backendUrl = () => process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

export type PanelCollege = { id: number; name: string; slug: string; logo: string | null; city: string | null; state: string | null; isPublished: boolean };
export type PanelMe = { user: { id: number; name: string; email: string }; colleges: PanelCollege[]; sections: string[] };

export async function panelFetch<T>(path: string): Promise<{ status: number; body: T | null }> {
  const store = await cookies();
  const token = store.get(COLLEGE_SESSION_COOKIE)?.value;
  if (!token) return { status: 401, body: null };
  try {
    const response = await fetch(`${backendUrl()}/college${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000)
    });
    const body = (await response.json().catch(() => null)) as T | null;
    return { status: response.status, body };
  } catch {
    return { status: 503, body: null };
  }
}

/** Signed-in owner + the college currently being managed (cookie choice, else the first one). */
export async function getPanelContext() {
  const me = await panelFetch<{ data: PanelMe }>('/me');
  if (me.status !== 200 || !me.body?.data?.colleges?.length) return null;
  const store = await cookies();
  const wanted = Number(store.get(COLLEGE_ACTIVE_COOKIE)?.value || 0);
  const colleges = me.body.data.colleges;
  const college = colleges.find((c) => c.id === wanted) || colleges[0];
  return { user: me.body.data.user, colleges, college };
}
