export type ClaimCollege = { id: number; name: string; city: string | null; state: string | null; slug: string | null; websiteDomain: string | null };

export const MAX_FILE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 10);
export const MAX_OTHER_DOCS = 3;
export const ACCEPT_DOCS = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';
const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp)$/i;

// Mirrors FREE_MAIL_DOMAINS / isFreeMailDomain in the backend claim.service.ts (the backend check is the real one).
const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.in', 'outlook.com', 'outlook.in', 'live.com', 'live.in', 'msn.com',
  'rediffmail.com', 'rediff.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aim.com',
  'proton.me', 'protonmail.com', 'pm.me', 'zoho.com', 'zohomail.com', 'zohomail.in', 'mail.com', 'gmx.com', 'gmx.net',
  'yandex.com', 'yandex.ru', 'tutanota.com', 'tuta.io', 'fastmail.com', 'hushmail.com', 'inbox.com', 'lycos.com',
  'mailinator.com', 'sify.com', 'indiatimes.com', 'in.com', 'vsnl.net', 'vsnl.com', 'bsnl.in', 'qq.com', '163.com'
]);
const FREE_MAIL_INTL = /^(yahoo|ymail|hotmail|outlook|live|gmail|rediffmail|aol|icloud|protonmail|gmx|yandex)\.(co\.uk|fr|de|it|es|ca|ie|nl|ru|com\.au|com\.br|co\.jp|com\.sg|com\.my)$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}\s.'-]+$/u;

export function isFreeMail(email: string) {
  const domain = (email.trim().toLowerCase().split('@')[1] || '');
  return Boolean(domain) && (FREE_MAIL_DOMAINS.has(domain) || FREE_MAIL_INTL.test(domain));
}

export function freeMailMessage(email: string) {
  return isFreeMail(email)
    ? 'Please use your official college email (for example name@yourcollege.ac.in). Gmail, Yahoo, Outlook, Rediffmail and other personal addresses cannot be used to claim a college.'
    : null;
}

/** Same rule as the backend normalizeIndianMobile: optional +91 / 91 / 0, then 10 digits starting 6-9. */
export function normalizeIndianMobile(raw: string): string | null {
  const cleaned = String(raw ?? '').replace(/[\s().-]/g, '');
  const digits = cleaned.replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function nameProblem(value: string) {
  const name = value.trim();
  if (!name) return 'Enter your full name.';
  if (name.length < 2 || name.length > 100) return 'Your name must be 2 to 100 characters long.';
  if (!NAME_PATTERN.test(name)) return "Your name can contain only letters, spaces and . ' -";
  return null;
}

export function designationProblem(value: string) {
  const text = value.trim();
  if (text.length < 2) return 'Enter your designation at the college.';
  if (text.length > 120) return 'Keep the designation under 120 characters.';
  return null;
}

export function phoneProblem(value: string) {
  if (!value.trim()) return 'Enter your mobile number.';
  return normalizeIndianMobile(value) ? null : 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9 (+91 is optional).';
}

export function emailProblem(value: string) {
  const email = value.trim();
  if (!email) return 'Enter your official college email address.';
  if (email.length > 190 || !EMAIL_PATTERN.test(email)) return 'Enter a valid email address, for example name@yourcollege.ac.in.';
  return freeMailMessage(email);
}

export function fileProblem(file: File | null | undefined) {
  if (!file) return null;
  if (!ALLOWED_EXT.test(file.name)) return `"${file.name}" must be a PDF, JPG, PNG or WebP file.`;
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_FILE_MB} MB.`;
  if (file.size === 0) return `"${file.name}" is empty.`;
  return null;
}

export function collegeLabel(college: ClaimCollege) {
  return [college.name, [college.city, college.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
}
