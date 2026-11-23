import { api } from './api';

/**
 * Claim / verification status for a college profile (claim links, verified badge). Unverified profiles show no label.
 *
 * Source of truth is the claim system (college_owners / college_verification). Until its public read
 * endpoint exists this helper degrades to `unverified`: it first looks for a status already present on
 * the profile payload, then tries GET /colleges/:slug/verification, and on any error or timeout
 * returns { verified: false }. It never throws, so a profile page can never break because of it.
 */
/**
 * verificationDue: claimed + verified, but the yearly re-verification (panel v2) has lapsed.
 * claimed: the college has an active owner. Verified + claimed -> "Verified by college"; verified without an owner
 * (badge set by the CollegeDecision team in Admin) -> "Verified". Unknown (older API) -> treated as claimed when verified.
 */
export type CollegeVerification = { verified: boolean; verifiedAt?: string | null; verificationDue?: boolean; claimed?: boolean };

export const FOR_COLLEGES_HREF = '/for-colleges';
export const VERIFICATION_POLICY_HREF = '/for-colleges/verification-policy';
export const CLAIM_HREF = '/for-colleges/claim';

/** Claim form link for a college: `/for-colleges/claim?college=<slug>`. */
export function claimHref(college?: { id?: number | string | null; slug?: string | null } | null) {
  const key = college?.slug ? String(college.slug).trim() : '';
  return key ? `${CLAIM_HREF}?college=${encodeURIComponent(key)}` : CLAIM_HREF;
}

type MaybeStatus = Record<string, unknown> | null | undefined;

function readStatus(source: MaybeStatus): CollegeVerification | null {
  if (!source || typeof source !== 'object') return null;
  const nested = (source.verification || source.claim) as MaybeStatus;
  if (nested && typeof nested === 'object') {
    const fromNested = readStatus(nested);
    if (fromNested) return fromNested;
  }
  for (const key of ['verified', 'isVerified', 'is_verified', 'claimed', 'isClaimed', 'is_claimed']) {
    if (key in source && source[key] !== null && source[key] !== undefined) {
      const value = source[key];
      const verified = value === true || value === 1 || value === '1' || value === 'true';
      const at = (source.verifiedAt || source.verified_at || null) as string | null;
      const claimed = typeof source.claimed === 'boolean' ? source.claimed : verified;
      return { verified, verifiedAt: verified ? at : null, verificationDue: verified && source.verificationDue === true, claimed };
    }
  }
  if (typeof source.status === 'string' && ('verifiedAt' in source || 'verified_at' in source || 'ownerId' in source)) {
    return { verified: source.status === 'verified' || source.status === 'approved', verifiedAt: (source.verifiedAt || source.verified_at || null) as string | null };
  }
  return null;
}

export async function getCollegeVerification(slug: string, profile?: { institute?: MaybeStatus; verification?: unknown } | null): Promise<CollegeVerification> {
  const inline = readStatus(profile as MaybeStatus) || readStatus(profile?.institute);
  if (inline) return inline;
  try {
    const response = await api<{ data?: MaybeStatus } & Record<string, unknown>>(`/colleges/${encodeURIComponent(slug)}/verification`, {
      next: { revalidate: 1800, tags: ['colleges', `college:${slug}`] },
      signal: AbortSignal.timeout(1500)
    });
    return readStatus(response?.data) || readStatus(response) || { verified: false };
  } catch {
    return { verified: false };
  }
}
