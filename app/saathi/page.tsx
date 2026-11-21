import { redirect } from 'next/navigation';
import { SAATHI_HREF } from '../../lib/site-nav';

/** Old /saathi URL → CollegeDecision Saathi page. */
export default function SaathiRedirectPage() {
  redirect(SAATHI_HREF);
}
