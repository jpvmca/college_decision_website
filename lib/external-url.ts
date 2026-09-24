/**
 * Normalize scraped / DB website values into safe absolute http(s) URLs.
 * Bare hosts like `www.kahedu.edu.in` must not become site-relative paths.
 */
export function toExternalHttpUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  // Do not invent links for in-page anchors, site paths, or contact schemes.
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('javascript:')
  ) {
    return null;
  }

  // Host-like website: contains a dot and looks like a hostname/path.
  if (trimmed.includes('.') && !/\s/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
}

/**
 * Absolute URL of an EXTERNAL website for JSON-LD sameAs/url.
 * Never resolves a bare host against siteUrl (that yields https://site/www.…).
 */
export function toAbsoluteExternalUrl(
  value: string | null | undefined,
  _siteUrl?: string
): string | null {
  return toExternalHttpUrl(value);
}
