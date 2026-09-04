import { instituteLogoUrl } from '../lib/api';

export default function InstituteLogo({ src, alt }: { src?: string | null; alt: string }) {
  const url = instituteLogoUrl(src);
  if (!url) return null;
  return <img className="institute-logo" src={url} alt={alt} width={56} height={56} loading="lazy" decoding="async" />;
}
