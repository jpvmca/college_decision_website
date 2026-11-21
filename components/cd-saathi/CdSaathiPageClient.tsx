'use client';

import dynamic from 'next/dynamic';

const CdSaathiChat = dynamic(() => import('./CdSaathiChat'), {
  ssr: false,
  loading: () => (
    <div className="saathi-chat-loading" role="status">
      Starting CollegeDecision Saathi…
    </div>
  )
});

/** Full-page Saathi chat (no floating FAB). */
export default function CdSaathiPageClient() {
  return <CdSaathiChat variant="page" />;
}
