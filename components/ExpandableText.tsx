'use client';

import { useState } from 'react';

type Props = {
  text: string;
  limit?: number;
};

export default function ExpandableText({ text, limit = 280 }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= limit) return <span>{text}</span>;
  return <span className="expandable-text">
    {expanded ? text : `${text.slice(0, limit).trimEnd()}… `}
    <button type="button" className="text-expand-button" onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'View less' : 'View more'}
    </button>
  </span>;
}
