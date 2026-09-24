import Link from 'next/link';
import { autoLinkTextParts, type LinkableEntity, type AutoLinkOptions } from '../lib/auto-link-entities';

export default function AutoLinkedText({
  text,
  entities,
  options
}: {
  text: string;
  entities: LinkableEntity[];
  options?: AutoLinkOptions;
}) {
  const parts = autoLinkTextParts(text, entities, options);
  return (
    <>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <Link key={`${part.href}-${index}`} href={part.href} className={options?.className || 'auto-entity-link'}>
            {part.value}
          </Link>
        ) : (
          <span key={`t-${index}`}>{part.value}</span>
        )
      )}
    </>
  );
}
