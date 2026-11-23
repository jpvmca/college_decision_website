'use client';

import { SAATHI_NAME } from '../../lib/site-nav';

/**
 * Presentational launcher only. It ships in the initial bundle, so it must never fetch,
 * track or import the chat module.
 */
export default function CdSaathiFab({
  onClick,
  title = SAATHI_NAME,
  sub = 'Ask me anything',
  disabled = false,
  unread = 0
}: {
  onClick: () => void;
  title?: string;
  sub?: string;
  disabled?: boolean;
  unread?: number;
}) {
  return (
    <button
      type="button"
      className="cds-fab"
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled || undefined}
      aria-label={`Open ${SAATHI_NAME}`}
    >
      <span className="cds-fab-ring" aria-hidden="true" />
      <span className="cds-fab-avatar" aria-hidden="true">
        <span className="cds-fab-face">CD</span>
        <span className="cds-fab-online" />
      </span>
      <span className="cds-fab-label">
        <span className="cds-fab-title">{title}</span>
        <span className="cds-fab-sub">{sub}</span>
      </span>
      {unread > 0 ? <span className="cds-fab-badge">{unread > 9 ? '9+' : unread}</span> : null}
    </button>
  );
}
