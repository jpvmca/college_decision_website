'use client';

import { useEffect } from 'react';

const GTM_ID = 'GTM-T47JR276';

export default function GoogleTagManager() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.querySelector(`script[data-gtm-id="${GTM_ID}"]`)) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      script.dataset.gtmId = GTM_ID;
      document.head.appendChild(script);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
