/**
 * Student registration field rules. Kept identical to the website popup (college_decision_backend src/utils/lead-validation.ts),
 * so a message the server returns is the same one the student would have seen inline.
 */
export type FieldResult = { value: string; error?: undefined } | { value?: undefined; error: string };

export function validateName(raw: unknown): FieldResult {
  const value = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (!value) return { error: 'Please enter your full name' };
  if (/\d/.test(value)) return { error: 'Name cannot contain numbers' };
  if (value.length < 2) return { error: 'Name is too short' };
  if (value.length > 60) return { error: 'Name must be 60 characters or fewer' };
  if (!/^\p{L}[\p{L}\p{M} .'-]*$/u.test(value)) return { error: 'Use letters, spaces, dots, apostrophes or hyphens only' };
  return { value };
}

/** All one digit, or a straight ascending/descending run (1234567890, 9876543210, 6789012345). */
export function isFakeNumber(digits: string) {
  if (/^(\d)\1+$/.test(digits)) return true;
  let up = true;
  let down = true;
  for (let i = 1; i < digits.length; i += 1) {
    const d = (Number(digits[i]) - Number(digits[i - 1]) + 10) % 10;
    if (d !== 1) up = false;
    if (d !== 9) down = false;
  }
  return up || down;
}

/** India: 10 digits starting 6-9 (strips spaces, +91/91, leading 0). Abroad: 6-15 digits including the country code. */
export function validateMobile(raw: unknown, isIndia: boolean, dialCode: string | null): FieldResult {
  const cleaned = String(raw ?? '').replace(/[\s().-]/g, '');
  if (!cleaned) return { error: 'Please enter your mobile number' };
  if (isIndia) {
    const digits = cleaned.replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
    if (!/^\d+$/.test(digits)) return { error: 'Mobile number can contain digits only' };
    if (digits.length !== 10) return { error: 'Enter a 10-digit mobile number' };
    if (!/^[6-9]/.test(digits)) return { error: 'Indian mobile numbers start with 6, 7, 8 or 9' };
    if (isFakeNumber(digits)) return { error: 'Please enter your real mobile number' };
    return { value: digits };
  }
  if (!/^\+?\d+$/.test(cleaned)) return { error: 'Mobile number can contain digits only' };
  const dial = (dialCode || '').replace(/\D/g, '');
  let digits = cleaned.replace(/^\+/, '').replace(/^00/, '');
  if (!cleaned.startsWith('+') && !cleaned.startsWith('00') && dial && !digits.startsWith(dial)) digits = `${dial}${digits.replace(/^0+/, '')}`;
  if (digits.length < 6 || digits.length > 15) return { error: 'Enter 6-15 digits including the country code' };
  if (isFakeNumber(digits.slice(dial.length) || digits)) return { error: 'Please enter your real mobile number' };
  return { value: `+${digits}` };
}

export function validateEmail(raw: unknown): FieldResult {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return { error: 'Please enter your email address' };
  if (value.length > 254) return { error: 'Email address is too long' };
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/.test(value) || value.includes('..')) {
    return { error: 'Enter a valid email address, like name@example.com' };
  }
  return { value };
}

const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.in': 'gmail.com', 'gmali.com': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'yhoo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlookk.com': 'outlook.com', 'rediffmial.com': 'rediffmail.com', 'redifmail.com': 'rediffmail.com',
  'icloud.co': 'icloud.com', 'iclod.com': 'icloud.com'
};

/** "Did you mean …?" hint for common email domain typos (a hint only, never blocks submit). */
export function suggestEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  const at = value.lastIndexOf('@');
  if (at < 1) return null;
  const fix = DOMAIN_TYPOS[value.slice(at + 1)];
  return fix ? `${value.slice(0, at)}@${fix}` : null;
}
