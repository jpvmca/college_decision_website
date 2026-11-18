'use client';

import { useMemo } from 'react';
import { externalLinkError } from '../../../lib/external-links';

export { externalLinkError };

/** First field that contains a website link, or null. */
export function firstLinkError(fields: Array<[unknown, string]>): string | null {
  for (const [value, label] of fields) {
    const err = externalLinkError(value, label);
    if (err) return err;
  }
  return null;
}

/** Inline warning under a single input or editor. */
export function LinkWarning({ value, label }: { value: unknown; label: string }) {
  const msg = useMemo(() => externalLinkError(value, label), [value, label]);
  if (!msg) return null;
  return <p className="cpn-field-error" role="alert">{msg}</p>;
}
