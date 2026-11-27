'use client';

import { useRouter } from 'next/navigation';
import { claimHref } from '../lib/college-verification';

/**
 * Navigates to the claim form on click so college profile HTML has no crawlable
 * /for-colleges/claim?college= link for Google to discover.
 */
export default function ClaimProfileButton({ slug }: { slug: string }) {
  const router = useRouter();

  return (
    <button type="button" className="button" onClick={() => router.push(claimHref({ slug }))}>
      Claim this profile
    </button>
  );
}
