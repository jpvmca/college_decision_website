import { redirect } from 'next/navigation';
import { SAATHI_HREF } from '../../lib/site-nav';

/** Typo slug → CollegeDecision Saathi. */
export default function CollgeSaathiRedirectPage() {
  redirect(SAATHI_HREF);
}
