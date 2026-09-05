import { instituteLogoUrl } from '../lib/api';

export default function ExamLogo({
  src,
  examName,
  courseName,
  size = 56
}: {
  src?: string | null;
  examName: string;
  courseName?: string | null;
  size?: number;
}) {
  const url = instituteLogoUrl(src);
  if (!url) return null;
  const alt = courseName
    ? `${examName} entrance exam logo for ${courseName} admissions in India`
    : `${examName} entrance exam logo for college admissions in India`;
  return (
    <img
      className="exam-logo"
      src={url}
      alt={alt}
      title={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}
