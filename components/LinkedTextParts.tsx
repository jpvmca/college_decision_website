import Link from 'next/link';
import type { TextPart } from '../lib/auto-link-entities';

export default function LinkedTextParts({
  parts,
  className = 'auto-entity-link'
}: {
  parts: TextPart[];
  className?: string;
}) {
  if (!parts.length) return null;
  return (
    <>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <Link key={`${part.href}-${index}`} href={part.href} className={className}>
            {part.value}
          </Link>
        ) : (
          <span key={`t-${index}`}>{part.value}</span>
        )
      )}
    </>
  );
}
